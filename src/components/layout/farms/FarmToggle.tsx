"use client";

interface FarmToggleProps {
  isActive: boolean;
  onToggle: () => void;
  farmName: string;
}

export default function FarmToggle({
  isActive,
  onToggle,
  farmName,
}: FarmToggleProps) {
  return (
    <div className="absolute top-px right-0 flex items-center gap-2">
      <div className="inline-flex flex-col items-start relative flex-[0_0_auto]">
        <div className="relative flex items-center w-[56px] h-2 mt-[-25px] [font-family:'Inter-SemiBold',Helvetica] font-semibold text-[#41493E] text-xs tracking-[0] leading-4 whitespace-nowrap">
          ANALYZE
        </div>
      </div>

      <button
        className="flex-[0_0_auto] inline-flex items-center relative cursor-pointer"
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
    </div>
  );
}
