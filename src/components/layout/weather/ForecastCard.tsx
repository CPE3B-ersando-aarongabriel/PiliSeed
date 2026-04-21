"use client";
import { 
  Sun, 
  Cloud, 
  CloudRain, 
  CloudSun, 
  Cloudy,
  LucideIcon,
} from "lucide-react";


interface ForecastData {
  date?: string;
  day: string;
  high: number;
  low: number;
  condition: string;
  isToday?: boolean;
}

interface ForecastCardProps {
  data: ForecastData[];
}

const getWeatherIcon = (condition: string): { icon: LucideIcon; color: string }=> {
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
  return icons[normalizedCondition] || { icon: Cloud, color: "text-[#003E63]" };
};

export default function ForecastCard({ data }: ForecastCardProps) {
  const todayKey = new Date().toISOString().slice(0, 10);
  const hasToday = data.some((entry) => entry.date === todayKey || entry.isToday);

  return (
    <div className="col-span-12">
      <h3 className="text-xl font-bold mb-6 text-[#171d14]">7-Day Agricultural Outlook</h3>
      <div className="grid grid-cols-7 gap-4">
        {data.map((day, idx) => {
          const isHighlighted =
            day.date === todayKey || day.isToday || (!hasToday && idx === 0);
            const { icon: WeatherIcon, color } = getWeatherIcon(day.condition);
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
                 <WeatherIcon className={`w-10 h-10 mb-4 ${color}`} />
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