import { z } from "zod";
import { randomUUID } from "node:crypto";

import {
  errorResponse,
  handleRouteError,
  successResponse,
} from "../../../../../../lib/apiResponse";
import { verifyTokenWithClaims } from "../../../../../../lib/authMiddleware";
import {
  summarizeAnalysisInput,
} from "../../../../../../lib/analysisService";
import {
  type NormalizedMarketContext,
  type NormalizedSoilSnapshot,
  type NormalizedWeatherSnapshot,
  type RecommendationItem,
  type RecommendationResult,
  type YieldForecastResult,
} from "../../../../../../lib/analysisContracts";
import {
  createCropRecommendationForFarm,
  createYieldForecastForFarm,
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

const personalizeSchema = z.object({
  budget: z.string().trim().min(1).max(40).optional(),
  demandSignal: z.string().trim().min(1).max(80).optional(),
  supplySignal: z.string().trim().min(1).max(80).optional(),
  goal: z.string().trim().min(1).max(80).optional(),
  landSize: z.string().trim().min(1).max(80).optional(),
  plantingDuration: z.string().trim().min(1).max(80).optional(),
});

type RecommendationPersonalizeContext = {
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

const aiYieldForecastSchema = z.object({
  expectedYield: z.number().min(0).max(20),
  estimatedRevenuePhp: z.number().min(0).nullable(),
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

function toMarketConfidence(budget: string | undefined) {
  const normalizedBudget = budget?.trim().toLowerCase() ?? "";

  if (normalizedBudget === "high") {
    return 0.8;
  }

  if (normalizedBudget === "medium") {
    return 0.6;
  }

  if (normalizedBudget === "low") {
    return 0.4;
  }

  return 0.5;
}

function toPriceTrend(
  demandSignal: string | undefined,
  supplySignal: string | undefined,
) {
  const demand = demandSignal?.trim().toLowerCase() ?? "";
  const supply = supplySignal?.trim().toLowerCase() ?? "";

  const demandHigh = demand.includes("high") || demand.includes("strong");
  const demandLow = demand.includes("low") || demand.includes("weak");
  const supplyHigh = supply.includes("high") || supply.includes("surplus");
  const supplyLow = supply.includes("low") || supply.includes("tight");

  if (demandHigh && supplyLow) {
    return "rising";
  }

  if (demandLow && supplyHigh) {
    return "falling";
  }

  return "stable";
}

function toNormalizedMarketContext(
  input: z.infer<typeof personalizeSchema>,
  cropType: string,
): NormalizedMarketContext {
  return {
    cropType,
    priceTrend: toPriceTrend(input.demandSignal, input.supplySignal),
    localDemand: input.demandSignal ?? null,
    supplySignal: input.supplySignal ?? null,
    confidence: toMarketConfidence(input.budget),
    source: "recommendations-personalize",
    raw: {
      demandSignal: input.demandSignal ?? null,
      supplySignal: input.supplySignal ?? null,
      budget: input.budget ?? null,
    },
  };
}

function currentSeasonFromDate(now: Date) {
  const month = now.getUTCMonth() + 1;

  if (month >= 5 && month <= 11) {
    return "wet";
  }

  return "dry";
}

function currentQuarterFromDate(now: Date) {
  const quarter = Math.floor(now.getUTCMonth() / 3) + 1;

  return `${now.getUTCFullYear()}-Q${quarter}`;
}

function buildPersonalizeOpenAIPrompt(input: {
  farmName: string;
  farmLocation: string | null;
  userInput: z.infer<typeof personalizeSchema>;
  soil: NormalizedSoilSnapshot | null;
  weather: NormalizedWeatherSnapshot | null;
  contextSummary: ReturnType<typeof summarizeAnalysisInput>;
  previousRecommendations: RecommendationItem[];
}) {
  const priceTrend = toPriceTrend(input.userInput.demandSignal, input.userInput.supplySignal);
  const hasMarketContext = input.userInput.demandSignal || input.userInput.supplySignal;
  
  return [
    "You are an agricultural crop recommendation engine optimizing for market & personalization.",
    "Use ONLY the provided farm context. Do not invent measurements or make assumptions.",
    "RETURN STRICT JSON ONLY. No markdown, no explanation text, no extra formatting.",
    "",
    "Expected JSON format (strict):",
    "{",
    '  "recommendedCrops": [',
    '    {"crop": "crop name (string)", "score": number 0-100, "reason": "explanation (max 300 chars)"},',
    '    ...',
    "  ],",
    '  "analysisText": "full analysis (max 1200 chars)",',
    '  "warningFlags": ["warning 1", "warning 2"]',
    "}",
    "",
    `Farm: ${input.farmName}`,
    `Farm location: ${input.farmLocation ?? "unknown"}`,
    `User inputs: ${JSON.stringify(input.userInput)}`,
    `Soil data: ${JSON.stringify(input.soil)}`,
    `Weather data: ${JSON.stringify(input.weather)}`,
    `Has soil context: ${input.contextSummary.hasSoil}`,
    `Has weather context: ${input.contextSummary.hasWeather}`,
    hasMarketContext ? `Market trend: ${priceTrend} (based on demand/supply signals)` : "Market context: not provided",
    `Previously recommended crops: ${JSON.stringify(input.previousRecommendations.map((item) => item.crop))}`,
    "",
    "CRITICAL CONSTRAINTS:",
    "- Score must be a number between 0 and 100 (inclusive)",
    "- Crop name max 80 characters",
    "- Reason max 300 characters",
    "- Analysis text max 1200 characters",
    "- Provide minimum 3 crops when possible, maximum 10",
    "- MANDATORY: Only recommend crops that can realistically grow within the specified plantingDuration",
    "- MANDATORY: Consider market trends (demand/supply/budget) in scoring",
    "- warningFlags array: list data gaps or risks",
    "- Sort crops by score (highest first)",
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
      mode: "personalized",
    },
  };
}

async function generatePersonalizedRecommendation(input: {
  farmName: string;
  farmLocation: string | null;
  userInput: z.infer<typeof personalizeSchema>;
  soil: NormalizedSoilSnapshot | null;
  weather: NormalizedWeatherSnapshot | null;
  contextSummary: ReturnType<typeof summarizeAnalysisInput>;
  previousRecommendations: RecommendationItem[];
}): Promise<RecommendationResult> {
  const openAIService = createOpenAIService();
  const prompt = buildPersonalizeOpenAIPrompt(input);
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
  sessionId: string;
  sessionStartedAt: string;
  farmName: string;
  farmLocation: string | null;
  inputSnapshot: z.infer<typeof personalizeSchema>;
  recommendation: RecommendationResult;
  generatedBy: "deterministic" | "hybrid" | "openai";
  contextSummary: ReturnType<typeof summarizeAnalysisInput>;
  previousRecommendationId: string | null;
}) {
  return {
    farmId: input.farmId,
    sessionId: input.sessionId,
    sessionStartedAt: input.sessionStartedAt,
    farmName: input.farmName,
    farmLocation: input.farmLocation,
    mode: "personalized",
    inputSnapshot: input.inputSnapshot,
    generatedBy: input.generatedBy,
    previousRecommendationId: input.previousRecommendationId,
    recommendedCrops: input.recommendation.recommendedCrops,
    warningFlags: input.recommendation.warningFlags,
    contextSummary: input.contextSummary,
  };
}

function sanitizeYieldRecord(input: {
  farmId: string;
  cropType: string;
  season: string;
  forecastPeriod: string;
  yieldForecast: YieldForecastResult;
  contextSummary: ReturnType<typeof summarizeAnalysisInput>;
  recommendationId: string;
}) {
  return {
    farmId: input.farmId,
    mode: "personalized",
    recommendationId: input.recommendationId,
    cropType: input.cropType,
    season: input.season,
    forecastPeriod: input.forecastPeriod,
    expectedYield: input.yieldForecast.expectedYield,
    unit: input.yieldForecast.unit,
    estimatedRevenue: input.yieldForecast.estimatedRevenue,
    marketContext: input.yieldForecast.marketContext,
    warningFlags: input.yieldForecast.warningFlags,
    contextSummary: input.contextSummary,
  };
}

function buildPersonalizedYieldOpenAIPrompt(input: {
  farmName: string;
  farmLocation: string | null;
  personalizationInput: z.infer<typeof personalizeSchema>;
  cropType: string;
  season: string;
  forecastPeriod: string;
  soil: NormalizedSoilSnapshot | null;
  weather: NormalizedWeatherSnapshot | null;
  market: NormalizedMarketContext | null;
  contextSummary: ReturnType<typeof summarizeAnalysisInput>;
}) {
  return [
    "You are an agricultural yield forecast engine.",
    "Use only provided farm context. Do not invent measurements.",
    "All revenue values must be in Philippine Peso (PHP).",
    "Return strict JSON only, no markdown and no extra text.",
    "JSON schema:",
    '{"expectedYield":0-20,"estimatedRevenuePhp":number|null,"analysisText":"string","warningFlags":["string"]}',
    `Farm: ${input.farmName}`,
    `Farm location: ${input.farmLocation ?? "unknown"}`,
    `Personalization input: ${JSON.stringify(input.personalizationInput)}`,
    `Crop type: ${input.cropType}`,
    `Season: ${input.season}`,
    `Forecast period: ${input.forecastPeriod}`,
    `Soil context: ${JSON.stringify(input.soil)}`,
    `Weather context: ${JSON.stringify(input.weather)}`,
    `Market context: ${JSON.stringify(input.market)}`,
    `Has soil context: ${input.contextSummary.hasSoil}`,
    `Has weather context: ${input.contextSummary.hasWeather}`,
    "Requirements:",
    "1) expectedYield must be in tons_per_hectare.",
    "2) estimatedRevenuePhp must be null if market confidence is too limited.",
    "3) analysisText should explain the key drivers briefly.",
    "4) warningFlags should identify uncertainty or missing context.",
  ].join("\n");
}

async function generatePersonalizedYieldForecastWithOpenAI(input: {
  farmName: string;
  farmLocation: string | null;
  personalizationInput: z.infer<typeof personalizeSchema>;
  cropType: string;
  season: string;
  forecastPeriod: string;
  soil: NormalizedSoilSnapshot | null;
  weather: NormalizedWeatherSnapshot | null;
  market: NormalizedMarketContext | null;
  contextSummary: ReturnType<typeof summarizeAnalysisInput>;
}): Promise<YieldForecastResult> {
  const openAIService = createOpenAIService();
  const prompt = buildPersonalizedYieldOpenAIPrompt(input);
  const aiResponse = await openAIService.generateJson(prompt);
  const validationResult = aiYieldForecastSchema.safeParse(aiResponse);

  if (!validationResult.success) {
    throw new AnalysisExternalServiceError(
      "OpenAI yield forecast payload did not match the expected schema.",
      502,
      validationResult.error.flatten(),
    );
  }

  return {
    expectedYield: Number(validationResult.data.expectedYield.toFixed(2)),
    unit: "tons_per_hectare",
    estimatedRevenue: validationResult.data.estimatedRevenuePhp,
    marketContext: input.market
      ? {
          priceTrend: input.market.priceTrend,
          localDemand: input.market.localDemand,
          supplySignal: input.market.supplySignal,
          confidence: input.market.confidence,
        }
      : null,
    analysisText: validationResult.data.analysisText,
    warningFlags: validationResult.data.warningFlags,
    raw: {
      source: "openai",
      generatedAt: new Date().toISOString(),
      mode: "personalized",
    },
  };
}

export async function POST(
  request: Request,
  context: RecommendationPersonalizeContext,
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

    const validationResult = personalizeSchema.safeParse(requestBody);

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
    const sessionId =
      latestRecommendation?.sessionId ||
      (typeof latestRecommendation?.recommendationJson?.sessionId === "string"
        ? latestRecommendation.recommendationJson.sessionId
        : randomUUID());
    const sessionStartedAt =
      latestRecommendation?.sessionStartedAt ?? new Date().toISOString();

    const recommendation = await generatePersonalizedRecommendation({
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
        sessionId,
        sessionStartedAt,
        recommendedCrops: recommendation.recommendedCrops,
        analysisText: recommendation.analysisText,
        warningFlags: recommendation.warningFlags,
        generatedBy,
        recommendationJson: sanitizeRecommendationRecord({
          farmId: farm.id,
          sessionId,
          sessionStartedAt,
          farmName: farm.name,
          farmLocation: farm.location,
          inputSnapshot: validationResult.data,
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

    const topRecommendedCrop = recommendation.recommendedCrops[0]?.crop ?? "mixed-crops";
    const now = new Date();
    const season = currentSeasonFromDate(now);
    const forecastPeriod = currentQuarterFromDate(now);
    const market = toNormalizedMarketContext(validationResult.data, topRecommendedCrop);

    const yieldForecast = await generatePersonalizedYieldForecastWithOpenAI({
      farmName: farm.name,
      farmLocation: farm.location,
      personalizationInput: validationResult.data,
      cropType: topRecommendedCrop,
      season,
      forecastPeriod,
      soil,
      weather,
      market,
      contextSummary,
    });

    const yieldForecastRecord = await createYieldForecastForFarm(
      decodedToken.uid,
      farm.id,
      {
        cropType: topRecommendedCrop,
        season,
        forecastPeriod,
        expectedYield: yieldForecast.expectedYield,
        unit: yieldForecast.unit,
        estimatedRevenue: yieldForecast.estimatedRevenue,
        marketContext: yieldForecast.marketContext,
        analysisText: yieldForecast.analysisText,
        warningFlags: yieldForecast.warningFlags,
        generatedBy: "openai",
        forecastJson: sanitizeYieldRecord({
          farmId: farm.id,
          cropType: topRecommendedCrop,
          season,
          forecastPeriod,
          yieldForecast,
          contextSummary,
          recommendationId: recommendationRecord.id,
        }),
      },
    );

    if (!yieldForecastRecord) {
      return errorResponse(404, "FARM_NOT_FOUND", "Farm not found.");
    }

    return successResponse(
      {
        farmId: farm.id,
        sessionId,
        contextSummary,
        previousRecommendationId: latestRecommendation?.id ?? null,
        recommendation,
        recommendationRecord,
        yieldForecast,
        yieldForecastRecord,
        metadata: {
          aiUsed: true,
          generatedBy,
          mode: "personalized",
          yieldIncluded: true,
        },
      },
      201,
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
