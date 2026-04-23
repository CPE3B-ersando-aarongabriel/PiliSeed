"use client";
import FarmToggle from "@/components/layout/farms/FarmToggle";
import { LucideIcon } from "lucide-react";

interface FarmCardProps {
  id: string;
  name: string;
  location: string | null;
  isActive: boolean;
  locationIcon: LucideIcon;
  bgColor: string;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function FarmCard({
  id,
  name,
  location,
  isActive,
  locationIcon,
  bgColor,
  onToggle,
  onDelete,
}: FarmCardProps) {
  const LocationIcon = locationIcon;
  const cardContainerClass = isActive
    ? "relative row-[1_/_2] w-full sm:w-[236px] sm:h-[236px] rounded-[20px] sm:rounded-[36px] overflow-hidden border bg-[#F8FCF5] shadow-[0px_12px_24px_-14px_#00450D66] flex flex-col"
    : "relative row-[1_/_2] w-full sm:w-[236px] sm:h-[236px] rounded-[20px] sm:rounded-[36px] overflow-hidden border bg-white shadow-[0px_1px_2px_#0000000d] flex flex-col";

  return (
    <div className={cardContainerClass} style={{ borderColor: bgColor }}>
      {isActive && (
        <div
          className="absolute left-0 top-0 bottom-0 z-20 w-1.5"
          style={{ backgroundColor: bgColor }}
        />
      )}

      <div
        className="flex flex-col w-full h-21 items-start justify-center overflow-visible flex-shrink-0 relative"
        style={{ backgroundColor: bgColor }}
      >
        <div className="relative flex-1 self-stretch w-full grow bg-[linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] opacity-30" />
        <div className="absolute w-full h-full top-0 left-0 bg-[linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,0)_50%,rgba(255,255,255,0)_100%)]" />
      </div>

      <div className="flex flex-col w-full items-start justify-between flex-1 p-3.5 min-h-0 gap-1.5">
        <div className="flex items-start justify-between gap-2 w-full min-h-0">
          <div className="flex min-w-0 flex-col gap-0.5">
            <div className="text-[#171D14] text-[15px] font-bold leading-5 break-words line-clamp-2">
              {name}
            </div>

            <div className="flex items-center gap-1.5 min-w-0">
              <LocationIcon className="w-3 h-3 shrink-0 text-[#41493E]" />

              <span className="text-[#41493E] text-xs font-normal leading-3 truncate">
                {location ?? "Location pending"}
              </span>
            </div>
          </div>

          <div className={`flex flex-shrink-0 items-center rounded-full px-2 py-0.5 text-[9px] font-semibold tracking-[0.8px] ${isActive ? "bg-[#00450D] text-white" : "invisible"}`}>
            ACTIVE
          </div>
        </div>

        <div className="w-full flex-shrink-0 h-6">
          <FarmToggle
            isActive={isActive}
            onToggle={() => onToggle(id)}
            farmName={name}
            onDelete={() => onDelete(id)}
          />
        </div>
      </div>
    </div>
  );
}
