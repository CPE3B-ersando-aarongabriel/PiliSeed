"use client";

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

interface DashboardHeaderProps {
  farmerName: string;
  activeFarm: FarmData;
  onMenuClick?: () => void;
}

export default function DashboardHeader({
  farmerName,
  activeFarm,
  onMenuClick,
}: DashboardHeaderProps) {
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      {/* Top row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
        {/* Left side - Menu + Welcome Text */}
        <div className="flex items-center gap-3">
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              className="lg:hidden bg-[#00450D] p-2 rounded-lg shadow flex-shrink-0"
            >
              <img
                src="/sidebar/menu.svg"
                alt="menu"
                className="w-5 h-5 invert"
              />
            </button>
          )}
          
          {/* Welcome Text - Grows on larger screens */}
          <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-extrabold text-[#00450D]">
            Welcome Back, {farmerName}
          </h1>
        </div>

        {/* Active Farm Badge */}
        <div className="border-2 border-[#41493E]/20 bg-[#E3EBDC] rounded-full px-3 sm:px-4 lg:px-5 py-1 flex items-center w-fit">
          <div className="w-8 h-8 sm:w-9 h-9 lg:w-10 lg:h-10 rounded-full bg-[#00450D] flex items-center justify-center -ml-2 mr-2">
            <img
              src="/dashboard/active-farm.svg"
              alt="active farm icon"
              className="w-4 h-4 sm:w-4 h-4 lg:w-5 lg:h-5"
            />
          </div>

          <div>
            <p className="text-[10px] sm:text-[11px] lg:text-[12px] font-bold text-[#41493E]/50">
              ACTIVE FARM
            </p>
            <p className="text-xs sm:text-[13px] lg:text-[14px] font-bold text-[#41493E]">
              {activeFarm.name}
            </p>
          </div>
        </div>
      </div>

      {/* Subtitle */}
      <p className="text-[#41493E] mt-3 sm:mt-4 text-sm sm:text-base lg:text-lg">
        Here's what's happening across your digital ecosystem today.
      </p>
    </div>
  );
}