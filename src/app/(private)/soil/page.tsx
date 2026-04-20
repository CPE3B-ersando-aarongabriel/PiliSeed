"use client";

import { useState } from "react";
import QuickNavigation from "@/components/layout/QuickNavigation";
import SoilInputForm from "@/components/layout/soil/SoilInputForm";

const metrics = [
  {
    iconSrc: "/soil/moisture.svg",
    iconAlt: "Moisture icon",
    iconBg: "bg-[#00450d1a]",
    iconWidth: "w-[13.33px]",
    iconHeight: "h-[16.67px]",
    title: "Moisture Balance",
    description:
      "Proper hydration prevents root rot while ensuring nutrient transport from soil to stalk.",
  },
  {
    iconSrc: "/soil/ph.svg",
    iconAlt: "pH icon",
    iconBg: "bg-[#fdcdbc4c]",
    iconWidth: "w-[16.71px]",
    iconHeight: "h-[16.71px]",
    title: "pH Equilibrium",
    description:
      "Solubility of nutrients is directly linked to pH. Most cereal crops thrive between 6.0 and 7.5.",
  },
  {
    iconSrc: "/soil/npk.svg",
    iconAlt: "NPK icon",
    iconBg: "bg-[#cee5ff]",
    iconWidth: "w-[15.83px]",
    iconHeight: "h-[17.92px]",
    title: "NPK Vitality",
    description:
      "Nitrogen for foliage, Phosphorus for roots and fruit, and Potassium for overall plant health.",
  },
];

const farmOptions = ["Emerald Ridge Farm", "Emerald Valley", "Highland Ridge"];

export default function SoilData() {
  const [selectedFarm, setSelectedFarm] = useState("Emerald Ridge Farm");
  const [isFarmDropdownOpen, setIsFarmDropdownOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#EFF6E7]">
      <div className="px-6 mt-8">
        <div className="flex items-start justify-between mb-2">
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold text-gray-900">
              Input Soil Data
            </h1>
            <p className="text-gray-600 text-base max-w-2xl">
              Capture the precise biological composition of your soil to unlock
              AI-driven crop optimization and yield forecasting.
            </p>
          </div>

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
        </div>
      </div>

      <div className="flex gap-6 p-6">
        <div className="flex-1">
          <SoilInputForm />
        </div>

        <div className="w-[380px] flex flex-col gap-8">
          <div className="rounded-[48px] overflow-hidden shadow-[0px_25px_50px_-12px_#00000040]">
            <div className="h-[194px] bg-[url(/soil/soildatabg.png)] bg-cover bg-center" />
            <div className="p-6 bg-gradient-to-t from-black/60 to-transparent -mt-16 relative">
              <p className="font-medium text-white text-xs leading-4">
                "The foundation of every great harvest is the
                <br />
                invisible life within the earth."
              </p>
            </div>
          </div>

          <div className="p-8 bg-[#e3ebdc] rounded-[48px]">
            <h2 className="font-bold text-[#171d14] text-xl mb-6">
              Why these metrics matter
            </h2>
            <div className="flex flex-col gap-6">
              {metrics.map((metric, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div
                    className={`flex w-10 h-10 items-center justify-center ${metric.iconBg} rounded-full`}
                  >
                    <img
                      className={`${metric.iconWidth} ${metric.iconHeight}`}
                      alt={metric.iconAlt}
                      src={metric.iconSrc}
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-[#171d14] text-sm mb-1">
                      {metric.title}
                    </h3>
                    <p className="font-normal text-[#41493e] text-xs leading-[19.5px]">
                      {metric.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-12 pb-8">
        <QuickNavigation currentPage="soil-data" />
      </div>
    </div>
  );
}
