"use client";

import Image from "next/image";  // for pics of crops recommended
import { useState } from "react";
import QuickNavigation from "@/components/layout/QuickNavigation";
import FeaturedCropCard from "@/components/layout/recommendations/FeatureCropCard";
import CropRecommendationCard from "@/components/layout/recommendations/CropRecommendationCard";
import DiversificationCard from "@/components/layout/recommendations/Diversification";

interface CropRecommendation {
  id: string;
  cropName: string;
  description: string;
  imageUrl?: string;
  match?: string;
}

const mockCropRecommendations: CropRecommendation[] = [
  {
    id: "1",
    cropName: "Hard Red Winter Wheat",
    description:
      'Your soil analysis indicates a perfect PH balance (6.8) for wheat. Coupled with the forecasted low rainfall in May, the "Red Winter" variety will achieve maximum protein content with minimal risk of fungal issues found in wetter climates.',
    imageUrl: "/recommendations/hard-red-winter-wheat.png",
    match: "98%",
  },
  {
    id: "2",
    cropName: "Yellow Dent Corn",
    description:
      "Ideal for your Plot B topography. High nitrogen resilience makes it the perfect successor to last…",
    imageUrl: "/recommendations/yellow-dent-corn.png",
    match: "91%",
  },
  {
    id: "3",
    cropName: "Organic Soybeans",
    description:
      "Best for late-season planting. The humidity levels predicted for August align with this variety's flowering stage.",
    imageUrl: "/recommendations/soybean-crop.png",
    match: "88%",
  },
  {
    id: "4",
    cropName: "Diversification Strategy",
    description:
      "Our analysis suggests planting 15% of your southern acreage with **High-Oleic Sunflowers** to mitigate soil exhaustion risk and tap into rising market demand.",
    match: "+12.4%",
  },
  {
    id: "5",
    cropName: "Malting Barley",
    description:
      "Good secondary option. Requires slightly more irrigation than the current forecast provides, but offers high market stability.",
    imageUrl: "/recommendations/barley-crop.png",
    match: "74%",
  },
];

const farmOptions = ["Emerald Ridge Farm", "Emerald Valley", "Highland Ridge"];
const sortOptions = ["Suitability Score", "Alphabetical", "Recently Added"];

export default function CropRecommendations() {
  const [selectedFarm, setSelectedFarm] = useState("Emerald Ridge Farm");
  const [sortBy, setSortBy] = useState("Suitability Score");
  const [isFarmDropdownOpen, setIsFarmDropdownOpen] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);

  const featured = mockCropRecommendations[0];
  const others = mockCropRecommendations.slice(1);

  return (
    <div className="min-h-screen bg-[#EFF6E7]">
      <main className="max-w-[1200px] mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between gap-6 mb-10">
          <div className="max-w-2xl space-y-4">
            <h1 className="text-5xl font-extrabold text-[#171d14]">
              Personalized Crop <br /> Recommendations
            </h1>
            <p className="text-[#41493e] text-medium">
              AI-driven insights analyzing your soil's nitrogen levels, local
              micro-climate forecasts, and historical yield data to find your
              next harvest.
            </p>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex flex-col">
              <label className="text-[10px] font-semibold text-[#41493E] tracking-widest mb-1.5">
                SELECTED FARM
              </label>
              <div className="relative">
                <button
                  onClick={() => setIsFarmDropdownOpen(!isFarmDropdownOpen)}
                  className="w-[200px] h-10 bg-white rounded-full shadow-sm flex items-center justify-between px-5 border border-gray-200"
                >
                  <span className="font-semibold text-[#00450D] text-sm">
                    {selectedFarm}
                  </span>
                  <img
                    src="/soil/dropdown.svg"
                    alt="Dropdown"
                    className="w-3 h-2 object-contain"
                  />
                </button>
                {isFarmDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsFarmDropdownOpen(false)}
                    />
                    <div className="absolute left-0 mt-2 w-[180px] bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">
                      {farmOptions.map((farm) => (
                        <button
                          key={farm}
                          onClick={() => {
                            setSelectedFarm(farm);
                            setIsFarmDropdownOpen(false);
                          }}
                          className={`w-full text-left px-5 py-2.5 text-sm hover:bg-[#e3ebdc] transition ${
                            farm === selectedFarm
                              ? "text-[#00450d] font-medium bg-[#eef3ea]"
                              : "text-[#171d14]"
                          }`}
                        >
                          {farm}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-[10px] font-semibold text-[#41493E] tracking-widest mb-1.5">
                SORT BY
              </label>
              <div className="relative">
                <button
                  onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                  className="w-[170px] h-10 bg-white rounded-full shadow-sm flex items-center justify-between px-5 border border-gray-200"
                >
                  <span className="font-semibold text-[#00450D] text-sm">
                    {sortBy}
                  </span>
                  <img
                    src="/soil/dropdown.svg"
                    alt="Dropdown"
                    className="w-3 h-2"
                  />
                </button>
                {isSortDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsSortDropdownOpen(false)}
                    />
                    <div className="absolute left-0 mt-2 w-[170px] bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">
                      {sortOptions.map((option) => (
                        <button
                          key={option}
                          onClick={() => {
                            setSortBy(option);
                            setIsSortDropdownOpen(false);
                          }}
                          className={`w-full text-left px-5 py-2.5 text-sm hover:bg-[#e3ebdc] transition ${
                            option === sortBy
                              ? "text-[#00450D] font-medium bg-[#eef3ea]"
                              : "text-[#171d14]"
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <FeaturedCropCard
            cropName={featured.cropName}
            description={featured.description}
            match={featured.match || ""}
            imageUrl={featured.imageUrl}
            moistureNeed="Low (200mm)"
            tempRange="4°C - 24°C"
          />

          <CropRecommendationCard
            cropName={others[0].cropName}
            description={others[0].description}
            match={others[0].match}
            imageUrl={others[0].imageUrl}
          />

          {others.slice(1).map((crop) => {
            if (crop.id === "4") {
              return (
                <DiversificationCard
                  key={crop.id}
                  cropName={crop.cropName}
                  description={crop.description}
                  match={crop.match || ""}
                />
              );
            }
            return (
              <CropRecommendationCard
                key={crop.id}
                cropName={crop.cropName}
                description={crop.description}
                match={crop.match}
                imageUrl={crop.imageUrl}
              />
            );
          })}
        </div>
        <QuickNavigation currentPage="crop-recommendations" />
      </main>
    </div>
  );
}
