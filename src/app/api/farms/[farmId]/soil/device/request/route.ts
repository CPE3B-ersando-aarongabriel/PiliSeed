import { z } from "zod";

import {
  errorResponse,
  handleRouteError,
  successResponse,
} from "../../../../../../../lib/apiResponse";
import { verifyTokenWithClaims } from "../../../../../../../lib/authMiddleware";
import {
  getFarmByIdForUser,
  requestFarmDeviceReadingForUser,
} from "../../../../../../../lib/firestoreSchema";

export const runtime = "nodejs";

const farmParamsSchema = z.object({
  farmId: z.string().trim().min(1),
});

type SoilDeviceRequestContext = {
  params: Promise<{ farmId: string }>;
};

export async function POST(
  request: Request,
  context: SoilDeviceRequestContext,
) {
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

    const linkedDevice = await requestFarmDeviceReadingForUser(
      decodedToken.uid,
      farm.id,
    );

    if (!linkedDevice) {
      return errorResponse(
        404,
        "DEVICE_NOT_CONNECTED",
        "No soil sensor device is currently linked to this farm.",
        { farmId: farm.id },
      );
    }

    return successResponse({
      farmId: farm.id,
      device: {
        id: linkedDevice.deviceId,
        name: linkedDevice.deviceName,
      },
      activation: {
        pending: linkedDevice.activationPending,
        requestedAt: linkedDevice.lastActivationRequestedAt,
      },
      message: "Device reading request queued.",
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
