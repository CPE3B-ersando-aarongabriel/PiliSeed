"use client";

import Image from "next/image";

interface CurrentConditionCardProps {
  condition: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  uvIndex: string;
}

const getWeatherIcon = (condition: string) => {
  const icons: Record<string, string> = {
    "sunny": "/weather/sunny.svg",
    "cloudy": "/weather/cloudy.svg",
    "rainy": "/weather/rainy.svg",
    "partly-cloudy": "/weather/partly.svg",
    "Partly Cloudy": "/weather/partly.svg",
    "Cloudy": "/weather/cloudy.svg",
    "Sunny": "/weather/sunny.svg",
    "Rainy": "/weather/rainy.svg",
    "Clear": "/weather/sunny.svg",
    "Overcast": "/weather/cloudy.svg",
  };
  return icons[condition] || "/weather/default.svg";
};

export default function CurrentConditionCard({
  condition,
  temperature,
  feelsLike,
  humidity,
  uvIndex,
}: CurrentConditionCardProps) {
  return (
    <div className="col-span-4">
      <div className="p-8 bg-white rounded-[48px] shadow-sm">
        <div className="flex items-start justify-between mb-8">
          <div>
            <span className="text-sm font-medium text-[#41493E]">Current Condition</span>
            <h3 className="text-lg font-semibold mt-1">{condition}</h3>
          </div>
          <img
            src={getWeatherIcon(condition)}
            alt={condition}
            className="w-12 h-12"
          />
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