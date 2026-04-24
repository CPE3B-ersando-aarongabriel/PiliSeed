"use client";

import Image from "next/image";

interface CropRecommendationCardProps {
  cropName: string;
  description: string;
  match?: string;
  imageUrl?: string;
}

export default function CropRecommendationCard({
  cropName,
  description,
  match,
  imageUrl,
}: CropRecommendationCardProps) {
  return (
    <div className="group bg-white rounded-2xl shadow overflow-hidden h-full flex flex-col transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl">
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

        <div className="absolute bottom-3 left-4 right-4 text-white">
          <h3 className="text-xl font-bold leading-tight">{cropName}</h3>
        </div>

        {match && (
          <div className="absolute top-3 right-3 bg-white w-10 h-10 rounded-full flex items-center justify-center text-xs font-semibold text-[#00450D]">
            {match}
          </div>
        )}
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <p className="text-xs font-semibold text-[#41493E] mb-2 tracking-wider">
          WHY IT FITS
        </p>
        <p className="text-sm text-[#171D14] mb-2">{description}</p>
      </div>
    </div>
  );
}
