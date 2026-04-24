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

type FarmWeatherCurrentContext = {
  params: Promise<{ farmId: string }>;
};

const geocodingService = createGeocodingService();
const weatherService = createWeatherService();

function resolveStoredGeocode(farm: {
  locationLatitude: number | null;
  locationLongitude: number | null;
  location: string | null;
  locationConfidence: number | null;
  locationSource: string | null;
}) {
  if (
    typeof farm.locationLatitude === "number" &&
    Number.isFinite(farm.locationLatitude) &&
    typeof farm.locationLongitude === "number" &&
    Number.isFinite(farm.locationLongitude)
  ) {
    return {
      latitude: farm.locationLatitude,
      longitude: farm.locationLongitude,
      formattedAddress: farm.location ?? "Selected farm location",
      confidence: farm.locationConfidence ?? 1,
      source: farm.locationSource ?? "farm-selected",
    };
  }

  return null;
}

export async function GET(
  request: Request,
  context: FarmWeatherCurrentContext,
) {
  try {
    const routeParams = await context.params;
    const farmIdResult = farmParamsSchema.safeParse(routeParams);

    if (!farmIdResult.success) {
      return errorResponse(400, "VALIDATION_ERROR", "Invalid farm id.");
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
        "Farm location is required before fetching weather.",
      );
    }

    const storedGeocode = resolveStoredGeocode(farm);
    const geocode = storedGeocode
      ? storedGeocode
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

    const weather = await weatherService.fetchCurrentWeather({
      latitude: geocode.latitude,
      longitude: geocode.longitude,
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
      geocode,
      weather,
      weatherSnapshot,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}