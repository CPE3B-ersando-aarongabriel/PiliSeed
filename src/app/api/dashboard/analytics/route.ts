import { z } from "zod";

import {
  handleRouteError,
  successResponse,
} from "../../../../lib/apiResponse";
import { verifyTokenWithClaims } from "../../../../lib/authMiddleware";
import {
  listFarmsByUid,
  listRecentCropRecommendationsForFarm,
  listRecentSoilProfilesForFarm,
  listRecentWeatherSnapshotsForFarm,
  listRecentYieldForecastsForFarm,
} from "../../../../lib/firestoreSchema";

export const runtime = "nodejs";

const analyticsQuerySchema = z.object({
  dateRange: z.enum(["7d", "30d", "90d"]).optional(),
});

function toDays(dateRange: z.infer<typeof analyticsQuerySchema>["dateRange"]) {
  if (dateRange === "7d") {
    return 7;
  }

  if (dateRange === "90d") {
    return 90;
  }

  return 30;
}

function startDateForDays(days: number, now = new Date()) {
  const start = new Date(now);
  start.setUTCDate(start.getUTCDate() - (days - 1));
  start.setUTCHours(0, 0, 0, 0);

  return start;
}

function toIsoDateKey(value: string | null) {
  if (!value) {
    return null;
  }

  return value.slice(0, 10);
}

function toDaySeries(days: number, now = new Date()) {
  const start = startDateForDays(days, now);

  return Array.from({ length: days }, (_, index) => {
    const date = new Date(start);
    date.setUTCDate(start.getUTCDate() + index);

    return date.toISOString().slice(0, 10);
  });
}

type Point = { date: string; value: number | null };

function emptyPoints(days: string[]): Point[] {
  return days.map((date) => ({ date, value: null }));
}

function mergePoint(points: Point[], date: string, value: number | null) {
  if (value === null) {
    return;
  }

  const target = points.find((point) => point.date === date);

  if (!target) {
    return;
  }

  target.value = value;
}

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url);
    const queryValidation = analyticsQuerySchema.safeParse({
      dateRange: requestUrl.searchParams.get("dateRange") ?? undefined,
    });

    if (!queryValidation.success) {
      return successResponse({
        activeFarm: null,
        window: null,
        series: null,
        messages: ["Invalid dateRange query parameter. Use 7d, 30d, or 90d."],
      });
    }

    const decodedToken = await verifyTokenWithClaims(request);
    const farms = await listFarmsByUid(decodedToken.uid);
    const activeFarm = farms.find((farm) => farm.isActive) ?? farms[0] ?? null;

    if (!activeFarm) {
      return successResponse({
        activeFarm: null,
        window: null,
        series: null,
        messages: [
          "No active farm found. Create a farm and activate it to view analytics.",
        ],
      });
    }

    const dateRange = queryValidation.data.dateRange ?? "30d";
    const days = toDays(dateRange);
    const dayKeys = toDaySeries(days);
    const startDate = dayKeys[0];
    const endDate = dayKeys[dayKeys.length - 1];
    const startBoundary = new Date(`${startDate}T00:00:00.000Z`);

    const [weatherSnapshots, soilProfiles, recommendations, yieldForecasts] = await Promise.all([
      listRecentWeatherSnapshotsForFarm(decodedToken.uid, activeFarm.id, 120),
      listRecentSoilProfilesForFarm(decodedToken.uid, activeFarm.id, 120),
      listRecentCropRecommendationsForFarm(decodedToken.uid, activeFarm.id, 120),
      listRecentYieldForecastsForFarm(decodedToken.uid, activeFarm.id, 120),
    ]);

    const rainfallSeries = emptyPoints(dayKeys);
    const temperatureSeries = emptyPoints(dayKeys);
    const humiditySeries = emptyPoints(dayKeys);
    const phSeries = emptyPoints(dayKeys);
    const recommendationScoreSeries = emptyPoints(dayKeys);
    const yieldSeries = emptyPoints(dayKeys);
    const revenuePhpSeries = emptyPoints(dayKeys);

    const recommendationCropByDay: Record<string, string | null> = {};

    for (const item of weatherSnapshots) {
      const createdDate = item.createdAt ? new Date(item.createdAt) : null;

      if (!createdDate || createdDate < startBoundary) {
        continue;
      }

      const day = toIsoDateKey(item.createdAt);

      if (!day) {
        continue;
      }

      mergePoint(rainfallSeries, day, item.rainfallMm);
      mergePoint(temperatureSeries, day, item.temperatureC);
      mergePoint(humiditySeries, day, item.humidity);
    }

    for (const item of soilProfiles) {
      const createdDate = item.createdAt ? new Date(item.createdAt) : null;

      if (!createdDate || createdDate < startBoundary) {
        continue;
      }

      const day = toIsoDateKey(item.createdAt);

      if (!day) {
        continue;
      }

      mergePoint(phSeries, day, item.pH);
    }

    for (const item of recommendations) {
      const createdDate = item.createdAt ? new Date(item.createdAt) : null;

      if (!createdDate || createdDate < startBoundary) {
        continue;
      }

      const day = toIsoDateKey(item.createdAt);

      if (!day) {
        continue;
      }

      const topCrop = item.recommendedCrops[0] ?? null;
      mergePoint(recommendationScoreSeries, day, topCrop?.score ?? null);
      recommendationCropByDay[day] = topCrop?.crop ?? null;
    }

    for (const item of yieldForecasts) {
      const createdDate = item.createdAt ? new Date(item.createdAt) : null;

      if (!createdDate || createdDate < startBoundary) {
        continue;
      }

      const day = toIsoDateKey(item.createdAt);

      if (!day) {
        continue;
      }

      mergePoint(yieldSeries, day, item.expectedYield);
      mergePoint(revenuePhpSeries, day, item.estimatedRevenue);
    }

    return successResponse({
      activeFarm: {
        id: activeFarm.id,
        name: activeFarm.name,
        location: activeFarm.location,
        isActive: activeFarm.isActive,
      },
      window: {
        dateRange,
        days,
        startDate,
        endDate,
      },
      series: {
        weather: {
          rainfallMm: rainfallSeries,
          temperatureC: temperatureSeries,
          humidity: humiditySeries,
        },
        soil: {
          phLevel: phSeries,
        },
        recommendations: {
          topScore: recommendationScoreSeries,
          topCropByDay: dayKeys.map((date) => ({
            date,
            crop: recommendationCropByDay[date] ?? null,
          })),
        },
        yield: {
          expectedYield: yieldSeries,
          estimatedRevenuePhp: revenuePhpSeries,
        },
      },
      totals: {
        weatherSnapshots: weatherSnapshots.length,
        soilProfiles: soilProfiles.length,
        recommendations: recommendations.length,
        yieldForecasts: yieldForecasts.length,
      },
      messages: [],
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
