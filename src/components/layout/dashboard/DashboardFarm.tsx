import Link from "next/link";
import { MapPin,ArrowRight } from "lucide-react";
export interface FarmData {
  id: string;
  name: string;
  location: string | null;
  latitude?: number;
  longitude?: number;
  size?: number;
  sizeUnit?: string;
  isActive: boolean;
}

interface FarmCardProps {
  farm: FarmData;
}

export default function FarmCard({ farm }: FarmCardProps) {
  return (
    <div className="w-full h-full bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-md border border-[#41493E]/10 flex flex-col">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <div className="rounded-2xl bg-[#FDCDBC] p-2">
            <MapPin className="w-8 h-8 sm:w-10 sm:h-9 text-[#795548]"/>
          </div>
          <h2 className="min-w-0 flex-1 truncate text-lg sm:text-xl font-bold text-[#171D14]">
            {farm.name}
          </h2>
        </div>

        {farm.isActive && (
          <div className="shrink-0 rounded-full bg-[#00450D]/15 px-3 py-1">
            <p className="text-xs font-semibold text-[#00450D]">
              CURRENTLY VIEWING
            </p>
          </div>
        )}
      </div>

      <div className="space-y-3 mb-6">
        <div>
          <span className="text-[12px] font-bold text-[#41493E]/60">LOCATION</span>
          <p className="font-semibold text-[#171D14] text-sm sm:text-base">{farm.location || "--"}</p>
        </div>
        <div>
          <span className="text-[12px] font-bold text-[#41493E]/60">SIZE</span>
          <p className="font-semibold text-[#171D14] text-sm sm:text-base">
            {farm.size !== undefined && farm.sizeUnit
              ? `${farm.size} ${farm.sizeUnit}`
              : "--"}
          </p>
        </div>
      </div>

      <div className="flex-1"></div>

      <Link
        href="/farms"
        className="text-[#00450D] text-sm font-semibold hover:text-[#003d0b] transition"
      >
        Go to Farm Management
        <ArrowRight className="w-5 h-5 ml-2 inline text-[#41493E]"/>
      </Link>
    </div>
  );
}
