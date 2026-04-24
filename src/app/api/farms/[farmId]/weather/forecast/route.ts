import { z } from "zod";

import {
  errorResponse,
  handleRouteError,
  successResponse,
} from "../../../../../../lib/apiResponse";
import { verifyTokenWithClaims } from "../../../../../../lib/authMiddleware";
import {
  createWeatherSnapshotForFarm,
  getFarmByIdForUser,
  listRecentWeatherSnapshotsForFarm,
} from "../../../../../../lib/firestoreSchema";
import { createGeocodingService } from "../../../../../../lib/geocodingService";
import { createWeatherService } from "../../../../../../lib/weatherService";

export const runtime = "nodejs";

const farmParamsSchema = z.object({
  farmId: z.string().trim().min(1),
});

const forecastQuerySchema = z.object({
  days: z.number().int().min(1).max(16).optional(),
});

type FarmWeatherForecastContext = {
  params: Promise<{ farmId: string }>;
};

const geocodingService = createGeocodingService();
const weatherService = createWeatherService();

function hasStoredGeocode(farm: {
  locationLatitude: number | null;
  locationLongitude: number | null;
}) {
  return (
    typeof farm.locationLatitude === "number" &&
    Number.isFinite(farm.locationLatitude) &&
    typeof farm.locationLongitude === "number" &&
    Number.isFinite(farm.locationLongitude)
  );
}

type WeatherTimelineEntry = {
  date: string;
  sourceType: "observed" | "backfilled" | "forecast";
  temperatureC: number | null;
  humidity: number | null;
  rainfallMm: number | null;
  rainRisk: "low" | "medium" | "high" | "unknown";
  isInferred: boolean;
};

function toIsoDateString(value: Date) {
  return value.toISOString().slice(0, 10);
}

function startOfIsoWeekUtc(value: Date) {
  const normalized = new Date(Date.UTC(
    value.getUTCFullYear(),
    value.getUTCMonth(),
    value.getUTCDate(),
  ));
  const day = normalized.getUTCDay();
  const daysFromMonday = (day + 6) % 7;

  normalized.setUTCDate(normalized.getUTCDate() - daysFromMonday);

  return normalized;
}

function toRainRisk(rainfallMm: number | null): "low" | "medium" | "high" | "unknown" {
  if (rainfallMm === null) {
    return "unknown";
  }

  if (rainfallMm >= 8) {
    return "high";
  }

  if (rainfallMm >= 2) {
    return "medium";
  }

  return "low";
}

function toTimelineDateRange(now = new Date()) {
  const weekStart = startOfIsoWeekUtc(now);
  const weekDates = Array.from({ length: 7 }, (_, index) => {
    const day = new Date(weekStart);
    day.setUTCDate(weekStart.getUTCDate() + index);

    return toIsoDateString(day);
  });

  return {
    weekDates,
    weekStartDate: weekDates[0],
    weekEndDate: weekDates[6],
    todayDate: toIsoDateString(now),
  };
}

function toProviderDailyMap(forecast: Array<Record<string, unknown>>) {
  return forecast.reduce<Record<string, Record<string, unknown>>>((map, item) => {
    const date = typeof item.date === "string" ? item.date : null;

    if (!date) {
      return map;
    }

    map[date] = item;

    return map;
  }, {});
}

function toObservedDailyMap(
  snapshots: Array<{ recordedAt: string | null; temperatureC: number | null; humidity: number | null; rainfallMm: number | null }>,
) {
  return snapshots.reduce<Record<string, {
    temperatureC: number | null;
    humidity: number | null;
    rainfallMm: number | null;
  }>>((map, snapshot) => {
    if (!snapshot.recordedAt) {
      return map;
    }

    const date = snapshot.recordedAt.slice(0, 10);

    if (date.length !== 10 || map[date]) {
      return map;
    }

    map[date] = {
      temperatureC: snapshot.temperatureC,
      humidity: snapshot.humidity,
      rainfallMm: snapshot.rainfallMm,
    };

    return map;
  }, {});
}

function buildWeatherTimeline(input: {
  weekDates: string[];
  todayDate: string;
  observedByDate: Record<string, { temperatureC: number | null; humidity: number | null; rainfallMm: number | null }>;
  providerByDate: Record<string, Record<string, unknown>>;
}) {
  const timeline: WeatherTimelineEntry[] = [];

  for (const date of input.weekDates) {
    const observed = input.observedByDate[date];

    if (observed) {
      timeline.push({
        date,
        sourceType: "observed",
        temperatureC: observed.temperatureC,
        humidity: observed.humidity,
        rainfallMm: observed.rainfallMm,
        rainRisk: toRainRisk(observed.rainfallMm),
        isInferred: false,
      });
      continue;
    }

    const provider = input.providerByDate[date] ?? null;
    const isPastDay = date < input.todayDate;

    timeline.push({
      date,
      sourceType: isPastDay ? "backfilled" : "forecast",
      temperatureC:
        typeof provider?.temperatureMaxC === "number"
          ? provider.temperatureMaxC
          : null,
      humidity: null,
      rainfallMm:
        typeof provider?.rainfallMm === "number" ? provider.rainfallMm : null,
      rainRisk: toRainRisk(
        typeof provider?.rainfallMm === "number" ? provider.rainfallMm : null,
      ),
      isInferred: true,
    });
  }

  return timeline;
}

