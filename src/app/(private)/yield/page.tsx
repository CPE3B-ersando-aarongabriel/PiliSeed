"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { User } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";

import QuickNavigation from "@/components/layout/QuickNavigation";
import YieldHeader from "@/components/layout/yield/YieldHeader";
import SeasonalYieldChart from "@/components/layout/yield/SeasonalYieldChart";
import EstimatedRevenueCard from "@/components/layout/yield/EstimatedRevenue";
import MarketPriceTrendsCard from "@/components/layout/yield/MarketPriceTrends";
import { fetchWithAuth, extractApiData, getApiErrorMessage } from "@/lib/apiClient";
import { getClientAuth } from "@/lib/firebaseClient";
import type {
  FarmMarketApiData,
  MarketSnapshot,
  MarketSourceInfo,
} from "@/lib/marketTypes";

interface MarketPrice {
  label: string;
  price: string;
  change: string;
  changeColor: string;
  isPositive: boolean;
}

type FarmOption = {
  id: string;
  name: string;
  location: string | null;
  isActive: boolean;
};

type YieldForecast = {
  expectedYield: number;
  unit: string;
  estimatedRevenuePhp: number | null;
  analysisText?: string | null;
  warningFlags?: string[];
};

const FORECAST_DAYS = 90;
const DEFAULT_YIELD_REQUEST = {
  cropType: "Rice",
  season: "Wet Season",
  forecastPeriod: "Next 90 days",
};

type YieldCacheRecord = {
  storedAt: string;
  cropName: string;
  yieldForecast: YieldForecast | null;
  marketSnapshot: MarketSnapshot | null;
  marketSource: MarketSourceInfo | null;
};

const YIELD_CACHE_TTL_MS = 1000 * 60 * 60 * 24;

function toUtcDateKey(value: Date) {
  return value.toISOString().slice(0, 10);
}

function getYieldCacheKey(farmId: string, cropName: string) {
  return `piliSeed.yieldCache.${farmId}.${encodeURIComponent(cropName)}`;
}

