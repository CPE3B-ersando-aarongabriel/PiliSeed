import { type NormalizedGeocodeResult } from "./analysisContracts";
import { getAnalysisProviderConfig } from "./analysisEnv";
import { AnalysisConfigurationError } from "./analysisErrors";
import { normalizeNumber, normalizeString, requestJson } from "./analysisHttp";

type GeocodingServiceResponse = {
  results?: unknown[];
  data?: unknown[];
};

function extractCandidate(payload: unknown): Record<string, unknown> | null {
  if (Array.isArray(payload)) {
    return (payload[0] as Record<string, unknown> | undefined) ?? null;
  }

  if (typeof payload === "object" && payload !== null) {
    const record = payload as Record<string, unknown>;
    const results = record.results ?? record.data;

    if (Array.isArray(results)) {
      return (results[0] as Record<string, unknown> | undefined) ?? null;
    }

    return record;
  }

  return null;
}

export function normalizeGeocodeResult(payload: unknown): NormalizedGeocodeResult | null {
  const candidate = extractCandidate(payload);

  if (!candidate) {
    return null;
  }

  const latitude = normalizeNumber(candidate.latitude ?? candidate.lat);
  const longitude = normalizeNumber(candidate.longitude ?? candidate.lng ?? candidate.lon);
  const formattedAddress = normalizeString(
    candidate.formattedAddress ?? candidate.address ?? candidate.label,
  );
  const confidence = normalizeNumber(candidate.confidence ?? candidate.score, 0) ?? 0;

  if (latitude === null || longitude === null || !formattedAddress) {
    return null;
  }

  return {
    latitude,
    longitude,
    formattedAddress,
    confidence: Math.max(0, Math.min(1, confidence)),
    source: normalizeString(candidate.source, "geocoding") || "geocoding",
  };
}

export function createGeocodingService(baseUrl?: string | null, apiKey?: string) {
  const providerConfig = apiKey
    ? {
        apiKey,
        baseUrl: baseUrl ?? null,
      }
    : getAnalysisProviderConfig("geocoding");

  if (!providerConfig.baseUrl) {
    throw new AnalysisConfigurationError("Missing geocoding provider base URL.");
  }

  const providerBaseUrl = providerConfig.baseUrl;

  return {
    async geocodeLocationText(locationText: string): Promise<NormalizedGeocodeResult> {
      const trimmedLocationText = locationText.trim();

      if (!trimmedLocationText) {
        throw new AnalysisConfigurationError("Location text is required for geocoding.");
      }

      const url = new URL("/geocode", providerBaseUrl);
      url.searchParams.set("q", trimmedLocationText);

      const payload = await requestJson<GeocodingServiceResponse>(url.toString(), {
        method: "GET",
        headers: {
          Authorization: `Bearer ${providerConfig.apiKey}`,
          Accept: "application/json",
        },
      });

      const result = normalizeGeocodeResult(payload);

      if (!result) {
        throw new AnalysisConfigurationError("Geocoding provider returned an unrecognized payload.");
      }

      return result;
    },
    normalizeGeocodeResult,
  };
}