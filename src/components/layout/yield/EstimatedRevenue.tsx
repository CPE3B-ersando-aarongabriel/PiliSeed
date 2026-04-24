"use client";

import { Banknote, TrendingUp } from "lucide-react";

interface EstimatedRevenueCardProps {
  revenue: string;
  percentageIncrease: string;
  progressWidth: string;
}

export default function EstimatedRevenueCard({
  revenue,
  percentageIncrease,
  progressWidth,
}: EstimatedRevenueCardProps) {
  return (
    <div className="bg-[#00450D] rounded-3xl sm:rounded-[48px] p-4 sm:p-5 md:p-6 relative overflow-hidden flex flex-col min-h-[140px] sm:min-h-[170px] md:min-h-[190px]">
      <div className="absolute -top-10 -right-10 w-20 h-20 sm:w-28 sm:h-28 md:w-32 bg-white/10 rounded-full blur-2xl sm:blur-[32px]" />

      <div className="relative z-10 flex-1 flex flex-col min-w-0">
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <span className="font-semibold text-white/80 text-[10px] sm:text-xs tracking-wider">
            ESTIMATED REVENUE
          </span>
          <Banknote className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-[#FFFFFF]"/>
        </div>

        <div className="font-extrabold text-white tracking-tight mb-2 leading-tight w-full min-w-0 truncate text-[clamp(1rem,2.5vw,2rem)]">
          <span className="inline-block min-w-0 max-w-full">{revenue}</span>
        </div>

        <div className="flex items-center gap-1 mb-2">
          <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-[#FFFFFF] shrink-0"/>
          <p className="text-white leading-tight text-[clamp(0.625rem,2.2vw,0.95rem)] sm:text-sm md:text-base">
            {percentageIncrease} increase from last season
          </p>
        </div>
      </div>
    </div>
  );
}
