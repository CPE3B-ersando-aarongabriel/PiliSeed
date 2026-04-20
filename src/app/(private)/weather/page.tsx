"use client";

import { useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";

import QuickNavigation from "@/components/layout/QuickNavigation";
import WeatherHeader from "@/components/layout/weather/WeatherHeader";
import CurrentConditionCard from "@/components/layout/weather/CurrentCondition";
import TemperatureChart from "@/components/layout/weather/TemperatureChart";
import ForecastCard from "@/components/layout/weather/ForecastCard";
import PrecipitationChart from "@/components/layout/weather/PrecipitationChart";
import AtmosphericBalance from "@/components/layout/weather/AtmosphericBalance";
import HyperLocalContext from "@/components/layout/weather/HyperLocalContext";
import { fetchWithAuth, extractApiData, getApiErrorMessage } from "@/lib/apiClient";
import { getClientAuth } from "@/lib/firebaseClient";

interface WeatherData {
  current: {
    condition: string;
    temperature: number;
    feelsLike: number;
    humidity: number;
    uvIndex: string;
    dewPoint: number;
    pressure: number;
  };
  forecast: Array<{
    date?: string;
    day: string;
    high: number;
    low: number;
    condition: "sunny" | "cloudy" | "rainy" | "partly-cloudy";
    isToday?: boolean;
  }>;
  temperatureEvolution: Array<{
    day: string;
    high: number;
    low: number;
  }>;
  precipitation: Array<{
    day: string;
    amount: number;
  }>;
  farmContext: {
    slopeAspect: string;
    soilRetention: string;
    description: string;
    satelliteImage?: string;
  };
}

type FarmOption = {
  id: string;
  name: string;
  location: string | null;
  isActive: boolean;
};

type WeatherSnapshot = {
  temperatureC: number | null;
  humidity: number | null;
  rainfallMm: number | null;
  rainRisk?: "low" | "medium" | "high" | "unknown";
  forecast?: Array<{
    date?: string;
    temperatureMaxC?: number | null;
    temperatureMinC?: number | null;
    rainfallMm?: number | null;
  }>;
};

type WeatherTimelineEntry = {
  date: string;
  sourceType: "observed" | "backfilled" | "forecast";
  temperatureC: number | null;
  humidity: number | null;
  rainfallMm: number | null;
  rainRisk: "low" | "medium" | "high" | "unknown";
  isInferred: boolean;
};

type WeatherForecastPayload = {
  weather: WeatherSnapshot;
  weatherTimeline: WeatherTimelineEntry[];
  warnings: string[];
  weatherSnapshot: {
    temperatureC: number | null;
    humidity: number | null;
    rainfallMm: number | null;
  };
  timelineWindow?: {
    todayDate?: string;
  };
};

const mockWeatherData: WeatherData = {
  current: {
    condition: "Partly Cloudy",
    temperature: 24,
    feelsLike: 18,
    humidity: 68,
    uvIndex: "Moderate",
    dewPoint: 18.4,
    pressure: 1012,
  },
  forecast: [
    { day: "MONDAY", high: 26, low: 18, condition: "sunny" },
    { day: "TUESDAY", high: 24, low: 17, condition: "cloudy" },
    { day: "WEDNESDAY", high: 21, low: 16, condition: "rainy" },
    { day: "THURSDAY", high: 19, low: 14, condition: "cloudy" },
    { day: "FRIDAY", high: 23, low: 16, condition: "partly-cloudy" },
    { day: "SATURDAY", high: 27, low: 19, condition: "sunny" },
    { day: "SUNDAY", high: 28, low: 20, condition: "sunny" },
  ],
  temperatureEvolution: [
    { day: "Mon", high: 26, low: 18 },
    { day: "Tue", high: 24, low: 17 },
    { day: "Wed", high: 21, low: 16 },
    { day: "Thu", high: 19, low: 14 },
    { day: "Fri", high: 23, low: 16 },
    { day: "Sat", high: 27, low: 19 },
    { day: "Sun", high: 28, low: 20 },
  ],
  precipitation: [
    { day: "M", amount: 0 },
    { day: "T", amount: 0 },
    { day: "W", amount: 25 },
    { day: "T", amount: 0 },
    { day: "F", amount: 0 },
    { day: "S", amount: 0 },
    { day: "S", amount: 0 },
  ],
  farmContext: {
    slopeAspect: "NE (22°)",
    soilRetention: "High (Loam)",
    description:
      "Showing moisture distribution across Section B-12. The topography in the north-east quadrant is trapping higher humidity levels than the valley floor.",
    satelliteImage: undefined,
  },
};

type WeatherCacheRecord = {
  storedAt: string;
  data: WeatherData;
  warnings: string[];
};

const WEATHER_CACHE_TTL_MS = 1000 * 60 * 60 * 24;

function toUtcDateKey(value: Date) {
  return value.toISOString().slice(0, 10);
}

function getWeatherCacheKey(farmId: string) {
  return `piliSeed.weatherCache.${farmId}`;
}

function readWeatherCache(farmId: string): WeatherCacheRecord | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(getWeatherCacheKey(farmId));

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as WeatherCacheRecord;
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

    if (ageMs > WEATHER_CACHE_TTL_MS) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function writeWeatherCache(farmId: string, data: WeatherData, warnings: string[]) {
  if (typeof window === "undefined") {
    return;
  }

  const payload: WeatherCacheRecord = {
    storedAt: new Date().toISOString(),
    data,
    warnings,
  };

  window.localStorage.setItem(getWeatherCacheKey(farmId), JSON.stringify(payload));
}

export default function WeatherAnalysis() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [farms, setFarms] = useState<FarmOption[]>([]);
  const [selectedFarmId, setSelectedFarmId] = useState("");
  const [data, setData] = useState(mockWeatherData);
  const [isLoading, setIsLoading] = useState(false);
  const [isFarmDropdownOpen, setIsFarmDropdownOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [warnings, setWarnings] = useState<string[]>([]);

  useEffect(() => {
    const auth = getClientAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (!user) {
        setFarms([]);
        setSelectedFarmId("");
        setStatusMessage("Sign in to view weather data.");
        return;
      }

      setIsLoading(true);
      setStatusMessage("");

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
        setStatusMessage(message);
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const selectedFarm = farms.find((farm) => farm.id === selectedFarmId) ?? null;
  const selectedFarmName = selectedFarm?.name ?? "Select a farm";

  const mapForecastToUi = (payload: WeatherForecastPayload): WeatherData => {
    const baseTemperature = payload.weatherSnapshot.temperatureC ?? payload.weather.temperatureC ?? 24;
    const baseHumidity = payload.weatherSnapshot.humidity ?? payload.weather.humidity ?? 65;
    const rainRisk = payload.weather.rainRisk ?? "unknown";
    const todayDate =
      payload.timelineWindow?.todayDate ?? new Date().toISOString().slice(0, 10);
    const conditionLabel =
      rainRisk === "high"
        ? "Rainy"
        : rainRisk === "medium"
          ? "Cloudy"
          : "Sunny";
    const dewPoint = Number((baseTemperature - (100 - baseHumidity) / 5).toFixed(1));

    const providerForecast = payload.weather.forecast ?? [];
    const forecastSource = providerForecast.length > 0
      ? providerForecast.slice(0, 7).map((entry) => ({
          date: typeof entry.date === "string" ? entry.date : "",
          temperatureMaxC:
            typeof entry.temperatureMaxC === "number" ? entry.temperatureMaxC : null,
          temperatureMinC:
            typeof entry.temperatureMinC === "number" ? entry.temperatureMinC : null,
          rainfallMm:
            typeof entry.rainfallMm === "number" ? entry.rainfallMm : null,
          sourceType: "forecast" as const,
          rainRisk,
        }))
      : payload.weatherTimeline.slice(0, 7).map((entry) => ({
          date: entry.date,
          temperatureMaxC:
            typeof entry.temperatureC === "number" ? entry.temperatureC + 2 : null,
          temperatureMinC:
            typeof entry.temperatureC === "number" ? entry.temperatureC - 3 : null,
          rainfallMm: entry.rainfallMm,
          sourceType: entry.sourceType,
          rainRisk: entry.rainRisk,
        }));

    const toCondition = (rainfallMm: number | null, risk: typeof rainRisk) => {
      if (typeof rainfallMm === "number") {
        if (rainfallMm >= 8) return "rainy";
        if (rainfallMm >= 2) return "cloudy";
        return "sunny";
      }

      if (risk === "high") return "rainy";
      if (risk === "medium") return "cloudy";
      return "sunny";
    };

    const timeline = forecastSource.map((entry) => {
      const date = new Date(entry.date);
      const isValidDate = !Number.isNaN(date.getTime());
      const dayLabel = isValidDate
        ? date.toLocaleDateString("en-US", { weekday: "long" }).toUpperCase()
        : "DAY";
      const shortDayLabel = isValidDate
        ? date.toLocaleDateString("en-US", { weekday: "short" })
        : "Day";

      const highTemp = entry.temperatureMaxC ?? baseTemperature + 2;
      const lowTemp = entry.temperatureMinC ?? baseTemperature - 3;
      const rainfallValue = entry.rainfallMm ?? payload.weather.rainfallMm ?? 0;

      return {
        date: entry.date,
        day: dayLabel,
        shortDay: shortDayLabel,
        high: Math.round(highTemp),
        low: Math.round(lowTemp),
        rainfall: rainfallValue,
        condition: toCondition(entry.rainfallMm, entry.rainRisk),
        isToday: entry.date === todayDate,
      };
    });

    const forecast = timeline.map((entry) => ({
      date: entry.date,
      day: entry.day,
      high: entry.high,
      low: entry.low,
      condition: entry.condition as "sunny" | "cloudy" | "rainy" | "partly-cloudy",
      isToday: entry.isToday,
    }));

    const temperatureEvolution = timeline.map((entry) => ({
      day: entry.shortDay.toUpperCase(),
      high: entry.high,
      low: entry.low,
    }));

    const precipitation = timeline.map((entry) => ({
      day: entry.shortDay.slice(0, 1).toUpperCase(),
      amount: Math.round(entry.rainfall ?? 0),
    }));

    return {
      current: {
        condition: conditionLabel,
        temperature: Math.round(baseTemperature),
        feelsLike: Math.round(baseTemperature - 1),
        humidity: Math.round(baseHumidity),
        uvIndex: "Moderate",
        dewPoint,
        pressure: 1012,
      },
      forecast,
      temperatureEvolution,
      precipitation,
      farmContext: mockWeatherData.farmContext,
    };
  };

  const fetchWeatherData = async (mode: "initial" | "refresh" = "initial") => {
    if (!currentUser || !selectedFarmId) {
      return;
    }

    if (mode === "initial") {
      const cached = readWeatherCache(selectedFarmId);

      if (cached) {
        setData(cached.data);
        setWarnings(cached.warnings);
        return;
      }
    }

    setIsLoading(true);
    setStatusMessage("");
    setWarnings([]);

    try {
      if (mode === "refresh") {
        const refreshResult = await fetchWithAuth(
          currentUser,
          `/api/farms/${selectedFarmId}/weather/refresh`,
          { method: "POST" },
        );

        if (!refreshResult.response.ok) {
          throw new Error(
            getApiErrorMessage(
              refreshResult.body,
              "Unable to refresh weather data right now.",
            ),
          );
        }
      }

      const [currentResult, forecastResult] = await Promise.all([
        fetchWithAuth(currentUser, `/api/farms/${selectedFarmId}/weather/current`),
        fetchWithAuth(
          currentUser,
          `/api/farms/${selectedFarmId}/weather/forecast?days=7`,
        ),
      ]);

      if (!currentResult.response.ok) {
        throw new Error(
          getApiErrorMessage(
            currentResult.body,
            "Unable to load current weather right now.",
          ),
        );
      }

      if (!forecastResult.response.ok) {
        throw new Error(
          getApiErrorMessage(
            forecastResult.body,
            "Unable to load weather forecast right now.",
          ),
        );
      }

      const currentData = extractApiData<{ weather: WeatherSnapshot }>(
        currentResult.body,
      );
      const forecastData = extractApiData<WeatherForecastPayload>(
        forecastResult.body,
      );

      console.log("[Weather API] current:", currentData?.weather ?? null);
      console.log("[Weather API] forecast:", forecastData ?? null);

      if (!forecastData?.weather) {
        throw new Error("Weather forecast response did not include data.");
      }

      const payload: WeatherForecastPayload = {
        ...forecastData,
        weather: {
          ...forecastData.weather,
          temperatureC:
            currentData?.weather?.temperatureC ?? forecastData.weather.temperatureC ?? null,
          humidity:
            currentData?.weather?.humidity ?? forecastData.weather.humidity ?? null,
          rainfallMm:
            currentData?.weather?.rainfallMm ?? forecastData.weather.rainfallMm ?? null,
        },
      };

      const nextWarnings = forecastData.warnings ?? [];
      const mappedData = mapForecastToUi(payload);

      setWarnings(nextWarnings);
      setData(mappedData);
      writeWeatherCache(selectedFarmId, mappedData, nextWarnings);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to load weather data right now.";
      const cached = readWeatherCache(selectedFarmId);

      if (cached) {
        setData(cached.data);
        setWarnings(cached.warnings);
      } else {
        setStatusMessage(message);
        setData(mockWeatherData);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedFarmId) {
      fetchWeatherData();
    }
  }, [selectedFarmId, currentUser]);

  return (
    <div className="min-h-screen bg-[#EFF6E7] py-8">
      <div className="max-w-7xl mx-auto px-12">
        <WeatherHeader
          selectedFarmId={selectedFarmId}
          selectedFarmName={selectedFarmName}
          onFarmChange={setSelectedFarmId}
          onRefresh={() => fetchWeatherData("refresh")}
          isLoading={isLoading}
          isFarmDropdownOpen={isFarmDropdownOpen}
          setIsFarmDropdownOpen={setIsFarmDropdownOpen}
          farmOptions={farms}
        />

        {(statusMessage || warnings.length > 0) && (
          <div className="mt-4 rounded-3xl border border-[#C0C9BB] bg-white px-6 py-4 text-sm font-semibold text-[#9C4A00]">
            {statusMessage && <p>{statusMessage}</p>}
            {warnings.length > 0 && (
              <p>{warnings.join(" ")}</p>
            )}
          </div>
        )}

        <div className="grid grid-cols-12 gap-8 mt-8">
          <CurrentConditionCard {...data.current} />
          <TemperatureChart data={data.temperatureEvolution} />
          <ForecastCard data={data.forecast} />
          <PrecipitationChart data={data.precipitation} />
          <AtmosphericBalance {...data.current} />
          <HyperLocalContext data={data.farmContext} />
        </div>
        <QuickNavigation currentPage="weather-analysis" />
      </div>
    </div>
  );
}
