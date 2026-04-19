import { type NormalizedWeatherSnapshot } from "./analysisContracts";
import { getAnalysisProviderConfig } from "./analysisEnv";
import { AnalysisConfigurationError } from "./analysisErrors";
import { normalizeNumber, normalizeString, requestJson } from "./analysisHttp";

type WeatherServiceResponse = Record<string, unknown>;

export function normalizeWeatherSnapshot(payload: unknown): NormalizedWeatherSnapshot | null {
  if (typeof payload !== "object" || payload === null) {
    return null;
  }

  const record = payload as WeatherServiceResponse;
  const forecast = Array.isArray(record.forecast)
    ? record.forecast.filter((item) => typeof item === "object") as Record<string, unknown>[]
    : [];

  const rainRiskValue = normalizeString(record.rainRisk, "unknown");

  return {
    temperatureC: normalizeNumber(record.temperatureC ?? record.temperature ?? null),
    humidity: normalizeNumber(record.humidity ?? null),
    rainfallMm: normalizeNumber(record.rainfallMm ?? record.rainfall ?? null),
    rainRisk:
      rainRiskValue === "low" || rainRiskValue === "medium" || rainRiskValue === "high"
        ? rainRiskValue
        : "unknown",
    alertText: normalizeString(record.alertText ?? record.alert ?? null),
    forecast,
    source: normalizeString(record.source, "weather") || "weather",
  };
}

export function createWeatherService(baseUrl?: string | null, apiKey?: string) {
  const providerConfig = apiKey
    ? {
        apiKey,
        baseUrl: baseUrl ?? null,
      }
    : getAnalysisProviderConfig("weather");

  if (!providerConfig.baseUrl) {
    throw new AnalysisConfigurationError("Missing weather provider base URL.");
  }

  const providerBaseUrl = providerConfig.baseUrl;

  async function fetchWeatherSnapshot(query: {
    latitude: number;
    longitude: number;
    days?: number;
    mode?: "current" | "forecast" | "refresh";
  }): Promise<NormalizedWeatherSnapshot> {
    const url = new URL("/weather", providerBaseUrl);
    url.searchParams.set("lat", String(query.latitude));
    url.searchParams.set("lon", String(query.longitude));

    if (query.days !== undefined) {
      url.searchParams.set("days", String(query.days));
    }

    if (query.mode) {
      url.searchParams.set("mode", query.mode);
    }

    const payload = await requestJson<unknown>(url.toString(), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${providerConfig.apiKey}`,
        Accept: "application/json",
      },
    });

    const normalized = normalizeWeatherSnapshot(payload);

    if (!normalized) {
      throw new AnalysisConfigurationError("Weather provider returned an unrecognized payload.");
    }

    return normalized;
  }

  return {
    fetchCurrentWeather: (query: { latitude: number; longitude: number }) =>
      fetchWeatherSnapshot({ ...query, mode: "current" }),
    fetchWeatherForecast: (query: { latitude: number; longitude: number; days?: number }) =>
      fetchWeatherSnapshot({ ...query, mode: "forecast" }),
    refreshWeatherSnapshot: (query: { latitude: number; longitude: number }) =>
      fetchWeatherSnapshot({ ...query, mode: "refresh" }),
    normalizeWeatherSnapshot,
  };
}