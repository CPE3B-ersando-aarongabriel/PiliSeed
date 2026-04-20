"use client";
import { useState, useEffect, useMemo } from "react";
import { getClientAuth } from "@/lib/firebaseClient";
import { onAuthStateChanged, User } from "firebase/auth";
import DashboardHeader from "@/components/layout/dashboard/DashboardHeader";
import DashboardCropReco from "@/components/layout/dashboard/DashbordCropReco";
import DashboardFarm from "@/components/layout/dashboard/DashboardFarm";
import DashboardWeather from "@/components/layout/dashboard/DashboardWeather";
import DashboardYieldPred from "@/components/layout/dashboard/DashboardYieldPred";

export interface FarmData {
  id: string;
  name: string;
  location: string | null;
  isActive: boolean;
}

export interface WeatherData {
  temperatureC: number;
  humidity: number;
  rainfallMm: number;
  rainRisk: "low" | "medium" | "high" | "unknown";
  recordedAt: string;
  updatedAt?: string;
}

export interface SoilStatus {
  phLevel: number;
  texture: string | null;
  soilClass: string | null;
  overallStatus: "good" | "needs_attention" | "usable" | "unknown";
  updatedAt: string;
}

export interface RecommendationPreview {
  recommendationId: string;
  topCrop: string | null;
  topScore: number | null;
  previewText: string | null;
  updatedAt: string;
}

export interface YieldPreview {
  forecastId: string;
  cropType: string;
  expectedYield: number;
  unit: string;
  estimatedRevenuePhp: number | null;
  updatedAt: string;
}

export interface MarketSnapshot {
  price: number;
  unit: string;
  percentageChange: number;
}

export interface CropRecommendation {
  name: string;
  suitabilityScore: number;
  description?: string;
}

export interface DashboardData {
  activeFarm: FarmData | null;
  weather: WeatherData | null;
  soilStatus: SoilStatus | null;
  recommendationPreview: RecommendationPreview | null;
  yieldPreview: YieldPreview | null;
  messages: string[];
  cropRecommendation: CropRecommendation | null;
  yieldHistory?: { month: string; value: number }[];
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


async function fetchWithAuth(url: string, user: User) {
  const token = await user.getIdToken();

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Failed to fetch");
  }

  const result = await res.json();

  if (!result.success) {
    throw new Error(result.error || "API returned unsuccessful response");
  }

