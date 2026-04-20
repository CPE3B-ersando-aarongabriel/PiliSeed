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
  type CropRecommendation,
} from "../../../../../lib/firestoreSchema";

export const runtime = "nodejs";

const farmParamsSchema = z.object({
  farmId: z.string().trim().min(1),
});

type FarmMarketContext = {
  params: Promise<{ farmId: string }>;
};

type CommodityApiPayload = {
  success?: boolean;
  date?: string;
  base?: string;
  symbol?: string;
  rates?: Record<string, unknown>;
  unit?: Record<string, unknown> | string;
};

const RAPID_API_HOST = "commodity-rates-api.p.rapidapi.com";
const RAPID_API_LATEST_ENDPOINT = `https://${RAPID_API_HOST}/latest`;
const DEFAULT_CROP_SYMBOL = "RICE";

const cropToCommoditySymbolMap: Record<string, string> = {
  RICE: "RICE",
  PALAY: "RICE",
  CORN: "CORN",
  MAIZE: "CORN",
  WHEAT: "WHEAT",
};

const commodityDisplayNameMap: Record<string, string> = {
  RICE: "Rice",
  CORN: "Corn",
  WHEAT: "Wheat",
};

function toUpperText(value: string | null | undefined): string {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().toUpperCase();
}

function resolvePrimaryCropSymbol(
  recommendation: CropRecommendation | null,
): string {
  if (!recommendation || recommendation.recommendedCrops.length === 0) {
    return DEFAULT_CROP_SYMBOL;
  }

  const bestRecommendation = [...recommendation.recommendedCrops].sort(
    (first, second) => second.score - first.score,
  )[0];

  const preferredCrop = toUpperText(bestRecommendation?.crop);

  return cropToCommoditySymbolMap[preferredCrop] ?? DEFAULT_CROP_SYMBOL;
}

async function fetchLatestCommodityRate(symbol: string) {
  const apiKey = process.env.COMMODITY_API_KEY?.trim();

  if (!apiKey) {
    return {
      error: errorResponse(
        500,
        "CONFIGURATION_ERROR",
        "Commodity API key is not configured.",
      ),
      data: null,
    } as const;
  }

  const requestUrl = new URL(RAPID_API_LATEST_ENDPOINT);
  requestUrl.searchParams.set("base", "USD");
  requestUrl.searchParams.set("symbols", symbol);

  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => {
    timeoutController.abort();
  }, 12000);

  try {
    const response = await fetch(requestUrl.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-rapidapi-host": RAPID_API_HOST,
        "x-rapidapi-key": apiKey,
      },
      signal: timeoutController.signal,
      cache: "no-store",
    });

    if (!response.ok) {
      const rawErrorBody = await response.text().catch(() => "");

      return {
        error: errorResponse(
          502,
          "EXTERNAL_SERVICE_ERROR",
          "Commodity provider request failed.",
          {
            status: response.status,
            response: rawErrorBody.slice(0, 500),
          },
        ),
        data: null,
      } as const;
    }

    const rawPayload: unknown = await response.json().catch(() => null);

    if (typeof rawPayload !== "object" || rawPayload === null) {
      return {
        error: errorResponse(
          502,
          "INVALID_COMMODITY_RESPONSE",
          "Commodity provider returned an invalid JSON payload.",
        ),
        data: null,
      } as const;
    }

    const payload = (
      "data" in rawPayload &&
      typeof (rawPayload as { data?: unknown }).data === "object" &&
      (rawPayload as { data?: unknown }).data !== null
        ? (rawPayload as { data: CommodityApiPayload }).data
        : (rawPayload as CommodityApiPayload)
    ) as CommodityApiPayload;

    const rates = payload.rates;

    if (typeof rates !== "object" || rates === null) {
      return {
        error: errorResponse(
          502,
          "INVALID_COMMODITY_RESPONSE",
          "Commodity provider response did not include rates.",
        ),
        data: null,
      } as const;
    }

    const directRate = rates[symbol];
    const resolvedRate =
      typeof directRate === "number"
        ? directRate
        : Object.entries(rates).find(
            ([key, value]) =>
              key.toUpperCase() === symbol && typeof value === "number",
          )?.[1];

    if (typeof resolvedRate !== "number" || !Number.isFinite(resolvedRate)) {
      return {
        error: errorResponse(
          502,
          "MISSING_COMMODITY_RATE",
          "Commodity provider response did not include a valid rate for the requested symbol.",
        ),
        data: null,
      } as const;
    }

    const unitRaw = payload.unit;
    const resolvedUnit =
      typeof unitRaw === "object" && unitRaw !== null
        ? unitRaw[symbol]
        : typeof unitRaw === "string"
          ? unitRaw
          : null;

    return {
      error: null,
      data: {
        date: typeof payload.date === "string" ? payload.date : null,
        base: typeof payload.base === "string" ? payload.base : "USD",
        symbol,
        rate: resolvedRate,
        unit:
          typeof resolvedUnit === "string" && resolvedUnit.trim().length > 0
            ? resolvedUnit.trim()
            : "unit",
      },
    } as const;
  } catch (error) {
    const isAbortError =
      typeof error === "object" &&
      error !== null &&
      "name" in error &&
      (error as { name?: string }).name === "AbortError";

    return {
      error: errorResponse(
        502,
        "EXTERNAL_SERVICE_ERROR",
        isAbortError
          ? "Commodity provider request timed out."
          : "Commodity provider request failed.",
      ),
      data: null,
    } as const;
  } finally {
    clearTimeout(timeoutId);
  }
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

    const latestRecommendation = await getLatestCropRecommendationForFarm(
      decodedToken.uid,
      farm.id,
    );

    const symbol = resolvePrimaryCropSymbol(latestRecommendation);
    const latestRateResult = await fetchLatestCommodityRate(symbol);

    if (latestRateResult.error) {
      return latestRateResult.error;
    }

    const latestRate = latestRateResult.data;

    if (!latestRate) {
      return errorResponse(
        502,
        "INVALID_COMMODITY_RESPONSE",
        "Commodity provider returned an empty payload.",
      );
    }

    const previousSnapshot = await getLatestMarketSnapshotForFarm(
      decodedToken.uid,
      farm.id,
      symbol,
    );

    const previousPrice = previousSnapshot?.price ?? null;
    const percentageChange =
      typeof previousPrice === "number" &&
      Number.isFinite(previousPrice) &&
      previousPrice > 0
        ? ((latestRate.rate - previousPrice) / previousPrice) * 100
        : 0;

    await createMarketSnapshotForFarm(decodedToken.uid, farm.id, {
      commodityName: commodityDisplayNameMap[symbol] ?? symbol,
      symbol,
      price: latestRate.rate,
      unit: latestRate.unit,
      currency: "USD",
      sourceDate: latestRate.date,
    });

    return successResponse({
      farmId: farm.id,
      market: {
        commodityName: commodityDisplayNameMap[symbol] ?? symbol,
        symbol,
        price: latestRate.rate,
        unit: latestRate.unit,
        currency: "USD",
        percentageChange,
        trendDirection: percentageChange > 0 ? "up" : "down",
      },
      source: {
        date: latestRate.date,
        base: latestRate.base,
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
