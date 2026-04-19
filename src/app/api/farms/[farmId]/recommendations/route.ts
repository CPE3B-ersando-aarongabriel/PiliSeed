import { z } from "zod";

import {
  errorResponse,
  handleRouteError,
  successResponse,
} from "../../../../../lib/apiResponse";
import { verifyTokenWithClaims } from "../../../../../lib/authMiddleware";
import {
  getFarmByIdForUser,
  listRecentCropRecommendationsForFarm,
} from "../../../../../lib/firestoreSchema";

export const runtime = "nodejs";

const farmParamsSchema = z.object({
  farmId: z.string().trim().min(1),
});

const recommendationsQuerySchema = z.object({
  limit: z.number().int().min(1).max(100).optional(),
});

type FarmRecommendationsContext = {
  params: Promise<{ farmId: string }>;
};

export async function GET(
  request: Request,
  context: FarmRecommendationsContext,
) {
  try {
    const routeParams = await context.params;
    const farmIdResult = farmParamsSchema.safeParse(routeParams);

    if (!farmIdResult.success) {
      return errorResponse(400, "VALIDATION_ERROR", "Invalid farm id.");
    }

    const requestUrl = new URL(request.url);
    const queryValidation = recommendationsQuerySchema.safeParse({
      limit: requestUrl.searchParams.get("limit")
        ? Number(requestUrl.searchParams.get("limit"))
        : undefined,
    });

    if (!queryValidation.success) {
      return errorResponse(
        400,
        "VALIDATION_ERROR",
        "Invalid recommendations query params.",
        queryValidation.error.flatten(),
      );
    }

    const decodedToken = await verifyTokenWithClaims(request);
    const farm = await getFarmByIdForUser(
      decodedToken.uid,
      farmIdResult.data.farmId,
    );

    if (!farm) {
      return errorResponse(404, "FARM_NOT_FOUND", "Farm not found.");
    }

    const limit = queryValidation.data.limit ?? 10;
    const recommendations = await listRecentCropRecommendationsForFarm(
      decodedToken.uid,
      farm.id,
      limit,
    );

    return successResponse({
      farmId: farm.id,
      recommendations,
      count: recommendations.length,
      limit,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