  return result.data;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userName, setUserName] = useState<string>("Farmer");
  const [marketSnapshot, setMarketSnapshot] = useState<MarketSnapshot | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const yieldPreview = data?.yieldPreview ?? null;

  const revenueSource = useMemo(() => {
    if (!yieldPreview) {
      return null;
    }

    if (yieldPreview.estimatedRevenuePhp !== null &&
      yieldPreview.estimatedRevenuePhp !== undefined) {
      return yieldPreview.estimatedRevenuePhp;
    }

    if (!marketSnapshot) {
      return null;
    }

    const fallbackRevenue = yieldPreview.expectedYield * 1000 * marketSnapshot.price;

    return Number.isFinite(fallbackRevenue) ? fallbackRevenue : null;
  }, [yieldPreview, marketSnapshot]);

  const handleMenuClick = () => {
    const sidebar = document.querySelector("aside");
    if (sidebar) {
      const isOpen = sidebar.classList.contains("translate-x-0");
      if (isOpen) {
        sidebar.classList.add("-translate-x-full");
        sidebar.classList.remove("translate-x-0");
      } else {
        sidebar.classList.remove("-translate-x-full");
        sidebar.classList.add("translate-x-0");
      }
    }
  };
  useEffect(() => {
    const auth = getClientAuth();

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setUserName(
          firebaseUser.displayName ||
            firebaseUser.email?.split("@")[0] ||
            "Farmer",
        );

        try {
          setLoading(true);
          setError(null);

          const apiData = await fetchWithAuth(
            "/api/dashboard/summary",
            firebaseUser,
          );
          console.log("API Data:", apiData);

          let nextMarketSnapshot: MarketSnapshot | null = null;

          if (apiData.activeFarm && apiData.yieldPreview) {
            try {
              const marketData = await fetchWithAuth(
                `/api/farms/${apiData.activeFarm.id}/market`,
                firebaseUser,
              );
              nextMarketSnapshot = marketData?.market ?? null;
            } catch {
              nextMarketSnapshot = null;
            }
          }

          const dashboardData: DashboardData = {
            ...apiData,

            cropRecommendation: apiData.recommendationPreview?.topCrop
              ? {
                  name: apiData.recommendationPreview.topCrop,
                  suitabilityScore: apiData.recommendationPreview.topScore || 0,
                  description:
                    apiData.recommendationPreview.previewText || undefined,
                }
              : null,

            yieldHistory: undefined,
          };

          setData(dashboardData);
          setMarketSnapshot(nextMarketSnapshot);
        } catch (err: any) {
          console.error("Dashboard error:", err);
          setError(err.message || "Something went wrong");
        } finally {
          setLoading(false);
        }
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#EFF6E7]">
        <p className="text-[#00450D] font-semibold text-sm sm:text-base">
          Loading dashboard...
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#EFF6E7] px-4">
        <p className="text-red-600 mb-4 text-sm sm:text-base">
          Please log in to view dashboard
        </p>
        <button
          onClick={() => (window.location.href = "/login")}
          className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#00450D] text-white rounded-md text-sm sm:text-base"
        >
          Go to Login
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#EFF6E7] px-4">
        <p className="text-red-600 mb-4 text-sm sm:text-base">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#00450D] text-white rounded-md text-sm sm:text-base"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data || !data.activeFarm) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#EFF6E7] px-4">
        <div className="text-center">
          <h2 className="text-lg sm:text-xl font-bold text-[#00450D] mb-2">
            No Active Farm
          </h2>
          <p className="text-[#41493E] text-sm sm:text-base">
            {data?.messages?.[0] ||
              "Please create and activate a farm to view your dashboard."}
          </p>
        </div>
      </div>
    );
  }

  const revenueValue = formatCurrencyPhp(revenueSource);
  const progressPercent = yieldPreview?.expectedYield
    ? `${Math.min(100, Math.max(20, (yieldPreview.expectedYield / 20) * 100)).toFixed(0)}%`
    : "20%";
  const percentageIncrease = marketSnapshot
    ? `${formatPercent(marketSnapshot.percentageChange)} market shift`
    : "Market data pending";

  return (
    <main className="min-h-screen bg-[#EFF6E7] lg:ml-0">
      <DashboardHeader farmerName={userName} activeFarm={data.activeFarm} />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 px-4 sm:px-5 pb-6 sm:pb-8">
        <div className="w-full">
          <DashboardFarm farm={data.activeFarm} />
        </div>

        {data.weather ? (
          <div className="w-full">
            <DashboardWeather weather={data.weather} />
          </div>
        ) : (
          <div className="w-full lg:w-auto lg:flex-1 bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-md border border-[#41493E]/10 flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="rounded-xl sm:rounded-2xl bg-[#CEE5FF] p-1.5 sm:p-2">
                  <img
                    src="/dashboard/weather-forecast.svg"
                    alt="weather"
                    className="w-8 h-8 sm:w-10 sm:h-10"
                  />
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-[#171D14]">
                  Weather
                  <br />
                  Forecast
                </h2>
              </div>
              <p className="text-3xl sm:text-4xl font-bold text-[#00450D] sm:ml-auto">
                --°C
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
              <div>
                <span className="text-[10px] sm:text-[12px] font-bold text-[#41493E]/60">
                  CONDITIONS
                </span>
                <p className="font-semibold text-[#171D14] text-sm sm:text-base">
                  No data
                </p>
              </div>
              <div>
                <span className="text-[10px] sm:text-[12px] font-bold text-[#41493E]/60">
                  HUMIDITY
                </span>
                <p className="font-semibold text-[#171D14] text-sm sm:text-base">
                  --%
                </p>
              </div>
              <div>
                <span className="text-[10px] sm:text-[12px] font-bold text-[#41493E]/60">
                  RAINFALL
                </span>
                <p className="font-semibold text-[#171D14] text-sm sm:text-base">
                  -- mm
                </p>
              </div>
            </div>
          </div>
        )}

        {data.cropRecommendation ? (
          <div className="w-full">
            <DashboardCropReco recommendation={data.cropRecommendation} />
          </div>
        ) : (
          <div className="w-full lg:w-auto lg:flex-1 bg-[#00450D] rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-md flex flex-col">
            <div className="flex items-center gap-2 sm:gap-3 mb-4">
              <div className="rounded-xl sm:rounded-2xl bg-[#065F18] p-1.5 sm:p-2 w-fit">
                <img
                  src="/dashboard/crop-recommendation.svg"
                  alt="crop recommendation icon"
                  className="w-8 h-8 sm:w-10 sm:h-10"
                />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                Crop <br /> Recommendation
              </h2>
            </div>

            <div className="mb-6">
              <p className="text-2xl sm:text-3xl font-bold text-white">--</p>
              <div className="mt-2 sm:mt-3">
                <div className="rounded-full bg-white/20 px-2 sm:px-3 py-0.5 sm:py-1 inline-block">
                  <p className="text-[10px] sm:text-xs font-semibold text-white/90">
                    Suitability Score:{" "}
                    <span className="font-bold text-white">--%</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="px-4 sm:px-5 pb-6 sm:pb-8">
        {data.yieldPreview ? (
          <DashboardYieldPred
            yieldHistory={data.yieldHistory}
            yieldPreview={data.yieldPreview}
            revenueValue={revenueValue}
            percentageIncrease={percentageIncrease}
          />
        ) : (
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-md border border-[#41493E]/10 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-0 mb-6">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-[#171D14]">
                  Yield Prediction Analysis
                </h3>
                <p className="text-xs sm:text-sm text-[#41493E]/60 mt-1">
                  Projected harvest weight for the next 6 months (Metric Tons)
                </p>
              </div>
            </div>
            <div className="h-48 sm:h-60 flex items-center justify-center">
              <div className="text-center">
                <p className="text-[#41493E] font-medium mb-1 text-sm sm:text-base">
                  No Yield Forecasts Yet
                </p>
                <p className="text-[#41493E]/60 text-xs sm:text-sm">
                  Add crop and historical data to see predictions
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