function readYieldCache(farmId: string, cropName: string): YieldCacheRecord | null {
  if (!farmId || typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(getYieldCacheKey(farmId, cropName));

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as YieldCacheRecord;
    const storedAt = new Date(parsed.storedAt);

    if (Number.isNaN(storedAt.getTime())) {
      return null;
    }

    const todayKey = toUtcDateKey(new Date());
    const storedKey = toUtcDateKey(storedAt);

    if (todayKey !== storedKey) {
      return null;
    }

    const ageMs = Date.now() - storedAt.getTime();

    if (ageMs > YIELD_CACHE_TTL_MS) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function writeYieldCache(
  farmId: string,
  cropName: string,
  yieldForecast: YieldForecast | null,
  marketSnapshot: MarketSnapshot | null,
  marketSource: MarketSourceInfo | null,
) {
  if (!farmId || typeof window === "undefined") {
    return;
  }

  const payload: YieldCacheRecord = {
    storedAt: new Date().toISOString(),
    cropName,
    yieldForecast,
    marketSnapshot,
    marketSource,
  };

  window.localStorage.setItem(
    getYieldCacheKey(farmId, cropName),
    JSON.stringify(payload),
  );
}

function buildMarketRequestPath(farmId: string, cropName: string) {
  const searchParams = new URLSearchParams();

  if (cropName.trim()) {
    searchParams.set("cropType", cropName.trim());
  }

  const queryString = searchParams.toString();

  return queryString
    ? `/api/farms/${farmId}/market?${queryString}`
    : `/api/farms/${farmId}/market`;
}

function getStoredSelectedCrop(farmId: string) {
  if (!farmId || typeof window === "undefined") {
    return null;
  }

  const storageKey = `piliSeed.selectedCrop.${farmId}`;
  const stored = window.localStorage.getItem(storageKey);

  return stored?.trim() ? stored : null;
}

function formatCurrencyPhp(amount: number | null) {
  if (amount === null || !Number.isFinite(amount)) {
    return "PHP --";
  }

  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatPercent(value: number) {
  const signed = value >= 0 ? value : Math.abs(value) * -1;
  return `${signed.toFixed(1)}%`;
}

function buildYieldSeries(expectedYield: number, days = FORECAST_DAYS) {
  const series: Array<{ day: string; value: number }> = [];
  const startDate = new Date();

  for (let index = 0; index < days; index += 1) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);

    const smoothFactor =
      Math.sin(index / 7) * 0.06 + Math.cos(index / 11) * 0.04;
    const projectedValue = Math.max(0, expectedYield * (1 + smoothFactor));

    series.push({
      day: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      value: Number(projectedValue.toFixed(2)),
    });
  }

  return series;
}

export default function YieldPrediction() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [farms, setFarms] = useState<FarmOption[]>([]);
  const [selectedFarmId, setSelectedFarmId] = useState("");
  const [selectedCropName, setSelectedCropName] = useState<string | null>(null);
  const [yieldForecast, setYieldForecast] = useState<YieldForecast | null>(null);
  const [marketSnapshot, setMarketSnapshot] = useState<MarketSnapshot | null>(null);
  const [marketSource, setMarketSource] = useState<MarketSourceInfo | null>(null);
  const [isFarmDropdownOpen, setIsFarmDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pageError, setPageError] = useState("");
  const [selectionMessage, setSelectionMessage] = useState("");
  const [lastPredictionKey, setLastPredictionKey] = useState("");

  useEffect(() => {
    const auth = getClientAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (!user) {
        setFarms([]);
        setSelectedFarmId("");
        setPageError("Sign in to view yield forecasts.");
        return;
      }

      setIsLoading(true);
      setPageError("");

      try {
        const { response, body } = await fetchWithAuth(user, "/api/farms");

        if (!response.ok) {
          throw new Error(
            getApiErrorMessage(body, "Unable to load farms right now."),
          );
        }

        const data = extractApiData<{ farms: FarmOption[] }>(body);
        const farmList = data?.farms ?? [];

        setFarms(farmList);
        const activeFarmId =
          farmList.find((farm) => farm.isActive)?.id ?? farmList[0]?.id ?? "";
        setSelectedFarmId(activeFarmId);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unable to load farms right now.";
        setPageError(message);
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!selectedFarmId) {
      setSelectedCropName(null);
      setSelectionMessage("");
      return;
    }

    const stored = getStoredSelectedCrop(selectedFarmId);
    setSelectedCropName(stored);

    if (!stored) {
      setSelectionMessage(
        "Using the default crop until a selection is made in Recommendations.",
      );
      return;
    }

    setSelectionMessage("");
  }, [selectedFarmId]);

  useEffect(() => {
    const loadYieldData = async () => {
      if (!currentUser || !selectedFarmId) {
        return;
      }

      const resolvedCropName = selectedCropName ?? DEFAULT_YIELD_REQUEST.cropType;
      const cached = readYieldCache(selectedFarmId, resolvedCropName);

      if (cached) {
        setYieldForecast(cached.yieldForecast);
        setMarketSnapshot(cached.marketSnapshot);
        setMarketSource(cached.marketSource);
        setPageError("");
        return;
      }

      setIsLoading(true);
      setPageError("");

      try {
        const [yieldResponse, marketResponse] = await Promise.all([
          fetchWithAuth(currentUser, `/api/farms/${selectedFarmId}/yield`),
          fetchWithAuth(
            currentUser,
            buildMarketRequestPath(selectedFarmId, resolvedCropName),
          ),
        ]);

        let nextYieldForecast: YieldForecast | null = null;

        if (!yieldResponse.response.ok) {
          if (yieldResponse.response.status !== 404) {
            throw new Error(
              getApiErrorMessage(
                yieldResponse.body,
                "Unable to load yield forecast right now.",
              ),
            );
          }

          setYieldForecast(null);
          nextYieldForecast = null;
        } else {
          const yieldData = extractApiData<{ yieldForecast: YieldForecast }>(
            yieldResponse.body,
          );
          nextYieldForecast = yieldData?.yieldForecast ?? null;
          setYieldForecast(nextYieldForecast);
        }

        let nextMarketSnapshot: MarketSnapshot | null = null;
        let nextMarketSource: MarketSourceInfo | null = null;

        if (!marketResponse.response.ok) {
          setMarketSnapshot(null);
          setMarketSource(null);
          nextMarketSnapshot = null;
          nextMarketSource = null;
        } else {
          const marketData = extractApiData<FarmMarketApiData>(
            marketResponse.body,
          );
          nextMarketSnapshot = marketData?.market ?? null;
          nextMarketSource = marketData?.source ?? null;
          setMarketSnapshot(nextMarketSnapshot);
          setMarketSource(nextMarketSource);
        }

        writeYieldCache(
          selectedFarmId,
          resolvedCropName,
          nextYieldForecast,
          nextMarketSnapshot,
          nextMarketSource,
        );
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Unable to load yield forecast right now.";
        setPageError(message);
      } finally {
        setIsLoading(false);
      }
    };

    loadYieldData();
  }, [currentUser, selectedFarmId, selectedCropName]);

  const dailySeries = useMemo(() => {
    if (!yieldForecast?.expectedYield) {
      return [];
    }

    return buildYieldSeries(yieldForecast.expectedYield);
  }, [yieldForecast]);

  const selectedFarm = farms.find((farm) => farm.id === selectedFarmId) ?? null;
  const selectedFarmName = selectedFarm?.name ?? "Select a farm";
  const activeCropName = selectedCropName ?? DEFAULT_YIELD_REQUEST.cropType;

  const marketPrices: MarketPrice[] = marketSnapshot
    ? [
        {
          label: `${(selectedCropName ?? marketSnapshot.commodityName).toUpperCase()} (${marketSnapshot.symbol})`,
          price: `PHP ${marketSnapshot.price.toFixed(2)} / ${marketSnapshot.unit}`,
          change: formatPercent(marketSnapshot.percentageChange),
          changeColor: marketSnapshot.percentageChange >= 0 ? "text-[#00450d]" : "text-[#ba1a1a]",
          isPositive: marketSnapshot.percentageChange >= 0,
        },
      ]
    : [];

  const revenueSource = useMemo(() => {
    if (yieldForecast?.estimatedRevenuePhp !== null &&
      yieldForecast?.estimatedRevenuePhp !== undefined) {
      return yieldForecast.estimatedRevenuePhp;
    }

    if (!yieldForecast || !marketSnapshot) {
      return null;
    }

    const fallbackRevenue = yieldForecast.expectedYield * 1000 * marketSnapshot.price;

    return Number.isFinite(fallbackRevenue) ? fallbackRevenue : null;
  }, [yieldForecast, marketSnapshot]);

  const revenueValue = formatCurrencyPhp(revenueSource);
  const progressPercent = yieldForecast?.expectedYield
    ? `${Math.min(100, Math.max(20, (yieldForecast.expectedYield / 20) * 100)).toFixed(0)}%`
    : "20%";

  const runYieldPrediction = useCallback(async (cropName: string, options?: { auto?: boolean }) => {
    if (!currentUser || !selectedFarmId) {
      setPageError("Select a farm before running a new analysis.");
      return;
    }

    const resolvedCropName = cropName || DEFAULT_YIELD_REQUEST.cropType;

    if (options?.auto) {
      const cached = readYieldCache(selectedFarmId, resolvedCropName);

      if (cached) {
        setYieldForecast(cached.yieldForecast);
        setMarketSnapshot(cached.marketSnapshot);
        setMarketSource(cached.marketSource);
        setLastPredictionKey(`${selectedFarmId}:${resolvedCropName}`);
        return;
      }
    }

    setIsLoading(true);
    setPageError("");
    setSelectionMessage("");

    try {
      const requestBody = {
        ...DEFAULT_YIELD_REQUEST,
        cropType: resolvedCropName,
      };
      const { response, body } = await fetchWithAuth(
        currentUser,
        `/api/farms/${selectedFarmId}/yield/predict`,
        {
          method: "POST",
          body: JSON.stringify(requestBody),
        },
      );

      if (!response.ok) {
        throw new Error(
          getApiErrorMessage(body, "Unable to generate yield forecast right now."),
        );
      }

      const data = extractApiData<{ forecast: YieldForecast }>(body);
      const nextYieldForecast = data?.forecast ?? null;
      setYieldForecast(nextYieldForecast);
      setLastPredictionKey(`${selectedFarmId}:${resolvedCropName}`);

      const marketResponse = await fetchWithAuth(
        currentUser,
        buildMarketRequestPath(selectedFarmId, resolvedCropName),
      );
      let nextMarketSnapshot: MarketSnapshot | null = null;
      let nextMarketSource: MarketSourceInfo | null = null;

      if (marketResponse.response.ok) {
        const marketData = extractApiData<FarmMarketApiData>(
          marketResponse.body,
        );
        nextMarketSnapshot = marketData?.market ?? null;
        nextMarketSource = marketData?.source ?? null;
        setMarketSnapshot(nextMarketSnapshot);
        setMarketSource(nextMarketSource);
      }

      writeYieldCache(
        selectedFarmId,
        resolvedCropName,
        nextYieldForecast,
        nextMarketSnapshot,
        nextMarketSource,
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to generate yield forecast right now.";
      setPageError(message);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, selectedFarmId]);

  const handleRunAnalysis = async () => {
    await runYieldPrediction(activeCropName);
  };

  useEffect(() => {
    if (!currentUser || !selectedFarmId) {
      return;
    }

    const predictionKey = `${selectedFarmId}:${activeCropName}`;

    if (predictionKey === lastPredictionKey || yieldForecast) {
      return;
    }

    runYieldPrediction(activeCropName, { auto: true });
  }, [currentUser, selectedFarmId, activeCropName, lastPredictionKey, yieldForecast, runYieldPrediction]);

  return (
    <div className="min-h-screen bg-[#EFF6E7] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
        <YieldHeader
          selectedFarmId={selectedFarmId}
          selectedFarmName={selectedFarmName}
          onFarmChange={setSelectedFarmId}
          onRunAnalysis={handleRunAnalysis}
          isLoading={isLoading}
          isFarmDropdownOpen={isFarmDropdownOpen}
          setIsFarmDropdownOpen={setIsFarmDropdownOpen}
          farmOptions={farms}
        />

        {(pageError || selectionMessage) && (
          <p className="mb-4 text-sm font-semibold text-[#9C4A00]">
            {pageError || selectionMessage}
          </p>
        )}

        {/* Responsive layout: stack on mobile, side-by-side on large screens */}
        <div className="flex flex-col lg:flex-row gap-6 w-full items-stretch">
          {/* Graph Card */}
          <div className="w-full lg:w-2/3 shrink-0 h-full">
            <SeasonalYieldChart
              dailyData={dailySeries}
              legendLabel={`Projected Yield (${activeCropName})`}
            />
          </div>
          {/* Side Cards */}
          <div className="w-full lg:w-1/3 flex flex-col gap-6 mt-0 h-full min-h-0 lg:h-[520px] overflow-hidden">
            <div className="shrink-0">
              <EstimatedRevenueCard
                revenue={revenueValue}
                percentageIncrease={
                  marketSnapshot
                    ? `${formatPercent(marketSnapshot.percentageChange)} market shift`
                    : "Market data pending"
                }
                progressWidth={progressPercent}
              />
            </div>
            <div className="flex-1 min-h-0">
              <MarketPriceTrendsCard
                prices={marketPrices}
                marketSnapshot={marketSnapshot}
                marketSource={marketSource}
              />
            </div>
          </div>
        </div>
         <QuickNavigation currentPage="yield-prediction" />
      </div>
    </div>
  );
}