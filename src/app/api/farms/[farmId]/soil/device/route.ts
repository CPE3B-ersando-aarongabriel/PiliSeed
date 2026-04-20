import { z } from "zod";

import {
	errorResponse,
	handleRouteError,
	successResponse,
} from "../../../../../../lib/apiResponse";
import { verifyTokenWithClaims } from "../../../../../../lib/authMiddleware";
import {
	getFarmByIdForUser,
	getFarmDeviceLinkForUser,
} from "../../../../../../lib/firestoreSchema";

export const runtime = "nodejs";

const farmParamsSchema = z.object({
	farmId: z.string().trim().min(1),
});

type SoilDeviceContext = {
	params: Promise<{ farmId: string }>;
};

export async function GET(request: Request, context: SoilDeviceContext) {
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

		const linkedDevice = await getFarmDeviceLinkForUser(decodedToken.uid, farm.id);

		if (!linkedDevice) {
			return errorResponse(
				404,
				"DEVICE_NOT_CONNECTED",
				"No soil sensor device is currently linked to this farm.",
				{ farmId: farm.id },
			);
		}

		return successResponse(
			{
				farmId: farm.id,
				device: {
					id: linkedDevice.deviceId,
					name: linkedDevice.deviceName,
					tokenHint: linkedDevice.tokenHint,
					status: "connected",
					linkedAt: linkedDevice.linkedAt,
					lastSeenAt: linkedDevice.lastSeenAt,
					source: "linked-farm-device",
				},
				activation: {
					pending: linkedDevice.activationPending,
					lastRequestedAt: linkedDevice.lastActivationRequestedAt,
					lastFulfilledAt: linkedDevice.lastActivationFulfilledAt,
				},
				readings: linkedDevice.lastReadings,
				collectedAt: linkedDevice.lastCollectedAt,
				source: "device-link",
			},
			200,
		);
	} catch (error) {
		return handleRouteError(error);
	}
}
