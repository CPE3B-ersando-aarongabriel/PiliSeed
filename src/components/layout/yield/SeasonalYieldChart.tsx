"use client";

import { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface SeasonalYieldChartProps {
  dailyData: Array<{ day: string; value: number }>;
  legendLabel: string;
}

export default function SeasonalYieldChart({
  dailyData,
  legendLabel,
}: SeasonalYieldChartProps) {
  const [mounted, setMounted] = useState(false);
  const hasData = dailyData.length > 0;

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="col-span-8 bg-white rounded-[48px] shadow-[0px_12px_40px_#171d140A] p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-bold text-[#171D14] text-2xl mb-1">
            90-Day Yield Forecast
          </h2>
          <p className="font-normal text-[#41493E] text-sm">
            Projected yield trend based on the latest farm forecast.
          </p>
        </div>
      </div>


      <div className="h-[350px] bg-[#Eff6e74C] rounded-[32px] p-4" style={{ minWidth: 0, minHeight: 0 }}>
        {mounted && hasData ? (
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <AreaChart
              data={dailyData}
              margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#171D14" opacity={0.1} />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 10, fill: "#41493E", fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
                minTickGap={24}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#41493E" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "none",
                  borderRadius: "16px",
                  boxShadow: "0 4px 6px -4px rgba(0,0,0,0.1)",
                  fontSize: "12px",
                  padding: "8px 12px",
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                name={legendLabel}
                stroke="#00450D"
                fill="#00450D"
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-sm font-semibold text-[#41493E]">
            {hasData ? "" : "Run a yield prediction to see a 90-day forecast."}
          </div>
        )}
      </div>

 
      {hasData && (
        <div className="flex items-center gap-6 mt-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#00450D] rounded-full" />
            <span className="font-semibold text-[#171D14] text-xs">
              {legendLabel}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}