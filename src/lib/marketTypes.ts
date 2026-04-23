export type MarketSourceProvider = "anomura.today" | "openai";

export type MarketVariant = {
  commodityName: string;
  category: string | null;
  specification: string | null;
  unit: string | null;
  price: number;
  date: string | null;
  score: number;
};

export type MarketSnapshot = {
  commodityName: string;
  symbol: string;
  price: number;
  unit: string;
  currency: "PHP";
  percentageChange: number;
  trendDirection: "up" | "down";
  variants?: MarketVariant[];
};

export type MarketSourceInfo = {
  date: string | null;
  provider: MarketSourceProvider;
  usedFallback: boolean;
  detail: Record<string, unknown>;
};

export type FarmMarketApiData = {
  farmId: string;
  market: MarketSnapshot;
  source: MarketSourceInfo;
};