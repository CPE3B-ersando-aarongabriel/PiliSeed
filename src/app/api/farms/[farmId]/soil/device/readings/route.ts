import { z } from "zod";

import {
	errorResponse,
	handleRouteError,
	successResponse,
} from "../../../../../../../lib/apiResponse";
import { verifyDeviceToken } from "../../../../../../../lib/deviceAuth";
import { firestore } from "../../../../../../../lib/firebaseAdmin";
import { createSoilProfileForFarm } from "../../../../../../../lib/firestoreSchema";

export const runtime = "nodejs";

const farmParamsSchema = z.object({
	farmId: z.string().trim().min(1),
});

const deviceReadingsSchema = z.object({
	moistureContent: z.number().min(0).max(100),
	lightLevel: z.number().min(0),
	temperatureC: z.number().min(-50).max(80),
	humidity: z.number().min(0).max(100),
	pH: z.number().min(0).max(14).optional(),
});

type DeviceReadingsContext = {
	params: Promise<{ farmId: string }>;
};

const activationsCollection = firestore.collection("soilDeviceActivations");

export async function POST(request: Request, context: DeviceReadingsContext) {
	try {
		const routeParams = await context.params;
		const farmIdResult = farmParamsSchema.safeParse(routeParams);

		if (!farmIdResult.success) {
			return errorResponse(400, "VALIDATION_ERROR", "Invalid farm id.");
		}

		verifyDeviceToken(request);

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

		const validationResult = deviceReadingsSchema.safeParse(requestBody);

		if (!validationResult.success) {
			return errorResponse(
				400,
				"VALIDATION_ERROR",
				"Invalid device readings payload.",
				validationResult.error.flatten(),
			);
		}

		const farmSnapshot = await firestore.collection("farms").doc(farmIdResult.data.farmId).get();

		if (!farmSnapshot.exists) {
			return errorResponse(404, "FARM_NOT_FOUND", "Farm not found.");
		}

		const farmData = farmSnapshot.data() as { uid?: string | null } | undefined;
		const uid = farmData?.uid?.trim();

		if (!uid) {
			return errorResponse(
				404,
				"FARM_NOT_FOUND",
				"Farm owner information is missing.",
			);
		}

		const soilProfile = await createSoilProfileForFarm(uid, farmIdResult.data.farmId, {
			pH: validationResult.data.pH ?? null,
			nitrogen: null,
			phosphorus: null,
			potassium: null,
			moistureContent: validationResult.data.moistureContent,
			lightLevel: validationResult.data.lightLevel,
			temperatureC: validationResult.data.temperatureC,
			humidity: validationResult.data.humidity,
			soilSource: "api",
		});

		await activationsCollection.doc(farmIdResult.data.farmId).set(
			{
				status: "completed",
				completedAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			},
			{ merge: true },
		);

		return successResponse({ soilProfile }, 201);
	} catch (error) {
		return handleRouteError(error);
	}
}
