"use client";

import { MoveUp, MoveDown, Store } from "lucide-react";

import type {
  MarketSnapshot,
  MarketSourceInfo,
} from "@/lib/marketTypes";

interface MarketPrice {
  label: string;
  price: string;
  change: string;
  changeColor: string;
  isPositive: boolean;
}

interface MarketPriceTrendsCardProps {
  prices: MarketPrice[];
  marketSnapshot?: MarketSnapshot | null;
  marketSource?: MarketSourceInfo | null;
}

function getSourceLabel(source: MarketSourceInfo | null | undefined) {
  if (!source) {
    return "Market feed unavailable";
  }

  const providerLabel = source.provider === "openai" ? "OpenAI fallback" : "Anomura.today";

  return source.date ? `${providerLabel} • ${source.date}` : providerLabel;
}

export default function MarketPriceTrendsCard({
  prices,
  marketSnapshot,
  marketSource,
}: MarketPriceTrendsCardProps) {
  const resolvedVariants = marketSnapshot?.variants ?? [];

  return (
    <div className="market-trends-card bg-[#FDCDBC] rounded-4xl p-6 flex flex-col min-h-0 h-full w-full shadow-md overflow-y-auto">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <span className="font-semibold text-[#7A5649] text-xs tracking-wider uppercase">
            Market Price Trends
          </span>
          <p className="font-normal text-[#7A5649]/60 text-[10px] leading-[12.5px]">
            {getSourceLabel(marketSource)}
          </p>
        </div>
        <Store className="w-6 h-6 text-[#7A5649] shrink-0" />
      </div>
      <div className="flex flex-col gap-3">
        {prices.length === 0 ? (
          <p className="text-sm font-semibold text-[#7A5649]/70">Market pricing will appear once a forecast is available.</p>
        ) : (
          prices.map((item) => (
            <div key={item.label} className="flex flex-col border-b border-[#7A5649]/10 pb-2 last:border-b-0 last:pb-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#7A5649]/80">{item.label}</span>
                <span className="font-bold text-[#7A5649] text-lg">{item.price}</span>
              </div>
              <div className="flex items-center gap-1 mt-1">
                {item.isPositive ? (
                  <MoveUp className="w-4 h-4 text-[#00450D]" />
                ) : (
                  <MoveDown className="w-4 h-4 text-[#AA5649]" />
                )}
                <span className={`font-semibold text-xs ${item.changeColor}`}>{item.change}</span>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="mt-3 flex flex-col gap-2">
        {resolvedVariants.length > 0 ? (
          resolvedVariants.map((variant, index) => (
            <div
              key={`${variant.commodityName}-${variant.score}-${variant.date ?? "no-date"}-${index}`}
              className="rounded-2xl bg-white/65 px-3 py-2 text-[#7A5649] shadow-sm"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-[11px] font-semibold leading-tight">
                  {variant.commodityName}
                </span>
                <span className="text-xs font-bold whitespace-nowrap">
                  PHP {variant.price.toFixed(2)}
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between gap-3 text-[10px] font-medium text-[#7A5649]/70">
                <span>{variant.category ?? "Uncategorized"}</span>
                <span>{variant.date ?? "No date"}</span>
              </div>
            </div>
          ))
        ) : null}
      </div>
      <style jsx>{`
        .market-trends-card {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .market-trends-card::-webkit-scrollbar {
          width: 0;
          height: 0;
          display: none;
        }
      `}</style>
    </div>
  );
}