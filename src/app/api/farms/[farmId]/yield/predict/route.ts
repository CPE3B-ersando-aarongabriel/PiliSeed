import { z } from "zod";

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
  type YieldForecastResult,
} from "../../../../../../lib/analysisContracts";
import {
  createYieldForecastForFarm,
  getFarmByIdForUser,
  getLatestSoilProfileForFarm,
  getLatestWeatherSnapshotForFarm,
} from "../../../../../../lib/firestoreSchema";
import { createOpenAIService } from "../../../../../../lib/openaiService";
import { AnalysisExternalServiceError } from "../../../../../../lib/analysisErrors";

export const runtime = "nodejs";

const farmParamsSchema = z.object({
  farmId: z.string().trim().min(1),
});

const yieldPredictSchema = z.object({
  cropType: z.string().trim().min(1).max(80),
  season: z.string().trim().min(1).max(40),
  forecastPeriod: z.string().trim().min(1).max(60),
  marketContext: z
    .object({
      priceTrend: z.string().trim().min(1).max(80).optional(),
      localDemand: z.string().trim().min(1).max(80).optional(),
      supplySignal: z.string().trim().min(1).max(80).optional(),
      confidence: z.number().min(0).max(1).optional(),
    })
    .optional(),
});

type FarmYieldPredictContext = {
  params: Promise<{ farmId: string }>;
};

const aiYieldForecastSchema = z.object({
  expectedYield: z.number().min(0).max(20),
  estimatedRevenuePhp: z.number().min(0).nullable(),
  analysisText: z.string().trim().min(1).max(1200),
  warningFlags: z.array(z.string().trim().min(1).max(200)).max(20).default([]),
});

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

function toNormalizedMarketContext(input: z.infer<typeof yieldPredictSchema>): NormalizedMarketContext | null {
  if (!input.marketContext) {
    return null;
  }

  return {
    cropType: input.cropType,
    priceTrend: input.marketContext.priceTrend ?? null,
    localDemand: input.marketContext.localDemand ?? null,
    supplySignal: input.marketContext.supplySignal ?? null,
    confidence: input.marketContext.confidence ?? null,
    source: "yield-predict-request",
    raw: {
      marketContext: input.marketContext,
    },
  };
}

function buildOpenAIYieldPrompt(input: {
  farmName: string;
  farmLocation: string | null;
  requestInput: z.infer<typeof yieldPredictSchema>;
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
    `Request input: ${JSON.stringify(input.requestInput)}`,
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

async function generateYieldForecastWithOpenAI(input: {
  farmName: string;
  farmLocation: string | null;
  requestInput: z.infer<typeof yieldPredictSchema>;
  soil: NormalizedSoilSnapshot | null;
  weather: NormalizedWeatherSnapshot | null;
  market: NormalizedMarketContext | null;
  contextSummary: ReturnType<typeof summarizeAnalysisInput>;
}): Promise<YieldForecastResult> {
  const openAIService = createOpenAIService();
  const prompt = buildOpenAIYieldPrompt(input);
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
      requestInput: input.requestInput,
    },
  };
}

export async function POST(request: Request, context: FarmYieldPredictContext) {
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

    const validationResult = yieldPredictSchema.safeParse(requestBody);

    if (!validationResult.success) {
      return errorResponse(
        400,
        "VALIDATION_ERROR",
        "Invalid yield forecast payload.",
        validationResult.error.flatten(),
      );
    }

    const [latestSoilProfile, latestWeatherSnapshot] = await Promise.all([
      getLatestSoilProfileForFarm(decodedToken.uid, farm.id),
      getLatestWeatherSnapshotForFarm(decodedToken.uid, farm.id),
    ]);

    const soil = toNormalizedSoilSnapshot(latestSoilProfile);
    const weather = toNormalizedWeatherSnapshot(latestWeatherSnapshot);
    const market = toNormalizedMarketContext(validationResult.data);
    const contextSummary = summarizeAnalysisInput({ soil, weather, market });

    const yieldForecast = await generateYieldForecastWithOpenAI({
      farmName: farm.name,
      farmLocation: farm.location,
      requestInput: validationResult.data,
      soil,
      weather,
      market,
      contextSummary,
    });

    const yieldForecastRecord = await createYieldForecastForFarm(
      decodedToken.uid,
      farm.id,
      {
        cropType: validationResult.data.cropType,
        season: validationResult.data.season,
        forecastPeriod: validationResult.data.forecastPeriod,
        expectedYield: yieldForecast.expectedYield,
        unit: yieldForecast.unit,
        estimatedRevenue: yieldForecast.estimatedRevenue,
        marketContext: yieldForecast.marketContext,
        analysisText: yieldForecast.analysisText,
        warningFlags: yieldForecast.warningFlags,
        generatedBy: "openai",
        forecastJson: {
          farmId: farm.id,
          cropType: validationResult.data.cropType,
          season: validationResult.data.season,
          forecastPeriod: validationResult.data.forecastPeriod,
          contextSummary,
          expectedYield: yieldForecast.expectedYield,
          unit: yieldForecast.unit,
          estimatedRevenue: yieldForecast.estimatedRevenue,
          marketContext: yieldForecast.marketContext,
          warningFlags: yieldForecast.warningFlags,
          estimatedRevenueCurrency: "PHP",
        },
      },
    );

    if (!yieldForecastRecord) {
      return errorResponse(404, "FARM_NOT_FOUND", "Farm not found.");
    }

    return successResponse(
      {
        farmId: farm.id,
        contextSummary,
        forecast: {
          expectedYield: yieldForecast.expectedYield,
          unit: yieldForecast.unit,
          estimatedRevenuePhp: yieldForecast.estimatedRevenue,
          estimatedRevenueCurrency: "PHP",
          marketContext: yieldForecast.marketContext,
          analysisText: yieldForecast.analysisText,
          warningFlags: yieldForecast.warningFlags,
        },
        yieldForecastRecord: {
          ...yieldForecastRecord,
          estimatedRevenuePhp: yieldForecastRecord.estimatedRevenue,
          estimatedRevenueCurrency: "PHP",
        },
        metadata: {
          aiUsed: true,
          generatedBy: "openai",
        },
      },
      201,
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
