"use client";
import {CloudSun} from "lucide-react";
interface WeatherCardProps {
  weather: {
    temperatureC: number;
    humidity: number;
    rainfallMm: number;
    rainRisk?: "low" | "medium" | "high" | "unknown";
  };
}

export default function DashboardWeather({ weather }: WeatherCardProps) {
  const getConditions = (rainfallMm: number): string => {
    if (rainfallMm > 5) return "Heavy Rain";
    if (rainfallMm > 0) return "Light Rain";
    return "Clear Skies";
  };

  return (
    <div className="w-full bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-md border border-[#41493E]/10 flex flex-col h-full">

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="rounded-xl sm:rounded-2xl bg-[#CEE5FF] p-1.5 sm:p-2">
           <CloudSun className="w-8 h-8 sm:w-10 sm:h-10 text-[#003E63]"/>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-[#171D14]">
            Weather
            <br />
            Forecast
          </h2>
        </div>
        <p className="text-3xl sm:text-4xl font-bold text-[#00450D] sm:ml-auto">
          {weather.temperatureC}°C
        </p>
      </div>

    
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div>
          <span className="text-[10px] sm:text-[12px] font-bold text-[#41493E]/60">
            CONDITIONS
          </span>
          <p className="font-semibold text-[#171D14] text-sm sm:text-base">
            {getConditions(weather.rainfallMm)}
          </p>
        </div>
        <div>
          <span className="text-[10px] sm:text-[12px] font-bold text-[#41493E]/60">
            HUMIDITY
          </span>
          <p className="font-semibold text-[#171D14] text-sm sm:text-base">
            {weather.humidity}%
          </p>
        </div>
        <div>
          <span className="text-[10px] sm:text-[12px] font-bold text-[#41493E]/60">
            RAINFALL
          </span>
          <p className="font-semibold text-[#171D14] text-sm sm:text-base">
            {weather.rainfallMm} mm
          </p>
        </div>
      </div>

      {weather.rainRisk && weather.rainRisk !== "unknown" && (
        <div className="mt-auto pt-2">
          <span className={`
            inline-block px-2 sm:px-3 py-1 rounded-full text-xs font-semibold
            ${weather.rainRisk === "high" ? "bg-red-100 text-red-700" : 
              weather.rainRisk === "medium" ? "bg-yellow-100 text-yellow-700" : 
              "bg-green-100 text-green-700"}
          `}>
            Rain Risk: {weather.rainRisk.toUpperCase()}
          </span>
        </div>
      )}
    </div>
  );
}