"use client";

import {MoveUp, MoveDown, Store} from "lucide-react";

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
    <div className="bg-[#FDCDBC] rounded-[48px] p-8 relative h-[275px] flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <span className="font-semibold text-[#795548] text-xs tracking-[1.20px]">
          MARKET PRICE TRENDS
        </span>
        <Store className="w-[25px] h-[25px] text-[#7A5649]" />
      </div>

      <div className="flex-1 flex flex-col gap-4">
        {prices.length === 0 ? (
          <p className="text-sm font-semibold text-[#795548]/70">
            Market pricing will appear once a forecast is available.
          </p>
        ) : (
          prices.map((item) => (
            <div key={item.label} className="border-b border-[#795548]/10 pb-2">
              <div className="text-xs font-semibold text-[#795548]/60 mb-1">
                {item.label}
              </div>
              <div className="flex items-end justify-between">
                <span className="font-bold text-[#795548] text-xl">
                  {item.price}
                </span>
                <div className="flex items-center gap-1">
                  {item.isPositive ? (
                    <MoveUp className="w-4 h-4 text-[#00450D]" />
                  ) : (
                    <MoveDown className="w-4 h-4 text-[#AA5649]" />
                  )}
                  <span className={`font-semibold text-xs ${item.changeColor}`}>
                    {item.change}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <p className="font-normal text-[#795548]/50 text-[10px] leading-[12.5px] mt-4">
        Real-time global trade data provided by
        <br />
        AgriData Hub.
      </p>
    </div>
  );
}