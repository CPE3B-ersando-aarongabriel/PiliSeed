"use client";
import {Map} from "lucide-react";
interface AddFarmFormProps {
  farmName: string;
  locationCoords: string;
  onFarmNameChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onSubmit: () => void;
}

export default function AddFarmForm({
  farmName,
  locationCoords,
  onFarmNameChange,
  onLocationChange,
  onSubmit,
}: AddFarmFormProps) {
  return (
    <div className="flex w-full flex-col items-start pt-0 pb-4 px-0 relative flex-1 grow">
      <div className="flex flex-col items-start gap-4 relative self-stretch w-full flex-[0_0_auto]">
        <div className="flex flex-col items-end gap-2 relative self-stretch w-full flex-[0_0_auto]">
          <div className="flex w-full flex-col items-start relative flex-[0_0_auto]">
            <label className="relative flex items-center mt-[-1.00px] [font-family:'Inter-SemiBold',Helvetica] font-semibold text-[#41493E] text-[10px] tracking-[1.00px] leading-[15px] whitespace-nowrap">
              FARM NAME
            </label>
          </div>

          <div className="flex items-start justify-center px-4 sm:px-6 py-4 sm:py-[18px] relative self-stretch w-full flex-[0_0_auto] bg-white rounded-md overflow-hidden">
            <div className="flex flex-col items-start relative flex-1 grow">
              <input
                className="relative flex items-center self-stretch mt-[-1.00px] [font-family:'Inter-Regular',Helvetica] font-normal text-gray-500 text-sm sm:text-base tracking-[0] leading-[normal] w-full border-none outline-none bg-transparent p-0"
                placeholder="e.g. Sunny Brook Orchards"
                type="text"
                value={farmName}
                onChange={(e) => onFarmNameChange(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 relative self-stretch w-full flex-[0_0_auto]">
          <div className="flex w-full flex-col items-start relative flex-[0_0_auto]">
            <label className="relative flex items-center mt-[-1.00px] [font-family:'Inter-SemiBold',Helvetica] font-semibold text-[#41493E] text-[10px] tracking-[1.00px] leading-[15px] whitespace-nowrap">
              LOCATION
            </label>
          </div>

          <div className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]">
            <div className="flex items-start justify-center pl-4 sm:pl-6 pr-10 sm:pr-12 py-4 sm:py-[18px] relative self-stretch w-full flex-[0_0_auto] bg-white rounded-md overflow-hidden">
              <input
                className="relative grow border-[none] [background:none] self-stretch mt-[-1.00px] [font-family:'Inter-Regular',Helvetica] font-normal text-gray-500 text-sm sm:text-base tracking-[0] leading-[normal] p-0 outline-none w-full"
                placeholder="City, region, or coordinates"
                type="text"
                value={locationCoords}
                onChange={(e) => onLocationChange(e.target.value)}
              />
            </div>

            <div className="inline-flex flex-col items-start absolute top-1/2 right-3 sm:right-4 -translate-y-1/2">
              <Map className="relative w-[18px] h-[18px] text-[#00450D]"/>
            </div>
          </div>
        </div>

        <button
          onClick={onSubmit}
          className="all-[unset] box-border flex items-center justify-center px-0 py-4 relative self-stretch w-full flex-[0_0_auto] bg-[#00450D] rounded-full cursor-pointer hover:bg-[#005610] transition-colors"
        >
          <div className="absolute w-full h-full top-0 left-0 bg-[#FFFFFF01] rounded-full shadow-[0px_4px_6px_-4px_#00450D33,0px_10px_15px_-3px_#00450D33]" />
          <div className="relative flex items-center justify-center w-[74.61px] h-6 mt-[-1.00px] [font-family:'Inter-SemiBold',Helvetica] font-semibold text-white text-base text-center tracking-[0] leading-6 whitespace-nowrap">
            Add Farm
          </div>
        </button>
      </div>
    </div>
  );
}
