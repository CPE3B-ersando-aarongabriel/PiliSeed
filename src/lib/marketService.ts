import { type NormalizedMarketContext } from "./analysisContracts";
import { getAnalysisProviderConfig } from "./analysisEnv";
import { AnalysisConfigurationError } from "./analysisErrors";
import { normalizeNumber, normalizeString, requestJson } from "./analysisHttp";

type MarketServiceResponse = Record<string, unknown>;

export function normalizeMarketContext(payload: unknown): NormalizedMarketContext | null {
  if (typeof payload !== "object" || payload === null) {
    return null;
  }

  const record = payload as MarketServiceResponse;

  return {
    cropType: normalizeString(record.cropType ?? null),
    priceTrend: normalizeString(record.priceTrend ?? null),
    localDemand: normalizeString(record.localDemand ?? null),
    supplySignal: normalizeString(record.supplySignal ?? null),
    confidence: normalizeNumber(record.confidence ?? null),
    source: normalizeString(record.source, "market") || "market",
    raw: record,
  };
}

export function createMarketService(baseUrl?: string | null, apiKey?: string) {
  const providerConfig = apiKey
    ? {
        apiKey,
        baseUrl: baseUrl ?? null,
      }
    : getAnalysisProviderConfig("market");

  if (!providerConfig.baseUrl) {
    throw new AnalysisConfigurationError("Missing market provider base URL.");
  }

  const providerBaseUrl = providerConfig.baseUrl;

  async function fetchMarketContext(query: {
    cropType?: string | null;
    locationText?: string | null;
  }) {
    const url = new URL("/market", providerBaseUrl);

    if (query.cropType) {
      url.searchParams.set("cropType", query.cropType);
    }

    if (query.locationText) {
      url.searchParams.set("locationText", query.locationText);
    }

    const payload = await requestJson<unknown>(url.toString(), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${providerConfig.apiKey}`,
        Accept: "application/json",
      },
    });

    const normalized = normalizeMarketContext(payload);

    if (!normalized) {
      throw new AnalysisConfigurationError("Market provider returned an unrecognized payload.");
    }

    return normalized;
  }

  return {
    fetchMarketContext,
    normalizeMarketContext,
  };
}