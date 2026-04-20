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
import {
	type AnalysisResult,
	type NormalizedSoilSnapshot,
} from "../../../../../../lib/analysisContracts";
import {
	scoreSoilClassification,
	scoreSoilSnapshot,
} from "../../../../../../lib/analysisService";
import { createGeocodingService } from "../../../../../../lib/geocodingService";
import { createSoilService } from "../../../../../../lib/soilService";

export const runtime = "nodejs";

const farmParamsSchema = z.object({
	farmId: z.string().trim().min(1),
});

const soilAnalyzeRequestSchema = z
	.object({
		numberClasses: z.number().int().min(1).max(10).optional(),
		nitrogen: z.number().min(0).optional(),
		phosphorus: z.number().min(0).optional(),
		potassium: z.number().min(0).optional(),
		moistureContent: z.number().min(0).max(100).optional(),
		pH: z.number().min(0).max(14).optional(),
		lightLevel: z.number().min(0).optional(),
		temperatureC: z.number().min(-50).max(80).optional(),
		humidity: z.number().min(0).max(100).optional(),
	})
	.refine(
		(data) => {
			const hasNitrogen = data.nitrogen !== undefined;
			const hasPhosphorus = data.phosphorus !== undefined;
			const hasPotassium = data.potassium !== undefined;

			const providedCount = [hasNitrogen, hasPhosphorus, hasPotassium].filter(
				Boolean,
			).length;

			return providedCount === 0 || providedCount === 3;
		},
		{
			message:
				"Provide all NPK values together (nitrogen, phosphorus, potassium) or omit all three.",
			path: ["nitrogen"],
		},
	);

type SoilAnalyzeRequest = z.infer<typeof soilAnalyzeRequestSchema>;

type SoilRouteContext = {
	params: Promise<{ farmId: string }>;
};

const geocodingService = createGeocodingService();
const soilService = createSoilService();

function normalizeOptionalNumericInput(value: unknown) {
	if (value === null || value === undefined) {
		return undefined;
	}

	if (typeof value === "string" && value.trim().length === 0) {
		return undefined;
	}

	return value;
}

function toFirestoreClassificationPayload(
	classification: Awaited<
		ReturnType<ReturnType<typeof createSoilService>["fetchSoilClassification"]>
	>,
	sensorContext: Record<string, number | null>,
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
		sensorContext,
	};
}

function toFirestoreAnalysisPayload(
	analysis: AnalysisResult,
	sensorContext: Record<string, number | null>,
) {
	return {
		score: analysis.score,
		summary: analysis.summary,
		flags: analysis.flags,
		nextSteps: analysis.nextSteps,
		explanation: analysis.explanation,
		sensorContext,
	};
}

function buildSensorContext(input: SoilAnalyzeRequest) {
	return {
		pH: input.pH ?? null,
		moistureContent: input.moistureContent ?? null,
		lightLevel: input.lightLevel ?? null,
		temperatureC: input.temperatureC ?? null,
		humidity: input.humidity ?? null,
		nitrogen: input.nitrogen ?? null,
		phosphorus: input.phosphorus ?? null,
		potassium: input.potassium ?? null,
	};
}

function hasManualSoilContext(input: SoilAnalyzeRequest) {
	return (
		input.pH !== undefined ||
		input.moistureContent !== undefined ||
		input.nitrogen !== undefined ||
		input.phosphorus !== undefined ||
		input.potassium !== undefined
	);
}

function hasAnySensorReadings(input: SoilAnalyzeRequest) {
	return (
		input.pH !== undefined ||
		input.moistureContent !== undefined ||
		input.lightLevel !== undefined ||
		input.temperatureC !== undefined ||
		input.humidity !== undefined
	);
}

