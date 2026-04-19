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

const activityQuerySchema = z.object({
  limit: z.number().int().min(1).max(100).optional(),
  before: z
    .string()
    .datetime({ offset: true })
    .optional(),
});

type ActivityItem = {
  id: string;
  type:
    | "weather_snapshot"
    | "soil_update"
    | "recommendation_generated"
    | "yield_forecast_generated";
  farmId: string;
  farmName: string;
  timestamp: string;
  title: string;
  description: string;
  metadata: Record<string, unknown>;
};

function pushIfRecent(input: {
  target: ActivityItem[];
  item: ActivityItem;
  beforeBoundary: Date | null;
}) {
  const date = new Date(input.item.timestamp);

  if (Number.isNaN(date.getTime())) {
    return;
  }

  if (input.beforeBoundary && date >= input.beforeBoundary) {
    return;
  }

  input.target.push(input.item);
}

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url);
    const queryValidation = activityQuerySchema.safeParse({
      limit: requestUrl.searchParams.get("limit")
        ? Number(requestUrl.searchParams.get("limit"))
        : undefined,
      before: requestUrl.searchParams.get("before") ?? undefined,
    });

    if (!queryValidation.success) {
      return successResponse({
        activities: [],
        count: 0,
        limit: 20,
        hasMore: false,
        nextCursor: null,
        messages: [
          "Invalid activity query parameters. Use limit=1..100 and before=<ISO timestamp>",
        ],
      });
    }

    const limit = queryValidation.data.limit ?? 20;
    const beforeBoundary = queryValidation.data.before
      ? new Date(queryValidation.data.before)
      : null;

    const decodedToken = await verifyTokenWithClaims(request);
    const farms = await listFarmsByUid(decodedToken.uid);

    if (farms.length === 0) {
      return successResponse({
        activities: [],
        count: 0,
        limit,
        hasMore: false,
        nextCursor: null,
        messages: [
          "No farms found yet. Create a farm to start generating activity.",
        ],
      });
    }

    const perFarmLimit = Math.max(10, Math.min(40, limit * 2));

    const farmActivityResults = await Promise.all(
      farms.map(async (farm) => {
        const [weatherItems, soilItems, recommendationItems, yieldItems] = await Promise.all([
          listRecentWeatherSnapshotsForFarm(decodedToken.uid, farm.id, perFarmLimit),
          listRecentSoilProfilesForFarm(decodedToken.uid, farm.id, perFarmLimit),
          listRecentCropRecommendationsForFarm(decodedToken.uid, farm.id, perFarmLimit),
          listRecentYieldForecastsForFarm(decodedToken.uid, farm.id, perFarmLimit),
        ]);

        const activities: ActivityItem[] = [];

        for (const weather of weatherItems) {
          const timestamp = weather.recordedAt ?? weather.createdAt ?? weather.updatedAt;

          if (!timestamp) {
            continue;
          }

          pushIfRecent({
            target: activities,
            beforeBoundary,
            item: {
              id: `weather:${weather.id}`,
              type: "weather_snapshot",
              farmId: farm.id,
              farmName: farm.name,
              timestamp,
              title: "Weather Snapshot Updated",
              description: "Weather conditions were refreshed for this farm.",
              metadata: {
                temperatureC: weather.temperatureC,
                humidity: weather.humidity,
                rainfallMm: weather.rainfallMm,
              },
            },
          });
        }

        for (const soil of soilItems) {
          const timestamp = soil.createdAt ?? soil.updatedAt;

          if (!timestamp) {
            continue;
          }

          pushIfRecent({
            target: activities,
            beforeBoundary,
            item: {
              id: `soil:${soil.id}`,
              type: "soil_update",
              farmId: farm.id,
              farmName: farm.name,
              timestamp,
              title: "Soil Data Recorded",
              description: "Soil profile or analysis was saved for this farm.",
              metadata: {
                phLevel: soil.pH,
                soilClass: soil.soilClass,
                soilSource: soil.soilSource,
              },
            },
          });
        }

        for (const recommendation of recommendationItems) {
          const timestamp = recommendation.createdAt ?? recommendation.updatedAt;

          if (!timestamp) {
            continue;
          }

          const topCrop = recommendation.recommendedCrops[0] ?? null;

          pushIfRecent({
            target: activities,
            beforeBoundary,
            item: {
              id: `recommendation:${recommendation.id}`,
              type: "recommendation_generated",
              farmId: farm.id,
              farmName: farm.name,
              timestamp,
              title: "Recommendation Generated",
              description:
                topCrop
                  ? `Top suggestion: ${topCrop.crop} (score ${topCrop.score}).`
                  : "A recommendation set was generated.",
              metadata: {
                generatedBy: recommendation.generatedBy,
                topCrop: topCrop?.crop ?? null,
                topScore: topCrop?.score ?? null,
              },
            },
          });
        }

        for (const forecast of yieldItems) {
          const timestamp = forecast.createdAt ?? forecast.updatedAt;

          if (!timestamp) {
            continue;
          }

          pushIfRecent({
            target: activities,
            beforeBoundary,
            item: {
              id: `yield:${forecast.id}`,
              type: "yield_forecast_generated",
              farmId: farm.id,
              farmName: farm.name,
              timestamp,
              title: "Yield Forecast Generated",
              description: `Forecast for ${forecast.cropType} at ${forecast.expectedYield} ${forecast.unit}.`,
              metadata: {
                cropType: forecast.cropType,
                expectedYield: forecast.expectedYield,
                unit: forecast.unit,
                estimatedRevenuePhp: forecast.estimatedRevenue,
                generatedBy: forecast.generatedBy,
              },
            },
          });
        }

        return activities;
      }),
    );

    const allActivities = farmActivityResults
      .flat()
      .sort((firstItem, secondItem) => {
        return new Date(secondItem.timestamp).getTime() - new Date(firstItem.timestamp).getTime();
      });

    const selectedActivities = allActivities.slice(0, limit);
    const hasMore = allActivities.length > limit;
    const nextCursor = hasMore
      ? selectedActivities[selectedActivities.length - 1]?.timestamp ?? null
      : null;

    return successResponse({
      activities: selectedActivities,
      count: selectedActivities.length,
      limit,
      hasMore,
      nextCursor,
      messages: [],
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
