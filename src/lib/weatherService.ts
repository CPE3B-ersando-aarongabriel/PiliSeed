import { type NormalizedWeatherSnapshot } from "./analysisContracts";
import { AnalysisConfigurationError } from "./analysisErrors";
import { normalizeNumber, normalizeString, requestJson } from "./analysisHttp";

type WeatherServiceResponse = Record<string, unknown>;

type OpenMeteoDaily = {
  time?: string[];
  temperature_2m_max?: number[];
  temperature_2m_min?: number[];
  precipitation_sum?: number[];
};

function resolveWeatherBaseUrl(explicitBaseUrl?: string | null): string {
  const candidateBaseUrl =
    explicitBaseUrl?.trim() ||
    process.env.WEATHER_API_BASE_URL?.trim() ||
    "https://api.open-meteo.com/v1";

  // Ignore scaffold placeholder values so local development works out of the box.
  if (candidateBaseUrl.includes("example-weather.com")) {
    return "https://api.open-meteo.com/v1";
  }

  return candidateBaseUrl;
}

function toRainRisk(rainfallMm: number | null): "low" | "medium" | "high" | "unknown" {
  if (rainfallMm === null) {
    return "unknown";
  }

  if (rainfallMm >= 8) {
    return "high";
  }

  if (rainfallMm >= 2) {
    return "medium";
  }

  return "low";
}

function normalizeOpenMeteoForecast(daily: OpenMeteoDaily | null): Record<string, unknown>[] {
  if (!daily || !Array.isArray(daily.time) || daily.time.length === 0) {
    return [];
  }

  return daily.time.map((dateValue, index) => ({
    date: dateValue,
    temperatureMaxC:
      Array.isArray(daily.temperature_2m_max) &&
      typeof daily.temperature_2m_max[index] === "number"
        ? daily.temperature_2m_max[index]
        : null,
    temperatureMinC:
      Array.isArray(daily.temperature_2m_min) &&
      typeof daily.temperature_2m_min[index] === "number"
        ? daily.temperature_2m_min[index]
        : null,
    rainfallMm:
      Array.isArray(daily.precipitation_sum) &&
      typeof daily.precipitation_sum[index] === "number"
        ? daily.precipitation_sum[index]
        : null,
  }));
}

export function normalizeWeatherSnapshot(payload: unknown): NormalizedWeatherSnapshot | null {
  if (typeof payload !== "object" || payload === null) {
    return null;
  }

  const record = payload as WeatherServiceResponse;
  const openMeteoCurrent =
    typeof record.current === "object" && record.current !== null
      ? (record.current as Record<string, unknown>)
      : null;
  const openMeteoDaily =
    typeof record.daily === "object" && record.daily !== null
      ? (record.daily as OpenMeteoDaily)
      : null;

  const genericForecast = Array.isArray(record.forecast)
    ? record.forecast.filter((item) => typeof item === "object") as Record<string, unknown>[]
    : [];

  const forecast =
    genericForecast.length > 0
      ? genericForecast
      : normalizeOpenMeteoForecast(openMeteoDaily);

  const rainfallMm =
    normalizeNumber(
      openMeteoCurrent?.precipitation ??
        openMeteoCurrent?.rain ??
        record.rainfallMm ??
        record.rainfall ??
        null,
    );

  const rainRiskValue = normalizeString(record.rainRisk, "unknown");
  const normalizedRainRisk =
    rainRiskValue === "low" || rainRiskValue === "medium" || rainRiskValue === "high"
      ? rainRiskValue
      : toRainRisk(rainfallMm);

  return {
    temperatureC: normalizeNumber(
      openMeteoCurrent?.temperature_2m ?? record.temperatureC ?? record.temperature ?? null,
    ),
    humidity: normalizeNumber(
      openMeteoCurrent?.relative_humidity_2m ?? record.humidity ?? null,
    ),
    rainfallMm,
    rainRisk: normalizedRainRisk,
    alertText: normalizeString(record.alertText ?? record.alert ?? null),
    forecast,
    source:
      normalizeString(record.source) ||
      (openMeteoCurrent ? "open-meteo" : "weather"),
  };
}

export function createWeatherService(baseUrl?: string | null, apiKey?: string) {
  const providerBaseUrl = resolveWeatherBaseUrl(baseUrl);
  const providerApiKey = apiKey?.trim() || process.env.WEATHER_API_KEY?.trim();
  const endpointPath = process.env.WEATHER_API_ENDPOINT_PATH?.trim() || "forecast";

  if (!providerBaseUrl) {
    throw new AnalysisConfigurationError("Missing weather provider base URL.");
  }

  async function fetchWeatherSnapshot(query: {
    latitude: number;
    longitude: number;
    days?: number;
    pastDays?: number;
    mode?: "current" | "forecast" | "refresh";
  }): Promise<NormalizedWeatherSnapshot> {
    const normalizedEndpointPath = endpointPath.replace(/^\/+/, "");
    const normalizedBaseUrl = providerBaseUrl.endsWith("/")
      ? providerBaseUrl
      : `${providerBaseUrl}/`;
    const url = new URL(normalizedEndpointPath, normalizedBaseUrl);

    // Default query layout follows Open-Meteo and remains backward-compatible for providers
    // that can ignore unknown parameters.
    url.searchParams.set("latitude", String(query.latitude));
    url.searchParams.set("longitude", String(query.longitude));
    url.searchParams.set(
      "current",
      "temperature_2m,relative_humidity_2m,precipitation",
    );
    url.searchParams.set("timezone", "auto");

    if (query.mode === "forecast") {
      url.searchParams.set(
        "daily",
        "temperature_2m_max,temperature_2m_min,precipitation_sum",
      );

      if (query.days !== undefined) {
        url.searchParams.set("forecast_days", String(query.days));
      }

      if (query.pastDays !== undefined && query.pastDays > 0) {
        url.searchParams.set("past_days", String(query.pastDays));
      }
    }

    const payload = await requestJson<unknown>(url.toString(), {
      method: "GET",
      headers: {
        Accept: "application/json",
        ...(providerApiKey
          ? { Authorization: `Bearer ${providerApiKey}` }
          : {}),
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
    fetchWeatherForecast: (query: {
      latitude: number;
      longitude: number;
      days?: number;
      pastDays?: number;
    }) =>
      fetchWeatherSnapshot({ ...query, mode: "forecast" }),
    refreshWeatherSnapshot: (query: { latitude: number; longitude: number }) =>
      fetchWeatherSnapshot({ ...query, mode: "refresh" }),
    normalizeWeatherSnapshot,
  };
}