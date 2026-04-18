import { z } from "zod";

import {
  errorResponse,
  handleRouteError,
  successResponse,
} from "../../../../../../lib/apiResponse";
import { verifyTokenWithClaims } from "../../../../../../lib/authMiddleware";
import { getLatestSoilProfileForFarm } from "../../../../../../lib/firestoreSchema";

export const runtime = "nodejs";

const farmParamsSchema = z.object({
  farmId: z.string().trim().min(1),
});

type FarmSoilLatestContext = {
  params: Promise<{ farmId: string }>;
};

export async function GET(request: Request, context: FarmSoilLatestContext) {
  try {
    const routeParams = await context.params;
    const farmIdResult = farmParamsSchema.safeParse(routeParams);

    if (!farmIdResult.success) {
      return errorResponse(400, "VALIDATION_ERROR", "Invalid farm id.");
    }

    const decodedToken = await verifyTokenWithClaims(request);
    const soilProfile = await getLatestSoilProfileForFarm(
      decodedToken.uid,
      farmIdResult.data.farmId,
    );

    if (!soilProfile) {
      return errorResponse(
        404,
        "SOIL_PROFILE_NOT_FOUND",
        "No soil profile was found for this farm.",
      );
    }

    return successResponse({ soilProfile });
  } catch (error) {
    return handleRouteError(error);
  }
}
