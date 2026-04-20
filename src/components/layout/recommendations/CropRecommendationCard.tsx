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
    <div className="bg-white rounded-2xl shadow overflow-hidden h-full flex flex-col">
      <div className="relative h-[120px]">
        {imageUrl ? (
          <Image src={imageUrl} alt={cropName} fill className="object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#00450D] to-[#008822] flex items-center justify-center">
            <span className="text-white text-3xl"></span>
          </div>
        )}

        {match && (
          <div className="absolute top-3 right-3 bg-white w-10 h-10 rounded-full flex items-center justify-center text-xs font-semibold text-[#00450D]">
            {match}
          </div>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-semibold text-sm mb-1">{cropName}</h3>
        <p className="text-s text-[#41493E] mb-2">{description}</p>
      </div>
    </div>
  );
}
