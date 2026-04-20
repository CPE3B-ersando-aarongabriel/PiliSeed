import { z } from "zod";

import {
  errorResponse,
  handleRouteError,
} from "../../../../../lib/apiResponse";
import { verifyTokenWithClaims } from "../../../../../lib/authMiddleware";
import { getFarmByIdForUser } from "../../../../../lib/firestoreSchema";

export const runtime = "nodejs";

const farmParamsSchema = z.object({
  farmId: z.string().trim().min(1),
});

type FarmWeatherContext = {
  params: Promise<{ farmId: string }>;
};

export async function GET(request: Request, context: FarmWeatherContext) {
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

    return errorResponse(
      501,
      "NOT_IMPLEMENTED",
      "Weather endpoint placeholder is ready, but weather integration is not implemented yet.",
      {
        farmId: farm.id,
      },
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
