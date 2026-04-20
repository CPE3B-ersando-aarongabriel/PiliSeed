import { z } from "zod";

import {
  errorResponse,
  handleRouteError,
  successResponse,
} from "../../../../../../lib/apiResponse";
import { verifyTokenWithClaims } from "../../../../../../lib/authMiddleware";
import { summarizeAnalysisInput } from "../../../../../../lib/analysisService";
import {
  type NormalizedSoilSnapshot,
  type NormalizedWeatherSnapshot,
  type RecommendationItem,
  type RecommendationResult,
} from "../../../../../../lib/analysisContracts";
import {
  createCropRecommendationForFarm,
  getFarmByIdForUser,
  getLatestCropRecommendationForFarm,
  getLatestSoilProfileForFarm,
  getLatestWeatherSnapshotForFarm,
} from "../../../../../../lib/firestoreSchema";
import { createOpenAIService } from "../../../../../../lib/openaiService";
import { AnalysisExternalServiceError } from "../../../../../../lib/analysisErrors";

export const runtime = "nodejs";

const farmParamsSchema = z.object({
  farmId: z.string().trim().min(1),
});

const moreRecommendationSchema = z.object({
  budget: z.string().trim().min(1).max(40).optional(),
  goal: z.string().trim().min(1).max(80).optional(),
  landSize: z.string().trim().min(1).max(80).optional(),
  plantingDuration: z.string().trim().min(1).max(80).optional(),
});

type RecommendationMoreContext = {
  params: Promise<{ farmId: string }>;
};

const aiRecommendationSchema = z.object({
  recommendedCrops: z
    .array(
      z.object({
        crop: z.string().trim().min(1).max(80),
        score: z.number().min(0).max(100),
        reason: z.string().trim().min(1).max(300),
      }),
    )
    .min(1)
    .max(10),
  analysisText: z.string().trim().min(1).max(1200),
  warningFlags: z.array(z.string().trim().min(1).max(200)).max(20).default([]),
});

function toNormalizedSoilSnapshot(
  soilProfile: Awaited<ReturnType<typeof getLatestSoilProfileForFarm>>,
): NormalizedSoilSnapshot | null {
  if (!soilProfile) {
    return null;
  }

  return {
    texture: soilProfile.texture,
    phLevel: soilProfile.pH,
    moistureContent: soilProfile.moistureContent,
    lightLevel: soilProfile.lightLevel,
    temperatureC: soilProfile.temperatureC,
    humidity: soilProfile.humidity,
    nitrogen: soilProfile.nitrogen,
    phosphorus: soilProfile.phosphorus,
    potassium: soilProfile.potassium,
    soilSource: soilProfile.soilSource,
    analysis: soilProfile.analysisJson ?? {},
    source: soilProfile.soilSource === "api" ? "soil-api" : "soil-profile",
  };
}

function toRainRisk(rainfallMm: number | null): NormalizedWeatherSnapshot["rainRisk"] {
  if (rainfallMm === null) {
    return "unknown";
  }

  if (rainfallMm >= 12) {
    return "high";
  }

  if (rainfallMm >= 4) {
    return "medium";
  }

  return "low";
}

function toNormalizedWeatherSnapshot(
  weatherSnapshot: Awaited<ReturnType<typeof getLatestWeatherSnapshotForFarm>>,
): NormalizedWeatherSnapshot | null {
  if (!weatherSnapshot) {
    return null;
  }

  return {
    temperatureC: weatherSnapshot.temperatureC,
    humidity: weatherSnapshot.humidity,
    rainfallMm: weatherSnapshot.rainfallMm,
    rainRisk: toRainRisk(weatherSnapshot.rainfallMm),
    alertText: null,
    forecast: [],
    source: "weather-snapshot",
  };
}

function buildMoreOpenAIPrompt(input: {
  farmName: string;
  farmLocation: string | null;
  userInput: z.infer<typeof moreRecommendationSchema>;
  soil: NormalizedSoilSnapshot | null;
  weather: NormalizedWeatherSnapshot | null;
  contextSummary: ReturnType<typeof summarizeAnalysisInput>;
  previousRecommendations: RecommendationItem[];
}) {
  return [
    "You are an agricultural crop recommendation engine.",
    "Use only provided farm context. Do not invent measurements.",
    "Return strict JSON only, no markdown and no extra text.",
    "JSON schema:",
    '{"recommendedCrops":[{"crop":"string","score":0-100,"reason":"string"}],"analysisText":"string","warningFlags":["string"]}',
    `Farm: ${input.farmName}`,
    `Farm location: ${input.farmLocation ?? "unknown"}`,
    `User input: ${JSON.stringify(input.userInput)}`,
    "User input fields include budget, goal, landSize, and plantingDuration.",
    `Soil context: ${JSON.stringify(input.soil)}`,
    `Weather context: ${JSON.stringify(input.weather)}`,
    `Has soil context: ${input.contextSummary.hasSoil}`,
    `Has weather context: ${input.contextSummary.hasWeather}`,
    `Previous recommended crops: ${JSON.stringify(input.previousRecommendations.map((item) => item.crop))}`,
    "This request came from a 'More recommendations' button after an initial recommendation.",
    "Try to provide alternative crop options to broaden choices while staying practical.",
    "Requirements:",
    "1) recommendedCrops must be sorted highest score first.",
    "2) Provide at least 3 crops when possible.",
    "3) Keep reasons practical and tied to given context.",
    "4) warningFlags should mention data gaps or risks.",
  ].join("\n");
}

