import { z } from "zod";

import {
	errorResponse,
	handleRouteError,
	successResponse,
} from "../../../../../../lib/apiResponse";
import { verifyTokenWithClaims } from "../../../../../../lib/authMiddleware";
import { getFarmByIdForUser } from "../../../../../../lib/firestoreSchema";

export const runtime = "nodejs";

const farmParamsSchema = z.object({
	farmId: z.string().trim().min(1),
});

const deviceQuerySchema = z.object({
	simulateNoDevice: z
		.enum(["1", "true", "yes", "on"])
		.optional(),
});

type SoilDeviceContext = {
	params: Promise<{ farmId: string }>;
};

function hashString(value: string) {
	let hash = 0;

	for (let index = 0; index < value.length; index += 1) {
		hash = (hash << 5) - hash + value.charCodeAt(index);
		hash |= 0;
	}

	return Math.abs(hash);
}

function buildMockReadings(seed: string) {
	const hash = hashString(seed);
	const moistureContent = Number((28 + (hash % 36) / 2).toFixed(1));
	const pH = Number((5.6 + ((hash >> 3) % 19) / 10).toFixed(1));
	const lightLevel = Math.round(800 + (hash % 9200));
	const temperatureC = Number((24 + ((hash >> 6) % 85) / 10).toFixed(1));
	const humidity = Number((52 + ((hash >> 9) % 34)).toFixed(1));

	return {
		moistureContent,
		pH,
		lightLevel,
		temperatureC,
		humidity,
	};
}

export async function GET(request: Request, context: SoilDeviceContext) {
	try {
		const routeParams = await context.params;
		const farmIdResult = farmParamsSchema.safeParse(routeParams);

		if (!farmIdResult.success) {
			return errorResponse(400, "VALIDATION_ERROR", "Invalid farm id.");
		}

		const requestUrl = new URL(request.url);
		const queryValidation = deviceQuerySchema.safeParse({
			simulateNoDevice: requestUrl.searchParams.get("simulateNoDevice") ?? undefined,
		});

		if (!queryValidation.success) {
			return errorResponse(
				400,
				"VALIDATION_ERROR",
				"Invalid soil device query parameters.",
				queryValidation.error.flatten(),
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

		if (queryValidation.data.simulateNoDevice) {
			return errorResponse(
				404,
				"DEVICE_NOT_CONNECTED",
				"No soil sensor device is currently linked to this farm.",
				{ farmId: farm.id },
			);
		}

		const readings = buildMockReadings(`${farm.id}:${farm.name}:${farm.location ?? ""}`);
		const collectedAt = new Date().toISOString();

		return successResponse(
			{
				farmId: farm.id,
				device: {
					id: "mock-esp32-soil-node",
					status: "connected",
					source: "mock",
				},
				readings,
				collectedAt,
				source: "mock-device",
			},
			200,
		);
	} catch (error) {
		return handleRouteError(error);
	}
}
