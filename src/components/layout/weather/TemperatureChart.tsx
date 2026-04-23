"use client";

import { useEffect, useState } from "react";
import {Info} from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface TemperatureData {
  day: string;
  high: number;
  low: number;
}

interface TemperatureChartProps {
  data: TemperatureData[];
}

export default function TemperatureChart({ data }: TemperatureChartProps) {
  const maxTemp = Math.max(...data.map(d => d.high));
  const minTemp = Math.min(...data.map(d => d.low));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="col-span-12 lg:col-span-8 min-w-0 min-h-0">
      <div className="h-full p-4 sm:p-6 lg:p-8 bg-white rounded-[24px] sm:rounded-[36px] lg:rounded-[48px] shadow-sm flex flex-col min-h-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h3 className="text-lg sm:text-xl font-bold text-[#171D14]">Temperature Evolution</h3>
          <div className="flex gap-2 flex-wrap">
            <span className="flex items-center gap-1 px-3 py-1 bg-[#EFF6E7] rounded-full text-xs">
              <span className="w-2 h-2 bg-[#00450D] rounded-full" />
              <p className="text-[#171D14]">Daytime</p>
            </span>
            <span className="flex items-center gap-1 px-3 py-1 bg-[#EFF6E7] rounded-full text-xs">
              <span className="w-2 h-2 bg-[#003E63] rounded-full" />
              <p className="text-[#171D14]">Nighttime</p>
            </span>
          </div>
        </div>

        <div className="h-52 sm:h-64 w-full min-w-0 min-h-0">
          {mounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 15, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 10, fill: '#41493E', fontWeight: 600 }}
                  axisLine={{ stroke: '#C0C9BB33' }}
                  tickLine={false}
                  padding={{ left: 10, right: 10 }}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#41493E' }}
                  axisLine={false}
                  tickLine={false}
                  domain={[minTemp - 2, maxTemp + 2]}
                  tickCount={6}
                />
                <Tooltip
                  cursor={{ stroke: '#C0C9BB' }}
                  contentStyle={{
                    backgroundColor: 'white',
                    borderColor: '#E5E7EB',
                    borderRadius: '16px',
                    boxShadow: '0 4px 6px -4px rgba(0,0,0,0.1)',
                    fontSize: '12px',
                    padding: '8px 12px'
                  }}
                />
                <Line type="monotone" dataKey="high" stroke="#00450D" strokeWidth={2} strokeDasharray="5 5" dot={false} activeDot={false} />
                <Line type="monotone" dataKey="low" stroke="#003E63" strokeWidth={2} strokeDasharray="3 4 5 2" dot={false} activeDot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ width: "100%", height: "100%" }} />
          )}
        </div>

        <div className="flex items-start sm:items-center gap-2 text-xs sm:text-sm text-[#41493E] mt-2">
          <Info className="w-5 h-5 text-[#41493E]"/>
          <p>Average temperature is 2.4°C higher than the seasonal baseline.</p>
        </div>
      </div>
    </div>
  );
}