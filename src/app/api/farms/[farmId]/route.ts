import { z } from "zod";

import {
  errorResponse,
  handleRouteError,
  successResponse,
} from "../../../../lib/apiResponse";
import { verifyTokenWithClaims } from "../../../../lib/authMiddleware";
import {
  deleteFarmByIdForUser,
  getFarmByIdForUser,
  updateFarmByIdForUser,
} from "../../../../lib/firestoreSchema";

export const runtime = "nodejs";

const farmParamsSchema = z.object({
  farmId: z.string().trim().min(1),
});

const updateFarmSchema = z
  .object({
    name: z.string().trim().min(1).max(120).optional(),
    location: z.string().trim().min(2).max(180).nullable().optional(),
    locationLatitude: z.number().min(-90).max(90).nullable().optional(),
    locationLongitude: z.number().min(-180).max(180).nullable().optional(),
    locationConfidence: z.number().min(0).max(1).nullable().optional(),
    locationSource: z.string().trim().min(1).max(80).nullable().optional(),
    isActive: z.boolean().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one farm field is required.",
  });

type FarmRouteContext = {
  params: Promise<{ farmId: string }>;
};

export async function GET(request: Request, context: FarmRouteContext) {
  try {
    const routeParams = await context.params;
    const farmIdResult = farmParamsSchema.safeParse(routeParams);

    if (!farmIdResult.success) {
      return errorResponse(400, "VALIDATION_ERROR", "Invalid farm id.");
    }

    const decodedToken = await verifyTokenWithClaims(request);
    const farm = await getFarmByIdForUser(
      decodedToken.uid,
      farmIdResult.data.farmId,
    );

    if (!farm) {
      return errorResponse(404, "FARM_NOT_FOUND", "Farm not found.");
    }

    return successResponse({ farm });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: Request, context: FarmRouteContext) {
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

    const validationResult = updateFarmSchema.safeParse(requestBody);

    if (!validationResult.success) {
      return errorResponse(
        400,
        "VALIDATION_ERROR",
        "Invalid farm update payload.",
        validationResult.error.flatten(),
      );
    }

    const decodedToken = await verifyTokenWithClaims(request);
    const farm = await updateFarmByIdForUser(
      decodedToken.uid,
      farmIdResult.data.farmId,
      validationResult.data,
    );

    if (!farm) {
      return errorResponse(404, "FARM_NOT_FOUND", "Farm not found.");
    }

    return successResponse({ farm });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(request: Request, context: FarmRouteContext) {
  try {
    const routeParams = await context.params;
    const farmIdResult = farmParamsSchema.safeParse(routeParams);

    if (!farmIdResult.success) {
      return errorResponse(400, "VALIDATION_ERROR", "Invalid farm id.");
    }

    const decodedToken = await verifyTokenWithClaims(request);
    const deleted = await deleteFarmByIdForUser(
      decodedToken.uid,
      farmIdResult.data.farmId,
    );

    if (!deleted) {
      return errorResponse(404, "FARM_NOT_FOUND", "Farm not found.");
    }

    return successResponse({ deleted: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
