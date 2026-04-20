"use client";
import { BadgeDollarSign, TrendingUp } from "lucide-react";

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
    <div className="bg-[#00450D] rounded-[48px] p-8 relative overflow-hidden h-[275px] flex flex-col">
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-[32px]" />

      <div className="relative z-10 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <span className="font-semibold text-white/80 text-xs tracking-[1.20px]">
            ESTIMATED REVENUE
          </span>
          <BadgeDollarSign className="w-[22px] h-[22px] text-white" strokeWidth={1.75} aria-hidden="true" />
        </div>

        <div className="font-extrabold text-white text-5xl tracking-[-2.40px] mb-4">
          {revenue}
        </div>

        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-5 h-5 text-[#86D881]" strokeWidth={1.75} aria-hidden="true" />
          <p className="text-white">
            {percentageIncrease} increase from last season
          </p>
        </div>

        <div className="mt-auto">
          <div className="w-full h-1 bg-white/20 rounded-full mb-2">
            <div
              className={`w-[${progressWidth}] h-full bg-[#86D881] rounded-full`}
            />
          </div>
          <p className="font-normal text-white/70 text-[10px]">
            Projected based on Q3 market indicators
          </p>
        </div>
      </div>
    </div>
  );
}
