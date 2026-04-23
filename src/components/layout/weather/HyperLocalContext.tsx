"use client";

import { Map } from "lucide-react";
import Image from "next/image";

interface FarmContext {
  slopeAspect: string;
  soilRetention: string;
  description: string;
  satelliteImage?: string;
}

interface HyperLocalContextProps {
  data: FarmContext;
}

export default function HyperLocalContext({ data }: HyperLocalContextProps) {
  return (
    <div className="col-span-12">
      <div className="relative w-full h-[360px] sm:h-[400px] rounded-[24px] sm:rounded-[36px] lg:rounded-[48px] overflow-hidden">
        <Image
          src="/Satellite.png"
          alt="Farm landscape background"
          fill
          priority
          className="object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#00450D]/80 to-transparent" />

        <div className="absolute bottom-4 sm:bottom-8 lg:bottom-12 left-4 sm:left-8 lg:left-12 right-4 sm:right-8 lg:right-12">
          <div className="max-w-md p-4 sm:p-6 lg:p-8 bg-white/70 backdrop-blur-md rounded-[20px] sm:rounded-[32px] lg:rounded-[48px]">
            <div className="flex items-center gap-3 mb-4">
              <Map className="w-[20px] h-[20px] text-[#00450D]"/>
              <h4 className="font-bold text-lg text-[#171D14]">Hyper-Local Context</h4>
            </div>

            <p className="text-xs sm:text-sm text-[#171d14] mb-4 sm:mb-6 leading-relaxed line-clamp-4 sm:line-clamp-none">{data.description}</p>

            <div className="flex gap-4">
              <div className="flex-1">
                <span className="text-[10px] font-semibold text-[#171D14] opacity-60">SLOPE ASPECT</span>
                <p className="text-xs font-semibold text-[#171D14]">{data.slopeAspect}</p>
              </div>
              <div className="flex-1">
                <span className="text-[10px] font-semibold text-[#171D14] opacity-60">SOIL RETENTION</span>
                <p className="text-xs font-semibold text-[#171D14]">{data.soilRetention}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}