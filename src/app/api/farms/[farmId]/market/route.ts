import { z } from "zod";

import {
  errorResponse,
  handleRouteError,
  successResponse,
} from "../../../../../lib/apiResponse";
import { verifyTokenWithClaims } from "../../../../../lib/authMiddleware";
import {
  createMarketSnapshotForFarm,
  getFarmByIdForUser,
  getLatestCropRecommendationForFarm,
  getLatestMarketSnapshotForFarm,
  getLatestYieldForecastForFarm,
  type CropRecommendation,
} from "../../../../../lib/firestoreSchema";
import { createOpenAIService } from "../../../../../lib/openaiService";

export const runtime = "nodejs";

const farmParamsSchema = z.object({
  farmId: z.string().trim().min(1),
});

type FarmMarketContext = {
  params: Promise<{ farmId: string }>;
};

type AnomuraSearchPayload = {
  query?: string;
  count?: number;
  results?: unknown[];
};

type AnomuraCommodityRecord = {
  name: string;
  category: string | null;
  specification: string | null;
  unit: string | null;
  price: number;
  date?: string;
};

type ResolvedMarketPrice = {
  commodityName: string;
  symbol: string;
  price: number;
  unit: string;
  currency: "PHP";
  sourceDate: string | null;
  sourceProvider: "anomura.today" | "openai";
  sourceDetail: Record<string, unknown>;
  variants?: ResolvedMarketMatch[];
};

type ResolvedMarketMatch = {
  commodityName: string;
  category: string | null;
  specification: string | null;
  unit: string | null;
  price: number;
  date: string | null;
  score: number;
};

const ANOMURA_API_BASE_URL = "https://api.anomura.today";
const DEFAULT_CROP_NAME = "Rice";

const cropAliasMap: Record<string, string[]> = {
  RICE: ["palay", "bigas"],
  CORN: ["maize", "mais"],
  EGGPLANT: ["talong"],
  TOMATO: ["kamatis"],
  ONION: ["sibuyas"],
  CABBAGE: ["repolyo"],
  MUNGBEAN: ["monggo", "mung bean"],
};

const cropToMarketSymbolMap: Record<string, string> = {
  RICE: "RICE",
  PALAY: "RICE",
  CORN: "CORN",
  MAIZE: "CORN",
  WHEAT: "WHEAT",
  MUNGBEAN: "MUNGBEAN",
  MONGO: "MUNGBEAN",
  MONGGO: "MUNGBEAN",
  EGGPLANT: "EGGPLANT",
  TALONG: "EGGPLANT",
  TOMATO: "TOMATO",
  KAMATIS: "TOMATO",
};

function toUpperText(value: string | null | undefined): string {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().toUpperCase();
}

