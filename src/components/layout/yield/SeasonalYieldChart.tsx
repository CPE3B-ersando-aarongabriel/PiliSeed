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
  monthlyData: Array<{ month: string; wheat: number; corn: number }>;
  quarterlyData: Array<{ quarter: string; wheat: number; corn: number }>;
  legendItems: Array<{ color: string; label: string }>;
}

export default function SeasonalYieldChart({
  monthlyData,
  quarterlyData,
  legendItems,
}: SeasonalYieldChartProps) {
  const [activeTab, setActiveTab] = useState<"Monthly" | "Quarterly">("Monthly");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Normalize shape so X axis uses a consistent key (`label`) for both tabs
  // Also ensure a `month` property exists on each point (required by some typings)
  const chartData =
    activeTab === "Monthly"
      ? monthlyData.map((d) => ({ ...d, label: d.month, month: d.month, quarter: "" }))
      : quarterlyData.map((d) => ({ ...d, label: d.quarter, month: d.quarter, quarter: d.quarter }));
  const xAxisKey = "label";

  return (
    <div className="col-span-8 bg-white rounded-[48px] shadow-[0px_12px_40px_#171d140A] p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-bold text-[#171D14] text-2xl mb-1">
            Seasonal Yield Forecast
          </h2>
          <p className="font-normal text-[#41493E] text-sm">
            Comparative analysis: Winter Wheat vs. Corn (Hybrid-A)
          </p>
        </div>

   
        <div className="inline-flex items-center gap-2 p-1 bg-[#E9F0E1] rounded-full">
          <button
            onClick={() => setActiveTab("Monthly")}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
              activeTab === "Monthly"
                ? "bg-white text-[#00450D] shadow-sm"
                : "text-[#41493E]"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setActiveTab("Quarterly")}
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
              activeTab === "Quarterly"
                ? "bg-white text-[#00450D] shadow-sm"
                : "text-[#41493E]"
            }`}
          >
            Quarterly
          </button>
        </div>
      </div>


      <div className="h-[350px] bg-[#Eff6e74C] rounded-[32px] p-4" style={{ minWidth: 0, minHeight: 0 }}>
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <AreaChart
            data={chartData}
            margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#171D14" opacity={0.1} />
            <XAxis 
              dataKey={xAxisKey} 
              tick={{ fontSize: 10, fill: '#41493E', fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              tick={{ fontSize: 10, fill: '#41493E' }}
              axisLine={false}
              tickLine={false}
              domain={[0, 100]}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: 'none',
                borderRadius: '16px',
                boxShadow: '0 4px 6px -4px rgba(0,0,0,0.1)',
                fontSize: '12px',
                padding: '8px 12px'
              }}
            />
            <Area 
              type="monotone" 
              dataKey="wheat" 
              name="Winter Wheat"
              stroke="#00450D" 
              fill="#00450D" 
              fillOpacity={0.3}
              strokeWidth={2}
            />
            <Area 
              type="monotone" 
              dataKey="corn" 
              name="Hybrid Corn"
              stroke="#7A5649" 
              fill="#7A5649" 
              fillOpacity={0.2}
              strokeWidth={2}
              strokeDasharray="5 5"
            />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ width: "100%", height: "100%" }} />
        )}
      </div>

 
      <div className="flex items-center gap-6 mt-6">
        {legendItems.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <div className={`w-3 h-3 ${item.color} rounded-full`} />
            <span className="font-semibold text-[#171D14] text-xs">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}