function buildForecastWarnings(forecastLength: number) {
  if (forecastLength > 0) {
    return [];
  }

  return [
    "Forecast data is currently limited. The response includes only available weather fields.",
  ];
}

export async function GET(
  request: Request,
  context: FarmWeatherForecastContext,
) {
  try {
    const routeParams = await context.params;
    const farmIdResult = farmParamsSchema.safeParse(routeParams);

    if (!farmIdResult.success) {
      return errorResponse(400, "VALIDATION_ERROR", "Invalid farm id.");
    }

    const requestUrl = new URL(request.url);
    const validationResult = forecastQuerySchema.safeParse({
      days: requestUrl.searchParams.get("days")
        ? Number(requestUrl.searchParams.get("days"))
        : undefined,
    });

    if (!validationResult.success) {
      return errorResponse(
        400,
        "VALIDATION_ERROR",
        "Invalid forecast query parameters.",
        validationResult.error.flatten(),
      );
    }

    const decodedToken = await verifyTokenWithClaims(request);
    const farm = await getFarmByIdForUser(decodedToken.uid, farmIdResult.data.farmId);

    if (!farm) {
      return errorResponse(404, "FARM_NOT_FOUND", "Farm not found.");
    }

    if (!farm.location?.trim()) {
      return errorResponse(
        400,
        "FARM_LOCATION_REQUIRED",
        "Farm location is required before fetching weather forecast.",
      );
    }

    const geocode = hasStoredGeocode(farm)
      ? {
          latitude: farm.locationLatitude as number,
          longitude: farm.locationLongitude as number,
          formattedAddress: farm.location ?? "Selected farm location",
          confidence: farm.locationConfidence ?? 1,
          source: farm.locationSource ?? "farm-selected",
        }
      : (await geocodingService.geocodeLocationText(farm.location, {
          limit: 1,
        }))[0];

    if (!geocode) {
      return errorResponse(
        400,
        "FARM_LOCATION_UNRESOLVED",
        "Farm location could not be resolved to coordinates.",
      );
    }

    const forecastDays = validationResult.data.days ?? 7;
    const timelineRange = toTimelineDateRange();
    const pastDays = timelineRange.weekDates.filter(
      (date) => date < timelineRange.todayDate,
    ).length;
    const futureDays = timelineRange.weekDates.filter(
      (date) => date >= timelineRange.todayDate,
    ).length;

    const weather = await weatherService.fetchWeatherForecast({
      latitude: geocode.latitude,
      longitude: geocode.longitude,
      days: Math.max(forecastDays, futureDays),
      pastDays,
    });

    const recentSnapshots = await listRecentWeatherSnapshotsForFarm(
      decodedToken.uid,
      farm.id,
      60,
    );
    const observedByDate = toObservedDailyMap(recentSnapshots);
    const providerByDate = toProviderDailyMap(weather.forecast);
    const weatherTimeline = buildWeatherTimeline({
      weekDates: timelineRange.weekDates,
      todayDate: timelineRange.todayDate,
      observedByDate,
      providerByDate,
    });
    const timelineMissingCount = weatherTimeline.filter(
      (entry) => entry.temperatureC === null && entry.rainfallMm === null,
    ).length;

    const weatherSnapshot = await createWeatherSnapshotForFarm(decodedToken.uid, farm.id, {
      temperatureC: weather.temperatureC,
      humidity: weather.humidity,
      rainfallMm: weather.rainfallMm,
    });

    if (!weatherSnapshot) {
      return errorResponse(404, "FARM_NOT_FOUND", "Farm not found.");
    }

    return successResponse({
      farmId: farm.id,
      requestedDays: forecastDays,
      timelineWindow: {
        startDate: timelineRange.weekStartDate,
        endDate: timelineRange.weekEndDate,
        todayDate: timelineRange.todayDate,
      },
      geocode,
      weather,
      weatherTimeline,
      warnings: [
        ...buildForecastWarnings(weather.forecast.length),
        ...(timelineMissingCount > 0
          ? [
              `${timelineMissingCount} timeline day(s) are missing provider and observed data; values were left null.`,
            ]
          : []),
      ],
      weatherSnapshot,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
