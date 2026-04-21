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

interface YieldPreview {
  cropType?: string | null;
  expectedYield: number;
  unit: string;
  estimatedRevenuePhp?: number | null;
}

interface YieldPredictionCardProps {
  yieldHistory?: YieldDataPoint[];
  yieldPreview?: YieldPreview | null;
  revenueValue?: string;
  percentageIncrease?: string;
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
  yieldPreview,
  revenueValue,
  percentageIncrease,
  isLoading = false,
}: YieldPredictionCardProps) {
  const [mounted, setMounted] = useState(false);

  const formatRevenuePhp = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined || !Number.isFinite(amount)) {
      return "PHP --";
    }

    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const buildPreviewSeries = (expectedYield: number) => {
    if (!Number.isFinite(expectedYield) || expectedYield <= 0) {
      return [] as YieldDataPoint[];
    }

    const start = new Date();
    const points: YieldDataPoint[] = [];

    for (let index = 0; index < 6; index += 1) {
      const date = new Date(start);
      date.setMonth(start.getMonth() + index);
      const label = date.toLocaleDateString("en-US", { month: "short" });
      const variation = Math.sin(index / 2) * 0.05;
      const value = Number((expectedYield * (1 + variation)).toFixed(2));

      points.push({ month: label, value });
    }

    return points;
  };

  const displaySeries =
    yieldHistory && yieldHistory.length > 0
      ? yieldHistory
      : yieldPreview
        ? buildPreviewSeries(yieldPreview.expectedYield)
        : [];

  const resolvedRevenue = revenueValue ?? formatRevenuePhp(yieldPreview?.estimatedRevenuePhp);
  const resolvedIncrease = percentageIncrease ?? "Market data pending";

  useEffect(() => {
    setMounted(true);
  }, []);
  const gradientId = "yieldGradient";

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

  if (displaySeries.length === 0) {
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
      </div>

      {yieldPreview && (
        <div className="mb-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#E3EBDC] bg-[#F7FAF2] p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7B8776]">
              Expected Yield
            </p>
            <p className="mt-2 text-2xl font-bold text-[#171D14]">
              {yieldPreview.expectedYield.toFixed(2)}
              <span className="ml-2 text-xs font-semibold text-[#7B8776]">
                {yieldPreview.unit}
              </span>
            </p>
          </div>
          <div className="rounded-2xl border border-[#E3EBDC] bg-[#F7FAF2] p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7B8776]">
              Estimated Revenue
            </p>
            <p className="mt-2 text-2xl font-bold text-[#00450D]">
              {resolvedRevenue}
            </p>
          </div>
          <div className="rounded-2xl border border-[#E3EBDC] bg-[#F7FAF2] p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7B8776]">
              Market Shift
            </p>
            <p className="mt-2 text-lg font-semibold text-[#171D14]">
              {resolvedIncrease}
            </p>
          </div>
        </div>
      )}

      <div className="w-full h-[300px] sm:h-[350px] min-h-[300px]">
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={displaySeries}>
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
