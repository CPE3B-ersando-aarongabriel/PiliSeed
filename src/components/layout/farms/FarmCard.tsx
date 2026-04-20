"use client";
import FarmToggle from "@/components/layout/farms/FarmToggle";

interface FarmCardProps {
  id: string;
  name: string;
  location: string | null;
  isActive: boolean;
  locationIcon: string;
  bgColor: string;
  onToggle: (id: string) => void;
}

export default function FarmCard({
  id,
  name,
  location,
  isActive,
  locationIcon,
  bgColor,
  onToggle,
}: FarmCardProps) {
  return (
    <div className="relative row-[1_/_2] w-[277.33px] h-[498px] bg-white rounded-[48px] overflow-hidden shadow-[0px_1px_2px_#0000000d] border border-gray-200">
      <div
        className="flex flex-col w-full h-48 items-start justify-center absolute top-0 left-0 overflow-hidden"
        style={{ backgroundColor: bgColor }}
      >
        <div className="relative flex-1 self-stretch w-full grow bg-[linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] opacity-30" />
        <div className="absolute w-full h-full top-0 left-0 bg-[linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,0)_50%,rgba(255,255,255,0)_100%)]" />

        {isActive && (
          <div className="inline-flex flex-col items-start px-4 py-1.5 absolute top-4 right-4 bg-[#00450D] rounded-full">
            <div className="flex items-center text-white text-xs font-semibold tracking-[1.2px]">
              ACTIVE
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col w-full items-start justify-around p-8 absolute top-48 left-0">
        <div className="flex flex-col items-start pt-0 pb-4 px-0 relative self-stretch w-full">
          <div className="inline-flex flex-col items-start gap-1">
            <div className="text-[#171D14] text-2xl font-bold leading-8 whitespace-pre-line">
              {name}
            </div>

            <div className="flex items-center gap-2">
              <img
                src="/farms/location.svg"
                alt="location icon"
                className="w-3.5 h-3.5 shrink-0"
              />

              <span className="text-[#41493E] text-sm font-normal leading-5">
                {location ?? "Location pending"}
              </span>
            </div>
          </div>

          <FarmToggle
            isActive={isActive}
            onToggle={() => onToggle(id)}
            farmName={name}
          />
        </div>
      </div>
    </div>
  );
}
