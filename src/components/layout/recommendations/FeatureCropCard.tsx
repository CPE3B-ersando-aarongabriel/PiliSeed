"use client";

import { Calendar, Droplet, Thermometer } from "lucide-react";
import Image from "next/image";

interface FeaturedCropCardProps {
  cropName: string;
  description: string;
  match: string;
  imageUrl?: string;
  moistureNeed?: string;
  tempRange?: string;
}

export default function FeaturedCropCard({
  cropName,
  description,
  match,
  imageUrl,
  moistureNeed,
  tempRange,
}: FeaturedCropCardProps) {
  const hasSupplementaryInfo = Boolean(moistureNeed || tempRange);

  return (
    <div className="md:col-span-2 bg-white rounded-4xl overflow-hidden shadow">
 
      <div className="relative h-[320px]">
        {imageUrl ? (
          <Image src={imageUrl} alt={cropName} fill className="object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#00450D] to-[#008822] flex items-center justify-center" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
      
        <div className="absolute top-5 left-5 bg-white px-6 py-3 rounded-xl flex items-center gap-3 shadow-lg">
          <span className="text-2xl font-extrabold text-[#00450D]">
            {match}
          </span>
          <span className="text-xs text-[#41493E] font-semibold leading-tight">
            MATCH
            <br />
            SCORE
          </span>
        </div>

        <div className="absolute bottom-5 left-5 text-white">
          <h2 className="text-3xl font-bold mb-2">{cropName}</h2>
        </div>
      </div>

      <div
        className={`p-6 grid gap-6 ${hasSupplementaryInfo ? "md:grid-cols-2" : "grid-cols-1"}`}
      >
     
        <div>
          <p className="text-xs font-semibold text-[#41493E] mb-2 tracking-wider">
            WHY IT FITS
          </p>
          <p className="text-[#171D14] leading-relaxed text-sm text-left">
            {description}
          </p>
        </div>

        {(moistureNeed || tempRange) && (
          <div className="flex gap-4">
            {moistureNeed && (
              <div className="flex-1 bg-[#EEF3EA] rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-4 h-4 flex items-center justify-center">
                    <Droplet className="w-4 h-4 text-[#41493E]"/>
                  </div>
                  <p className="text-xs text-[#41493E] font-semibold">
                    MOISTURE NEED
                  </p>
                </div>
                <p className="font-semibold text-[#00450D] text-2xl">
                  {moistureNeed}
                </p>
              </div>
            )}

            {tempRange && (
              <div className="flex-1 bg-[#EEF3EA] rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-4 h-4 flex items-center justify-center">
                    <Thermometer className="w-4 h-4 text-[#7A5649]"/>
                  </div>
                  <p className="text-xs text-[#41493E] font-semibold">TEMP RANGE</p>
                </div>
                <p className="font-semibold text-[#00450D] text-2xl">{tempRange}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
