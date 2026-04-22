"use client";

import { ChevronDown, RefreshCw } from "lucide-react";

type FarmOption = {
  id: string;
  name: string;
  isActive: boolean;
};

interface YieldHeaderProps {
  selectedFarmId: string;
  selectedFarmName: string;
  onFarmChange: (farmId: string) => void;
  onRunAnalysis: () => void;
  isLoading: boolean;
  isFarmDropdownOpen: boolean;
  setIsFarmDropdownOpen: (open: boolean) => void;
  farmOptions: FarmOption[];
}

export default function YieldHeader({
  selectedFarmId,
  selectedFarmName,
  onFarmChange,
  onRunAnalysis,
  isLoading,
  isFarmDropdownOpen,
  setIsFarmDropdownOpen,
  farmOptions,
}: YieldHeaderProps) {
  const isDisabled = isLoading || farmOptions.length === 0;
  const isAnalysisDisabled = isLoading || !selectedFarmId;

  return (
    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mt-2 mb-6 lg:mb-8">
      <div>
        <h1 className="font-extrabold text-2xl sm:text-3xl lg:text-4xl text-[#171D14] tracking-tight">
          Yield Prediction
        </h1>
        <p className="mt-2 sm:mt-3 text-sm sm:text-base text-[#41493E] leading-relaxed max-w-2xl">
          AI-driven harvest forecasting for <span className="text-[#00450D] font-semibold">{selectedFarmName}</span>.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-3 w-full lg:w-auto">
      
        <div className="flex flex-col w-full sm:w-auto">
          <label className="text-[10px] font-semibold text-[#41493E] tracking-widest mb-1.5">
            SELECTED FARM
          </label>
          <div className="relative w-full sm:w-[200px]">
            <button
              onClick={() => setIsFarmDropdownOpen(!isFarmDropdownOpen)}
              disabled={isDisabled}
              className="w-[200px] h-[42px] bg-[#E3eBDC] rounded-full shadow-sm flex items-center justify-between px-5 hover:bg-[#D5E0CC] transition-colors"
            >
              <span className="font-semibold text-[#00450D] text-sm">
                {selectedFarmName}
              </span>
              <ChevronDown className="w-5 h-5 text-[#6B7280]" />
            </button>

            {isFarmDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsFarmDropdownOpen(false)} />
                <div className="absolute left-0 mt-2 w-[220px] bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">
                  {farmOptions.map((farm) => (
                    <button
                      key={farm.id}
                      onClick={() => {
                        onFarmChange(farm.id);
                        setIsFarmDropdownOpen(false);
                      }}
                      className={`w-full text-left px-5 py-2.5 text-sm hover:bg-[#E3EBDC] transition ${
                        farm.id === selectedFarmId ? 'text-[#00450D] font-medium bg-[#EEF3EA]' : 'text-[#171D14]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="truncate">{farm.name}</span>
                        {farm.isActive && (
                          <span className="rounded-full bg-[#00450D]/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.18em] text-[#00450D]">
                            Active
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <button
          onClick={onRunAnalysis}
          disabled={isAnalysisDisabled}
          className="flex items-center justify-center gap-2 w-[165px] h-[42px] bg-[#00450D] text-white rounded-full hover:bg-[#00380A] transition-colors disabled:opacity-50 whitespace-nowrap"
        >
          <RefreshCw className={`w-4 h-4 text-[#FFFFFF] ${isLoading ? 'animate-spin' : ''}`} />
          <span className="font-semibold text-sm">Run New Analysis</span>
        </button>
      </div>
    </div>
  );
}