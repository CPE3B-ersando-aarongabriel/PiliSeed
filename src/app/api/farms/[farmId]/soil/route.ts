import { z } from "zod";

import {
  errorResponse,
  handleRouteError,
  successResponse,
} from "../../../../../lib/apiResponse";
import { verifyTokenWithClaims } from "../../../../../lib/authMiddleware";
import { createSoilProfileForFarm } from "../../../../../lib/firestoreSchema";

export const runtime = "nodejs";

const farmParamsSchema = z.object({
  farmId: z.string().trim().min(1),
});

const createSoilSchema = z.object({
  pH: z.number().min(0).max(14),
  nitrogen: z.number().min(0),
  phosphorus: z.number().min(0),
  potassium: z.number().min(0),
  moistureContent: z.number().min(0).max(100).optional(),
  lightLevel: z.number().min(0).optional(),
  temperatureC: z.number().min(-50).max(80).optional(),
  humidity: z.number().min(0).max(100).optional(),
});

type FarmSoilContext = {
  params: Promise<{ farmId: string }>;
};

export async function POST(request: Request, context: FarmSoilContext) {
  try {
    const routeParams = await context.params;
    const farmIdResult = farmParamsSchema.safeParse(routeParams);

    if (!farmIdResult.success) {
      return errorResponse(400, "VALIDATION_ERROR", "Invalid farm id.");
    }

    const requestBody = await request.json().catch(() => null);

    if (
      requestBody === null ||
      typeof requestBody !== "object" ||
      Array.isArray(requestBody)
    ) {
      return errorResponse(
        400,
        "INVALID_REQUEST_BODY",
        "Request body must be a valid JSON object.",
      );
    }

    const normalizedBody = {
      ...(requestBody as Record<string, unknown>),
    };

    if (normalizedBody.pH === undefined && normalizedBody.ph !== undefined) {
      normalizedBody.pH = normalizedBody.ph;
    }

    if (
      normalizedBody.moistureContent === undefined &&
      normalizedBody.moisture !== undefined
    ) {
      normalizedBody.moistureContent = normalizedBody.moisture;
    }

    if (normalizedBody.lightLevel === undefined && normalizedBody.light !== undefined) {
      normalizedBody.lightLevel = normalizedBody.light;
    }

    if (
      normalizedBody.temperatureC === undefined &&
      normalizedBody.temperature !== undefined
    ) {
      normalizedBody.temperatureC = normalizedBody.temperature;
    }

    const validationResult = createSoilSchema.safeParse(normalizedBody);

    if (!validationResult.success) {
      return errorResponse(
        400,
        "VALIDATION_ERROR",
        "Invalid soil payload.",
        validationResult.error.flatten(),
      );
    }

    const decodedToken = await verifyTokenWithClaims(request);
    const soilProfile = await createSoilProfileForFarm(
      decodedToken.uid,
      farmIdResult.data.farmId,
      validationResult.data,
    );

    if (!soilProfile) {
      return errorResponse(404, "FARM_NOT_FOUND", "Farm not found.");
    }

    return successResponse({ soilProfile }, 201);
  } catch (error) {
    return handleRouteError(error);
  }
}
