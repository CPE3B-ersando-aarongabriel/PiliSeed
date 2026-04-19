import {
  type NormalizedSoilClassification,
  type SoilClassificationProbability,
} from "./analysisContracts";
import {
  AnalysisConfigurationError,
  AnalysisExternalServiceError,
} from "./analysisErrors";
import { normalizeNumber, normalizeString, requestJson } from "./analysisHttp";

const DEFAULT_SOIL_GRIDS_BASE_URL = "https://rest.isric.org/soilgrids/v2.0/";
const SOIL_REQUEST_TIMEOUT_MS = 20000;

type SoilGridsClassificationResponse = Record<string, unknown> & {
  wrb_class_name?: unknown;
  wrb_class_value?: unknown;
  wrb_class_probability?: unknown;
  query_time_s?: unknown;
  coordinates?: unknown;
};

function resolveSoilBaseUrl(baseUrl?: string | null) {
  const configuredBaseUrl =
    baseUrl?.trim() || process.env.SOIL_API_BASE_URL?.trim() || "";

  if (!configuredBaseUrl) {
    return DEFAULT_SOIL_GRIDS_BASE_URL;
  }

  const normalizedConfiguredBaseUrl = configuredBaseUrl.toLowerCase();

  if (
    normalizedConfiguredBaseUrl.includes("api.example-soil.com") ||
    normalizedConfiguredBaseUrl.includes("api.example-")
  ) {
    return DEFAULT_SOIL_GRIDS_BASE_URL;
  }

  return configuredBaseUrl;
}

function normalizeProbabilityEntry(
  entry: unknown,
): SoilClassificationProbability | null {
  if (Array.isArray(entry)) {
    const className = normalizeString(entry[0], "");
    const probability = normalizeNumber(entry[1], null);

    if (!className || probability === null) {
      return null;
    }

    return { className, probability };
  }

  if (typeof entry === "object" && entry !== null) {
    const record = entry as Record<string, unknown>;
    const className = normalizeString(
      record.className ?? record.class_name ?? record.name,
      "",
    );
    const probability = normalizeNumber(
      record.probability ?? record.value ?? record.prob ?? null,
      null,
    );

    if (!className || probability === null) {
      return null;
    }

    return { className, probability };
  }

  return null;
}

function normalizeCoordinates(value: unknown) {
  if (!Array.isArray(value) || value.length < 2) {
    return null;
  }

  const longitude = normalizeNumber(value[0], null);
  const latitude = normalizeNumber(value[1], null);

  if (latitude === null || longitude === null) {
    return null;
  }

  return { latitude, longitude };
}

export function normalizeSoilClassification(
  payload: unknown,
): NormalizedSoilClassification | null {
  if (typeof payload !== "object" || payload === null) {
    return null;
  }

  const record = payload as SoilGridsClassificationResponse;
  const classProbabilities = Array.isArray(record.wrb_class_probability)
    ? record.wrb_class_probability
        .map(normalizeProbabilityEntry)
        .filter(
          (item): item is SoilClassificationProbability => item !== null,
        )
        .sort((firstItem, secondItem) => {
          if (secondItem.probability !== firstItem.probability) {
            return secondItem.probability - firstItem.probability;
          }

          return firstItem.className.localeCompare(secondItem.className);
        })
    : [];

  const dominantClass = normalizeString(record.wrb_class_name, "") || null;
  const dominantClassValue = normalizeNumber(record.wrb_class_value, null);
  const dominantClassProbability = classProbabilities[0]?.probability ?? null;
  const coordinates = normalizeCoordinates(record.coordinates);

  if (!coordinates || !dominantClass) {
    return null;
  }

  return {
    latitude: coordinates.latitude,
    longitude: coordinates.longitude,
    dominantClass,
    dominantClassValue,
    dominantClassProbability,
    classProbabilities,
    queryTimeSeconds: normalizeNumber(record.query_time_s ?? null),
    source: "soilgrids-classification",
    raw: record,
  };
}

export function createSoilService(baseUrl?: string | null) {
  const providerBaseUrl = resolveSoilBaseUrl(baseUrl);

  async function fetchSoilClassification(query: {
    latitude: number;
    longitude: number;
    numberClasses?: number;
  }): Promise<NormalizedSoilClassification> {
    const url = new URL(
      "classification/query",
      providerBaseUrl.endsWith("/") ? providerBaseUrl : `${providerBaseUrl}/`,
    );

    url.searchParams.set("lat", String(query.latitude));
    url.searchParams.set("lon", String(query.longitude));

    if (query.numberClasses !== undefined) {
      url.searchParams.set("number_classes", String(query.numberClasses));
    }

    let payload: unknown;

    try {
      payload = await requestJson<unknown>(url.toString(), {
        method: "GET",
        headers: { Accept: "application/json" },
        timeoutMs: SOIL_REQUEST_TIMEOUT_MS,
      });
    } catch (error) {
      if (error instanceof AnalysisExternalServiceError) {
        throw error;
      }

      throw new AnalysisExternalServiceError(
        error instanceof Error ? error.message : "Soil provider request failed.",
        502,
        {
          url: url.toString(),
          errorName: error instanceof Error ? error.name : "UnknownError",
          errorMessage: error instanceof Error ? error.message : "Unknown error",
        },
      );
    }

    const normalized = normalizeSoilClassification(payload);

    if (!normalized) {
      throw new AnalysisConfigurationError(
        "Soil provider returned an unrecognized payload.",
      );
    }

    return normalized;
  }

  return {
    fetchSoilClassification,
    normalizeSoilClassification,
  };
}