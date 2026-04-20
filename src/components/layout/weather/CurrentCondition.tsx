"use client";

import { Cloud, CloudRain, CloudSun, Sun } from "lucide-react";

interface CurrentConditionCardProps {
  condition: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  uvIndex: string;
}

const getWeatherIcon = (condition: string) => {
  const normalizedCondition = condition.toLowerCase();

  if (normalizedCondition.includes("rain")) {
    return CloudRain;
  }

  if (normalizedCondition.includes("partly")) {
    return CloudSun;
  }

  if (normalizedCondition.includes("cloud") || normalizedCondition.includes("overcast")) {
    return Cloud;
  }

  return Sun;
};

export default function CurrentConditionCard({
  condition,
  temperature,
  feelsLike,
  humidity,
  uvIndex,
}: CurrentConditionCardProps) {
  const WeatherIcon = getWeatherIcon(condition);

  return (
    <div className="col-span-4">
      <div className="p-8 bg-white rounded-[48px] shadow-sm">
        <div className="flex items-start justify-between mb-8">
          <div>
            <span className="text-sm font-medium text-[#41493E]">Current Condition</span>
            <h3 className="text-lg font-semibold mt-1">{condition}</h3>
          </div>
          <WeatherIcon className="w-12 h-12 text-[#00450D]" strokeWidth={1.75} aria-hidden="true" />
        </div>

        <div className="flex items-baseline gap-2 mb-8">
          <span className="text-6xl font-extrabold text-[#00450D]">{temperature}°</span>
          <span className="text-xl font-medium text-[#41493E]">/ {feelsLike}°</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-[#Eff6E7] rounded-[32px]">
            <span className="text-[10px] font-semibold text-[#41493E]">HUMIDITY</span>
            <p className="text-xl font-semibold text-[#003E63]">{humidity}%</p>
          </div>
          <div className="p-4 bg-[#Eff6E7] rounded-[32px]">
            <span className="text-[10px] font-semibold text-[#41493E]">UV INDEX</span>
            <p className="text-xl font-semibold text-[#AA5649]">{uvIndex}</p>
          </div>
        </div>
      </div>
    </div>
  );
}