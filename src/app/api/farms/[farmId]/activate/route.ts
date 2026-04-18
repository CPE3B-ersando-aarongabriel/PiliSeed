import { z } from "zod";

import {
  errorResponse,
  handleRouteError,
  successResponse,
} from "../../../../../lib/apiResponse";
import { verifyTokenWithClaims } from "../../../../../lib/authMiddleware";
import { activateFarmByIdForUser } from "../../../../../lib/firestoreSchema";

export const runtime = "nodejs";

const farmParamsSchema = z.object({
  farmId: z.string().trim().min(1),
});

type FarmActivateContext = {
  params: Promise<{ farmId: string }>;
};

export async function PATCH(request: Request, context: FarmActivateContext) {
  try {
    const routeParams = await context.params;
    const farmIdResult = farmParamsSchema.safeParse(routeParams);

    if (!farmIdResult.success) {
      return errorResponse(400, "VALIDATION_ERROR", "Invalid farm id.");
    }

    const decodedToken = await verifyTokenWithClaims(request);
    const farm = await activateFarmByIdForUser(
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

export async function POST(request: Request, context: FarmActivateContext) {
  return PATCH(request, context);
}
