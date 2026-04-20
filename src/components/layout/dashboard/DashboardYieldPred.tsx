"use client";

import { useState, useEffect } from "react";
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  ComposedChart,
} from "recharts";

interface YieldDataPoint {
  month: string;
  value: number;
}

interface YieldPredictionCardProps {
  yieldHistory?: YieldDataPoint[];
  isLoading?: boolean;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#93CBFF] text-white px-4 py-2 rounded-full shadow-md text-sm font-medium">
        Predicted: {payload[0].value} MT
      </div>
    );
  }
  return null;
};

export default function YieldPredictionCard({
  yieldHistory,
  isLoading = false,
}: YieldPredictionCardProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  const gradientId = "yieldGradient";

  const handleExportCSV = () => {
    if (!yieldHistory) return;

    const headers = ["Month", "Predicted Yield (MT)"];
    const rows = yieldHistory.map((item) => [item.month, item.value]);
    const csvContent = [headers, ...rows]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "yield-prediction.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCompareLastYear = () => {
    alert("Comparison feature will be available soon");
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-md border border-[#41493E]/10 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="h-80 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  if (!yieldHistory || yieldHistory.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-md border border-[#41493E]/10 p-6">
        <div className="h-[300px] flex items-center justify-center">
          <p className="text-[#41493E]/60">No yield data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-md border border-[#41493E]/10 p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-xl font-bold text-[#171D14]">
            Yield Prediction Analysis
          </h3>
          <p className="text-sm text-[#41493E]/60 mt-1">
            Projected harvest weight for the next 6 months (Metric Tons)
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleCompareLastYear}
            className="px-4 py-2 border border-[#41493E]/20 rounded-lg text-sm font-medium text-[#00450D] hover:bg-gray-50 transition"
          >
            Compare Last Year
          </button>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-[#dee5d6] text-[#00450D] rounded-lg text-sm font-medium transition hover:bg-[#00450D] hover:text-white"
          >
            Export CSV
          </button>
        </div>
      </div>

      <div className="w-full h-[300px] sm:h-[350px] min-h-[300px]">
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={yieldHistory}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00450D" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00450D" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid vertical={false} stroke="#E5E7EB" />

              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6B7280", fontSize: 12 }}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6B7280", fontSize: 12 }}
              />

              <Tooltip content={<CustomTooltip />} />

              <Area
                type="monotone"
                dataKey="value"
                stroke="none"
                fill={`url(#${gradientId})`}
              />

              <Line
                type="natural"
                dataKey="value"
                stroke="#00450D"
                strokeWidth={3}
                dot={{
                  r: 4,
                  fill: "#00450D",
                  stroke: "white",
                  strokeWidth: 2,
                }}
                activeDot={{
                  r: 7,
                  fill: "#00450D",
                }}
                isAnimationActive={true}
                animationDuration={800}
              />
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ width: '100%', height: '100%' }} />
        )}
      </div>
    </div>
  );
}
