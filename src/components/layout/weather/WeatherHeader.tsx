"use client";
import { ChevronDown, RefreshCw } from "lucide-react";

interface WeatherHeaderProps {
  selectedFarm: string;
  onFarmChange: (farm: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
  isFarmDropdownOpen: boolean;
  setIsFarmDropdownOpen: (open: boolean) => void;
  farmOptions: string[];
}

export default function WeatherHeader({
  selectedFarm,
  onFarmChange,
  onRefresh,
  isLoading,
  isFarmDropdownOpen,
  setIsFarmDropdownOpen,
  farmOptions,
}: WeatherHeaderProps) {
  return (
    <div className="flex items-start justify-between mt-2">
      <div>
        <h1 className="font-extrabold text-4xl text-[#00450D] tracking-tight">
          Weather Analysis
        </h1>
        <p className="mt-3 text-medium text-[#41493E] leading-relaxed max-w-2xl">
          Precision meteorological tracking for {selectedFarm} in the Central
          Highlands. Real-time atmospheric monitoring synced with soil moisture
          sensors.
        </p>
      </div>

      <div className="flex items-end gap-3">
    
        <div className="flex flex-col">
          <label className="text-[10px] font-semibold text-[#41493E] tracking-widest mb-1.5">
            SELECTED FARM
          </label>
          <div className="relative">
            <button
              onClick={() => setIsFarmDropdownOpen(!isFarmDropdownOpen)}
              className="w-[200px] h-[42px] bg-[#E3EBDC] rounded-full shadow-sm flex items-center justify-between px-5 hover:bg-[#D5E0CC] transition-colors"
            >
              <span className="font-semibold text-[#00450D] text-sm">
                {selectedFarm}
              </span>
              <ChevronDown className="w-4 h-4 text-[#00450D]" strokeWidth={2} aria-hidden="true" />
            </button>

            {isFarmDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsFarmDropdownOpen(false)}
                />
                <div className="absolute left-0 mt-2 w-[185px] bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">
                  {farmOptions.map((farm) => (
                    <button
                      key={farm}
                      onClick={() => {
                        onFarmChange(farm);
                        setIsFarmDropdownOpen(false);
                      }}
                      className={`w-full text-left px-5 py-2.5 text-sm hover:bg-[#E3EBDC] transition ${
                        farm === selectedFarm
                          ? "text-[#00450D] font-medium bg-[#EEF3EA]"
                          : "text-[#171D14]"
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

        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="flex items-center justify-center gap-2 w-[140px] h-[42px] bg-[#00450D] text-white rounded-full hover:bg-[#00380A] transition-colors disabled:opacity-50 whitespace-nowrap"
        >
          <RefreshCw className={`w-4 h-4 text-white ${isLoading ? "animate-spin" : ""}`} strokeWidth={2} aria-hidden="true" />
          <span className="font-semibold text-sm">Refresh Data</span>
        </button>
      </div>
    </div>
  );
}