function normalizeAIRecommendation(
  aiPayload: z.infer<typeof aiRecommendationSchema>,
): RecommendationResult {
  const recommendedCrops: RecommendationItem[] = aiPayload.recommendedCrops
    .map((item) => ({
      crop: item.crop,
      score: Math.max(0, Math.min(100, Math.round(item.score))),
      reason: item.reason,
    }))
    .sort((firstItem, secondItem) => {
      if (secondItem.score !== firstItem.score) {
        return secondItem.score - firstItem.score;
      }

      return firstItem.crop.localeCompare(secondItem.crop);
    });

  return {
    recommendedCrops,
    analysisText: aiPayload.analysisText,
    warningFlags: aiPayload.warningFlags,
    raw: {
      source: "openai",
      generatedAt: new Date().toISOString(),
      mode: "more",
    },
  };
}

async function generateMoreOpenAIRecommendation(input: {
  farmName: string;
  farmLocation: string | null;
  userInput: z.infer<typeof moreRecommendationSchema>;
  soil: NormalizedSoilSnapshot | null;
  weather: NormalizedWeatherSnapshot | null;
  contextSummary: ReturnType<typeof summarizeAnalysisInput>;
  previousRecommendations: RecommendationItem[];
}): Promise<RecommendationResult> {
  const openAIService = createOpenAIService();
  const prompt = buildMoreOpenAIPrompt(input);
  const aiResponse = await openAIService.generateJson(prompt);
  const validationResult = aiRecommendationSchema.safeParse(aiResponse);

  if (!validationResult.success) {
    throw new AnalysisExternalServiceError(
      "OpenAI recommendation payload did not match the expected schema.",
      502,
      validationResult.error.flatten(),
    );
  }

  return normalizeAIRecommendation(validationResult.data);
}

function sanitizeRecommendationRecord(input: {
  farmId: string;
  recommendation: RecommendationResult;
  generatedBy: "deterministic" | "hybrid" | "openai";
  contextSummary: ReturnType<typeof summarizeAnalysisInput>;
  previousRecommendationId: string | null;
}) {
  return {
    farmId: input.farmId,
    generatedBy: input.generatedBy,
    mode: "more",
    previousRecommendationId: input.previousRecommendationId,
    recommendedCrops: input.recommendation.recommendedCrops,
    warningFlags: input.recommendation.warningFlags,
    contextSummary: input.contextSummary,
  };
}

export async function POST(
  request: Request,
  context: RecommendationMoreContext,
) {
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

    const validationResult = moreRecommendationSchema.safeParse(requestBody);

    if (!validationResult.success) {
      return errorResponse(
        400,
        "VALIDATION_ERROR",
        "Invalid recommendation payload.",
        validationResult.error.flatten(),
      );
    }

    const [latestSoilProfile, latestWeatherSnapshot, latestRecommendation] = await Promise.all([
      getLatestSoilProfileForFarm(decodedToken.uid, farm.id),
      getLatestWeatherSnapshotForFarm(decodedToken.uid, farm.id),
      getLatestCropRecommendationForFarm(decodedToken.uid, farm.id),
    ]);

    const soil = toNormalizedSoilSnapshot(latestSoilProfile);
    const weather = toNormalizedWeatherSnapshot(latestWeatherSnapshot);
    const contextSummary = summarizeAnalysisInput({ soil, weather, market: null });

    const recommendation = await generateMoreOpenAIRecommendation({
      farmName: farm.name,
      farmLocation: farm.location,
      userInput: validationResult.data,
      soil,
      weather,
      contextSummary,
      previousRecommendations: latestRecommendation?.recommendedCrops ?? [],
    });

    const generatedBy = "openai" as const;

    const recommendationRecord = await createCropRecommendationForFarm(
      decodedToken.uid,
      farm.id,
      {
        recommendedCrops: recommendation.recommendedCrops,
        analysisText: recommendation.analysisText,
        warningFlags: recommendation.warningFlags,
        generatedBy,
        recommendationJson: sanitizeRecommendationRecord({
          farmId: farm.id,
          recommendation,
          generatedBy,
          contextSummary,
          previousRecommendationId: latestRecommendation?.id ?? null,
        }),
      },
    );

    if (!recommendationRecord) {
      return errorResponse(404, "FARM_NOT_FOUND", "Farm not found.");
    }

    return successResponse(
      {
        farmId: farm.id,
        contextSummary,
        previousRecommendationId: latestRecommendation?.id ?? null,
        recommendation,
        recommendationRecord,
        metadata: {
          aiUsed: true,
          generatedBy,
          mode: "more",
        },
      },
      201,
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
