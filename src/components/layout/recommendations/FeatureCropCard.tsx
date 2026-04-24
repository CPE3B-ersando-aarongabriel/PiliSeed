"use client";

import Image from "next/image";

interface FeaturedCropCardProps {
  cropName: string;
  description: string;
  match: string;
  imageUrl?: string;
}

export default function FeaturedCropCard({
  cropName,
  description,
  match,
  imageUrl,
}: FeaturedCropCardProps) {
  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow h-full flex flex-col transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl">
 
      <div className="relative h-[150px]">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={cropName}
            fill
            className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#00450D] to-[#008822]" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
      
        <div className="absolute top-3 left-3 bg-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg">
          <span className="text-xl font-extrabold text-[#00450D]">
            {match}
          </span>
          <span className="text-xs text-[#41493E] font-semibold leading-tight">
            MATCH
            <br />
            SCORE
          </span>
        </div>

        <div className="absolute bottom-3 left-4 right-4 text-white">
          <h2 className="text-xl font-bold leading-tight">{cropName}</h2>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <p className="text-xs font-semibold text-[#41493E] mb-2 tracking-wider">
          WHY IT FITS
        </p>
        <p className="text-[#171D14] leading-relaxed text-sm text-left">
          {description}
        </p>
      </div>
    </div>
  );
}
