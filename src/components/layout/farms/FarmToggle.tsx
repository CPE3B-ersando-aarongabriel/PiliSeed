"use client";

import { Trash2 } from "lucide-react";

interface FarmToggleProps {
  isActive: boolean;
  onToggle: () => void;
  farmName: string;
  onDelete: () => void;
}

export default function FarmToggle({
  isActive,
  onToggle,
  farmName,
  onDelete,
}: FarmToggleProps) {
  return (
    <div className="flex items-center justify-between gap-2 w-full min-h-6">
      <div className="flex items-center">
        <span className="relative flex items-center [font-family:'Inter-SemiBold',Helvetica] font-semibold text-[#41493E] text-xs tracking-[0] leading-4 whitespace-nowrap">
          ANALYZE
        </span>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          className="flex-[0_0_auto] inline-flex items-center relative cursor-pointer flex-shrink-0"
          onClick={onToggle}
          aria-label={`Toggle analyze for ${farmName}`}
        >
          <div
            className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
              isActive ? "bg-[#00450D]" : "bg-[#DEE5D6]"
            }`}
          />
          <div
            className={`absolute top-0.5 w-5 h-5 bg-white rounded-full border border-solid transition-all duration-200 ${
              isActive ? "left-[22px] border-white" : "left-0.5 border-gray-300"
            }`}
          />
        </button>

        <button
          type="button"
          className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-[#D5DDD0] bg-white text-[#9C4A00] transition-colors hover:bg-[#F5EFE8]"
          onClick={onDelete}
          aria-label={`Delete farm ${farmName}`}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
