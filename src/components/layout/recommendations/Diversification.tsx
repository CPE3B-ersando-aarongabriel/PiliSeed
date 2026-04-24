"use client";

import { Lightbulb, TrendingUp } from "lucide-react";
import Image from "next/image";

interface DiversificationCardProps {
  cropName: string;
  description: string;
  match: string;
}

export default function DiversificationCard({
  cropName,
  description,
  match,
}: DiversificationCardProps) {
  return (
    <div className="bg-[#FDCDBC] rounded-2xl shadow overflow-hidden h-full flex flex-col transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl">
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
            <Lightbulb className="w-5 h-5 text-[#795548]"/>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1 text-[#795548]">
              {cropName}
            </h3>
            <p className="text-s leading-relaxed text-[#795548]">
              {description}
            </p>
          </div>
        </div>

        <div className="mt-auto pt-4 border-t border-[#795548]/20">
          <div className="flex items-center gap-3 bg-white/50 rounded-2xl p-4">
            <div className="w-10 h-10 flex items-center justify-center flex-shrink-0 bg-white rounded-full">
              <TrendingUp className="w-5 h-5 text-[#7A5649]"/>
            </div>
            <div>
              <p className="text-xs text-[#795548]/70 mb-0.5 font-semibold tracking-wide">
                ESTIMATED ROI
              </p>
              <p className="text-3xl font-bold text-[#795548]">{match}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
