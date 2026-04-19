import { type NormalizedGeocodeResult } from "./analysisContracts";
import {
  AnalysisConfigurationError,
  AnalysisExternalServiceError,
  AnalysisInvalidInputError,
} from "./analysisErrors";
import { normalizeString, requestJson } from "./analysisHttp";

type GeocodingServiceResponse = {
  results?: unknown[];
  data?: unknown[];
  features?: unknown[];
};

type GeocodingOptions = {
  countryCode?: string;
  limit?: number;
};

type GeocodingProviderErrorPayload = {
  error?: boolean;
  reason?: string;
};

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);

    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function toConfidence(value: unknown): number {
  const normalizedValue = toNumber(value);

  if (normalizedValue === null) {
    return 0;
  }

  if (normalizedValue > 1) {
    return Math.max(0, Math.min(1, normalizedValue / 100));
  }

  return Math.max(0, Math.min(1, normalizedValue));
}

function extractCandidates(payload: unknown): Record<string, unknown>[] {
  if (Array.isArray(payload)) {
    return payload.filter(
      (item): item is Record<string, unknown> =>
        typeof item === "object" && item !== null,
    );
  }

  if (typeof payload === "object" && payload !== null) {
    const record = payload as Record<string, unknown>;
    const results = record.results ?? record.data ?? record.features;

    if (Array.isArray(results)) {
      return results.filter(
        (item): item is Record<string, unknown> =>
          typeof item === "object" && item !== null,
      );
    }

    return [record];
  }

  return [];
}

function normalizeGeocodeCandidate(
  candidate: Record<string, unknown>,
): NormalizedGeocodeResult | null {
  const geometry =
    typeof candidate.geometry === "object" && candidate.geometry !== null
      ? (candidate.geometry as Record<string, unknown>)
      : null;
  const geometryCoordinates = Array.isArray(geometry?.coordinates)
    ? geometry?.coordinates
    : null;

  const latitude =
    toNumber(candidate.latitude ?? candidate.lat) ??
    (geometryCoordinates ? toNumber(geometryCoordinates[1]) : null);
  const longitude =
    toNumber(candidate.longitude ?? candidate.lng ?? candidate.lon) ??
    (geometryCoordinates ? toNumber(geometryCoordinates[0]) : null);

  const composedAddress = [
    normalizeString(candidate.name),
    normalizeString(candidate.admin1),
    normalizeString(candidate.country),
  ]
    .filter(Boolean)
    .join(", ");

  const formattedAddress =
    normalizeString(
      candidate.formattedAddress ??
        candidate.formatted ??
        candidate.display_name ??
        candidate.address ??
        candidate.label,
    ) || composedAddress;

  if (latitude === null || longitude === null || !formattedAddress) {
    return null;
  }

  return {
    latitude,
    longitude,
    formattedAddress,
    confidence: toConfidence(
      candidate.confidence ?? candidate.score ?? candidate.importance,
    ),
    source: normalizeString(candidate.source, "geocoding") || "geocoding",
  };
}

export function normalizeGeocodeResults(
  payload: unknown,
): NormalizedGeocodeResult[] {
  const normalizedCandidates = extractCandidates(payload)
    .map(normalizeGeocodeCandidate)
    .filter(
      (candidate): candidate is NormalizedGeocodeResult => candidate !== null,
    );

  if (normalizedCandidates.length === 0) {
    return [];
  }

  normalizedCandidates.sort((firstCandidate, secondCandidate) => {
    if (secondCandidate.confidence !== firstCandidate.confidence) {
      return secondCandidate.confidence - firstCandidate.confidence;
    }

    return firstCandidate.formattedAddress.localeCompare(
      secondCandidate.formattedAddress,
    );
  });

  return normalizedCandidates;
}

export function createGeocodingService(baseUrl?: string | null, apiKey?: string) {
  const providerBaseUrl =
    baseUrl?.trim() ||
    process.env.GEOCODING_API_BASE_URL?.trim() ||
    "https://geocoding-api.open-meteo.com/v1";
  const providerApiKey = apiKey?.trim() || process.env.GEOCODING_API_KEY?.trim();
  const endpointPath =
    process.env.GEOCODING_API_ENDPOINT_PATH?.trim() || "search";

  if (!providerBaseUrl) {
    throw new AnalysisConfigurationError("Missing geocoding provider base URL.");
  }

  return {
    async geocodeLocationText(
      locationText: string,
      options?: GeocodingOptions,
    ): Promise<NormalizedGeocodeResult[]> {
      const trimmedLocationText = locationText.trim();

      if (!trimmedLocationText) {
        throw new AnalysisInvalidInputError("Location text is required for geocoding.");
      }

      const normalizedEndpointPath = endpointPath.replace(/^\/+/, "");
      const normalizedBaseUrl = providerBaseUrl.endsWith("/")
        ? providerBaseUrl
        : `${providerBaseUrl}/`;
      const fetchPayload = async (queryText: string) => {
        const url = new URL(normalizedEndpointPath, normalizedBaseUrl);
        url.searchParams.set("name", queryText);

        if (options?.countryCode) {
          url.searchParams.set("countryCode", options.countryCode.toUpperCase());
        }

        if (options?.limit !== undefined) {
          url.searchParams.set("count", String(options.limit));
        }

        return requestJson<GeocodingServiceResponse & GeocodingProviderErrorPayload>(
          url.toString(),
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              ...(providerApiKey
                ? { Authorization: `Bearer ${providerApiKey}` }
                : {}),
            },
          },
        );
      };

      const payload = await fetchPayload(trimmedLocationText);

      if (payload?.error) {
        throw new AnalysisExternalServiceError(
          normalizeString(payload.reason, "Geocoding provider returned an error."),
          502,
          payload,
        );
      }

      let results = normalizeGeocodeResults(payload);

      if (results.length === 0 && trimmedLocationText.includes(",")) {
        const fallbackLocationText = trimmedLocationText.split(",")[0]?.trim();

        if (fallbackLocationText && fallbackLocationText !== trimmedLocationText) {
          const fallbackPayload = await fetchPayload(fallbackLocationText);

          if (!fallbackPayload?.error) {
            results = normalizeGeocodeResults(fallbackPayload);
          }
        }
      }

      if (results.length === 0) {
        throw new AnalysisInvalidInputError(
          "No geocoding results found for the provided location.",
        );
      }

      return results;
    },
    normalizeGeocodeResults,
  };
}