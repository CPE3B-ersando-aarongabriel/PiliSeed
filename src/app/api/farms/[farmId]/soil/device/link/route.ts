import { createHash } from "crypto";
import { z } from "zod";

import {
  errorResponse,
  handleRouteError,
  successResponse,
} from "../../../../../../../lib/apiResponse";
import { verifyTokenWithClaims } from "../../../../../../../lib/authMiddleware";
import {
  getFarmByIdForUser,
  upsertFarmDeviceLinkForUser,
} from "../../../../../../../lib/firestoreSchema";

export const runtime = "nodejs";

const farmParamsSchema = z.object({
  farmId: z.string().trim().min(1),
});

const linkDeviceRequestSchema = z.object({
  deviceName: z.string().trim().min(1).max(120),
  deviceId: z.string().trim().min(1).max(128),
  deviceToken: z.string().trim().min(8).max(256),
});

type SoilDeviceLinkContext = {
  params: Promise<{ farmId: string }>;
};

function hashToken(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function buildTokenHint(value: string) {
  const trimmed = value.trim();

  if (trimmed.length <= 4) {
    return trimmed;
  }

  return trimmed.slice(-4);
}

export async function POST(request: Request, context: SoilDeviceLinkContext) {
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

    const validationResult = linkDeviceRequestSchema.safeParse(requestBody);

    if (!validationResult.success) {
      return errorResponse(
        400,
        "VALIDATION_ERROR",
        "Invalid device link payload.",
        validationResult.error.flatten(),
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

    const tokenHash = hashToken(validationResult.data.deviceToken.trim());
    const linkedDevice = await upsertFarmDeviceLinkForUser(
      decodedToken.uid,
      farm.id,
      {
        deviceId: validationResult.data.deviceId,
        deviceName: validationResult.data.deviceName,
        tokenHash,
        tokenHint: buildTokenHint(validationResult.data.deviceToken),
      },
    );

    if (!linkedDevice) {
      return errorResponse(404, "FARM_NOT_FOUND", "Farm not found.");
    }

    return successResponse(
      {
        farmId: farm.id,
        device: {
          id: linkedDevice.deviceId,
          name: linkedDevice.deviceName,
          tokenHint: linkedDevice.tokenHint,
          linkedAt: linkedDevice.linkedAt,
          status: "connected",
        },
      },
      201,
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
