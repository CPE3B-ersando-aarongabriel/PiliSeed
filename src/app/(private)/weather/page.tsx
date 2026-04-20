"use client";

import { useState, useEffect } from "react";
import QuickNavigation from "@/components/layout/QuickNavigation";
import WeatherHeader from "@/components/layout/weather/WeatherHeader";
import CurrentConditionCard from "@/components/layout/weather/CurrentCondition";
import TemperatureChart from "@/components/layout/weather/TemperatureChart";
import ForecastCard from "@/components/layout/weather/ForecastCard";
import PrecipitationChart from "@/components/layout/weather/PrecipitationChart";
import AtmosphericBalance from "@/components/layout/weather/AtmosphericBalance";
import HyperLocalContext from "@/components/layout/weather/HyperLocalContext";

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
    day: string;
    high: number;
    low: number;
    condition: "sunny" | "cloudy" | "rainy" | "partly-cloudy";
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

const farmOptions = ["Emerald Ridge Farm", "Emerald Valley", "Highland Ridge"];

export default function WeatherAnalysis() {
  const [data, setData] = useState(mockWeatherData);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFarm, setSelectedFarm] = useState("Emerald Ridge Farm");
  const [isFarmDropdownOpen, setIsFarmDropdownOpen] = useState(false);

  const fetchWeatherData = async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setData(mockWeatherData);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWeatherData();
  }, []);

  return (
    <div className="min-h-screen bg-[#EFF6E7] py-8">
      <div className="max-w-7xl mx-auto px-12">
        <WeatherHeader
          selectedFarm={selectedFarm}
          onFarmChange={setSelectedFarm}
          onRefresh={fetchWeatherData}
          isLoading={isLoading}
          isFarmDropdownOpen={isFarmDropdownOpen}
          setIsFarmDropdownOpen={setIsFarmDropdownOpen}
          farmOptions={farmOptions}
        />

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
