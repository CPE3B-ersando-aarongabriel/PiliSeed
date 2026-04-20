"use client";

import Image from "next/image";

interface ForecastData {
  day: string;
  high: number;
  low: number;
  condition: string;
  isToday?: boolean;
}

interface ForecastCardProps {
  data: ForecastData[];
}

const getWeatherIcon = (condition: string) => {
  const icons: Record<string, string> = {
    "sunny": "/weather/sunny.svg",
    "cloudy": "/weather/cloudy.svg",
    "rainy": "/weather/rainy.svg",
    "partly-cloudy": "/weather/partly.svg",
  };
  return icons[condition];
};

export default function ForecastCard({ data }: ForecastCardProps) {
  const hasToday = data.some((entry) => entry.isToday);

  return (
    <div className="col-span-12">
      <h3 className="text-xl font-bold mb-6">7-Day Agricultural Outlook</h3>
      <div className="grid grid-cols-7 gap-4">
        {data.map((day, idx) => {
          const isHighlighted = day.isToday ?? (!hasToday && idx === 0);
          return (
            <div
              key={day.day}
              className={`flex flex-col items-center p-6 rounded-[48px] transition-all ${
                isHighlighted
                  ? 'bg-white shadow-lg ring-2 ring-[#00450D] ring-opacity-10'
                  : 'bg-[#DFEAD6]'
              }`}
            >
              <span className={`text-[10px] font-semibold mb-4 ${isHighlighted ? 'text-[#00450D]' : 'text-[#41493e]'}`}>
                {day.day}
              </span>
              <img
                src={getWeatherIcon(day.condition)}
                alt={day.condition}
                className="w-8 h-8 mb-4"
              />
              <span className={`text-2xl font-bold mb-1 ${isHighlighted ? 'text-[#00450D]' : 'text-[#171d14]'}`}>
                {day.high}°
              </span>
              <span className="text-xs font-medium text-[#41493E]">Low {day.low}°</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}