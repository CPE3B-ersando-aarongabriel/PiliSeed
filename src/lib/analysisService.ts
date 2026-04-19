import {
  type AnalysisResult,
  type NormalizedMarketContext,
  type NormalizedSoilSnapshot,
  type NormalizedWeatherSnapshot,
  type RecommendationInput,
  type RecommendationResult,
  type YieldForecastInput,
  type YieldForecastResult,
} from "./analysisContracts";
import { normalizeString, normalizeStringArray } from "./analysisHttp";

function clampScore(score: number): number {
  if (score < 0) {
    return 0;
  }

  if (score > 100) {
    return 100;
  }

  return Math.round(score);
}

function buildFlag(code: string, message: string, severity: "info" | "warning" | "critical") {
  return { code, message, severity };
}

export function scoreSoilSnapshot(soil: NormalizedSoilSnapshot): AnalysisResult {
  let score = 70;
  const flags = [];

  if (soil.phLevel !== null) {
    if (soil.phLevel < 5.5 || soil.phLevel > 7.5) {
      score -= 18;
      flags.push(buildFlag("SOIL_PH_OUT_OF_RANGE", "pH is outside the ideal range for many crops.", "warning"));
    } else {
      score += 8;
    }
  }

  if (soil.moistureContent !== null) {
    if (soil.moistureContent < 20) {
      score -= 12;
      flags.push(buildFlag("SOIL_LOW_MOISTURE", "Moisture content is low.", "warning"));
    } else if (soil.moistureContent > 65) {
      score -= 6;
      flags.push(buildFlag("SOIL_HIGH_MOISTURE", "Moisture content is high.", "info"));
    }
  }

  if (soil.nitrogen !== null && soil.nitrogen < 10) {
    score -= 10;
    flags.push(buildFlag("SOIL_LOW_NITROGEN", "Nitrogen is low.", "warning"));
  }

  if (soil.phosphorus !== null && soil.phosphorus < 10) {
    score -= 6;
    flags.push(buildFlag("SOIL_LOW_PHOSPHORUS", "Phosphorus is low.", "info"));
  }

  if (soil.potassium !== null && soil.potassium < 10) {
    score -= 6;
    flags.push(buildFlag("SOIL_LOW_POTASSIUM", "Potassium is low.", "info"));
  }

  const summary =
    score >= 80
      ? "Soil conditions are generally strong."
      : score >= 60
        ? "Soil conditions are usable with targeted adjustments."
        : "Soil conditions need attention before planting.";

  return {
    score: clampScore(score),
    summary,
    flags,
    nextSteps:
      score >= 80
        ? ["Maintain current nutrient balance.", "Monitor moisture weekly."]
        : ["Review soil amendments.", "Recheck moisture and pH before planting."],
    explanation: null,
    raw: { soil },
  };
}

export function scoreWeatherSnapshot(weather: NormalizedWeatherSnapshot): AnalysisResult {
  let score = 68;
  const flags = [];

  if (weather.rainRisk === "high") {
    score -= 15;
    flags.push(buildFlag("WEATHER_HIGH_RAIN_RISK", "Rain risk is high.", "warning"));
  }

  if (weather.temperatureC !== null && (weather.temperatureC < 18 || weather.temperatureC > 36)) {
    score -= 12;
    flags.push(buildFlag("WEATHER_TEMP_EXTREME", "Temperature is outside a comfortable crop range.", "warning"));
  }

  if (weather.humidity !== null && weather.humidity > 85) {
    score -= 5;
    flags.push(buildFlag("WEATHER_HIGH_HUMIDITY", "Humidity is high.", "info"));
  }

  return {
    score: clampScore(score),
    summary: score >= 70 ? "Weather is favorable for planning." : "Weather needs closer monitoring.",
    flags,
    nextSteps: ["Check short-term rainfall before field work.", "Adjust planting timing if needed."],
    explanation: null,
    raw: { weather },
  };
}

export function buildRecommendationResult(input: RecommendationInput): RecommendationResult {
  const preferredCrops = normalizeStringArray(input.preferredCrops);
  const baseCrop = normalizeString(input.cropPreference);
  const soilScore = input.soil ? scoreSoilSnapshot(input.soil).score : 65;
  const weatherScore = input.weather ? scoreWeatherSnapshot(input.weather).score : 65;

  const candidates = Array.from(
    new Set([baseCrop, ...preferredCrops, "rice", "corn", "vegetables"].filter(Boolean)),
  );

  const recommendedCrops = candidates.map((crop, index) => {
    const preferenceBoost = preferredCrops.includes(crop) ? 8 : 0;
    const cropBias = index === 0 ? 4 : 0;
    const score = clampScore((soilScore + weatherScore) / 2 + preferenceBoost + cropBias - index * 5);

    return {
      crop,
      score,
      reason:
        score >= 80
          ? "Strong match with the current farm context."
          : score >= 65
            ? "Possible option with manageable adjustments."
            : "Lower priority compared with other options.",
    };
  });

  recommendedCrops.sort((a, b) => b.score - a.score || a.crop.localeCompare(b.crop));

  return {
    recommendedCrops,
    analysisText:
      recommendedCrops[0]?.score >= 80
        ? `${recommendedCrops[0].crop} is the strongest option based on the current farm context.`
        : "The crop ranking is usable, but the farm needs closer review before final selection.",
    warningFlags: [
      soilScore < 60 ? "Soil quality needs improvement." : null,
      weatherScore < 60 ? "Weather adds planting risk." : null,
    ].filter((value): value is string => Boolean(value)),
    raw: {
      input,
      soilScore,
      weatherScore,
    },
  };
}

export function buildYieldForecast(input: YieldForecastInput): YieldForecastResult {
  const soilScore = input.soil ? scoreSoilSnapshot(input.soil).score : 65;
  const weatherScore = input.weather ? scoreWeatherSnapshot(input.weather).score : 65;
  const marketConfidence = input.market?.confidence ?? 0.5;

  const baseYield = 3.5 + (soilScore - 50) / 50 + (weatherScore - 50) / 75;
  const expectedYield = Number((baseYield * (0.8 + marketConfidence * 0.4)).toFixed(2));
  const estimatedRevenue = input.market?.priceTrend ? Math.round(expectedYield * 28000) : null;

  return {
    expectedYield,
    unit: "tons_per_hectare",
    estimatedRevenue,
    marketContext: input.market
      ? {
          priceTrend: input.market.priceTrend,
          localDemand: input.market.localDemand,
          supplySignal: input.market.supplySignal,
          confidence: input.market.confidence,
        }
      : null,
    analysisText:
      expectedYield >= 4
        ? "Yield outlook is positive if farm conditions remain stable."
        : "Yield outlook is moderate and may improve with better soil or weather conditions.",
    raw: { input, soilScore, weatherScore, marketConfidence },
  };
}

export function summarizeAnalysisInput(input: {
  soil?: NormalizedSoilSnapshot | null;
  weather?: NormalizedWeatherSnapshot | null;
  market?: NormalizedMarketContext | null;
}) {
  return {
    hasSoil: input.soil !== undefined && input.soil !== null,
    hasWeather: input.weather !== undefined && input.weather !== null,
    hasMarket: input.market !== undefined && input.market !== null,
  };
}