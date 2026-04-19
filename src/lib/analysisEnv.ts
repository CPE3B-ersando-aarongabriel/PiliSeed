import { AnalysisConfigurationError } from "./analysisErrors";

type ProviderKey = "geocoding" | "weather" | "soil" | "market" | "openai";

const providerEnvMap: Record<
  ProviderKey,
  {
    apiKey: string;
    baseUrl?: string;
  }
> = {
  geocoding: {
    apiKey: process.env.GEOCODING_API_KEY ?? "",
    baseUrl: process.env.GEOCODING_API_BASE_URL,
  },
  weather: {
    apiKey: process.env.WEATHER_API_KEY ?? "",
    baseUrl: process.env.WEATHER_API_BASE_URL,
  },
  soil: {
    apiKey: process.env.SOIL_API_KEY ?? "",
    baseUrl: process.env.SOIL_API_BASE_URL,
  },
  market: {
    apiKey: process.env.MARKET_API_KEY ?? "",
    baseUrl: process.env.MARKET_API_BASE_URL,
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY ?? "",
    baseUrl: process.env.OPENAI_API_BASE_URL,
  },
};

export type AnalysisProviderConfig = {
  provider: ProviderKey;
  apiKey: string;
  baseUrl: string | null;
};

export function getAnalysisProviderConfig(provider: ProviderKey): AnalysisProviderConfig {
  const entry = providerEnvMap[provider];

  if (!entry.apiKey.trim()) {
    throw new AnalysisConfigurationError(
      `Missing required ${provider.toUpperCase()}_API_KEY environment variable.`,
    );
  }

  return {
    provider,
    apiKey: entry.apiKey.trim(),
    baseUrl: entry.baseUrl?.trim() || null,
  };
}

export function getMissingAnalysisProviderEnvVars() {
  return (Object.keys(providerEnvMap) as ProviderKey[]).reduce<string[]>((missing, provider) => {
    const entry = providerEnvMap[provider];

    if (!entry.apiKey.trim()) {
      missing.push(`${provider.toUpperCase()}_API_KEY`);
    }

    return missing;
  }, []);
}

export function assertAnalysisEnvironmentReady() {
  const missing = getMissingAnalysisProviderEnvVars();

  if (missing.length > 0) {
    throw new AnalysisConfigurationError(
      `Missing analysis environment variables: ${missing.join(", ")}`,
    );
  }
}