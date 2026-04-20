import { z } from "zod";

import {
	errorResponse,
	handleRouteError,
	successResponse,
} from "../../../../../../lib/apiResponse";
import { verifyTokenWithClaims } from "../../../../../../lib/authMiddleware";
import {
	createSoilAnalysisForFarm,
	getFarmByIdForUser,
} from "../../../../../../lib/firestoreSchema";
import { scoreSoilClassification } from "../../../../../../lib/analysisService";
import { createGeocodingService } from "../../../../../../lib/geocodingService";
import { createSoilService } from "../../../../../../lib/soilService";

export const runtime = "nodejs";

const farmParamsSchema = z.object({
	farmId: z.string().trim().min(1),
});

const soilAnalyzeRequestSchema = z
	.object({
		latitude: z.number().min(-90).max(90).optional(),
		longitude: z.number().min(-180).max(180).optional(),
		locationText: z.string().trim().min(1).max(180).optional(),
		numberClasses: z.number().int().min(1).max(10).optional(),
	})
	.refine(
		(data) =>
			(data.latitude === undefined && data.longitude === undefined) ||
			(data.latitude !== undefined && data.longitude !== undefined),
		{
			message: "latitude and longitude must be provided together.",
			path: ["latitude"],
		},
	);

type SoilAnalyzeRequest = z.infer<typeof soilAnalyzeRequestSchema>;

type SoilRouteContext = {
	params: Promise<{ farmId: string }>;
};

const geocodingService = createGeocodingService();
const soilService = createSoilService();

async function resolveCoordinates(
	farmLocation: string | null,
	input: SoilAnalyzeRequest,
) {
	if (input.latitude !== undefined && input.longitude !== undefined) {
		return {
			latitude: input.latitude,
			longitude: input.longitude,
			geocode: {
				latitude: input.latitude,
				longitude: input.longitude,
				formattedAddress:
					input.locationText ?? farmLocation ?? `${input.latitude}, ${input.longitude}`,
				confidence: 1,
				source: "manual",
			},
		};
	}

	const locationText = input.locationText ?? farmLocation?.trim() ?? "";

	if (!locationText) {
		return null;
	}

	const geocodes = await geocodingService.geocodeLocationText(locationText, {
		limit: 1,
	});
	const geocode = geocodes[0];

	if (!geocode) {
		return null;
	}

	return {
		latitude: geocode.latitude,
		longitude: geocode.longitude,
		geocode,
	};
}

function toFirestoreClassificationPayload(
	classification: Awaited<
		ReturnType<ReturnType<typeof createSoilService>["fetchSoilClassification"]>
	>,
) {
	return {
		latitude: classification.latitude,
		longitude: classification.longitude,
		dominantClass: classification.dominantClass,
		dominantClassValue: classification.dominantClassValue,
		dominantClassProbability: classification.dominantClassProbability,
		classProbabilities: classification.classProbabilities,
		queryTimeSeconds: classification.queryTimeSeconds,
		source: classification.source,
	};
}

function toFirestoreAnalysisPayload(
	analysis: ReturnType<typeof scoreSoilClassification>,
) {
	return {
		score: analysis.score,
		summary: analysis.summary,
		flags: analysis.flags,
		nextSteps: analysis.nextSteps,
		explanation: analysis.explanation,
	};
}

export async function POST(request: Request, context: SoilRouteContext) {
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

		const normalizedBody = {
			...(requestBody as Record<string, unknown>),
		};

		if (normalizedBody.latitude === undefined && normalizedBody.lat !== undefined) {
			normalizedBody.latitude = normalizedBody.lat;
		}

		if (normalizedBody.longitude === undefined && normalizedBody.lon !== undefined) {
			normalizedBody.longitude = normalizedBody.lon;
		}

		if (
			normalizedBody.numberClasses === undefined &&
			normalizedBody.number_classes !== undefined
		) {
			normalizedBody.numberClasses = normalizedBody.number_classes;
		}

		const validationResult = soilAnalyzeRequestSchema.safeParse(normalizedBody);

		if (!validationResult.success) {
			return errorResponse(
				400,
				"VALIDATION_ERROR",
				"Invalid soil analyze payload.",
				validationResult.error.flatten(),
			);
		}

		const coordinates = await resolveCoordinates(farm.location, validationResult.data);

		if (!coordinates) {
			return errorResponse(
				400,
				"FARM_LOCATION_REQUIRED",
				"Provide latitude and longitude or set a farm location before analyzing soil.",
			);
		}

		const soilClassification = await soilService.fetchSoilClassification({
			latitude: coordinates.latitude,
			longitude: coordinates.longitude,
			numberClasses: validationResult.data.numberClasses,
		});

		const soilAnalysis = scoreSoilClassification(soilClassification);
		const soilProfile = await createSoilAnalysisForFarm(decodedToken.uid, farm.id, {
			texture: soilClassification.dominantClass,
			pH: null,
			moistureContent: null,
			nitrogen: null,
			phosphorus: null,
			potassium: null,
			soilSource: "api",
			soilClass: soilClassification.dominantClass,
			soilClassValue: soilClassification.dominantClassValue,
			soilClassProbability: soilClassification.dominantClassProbability,
			soilClassProbabilities: soilClassification.classProbabilities,
			classificationJson: toFirestoreClassificationPayload(soilClassification),
			analysisJson: toFirestoreAnalysisPayload(soilAnalysis),
		});

		if (!soilProfile) {
			return errorResponse(404, "FARM_NOT_FOUND", "Farm not found.");
		}

		return successResponse(
			{
				farmId: farm.id,
				geocode: coordinates.geocode,
				soilClassification,
				soilProfile,
				soilAnalysis,
			},
			201,
		);
	} catch (error) {
		return handleRouteError(error);
	}
}
