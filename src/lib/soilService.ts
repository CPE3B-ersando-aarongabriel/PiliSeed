import { type NormalizedSoilSnapshot } from "./analysisContracts";
import { getAnalysisProviderConfig } from "./analysisEnv";
import { AnalysisConfigurationError } from "./analysisErrors";
import { normalizeNumber, normalizeString, requestJson } from "./analysisHttp";

type SoilServiceResponse = Record<string, unknown>;

export function normalizeSoilSnapshot(payload: unknown): NormalizedSoilSnapshot | null {
  if (typeof payload !== "object" || payload === null) {
    return null;
  }

  const record = payload as SoilServiceResponse;

  return {
    texture: normalizeString(record.texture ?? record.soilTexture ?? null),
    phLevel: normalizeNumber(record.phLevel ?? record.pH ?? record.ph ?? null),
    moistureContent: normalizeNumber(record.moistureContent ?? record.moisture ?? null),
    nitrogen: normalizeNumber(record.nitrogen ?? null),
    phosphorus: normalizeNumber(record.phosphorus ?? null),
    potassium: normalizeNumber(record.potassium ?? null),
    soilSource:
      normalizeString(record.soilSource, "unknown") === "manual" ||
      normalizeString(record.soilSource, "unknown") === "api" ||
      normalizeString(record.soilSource, "unknown") === "mixed"
        ? (normalizeString(record.soilSource, "unknown") as NormalizedSoilSnapshot["soilSource"])
        : "unknown",
    analysis:
      typeof record.analysis === "object" && record.analysis !== null
        ? (record.analysis as Record<string, unknown>)
        : {},
    source: normalizeString(record.source, "soil") || "soil",
  };
}

export function createSoilService(baseUrl?: string | null, apiKey?: string) {
  const providerConfig = apiKey
    ? {
        apiKey,
        baseUrl: baseUrl ?? null,
      }
    : getAnalysisProviderConfig("soil");

  if (!providerConfig.baseUrl) {
    throw new AnalysisConfigurationError("Missing soil provider base URL.");
  }

  const providerBaseUrl = providerConfig.baseUrl;

  async function fetchSoilSnapshot(query: {
    latitude: number;
    longitude: number;
  }): Promise<NormalizedSoilSnapshot> {
    const url = new URL("/soil", providerBaseUrl);
    url.searchParams.set("lat", String(query.latitude));
    url.searchParams.set("lon", String(query.longitude));

    const payload = await requestJson<unknown>(url.toString(), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${providerConfig.apiKey}`,
        Accept: "application/json",
      },
    });

    const normalized = normalizeSoilSnapshot(payload);

    if (!normalized) {
      throw new AnalysisConfigurationError("Soil provider returned an unrecognized payload.");
    }

    return normalized;
  }

  return {
    fetchSoilSnapshot,
    normalizeSoilSnapshot,
  };
}