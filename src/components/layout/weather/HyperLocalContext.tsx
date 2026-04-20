"use client";

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
      <div className="relative w-full h-[400px] rounded-[48px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-800 to-green-600">
          {data.satelliteImage ? (
            <img src={data.satelliteImage} alt="Farm satellite view" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center" />
          )}
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-[#00450D]/80 to-transparent" />

        <div className="absolute bottom-12 left-12 right-12">
          <div className="max-w-md p-8 bg-white/70 backdrop-blur-md rounded-[48px]">
            <div className="flex items-center gap-3 mb-4">
              <img
                src="/weather/map.svg"
                alt="location"
                width={18}
                height={18}
              />
              <h4 className="font-bold text-lg text-[#171D14]">Hyper-Local Context</h4>
            </div>

            <p className="text-sm text-[#171d14] mb-6 leading-relaxed">{data.description}</p>

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