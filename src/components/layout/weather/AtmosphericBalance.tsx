"use client";

import { useEffect, useState } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

interface AtmosphericData {
  subject: string;
  value: number;
  fullMark: number;
}

interface AtmosphericBalanceProps {
  humidity: number;
  pressure: number;
  dewPoint: number;
  uvIndex: string;
}

const getUVIndexValue = (uvIndex: string) => {
  switch (uvIndex) {
    case "Low":
      return 25;
    case "Moderate":
      return 50;
    case "High":
      return 75;
    case "Very High":
      return 90;
    default:
      return 50;
  }
};

export default function AtmosphericBalance({
  humidity,
  pressure,
  dewPoint,
  uvIndex,
}: AtmosphericBalanceProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const atmosphericData: AtmosphericData[] = [
    { subject: "Humidity", value: humidity, fullMark: 100 },
    { subject: "Pressure", value: Math.min(100, Math.max(0, ((pressure - 950) / 100) * 100)), fullMark: 100 },
    { subject: "Dew Point", value: Math.min(100, (dewPoint / 30) * 100), fullMark: 100 },
    { subject: "UV Index", value: getUVIndexValue(uvIndex), fullMark: 100 },
  ];

  return (
    <div className="col-span-12 lg:col-span-6 min-w-0 min-h-0">
      <div className="relative h-full p-4 sm:p-6 lg:p-8 bg-[#E3EBDC] rounded-[24px] sm:rounded-[36px] lg:rounded-[48px] flex flex-col min-h-0">
        <h3 className="text-lg sm:text-xl font-bold mb-4 text-[#171D14]">Atmospheric Balance</h3>

        <div className="w-full h-60 sm:h-72 mb-2 min-w-0">
          {mounted ? (
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart outerRadius="70%" data={atmosphericData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                <PolarGrid stroke="#C0C9BB" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fill: '#41493E', fontWeight: 600 }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Atmospheric Balance" dataKey="value" stroke="#00450D" fill="#00450D" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ width: '100%', height: '100%' }} />
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 mt-auto">
          <div>
            <span className="text-[10px] font-semibold text-[#41493E]">DEW POINT</span>
            <p className="text-lg sm:text-xl font-semibold text-[#171D14]">{dewPoint}°C</p>
          </div>
          <div>
            <span className="text-[10px] font-semibold text-[#41493E]">PRESSURE</span>
            <p className="text-lg sm:text-xl font-semibold text-[#171D14]">{pressure} hPa</p>
          </div>
        </div>
      </div>
    </div>
  );
}