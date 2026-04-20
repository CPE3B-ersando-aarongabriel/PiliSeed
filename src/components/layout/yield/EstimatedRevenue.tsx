"use client";

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
          <img
            src="/yield/revenue.svg"
            width={22}
            height={22}
            alt="revenue"
          />
        </div>

        <div className="font-extrabold text-white text-5xl tracking-[-2.40px] mb-4">
          {revenue}
        </div>

        <div className="flex items-center gap-2 mb-6">
          <img src="/yield/graph.svg" width={20} height={20} alt="graph" />
          <p className="text-white">
            {percentageIncrease} increase from last season
          </p>
        </div>

        <div className="mt-auto">
          <div className="w-full h-1 bg-white/20 rounded-full mb-2">
            <div
              className="h-full bg-[#86D881] rounded-full"
              style={{ width: progressWidth }}
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
