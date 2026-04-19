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

    const geocodes = await geocodingService.geocodeLocationText(farm.location, {
      limit: 1,
    });
    const geocode = geocodes[0];

    if (!geocode) {
      return errorResponse(
        400,
        "FARM_LOCATION_UNRESOLVED",
        "Farm location could not be resolved to coordinates.",
      );
    }

    const forecastDays = validationResult.data.days ?? 7;

    const weather = await weatherService.fetchWeatherForecast({
      latitude: geocode.latitude,
      longitude: geocode.longitude,
      days: forecastDays,
    });

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
      geocode,
      weather,
      warnings: buildForecastWarnings(weather.forecast.length),
      weatherSnapshot,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