function toManualSoilSnapshot(input: SoilAnalyzeRequest): NormalizedSoilSnapshot {
	return {
		texture: null,
		phLevel: input.pH ?? null,
		moistureContent: input.moistureContent ?? null,
		lightLevel: input.lightLevel ?? null,
		temperatureC: input.temperatureC ?? null,
		humidity: input.humidity ?? null,
		nitrogen: input.nitrogen ?? null,
		phosphorus: input.phosphorus ?? null,
		potassium: input.potassium ?? null,
		soilSource: "manual",
		analysis: {
			inputMode:
				input.nitrogen !== undefined ||
				input.phosphorus !== undefined ||
				input.potassium !== undefined
					? "manual-npk"
					: "sensor-context",
			sensorContext: buildSensorContext(input),
		},
		source: "soil-analyze-manual-context",
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

		if (!farm.location?.trim()) {
			return errorResponse(
				400,
				"FARM_LOCATION_REQUIRED",
				"The selected farm must have a saved location before soil analysis can run.",
			);
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

		normalizedBody.nitrogen = normalizeOptionalNumericInput(
			normalizedBody.nitrogen,
		);
		normalizedBody.phosphorus = normalizeOptionalNumericInput(
			normalizedBody.phosphorus,
		);
		normalizedBody.potassium = normalizeOptionalNumericInput(
			normalizedBody.potassium,
		);
		normalizedBody.moistureContent = normalizeOptionalNumericInput(
			normalizedBody.moistureContent,
		);
		normalizedBody.pH = normalizeOptionalNumericInput(normalizedBody.pH);
		normalizedBody.lightLevel = normalizeOptionalNumericInput(
			normalizedBody.lightLevel,
		);
		normalizedBody.temperatureC = normalizeOptionalNumericInput(
			normalizedBody.temperatureC,
		);
		normalizedBody.humidity = normalizeOptionalNumericInput(
			normalizedBody.humidity,
		);
		normalizedBody.n = normalizeOptionalNumericInput(normalizedBody.n);
		normalizedBody.p = normalizeOptionalNumericInput(normalizedBody.p);
		normalizedBody.k = normalizeOptionalNumericInput(normalizedBody.k);
		if (normalizedBody.pH === undefined && normalizedBody.ph !== undefined) {
			normalizedBody.pH = normalizeOptionalNumericInput(normalizedBody.ph);
		}
		if (
			normalizedBody.moistureContent === undefined &&
			normalizedBody.moisture !== undefined
		) {
			normalizedBody.moistureContent = normalizeOptionalNumericInput(
				normalizedBody.moisture,
			);
		}
		if (
			normalizedBody.lightLevel === undefined &&
			normalizedBody.light !== undefined
		) {
			normalizedBody.lightLevel = normalizeOptionalNumericInput(
				normalizedBody.light,
			);
		}
		if (
			normalizedBody.temperatureC === undefined &&
			normalizedBody.temperature !== undefined
		) {
			normalizedBody.temperatureC = normalizeOptionalNumericInput(
				normalizedBody.temperature,
			);
		}

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

		if (normalizedBody.nitrogen === undefined && normalizedBody.n !== undefined) {
			normalizedBody.nitrogen = normalizedBody.n;
		}

		if (
			normalizedBody.phosphorus === undefined &&
			normalizedBody.p !== undefined
		) {
			normalizedBody.phosphorus = normalizedBody.p;
		}

		if (normalizedBody.potassium === undefined && normalizedBody.k !== undefined) {
			normalizedBody.potassium = normalizedBody.k;
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

		const sensorContext = buildSensorContext(validationResult.data);
		const hasManualNpk =
			validationResult.data.nitrogen !== undefined &&
			validationResult.data.phosphorus !== undefined &&
			validationResult.data.potassium !== undefined;
		const hasManualSoilInputs = hasManualSoilContext(validationResult.data);
		const hasAnySensorData = hasAnySensorReadings(validationResult.data);
		const geocodes = await geocodingService.geocodeLocationText(
			farm.location.trim(),
			{ limit: 1 },
		);
		const geocode = geocodes[0];

		if (!geocode) {
			return errorResponse(
				400,
				"FARM_LOCATION_UNRESOLVED",
				"The selected farm location could not be resolved to coordinates.",
			);
		}

		let soilClassification: Awaited<
			ReturnType<ReturnType<typeof createSoilService>["fetchSoilClassification"]>
		> | null = null;
		let soilAnalysis: AnalysisResult;
		let soilSource: "manual" | "api" | "mixed" = "api";
		let analysisBasis: "manual_npk" | "sensor_context" | "api_classification" =
			"api_classification";

		if (hasManualSoilInputs) {
			soilSource = "manual";
			analysisBasis = hasManualNpk ? "manual_npk" : "sensor_context";
			soilAnalysis = scoreSoilSnapshot(toManualSoilSnapshot(validationResult.data));
		} else {
			soilClassification = await soilService.fetchSoilClassification({
				latitude: geocode.latitude,
				longitude: geocode.longitude,
				numberClasses: validationResult.data.numberClasses,
			});

			soilAnalysis = scoreSoilClassification(soilClassification);
			soilSource = hasAnySensorData ? "mixed" : "api";
		}

		const soilProfile = await createSoilAnalysisForFarm(decodedToken.uid, farm.id, {
			texture: soilClassification?.dominantClass ?? null,
			pH: validationResult.data.pH ?? null,
			moistureContent: validationResult.data.moistureContent ?? null,
			lightLevel: validationResult.data.lightLevel ?? null,
			temperatureC: validationResult.data.temperatureC ?? null,
			humidity: validationResult.data.humidity ?? null,
			nitrogen: validationResult.data.nitrogen ?? null,
			phosphorus: validationResult.data.phosphorus ?? null,
			potassium: validationResult.data.potassium ?? null,
			soilSource,
			soilClass: soilClassification?.dominantClass ?? null,
			soilClassValue: soilClassification?.dominantClassValue ?? null,
			soilClassProbability: soilClassification?.dominantClassProbability ?? null,
			soilClassProbabilities: soilClassification?.classProbabilities ?? [],
			classificationJson: soilClassification
				? toFirestoreClassificationPayload(soilClassification, sensorContext)
				: {
					inputMode: hasManualNpk ? "manual-npk" : "sensor-context",
					sensorContext,
					nitrogen: validationResult.data.nitrogen ?? null,
					phosphorus: validationResult.data.phosphorus ?? null,
					potassium: validationResult.data.potassium ?? null,
					source: "manual",
				},
			analysisJson: toFirestoreAnalysisPayload(soilAnalysis, sensorContext),
		});

		if (!soilProfile) {
			return errorResponse(404, "FARM_NOT_FOUND", "Farm not found.");
		}

		return successResponse(
			{
				farmId: farm.id,
				geocode,
				soilClassification,
				soilProfile,
				soilAnalysis,
				metadata: {
					analysisBasis,
				},
			},
			201,
		);
	} catch (error) {
		return handleRouteError(error);
	}
}
