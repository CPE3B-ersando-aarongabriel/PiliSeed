"use client";

import { MoveUp, MoveDown, Store } from "lucide-react";

interface MarketPrice {
  label: string;
  price: string;
  change: string;
  changeColor: string;
  isPositive: boolean;
}

interface MarketPriceTrendsCardProps {
  prices: MarketPrice[];
}

export default function MarketPriceTrendsCard({ prices }: MarketPriceTrendsCardProps) {
  return (
    <div className="bg-[#FDCDBC] rounded-[32px] p-6 flex flex-col min-h-[200px] w-full shadow-md">
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold text-[#7A5649] text-xs tracking-wider uppercase">Market Price Trends</span>
        <Store className="w-6 h-6 text-[#7A5649]" />
      </div>
      <div className="flex-1 flex flex-col gap-3 mt-2">
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
      <div className="mt-3">
        <p className="font-normal text-[#7A5649]/60 text-[10px] leading-[12.5px]">Real-time global trade data provided by AgriData Hub.</p>
      </div>
    </div>
  );
}