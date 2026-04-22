"use client";

import { 
  Sun, 
  Cloud, 
  CloudRain, 
  CloudSun, 
  Cloudy,
  LucideIcon, 
} from "lucide-react";

interface CurrentConditionCardProps {
  condition: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  uvIndex: string;
}

const getWeatherIcon = (condition: string): { icon: LucideIcon; color: string } => {
  const normalizedCondition = condition.toLowerCase();
  const icons: Record<string, { icon: LucideIcon; color: string }> = {
    "sunny": { icon: Sun, color: "text-[#00450D]" },
    "cloudy": { icon: Cloud, color: "text-[#003E63]" },
    "rainy": { icon: CloudRain, color: "text-[#003E63]" },
    "partly-cloudy": { icon: CloudSun, color: "text-[#00450D]" },
    "partly cloudy": { icon: CloudSun, color: "text-[#00450D]" },
    "clear": { icon: Sun, color: "text-[#00450D]" },
    "overcast": { icon: Cloudy, color: "text-[#00450D]" },
  };
  return icons[condition] || { icon: Cloud, color: "text-[#003E63]" };; 
};

export default function CurrentConditionCard({
  condition,
  temperature,
  feelsLike,
  humidity,
  uvIndex,
}: CurrentConditionCardProps) {
  const { icon: WeatherIconComponent, color } = getWeatherIcon(condition);
  return (
    <div className="col-span-12 lg:col-span-4 min-w-0">
      <div className="p-4 sm:p-6 lg:p-8 bg-white rounded-[24px] sm:rounded-[36px] lg:rounded-[48px] shadow-sm">
        <div className="flex items-start justify-between mb-6 sm:mb-8">
          <div>
            <span className="text-sm font-medium text-[#41493E]">Current Condition</span>
            <h3 className="text-lg font-semibold mt-1 text-[#171D14]">{condition}</h3>
          </div>
          <WeatherIconComponent className={`w-10 h-10 sm:w-12 sm:h-12 ${color}`} />
        </div>

        <div className="flex items-baseline gap-2 mb-6 sm:mb-8">
          <span className="text-5xl sm:text-6xl font-extrabold text-[#00450D]">{temperature}°</span>
          <span className="text-lg sm:text-xl font-medium text-[#41493E]">/ {feelsLike}°</span>
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