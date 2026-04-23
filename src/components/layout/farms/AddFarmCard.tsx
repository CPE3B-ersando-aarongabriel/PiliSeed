"use client";
import { useState } from "react";
import { Plus } from "lucide-react";
interface AddFarmCardProps {
  onAdd: (farmName: string, location: string) => void;
  currentFarmCount: number;
  maxFarms: number;
}

export default function AddFarmCard({
  onAdd,
  currentFarmCount,
  maxFarms,
}: AddFarmCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [farmName, setFarmName] = useState("");
  const [location, setLocation] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    setError("");

    if (!farmName.trim()) {
      setError("Please enter a farm name");
      return;
    }

    if (!location.trim()) {
      setError("Please enter a location");
      return;
    }

    if (currentFarmCount >= maxFarms) {
      setError(`Maximum ${maxFarms} farms allowed`);
      return;
    }

    onAdd(farmName, location);
    setFarmName("");
    setLocation("");
    setError("");
    setIsModalOpen(false);
  };

  const handleClose = () => {
    setFarmName("");
    setLocation("");
    setError("");
    setIsModalOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="relative w-full sm:w-[236px] sm:h-[236px] inline-flex flex-col items-center justify-center px-4 sm:px-5 py-4 bg-[#00450D] rounded-[20px] sm:rounded-[36px] overflow-hidden shadow-[0px_8px_10px_-6px_#0000001a,0px_20px_25px_-5px_#0000001a] cursor-pointer hover:bg-[#005610] transition-colors"
      >
        <div className="inline-flex pt-0 pb-3 px-0 relative flex-[0_0_auto] flex-col items-center">
          <div className="inline-flex flex-col items-center p-4 relative flex-[0_0_auto] bg-[#FFFFFF1a] rounded-full">
            <Plus className="h-5 w-5 text-[#FFFFFF]" />
          </div>
        </div>

        <div className="inline-flex items-center pt-1 pb-1.5 px-0 flex-col relative flex-[0_0_auto]">
          <div className="relative flex items-center justify-center h-6 mt-[-1.00px] [font-family:'Manrope-Bold',Helvetica] font-bold text-white text-base text-center tracking-[0] leading-6">
            Add Farm
          </div>
        </div>

        <div className="inline-flex flex-col max-w-[170px] items-center px-2 py-0 relative flex-[0_0_auto]">
          <div className="relative [font-family:'Inter-Regular',Helvetica] font-normal text-[#ffffffb2] text-xs text-center tracking-[0] leading-4">
            Expand your
            <br />
            digital greenhouse
          </div>
        </div>
      </button>

      {isModalOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={handleClose}
          />

          <div className="fixed top-1/2 left-1/2 z-50 w-[92vw] max-w-[450px] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-4 sm:p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-[#00450D]">
                Add New Farm
              </h2>
              <button
                onClick={handleClose}
                className="text-[#41493E]/50 hover:text-[#41493E] text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="mb-4">
              <label className="text-xs font-semibold text-[#41493E] block mb-1">
                FARM NAME
              </label>
              <input
                type="text"
                placeholder="e.g. Sunny Brook Orchards"
                className="w-full text-[#000000] px-4 py-3 border border-[#41493E]/20 rounded-xl outline-none focus:border-[#00450D] transition"
                value={farmName}
                onChange={(e) => setFarmName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
            </div>

            <div className="mb-6">
              <label className="text-xs font-semibold text-[#41493E] block mb-1">
                LOCATION
              </label>
              <input
                type="text"
                placeholder="City and state"
                className="w-full text-[#000000] px-4 py-3 border border-[#41493E]/20 rounded-xl outline-none focus:border-[#00450D] transition"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
            </div>

            {error && (
              <div className="mb-4 text-red-500 text-sm text-center">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-3 border border-[#41493E]/20 rounded-full text-[#41493E] font-semibold hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 px-4 py-3 bg-[#00450D] text-white rounded-full font-semibold hover:bg-[#005610] transition"
              >
                Add Farm
              </button>
            </div>

            <div className="mt-4 text-center text-xs text-[#41493E]/50">
              {currentFarmCount}/{maxFarms} farms used
            </div>
          </div>
        </>
      )}
    </>
  );
}
