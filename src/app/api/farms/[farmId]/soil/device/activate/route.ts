import { randomUUID } from "crypto";

import { FieldValue } from "firebase-admin/firestore";
import { z } from "zod";

import {
	errorResponse,
	handleRouteError,
	successResponse,
} from "../../../../../../../lib/apiResponse";
import { verifyTokenWithClaims } from "../../../../../../../lib/authMiddleware";
import { firestore } from "../../../../../../../lib/firebaseAdmin";
import { getFarmByIdForUser } from "../../../../../../../lib/firestoreSchema";
import { verifyDeviceToken } from "../../../../../../../lib/deviceAuth";

export const runtime = "nodejs";

const farmParamsSchema = z.object({
	farmId: z.string().trim().min(1),
});

const activationQuerySchema = z.object({
	deviceId: z.string().trim().min(1),
});

type DeviceActivationContext = {
	params: Promise<{ farmId: string }>;
};

const activationsCollection = firestore.collection("soilDeviceActivations");

export async function POST(request: Request, context: DeviceActivationContext) {
	try {
		const routeParams = await context.params;
		const farmIdResult = farmParamsSchema.safeParse(routeParams);

		if (!farmIdResult.success) {
			return errorResponse(400, "VALIDATION_ERROR", "Invalid farm id.");
		}

		const decodedToken = await verifyTokenWithClaims(request);
		const farm = await getFarmByIdForUser(decodedToken.uid, farmIdResult.data.farmId);

		if (!farm) {
			return errorResponse(404, "FARM_NOT_FOUND", "Farm not found.");
		}

		if (!farm.location?.trim()) {
			return errorResponse(
				400,
				"FARM_LOCATION_REQUIRED",
				"The selected farm must have a saved location before device activation can run.",
			);
		}

		const activationId = randomUUID();
		await activationsCollection.doc(farm.id).set({
			activationId,
			uid: decodedToken.uid,
			farmId: farm.id,
			status: "pending",
			requestedAt: FieldValue.serverTimestamp(),
			claimedAt: null,
			claimedByDeviceId: null,
			completedAt: null,
			updatedAt: FieldValue.serverTimestamp(),
		});

		return successResponse(
			{
				farmId: farm.id,
				activationId,
				status: "pending",
				message: "Device activation queued.",
			},
			202,
		);
	} catch (error) {
		return handleRouteError(error);
	}
}

export async function GET(request: Request, context: DeviceActivationContext) {
	try {
		const routeParams = await context.params;
		const farmIdResult = farmParamsSchema.safeParse(routeParams);

		if (!farmIdResult.success) {
			return errorResponse(400, "VALIDATION_ERROR", "Invalid farm id.");
		}

		const queryValidation = activationQuerySchema.safeParse({
			deviceId: new URL(request.url).searchParams.get("deviceId") ?? undefined,
		});

		if (!queryValidation.success) {
			return errorResponse(
				400,
				"VALIDATION_ERROR",
				"Invalid device activation query parameters.",
				queryValidation.error.flatten(),
			);
		}

		verifyDeviceToken(request);

		const activationSnapshot = await activationsCollection.doc(farmIdResult.data.farmId).get();

		if (!activationSnapshot.exists) {
			return successResponse({ shouldActivate: false, status: "idle" });
		}

		const activationData = activationSnapshot.data() as {
			status?: string;
			activationId?: string;
			claimedByDeviceId?: string | null;
			requestedAt?: unknown;
		};

		if (activationData.status !== "pending") {
			return successResponse({ shouldActivate: false, status: activationData.status ?? "idle" });
		}

		await activationSnapshot.ref.set(
			{
				status: "claimed",
				claimedAt: FieldValue.serverTimestamp(),
				claimedByDeviceId: queryValidation.data.deviceId,
				updatedAt: FieldValue.serverTimestamp(),
			},
			{ merge: true },
		);

		return successResponse({
			shouldActivate: true,
			status: "claimed",
			farmId: farmIdResult.data.farmId,
			deviceId: queryValidation.data.deviceId,
			activationId: activationData.activationId ?? null,
		});
	} catch (error) {
		return handleRouteError(error);
	}
}
