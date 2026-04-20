import { createHash } from "crypto";
import { z } from "zod";

import {
  errorResponse,
  handleRouteError,
  successResponse,
} from "../../../../../../../lib/apiResponse";
import { getFarmDeviceLinkByFarmId } from "../../../../../../../lib/firestoreSchema";

export const runtime = "nodejs";

const farmParamsSchema = z.object({
  farmId: z.string().trim().min(1),
});

const activateQuerySchema = z.object({
  deviceId: z.string().trim().min(1).max(128),
});

type SoilDeviceActivateContext = {
  params: Promise<{ farmId: string }>;
};

function hashToken(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export async function GET(request: Request, context: SoilDeviceActivateContext) {
  try {
    const routeParams = await context.params;
    const farmIdResult = farmParamsSchema.safeParse(routeParams);

    if (!farmIdResult.success) {
      return errorResponse(400, "VALIDATION_ERROR", "Invalid farm id.");
    }

    const requestUrl = new URL(request.url);
    const queryValidation = activateQuerySchema.safeParse({
      deviceId: requestUrl.searchParams.get("deviceId") ?? "",
    });

    if (!queryValidation.success) {
      return errorResponse(
        400,
        "VALIDATION_ERROR",
        "Invalid activation query parameters.",
        queryValidation.error.flatten(),
      );
    }

    const deviceToken = request.headers.get("x-device-token")?.trim();

    if (!deviceToken) {
      return errorResponse(
        401,
        "DEVICE_TOKEN_REQUIRED",
        "Missing X-Device-Token header.",
      );
    }

    const linkedDevice = await getFarmDeviceLinkByFarmId(farmIdResult.data.farmId);

    if (!linkedDevice) {
      return errorResponse(
        404,
        "DEVICE_NOT_CONNECTED",
        "No soil sensor device is currently linked to this farm.",
      );
    }

    const hashedToken = hashToken(deviceToken);

    if (
      linkedDevice.deviceId !== queryValidation.data.deviceId ||
      linkedDevice.tokenHash !== hashedToken
    ) {
      return errorResponse(
        401,
        "DEVICE_AUTH_FAILED",
        "Device credentials are not valid for this farm.",
      );
    }

    return successResponse({
      farmId: linkedDevice.farmId,
      deviceId: linkedDevice.deviceId,
      shouldActivate: linkedDevice.activationPending,
      activationRequestedAt: linkedDevice.lastActivationRequestedAt,
      lastSeenAt: linkedDevice.lastSeenAt,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
