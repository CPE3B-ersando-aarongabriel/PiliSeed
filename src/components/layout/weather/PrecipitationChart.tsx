"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface PrecipitationData {
  day: string;
  amount: number;
}

interface PrecipitationChartProps {
  data: PrecipitationData[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white px-3 py-2 rounded-lg shadow-lg border border-gray-200">
        <p className="text-sm font-semibold text-[#00450D]">
          {payload[0].value} mm
        </p>
      </div>
    );
  }
  return null;
};

export default function PrecipitationChart({ data }: PrecipitationChartProps) {
  const chartData = data.map((item) => ({
    day: item.day,
    amount: item.amount,
  }));

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="col-span-7">
      <div className="p-8 bg-white rounded-[48px] shadow-sm h-full">
        <div className="flex items-center justify-between mb-10">
          <h3 className="text-xl font-bold">Precipitation Accumulation</h3>
          <div className="flex items-center gap-2 px-4 py-3 bg-[#E3EBDC] rounded-full">
            <span className="text-xs font-semibold">Current Week</span>
          </div>
        </div>

        <div className="h-48 w-full" style={{ minWidth: 0, minHeight: 0 }}>
          {mounted ? (
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: "semibold", fill: "#41493E" }}
                  dy={10}
                />
                <YAxis hide={true} />
                <Tooltip content={<CustomTooltip />} cursor={false} />
                <Bar dataKey="amount" radius={[4, 4, 0, 0]} barSize={32}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill="#00450D" opacity={entry.amount > 0 ? 1 : 0.3} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ width: "100%", height: "100%" }} />
          )}
        </div>

        <div className="flex justify-between mt-2 px-2">
          {chartData.map((item, idx) => (
            <span
              key={idx}
              className={`text-[10px] font-semibold ${
                item.amount > 0 ? "text-[#00450D]" : "text-[#41493E]"
              }`}
              style={{ width: "32px", textAlign: "center" }}
            ></span>
          ))}
        </div>
      </div>
    </div>
  );
}
