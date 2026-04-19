export type JsonRecord = Record<string, unknown>;

export type NormalizedGeocodeResult = {
  latitude: number;
  longitude: number;
  formattedAddress: string;
  confidence: number;
  source: string;
};

export type NormalizedWeatherSnapshot = {
  temperatureC: number | null;
  humidity: number | null;
  rainfallMm: number | null;
  rainRisk: "low" | "medium" | "high" | "unknown";
  alertText: string | null;
  forecast: JsonRecord[];
  source: string;
};

export type NormalizedSoilSnapshot = {
  texture: string | null;
  phLevel: number | null;
  moistureContent: number | null;
  nitrogen: number | null;
  phosphorus: number | null;
  potassium: number | null;
  soilSource: "manual" | "api" | "mixed" | "unknown";
  analysis: JsonRecord;
  source: string;
};

export type SoilClassificationProbability = {
  className: string;
  probability: number;
};

export type NormalizedSoilClassification = {
  latitude: number;
  longitude: number;
  dominantClass: string | null;
  dominantClassValue: number | null;
  dominantClassProbability: number | null;
  classProbabilities: SoilClassificationProbability[];
  queryTimeSeconds: number | null;
  source: string;
  raw: JsonRecord;
};

export type NormalizedMarketContext = {
  cropType: string | null;
  priceTrend: string | null;
  localDemand: string | null;
  supplySignal: string | null;
  confidence: number | null;
  source: string;
  raw: JsonRecord;
};

export type AnalysisFlag = {
  code: string;
  message: string;
  severity: "info" | "warning" | "critical";
};

export type AnalysisResult = {
  score: number;
  summary: string;
  flags: AnalysisFlag[];
  nextSteps: string[];
  explanation: string | null;
  raw: JsonRecord;
};

export type RecommendationInput = {
  farmId: string;
  farmName?: string | null;
  cropPreference?: string | null;
  budget?: string | null;
  goal?: string | null;
  preferredCrops?: string[];
  marketPriority?: string | null;
  soil?: NormalizedSoilSnapshot | null;
  weather?: NormalizedWeatherSnapshot | null;
  market?: NormalizedMarketContext | null;
};

export type RecommendationItem = {
  crop: string;
  score: number;
  reason: string;
};

export type RecommendationResult = {
  recommendedCrops: RecommendationItem[];
  analysisText: string;
  warningFlags: string[];
  raw: JsonRecord;
};

export type YieldForecastInput = {
  farmId: string;
  cropType: string;
  season: string;
  forecastPeriod: string;
  soil?: NormalizedSoilSnapshot | null;
  weather?: NormalizedWeatherSnapshot | null;
  market?: NormalizedMarketContext | null;
};

export type YieldForecastResult = {
  expectedYield: number;
  unit: string;
  estimatedRevenue: number | null;
  marketContext: JsonRecord | null;
  analysisText: string;
  raw: JsonRecord;
};