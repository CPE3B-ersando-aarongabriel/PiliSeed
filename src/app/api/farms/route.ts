import { z } from "zod";

import {
  errorResponse,
  handleRouteError,
  successResponse,
} from "../../../lib/apiResponse";
import { verifyTokenWithClaims } from "../../../lib/authMiddleware";
import { createFarm, listFarmsByUid } from "../../../lib/firestoreSchema";

export const runtime = "nodejs";

const createFarmSchema = z.object({
  name: z.string().trim().min(1).max(120),
  location: z.string().trim().min(2).max(180).nullable().optional(),
  locationLatitude: z.number().min(-90).max(90).nullable().optional(),
  locationLongitude: z.number().min(-180).max(180).nullable().optional(),
  locationConfidence: z.number().min(0).max(1).nullable().optional(),
  locationSource: z.string().trim().min(1).max(80).nullable().optional(),
  isActive: z.boolean().optional(),
});

export async function GET(request: Request) {
  try {
    const decodedToken = await verifyTokenWithClaims(request);
    const farms = await listFarmsByUid(decodedToken.uid);

    return successResponse({ farms });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
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

    const validationResult = createFarmSchema.safeParse(requestBody);

    if (!validationResult.success) {
      return errorResponse(
        400,
        "VALIDATION_ERROR",
        "Invalid farm payload.",
        validationResult.error.flatten(),
      );
    }

    const decodedToken = await verifyTokenWithClaims(request);
    const farm = await createFarm(decodedToken.uid, validationResult.data);

    return successResponse({ farm }, 201);
  } catch (error) {
    return handleRouteError(error);
  }
}
