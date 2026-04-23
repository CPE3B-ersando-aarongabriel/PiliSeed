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
    <div className="bg-[#00450D] rounded-3xl sm:rounded-[48px] p-5 sm:p-6 md:p-8 relative overflow-hidden flex flex-col min-h-[220px] sm:min-h-[250px] md:min-h-[275px]">
      <div className="absolute -top-10 -right-10 w-28 h-28 sm:w-36 sm:h-36 md:w-40 bg-white/10 rounded-full blur-2xl sm:blur-[32px]" />

      <div className="relative z-10 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <span className="font-semibold text-white/80 text-[10px] sm:text-xs tracking-wider">
            ESTIMATED REVENUE
          </span>
          <Banknote className="w-5 h-5 sm:w-6 sm:h-6 md:w-[25px] md:h-[25px] text-[#FFFFFF]"/>
        </div>

        <div className="font-extrabold text-white text-2xl sm:text-3xl md:text-5xl tracking-tight sm:tracking-[-2px] mb-3 sm:mb-4 break-words">
          {revenue}
        </div>

        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-[#FFFFFF] shrink-0"/>
          <p className="text-white text-xs sm:text-sm md:text-base leading-tight">
            {percentageIncrease} increase from last season
          </p>
        </div>

        <div className="mt-auto">
          <div className="w-full h-1 bg-white/20 rounded-full mb-2">
            <div
              className="h-full bg-[#86D881] rounded-full transition-all duration-500"
              style={{ width: progressWidth }}
            />
          </div>
          <p className="text-white/70 text-[9px] sm:text-[10px] md:text-x">
            Projected based on Q3 market indicators
          </p>
        </div>
      </div>
    </div>
  );
}