function toSearchText(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function toCommodityLabel(record: AnomuraCommodityRecord): string {
  const baseName = record.name.trim().replace(/,+$/, "");

  if (record.specification && record.specification.trim()) {
    return `${baseName} (${record.specification.trim()})`;
  }

  return baseName;
}

function toMarketSymbol(cropType: string): string {
  const upperCrop = toUpperText(cropType);
  const mapped = cropToMarketSymbolMap[upperCrop];

  if (mapped) {
    return mapped;
  }

  const normalized = upperCrop.replace(/[^A-Z0-9]+/g, "_").replace(/^_+|_+$/g, "");

  return normalized || "UNKNOWN";
}

function getCropSearchTerms(cropType: string): string[] {
  const upperCrop = toUpperText(cropType);
  const aliases = cropAliasMap[upperCrop] ?? [];

  return Array.from(new Set([cropType, ...aliases].map((item) => toSearchText(item)).filter(Boolean)));
}

function scoreAnomuraRecord(cropType: string, record: AnomuraCommodityRecord): number {
  const haystack = toSearchText(
    `${record.name} ${record.specification ?? ""} ${record.category ?? ""}`,
  );
  const terms = getCropSearchTerms(cropType);
  let score = 0;

  for (const term of terms) {
    if (haystack === term) {
      score = Math.max(score, 150);
      continue;
    }

    if (haystack.startsWith(`${term} `)) {
      score = Math.max(score, 130);
      continue;
    }

    if (haystack.includes(term)) {
      score = Math.max(score, 110);
      continue;
    }

    if (term.length > 3 && term.includes(haystack)) {
      score = Math.max(score, 40);
    }
  }

  if (record.unit?.toLowerCase().includes("kg")) {
    score += 5;
  }

  return score;
}

function toAnomuraRecord(payload: unknown): AnomuraCommodityRecord | null {
  if (typeof payload !== "object" || payload === null) {
    return null;
  }

  const record = payload as Record<string, unknown>;
  const rawPrice = record.price;

  if (typeof record.name !== "string") {
    return null;
  }

  if (typeof rawPrice !== "number" || !Number.isFinite(rawPrice) || rawPrice <= 0) {
    return null;
  }

  return {
    name: record.name,
    category: typeof record.category === "string" ? record.category : null,
    specification: typeof record.specification === "string" ? record.specification : null,
    unit: typeof record.unit === "string" ? record.unit : null,
    price: rawPrice,
    date: typeof record.date === "string" ? record.date : undefined,
  };
}

function resolvePrimaryCropName(
  recommendation: CropRecommendation | null,
): string {
  if (!recommendation || recommendation.recommendedCrops.length === 0) {
    return DEFAULT_CROP_NAME;
  }

  const bestRecommendation = [...recommendation.recommendedCrops].sort(
    (first, second) => second.score - first.score,
  )[0];

  const preferredCrop = bestRecommendation?.crop?.trim();

  return preferredCrop || DEFAULT_CROP_NAME;
}

function resolveRequestedCropType(input: {
  request: Request;
  yieldForecastCropType: string | null;
  recommendation: CropRecommendation | null;
}): string {
  const url = new URL(input.request.url);
  const queryCropType = url.searchParams.get("cropType")?.trim();

  if (queryCropType) {
    return queryCropType;
  }

  if (input.yieldForecastCropType) {
    return input.yieldForecastCropType;
  }

  return resolvePrimaryCropName(input.recommendation);
}

async function fetchAnomuraMarketPrice(cropType: string): Promise<ResolvedMarketPrice | null> {
  const requestUrl = new URL("/api/search", ANOMURA_API_BASE_URL);
  requestUrl.searchParams.set("q", cropType);

  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => timeoutController.abort(), 12000);

  try {
    const response = await fetch(requestUrl.toString(), {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: timeoutController.signal,
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const rawPayload: unknown = await response.json().catch(() => null);

    if (typeof rawPayload !== "object" || rawPayload === null || Array.isArray(rawPayload)) {
      return null;
    }

    const payload = rawPayload as AnomuraSearchPayload;
    const records = Array.isArray(payload.results)
      ? payload.results.map((item) => toAnomuraRecord(item)).filter((item): item is AnomuraCommodityRecord => item !== null)
      : [];

    if (records.length === 0) {
      return null;
    }

    const withScore = records
      .map((record) => ({
        record,
        score: scoreAnomuraRecord(cropType, record),
      }))
      .sort((first, second) => {
        if (second.score !== first.score) {
          return second.score - first.score;
        }

        const secondDate = second.record.date ?? "";
        const firstDate = first.record.date ?? "";

        return secondDate.localeCompare(firstDate);
      });

    const matchedVariants = withScore
      .filter((entry) => entry.score > 0)
      .map<ResolvedMarketMatch>(({ record, score }) => ({
        commodityName: toCommodityLabel(record),
        category: record.category,
        specification: record.specification,
        unit: record.unit,
        price: Number(record.price.toFixed(2)),
        date: record.date ?? null,
        score,
      }));

    const best = matchedVariants[0] ?? null;

    if (!best) {
      return null;
    }

    const averagePrice = matchedVariants.reduce(
      (total, variant) => total + variant.price,
      0,
    ) / matchedVariants.length;

    const latestMatchedDate = matchedVariants
      .map((variant) => variant.date)
      .filter((date): date is string => typeof date === "string" && date.trim().length > 0)
      .sort((first, second) => second.localeCompare(first))[0] ?? best.date;

    return {
      commodityName: best.commodityName,
      symbol: toMarketSymbol(cropType),
      price: Number(averagePrice.toFixed(2)),
      unit: "per kilo",
      currency: "PHP",
      sourceDate: latestMatchedDate,
      sourceProvider: "anomura.today",
      sourceDetail: {
        queryCropType: cropType,
        matchedName: best.commodityName,
        matchedCategory: best.category,
        matchedSpecification: best.specification,
        matchedUnit: best.unit,
        matchedScore: best.score,
        averagePrice: Number(averagePrice.toFixed(2)),
        matchedCount: matchedVariants.length,
        candidates: records.length,
        matchedVariants,
      },
      variants: matchedVariants,
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

const llmMarketSuggestionSchema = z.object({
  suggestedPricePhpPerKg: z.number().positive().max(100000),
  priceTrend: z.string().trim().min(1).max(80),
  localDemand: z.string().trim().min(1).max(80),
  supplySignal: z.string().trim().min(1).max(80),
  confidence: z.number().min(0).max(1),
  reasoning: z.string().trim().min(1).max(600).optional(),
});

async function buildOpenAIFallbackMarketPrice(input: {
  cropType: string;
  farmLocation: string | null;
}): Promise<ResolvedMarketPrice> {
  const openAIService = createOpenAIService();
  const prompt = [
    "You are estimating Philippine wet-market commodity price data.",
    "Return strict JSON only, no markdown and no additional text.",
    "Values must be realistic Philippine Peso per kilogram estimates for the current period.",
    "JSON schema:",
    '{"suggestedPricePhpPerKg":number,"priceTrend":"string","localDemand":"string","supplySignal":"string","confidence":0-1,"reasoning":"string"}',
    `Crop type: ${input.cropType}`,
    `Farm location: ${input.farmLocation ?? "unknown"}`,
    "Use conservative confidence when uncertain.",
  ].join("\n");

  const payload = await openAIService.generateJson(prompt);
  const parsed = llmMarketSuggestionSchema.safeParse(payload);

  if (!parsed.success) {
    throw new Error("OpenAI fallback did not return a valid market suggestion payload.");
  }

  return {
    commodityName: input.cropType,
    symbol: toMarketSymbol(input.cropType),
    price: Number(parsed.data.suggestedPricePhpPerKg.toFixed(2)),
    unit: "per kilo",
    currency: "PHP",
    sourceDate: new Date().toISOString().slice(0, 10),
    sourceProvider: "openai",
    sourceDetail: {
      queryCropType: input.cropType,
      priceTrend: parsed.data.priceTrend,
      localDemand: parsed.data.localDemand,
      supplySignal: parsed.data.supplySignal,
      confidence: parsed.data.confidence,
      reasoning: parsed.data.reasoning ?? null,
    },
  };
}

export async function GET(request: Request, context: FarmMarketContext) {
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

    const [latestRecommendation, latestYieldForecast] = await Promise.all([
      getLatestCropRecommendationForFarm(decodedToken.uid, farm.id),
      getLatestYieldForecastForFarm(decodedToken.uid, farm.id),
    ]);

    const cropType = resolveRequestedCropType({
      request,
      yieldForecastCropType: latestYieldForecast?.cropType ?? null,
      recommendation: latestRecommendation,
    });

    const primaryMarket = await fetchAnomuraMarketPrice(cropType);
    const resolvedMarket =
      primaryMarket ??
      (await buildOpenAIFallbackMarketPrice({
        cropType,
        farmLocation: farm.location,
      }));

    const previousSnapshot = await getLatestMarketSnapshotForFarm(
      decodedToken.uid,
      farm.id,
      resolvedMarket.symbol,
    );

    const previousPrice = previousSnapshot?.price ?? null;

    const percentageChange =
      typeof previousPrice === "number" &&
      Number.isFinite(previousPrice) &&
      previousPrice > 0
        ? ((resolvedMarket.price - previousPrice) / previousPrice) * 100
        : 0;

    await createMarketSnapshotForFarm(decodedToken.uid, farm.id, {
      commodityName: resolvedMarket.commodityName,
      symbol: resolvedMarket.symbol,
      price: resolvedMarket.price,
      unit: resolvedMarket.unit,
      currency: resolvedMarket.currency,
      sourceDate: resolvedMarket.sourceDate,
    });

    return successResponse({
      farmId: farm.id,
      market: {
        cropType,
        commodityName: resolvedMarket.commodityName,
        symbol: resolvedMarket.symbol,
        price: resolvedMarket.price,
        unit: resolvedMarket.unit,
        currency: resolvedMarket.currency,
        percentageChange,
        trendDirection: percentageChange > 0 ? "up" : "down",
        variants: resolvedMarket.variants ?? [],
      },
      source: {
        date: resolvedMarket.sourceDate,
        provider: resolvedMarket.sourceProvider,
        usedFallback: resolvedMarket.sourceProvider === "openai",
        detail: resolvedMarket.sourceDetail,
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
