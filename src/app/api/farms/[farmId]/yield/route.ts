import { z } from "zod";

import {
  errorResponse,
  handleRouteError,
  successResponse,
} from "../../../../../lib/apiResponse";
import { verifyTokenWithClaims } from "../../../../../lib/authMiddleware";
import {
  getFarmByIdForUser,
  getLatestYieldForecastForFarm,
} from "../../../../../lib/firestoreSchema";

export const runtime = "nodejs";

const farmParamsSchema = z.object({
  farmId: z.string().trim().min(1),
});

type FarmYieldContext = {
  params: Promise<{ farmId: string }>;
};

export async function GET(request: Request, context: FarmYieldContext) {
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

    const latestYieldForecast = await getLatestYieldForecastForFarm(
      decodedToken.uid,
      farm.id,
    );

    if (!latestYieldForecast) {
      return errorResponse(
        404,
        "YIELD_FORECAST_NOT_FOUND",
        "No yield forecast was found for this farm.",
      );
    }

    return successResponse({
      farmId: farm.id,
      yieldForecast: {
        ...latestYieldForecast,
        estimatedRevenuePhp: latestYieldForecast.estimatedRevenue,
        estimatedRevenueCurrency: "PHP",
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
