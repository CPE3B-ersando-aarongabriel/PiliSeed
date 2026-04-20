"use client";
import { useState } from "react";

const soilTextures = [
  {
    id: "sandy",
    label: "Sandy",
    icon: "/soil/sandy.svg",
    hoverIcon: "/soil/sandy-hover.svg",
    iconClass: "w-4 h-4",
  },
  {
    id: "clay",
    label: "Clay",
    icon: "/soil/clay.svg",
    hoverIcon: "/soil/clay-hover.svg",
    iconClass: "w-[18px] h-[19.05px]",
  },
  {
    id: "loamy",
    label: "Loamy",
    icon: "/soil/loamy.svg",
    hoverIcon: "/soil/loamy-hover.svg",
    iconClass: "w-5 h-4",
  },
];

const npkFields = [
  { id: "nitrogen", label: "NITROGEN (N)", name: "nitrogen" },
  { id: "phosphorus", label: "PHOSPHORUS (P)", name: "phosphorus" },
  { id: "potassium", label: "POTASSIUM (K)", name: "potassium" },
];

export default function SoilInputForm() {
  const [selectedTexture, setSelectedTexture] = useState<string>("sandy");
  const [phLevel, setPhLevel] = useState<number>(6.5);
  const [moisture, setMoisture] = useState<number>(42);
  const [npkValues, setNpkValues] = useState<Record<string, string>>({
    nitrogen: "",
    phosphorus: "",
    potassium: "",
  });

  const phMin = 0;
  const phMax = 14;
  const phPercent = ((phLevel - phMin) / (phMax - phMin)) * 100;

  const handleNpkChange = (name: string, value: string) => {
    setNpkValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    console.log({
      soilTexture: selectedTexture,
      phLevel,
      moisture,
      npkValues,
    });
  };

  return (
    <div className="flex flex-col items-start pt-10 pb-14 px-10 bg-white rounded-[48px] border border-solid border-[#C0C9BB1A]">
      <div className="w-full">
        <div className="flex flex-col w-full items-start gap-4">
          <label className="font-semibold text-[#171D14] text-sm">
            Primary Soil Texture
          </label>
          <div className="grid grid-cols-3 gap-4 w-full">
            {soilTextures.map((texture) => {
              const isSelected = selectedTexture === texture.id;
              return (
                <button
                  key={texture.id}
                  type="button"
                  onClick={() => setSelectedTexture(texture.id)}
                  className={`group flex flex-col items-center justify-center py-4 rounded-[48px] border-2 cursor-pointer transition-all ${
                    isSelected
                      ? "bg-[#00450d0d] border-[#00450D]"
                      : "bg-transparent border-[#C0c9BB] hover:border-[#00450D]"
                  }`}
                >
                  <div className="pb-2 relative">
                    <img
                      className={`${texture.iconClass} ${isSelected ? "opacity-0" : "opacity-100 group-hover:opacity-0"} transition-opacity`}
                      alt={texture.label}
                      src={texture.icon}
                    />
                    <img
                      className={`${texture.iconClass} absolute top-0 left-0 transition-opacity ${isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                      alt={texture.label}
                      src={texture.hoverIcon}
                    />
                  </div>
                  <span
                    className={`text-xs tracking-normal leading-4 whitespace-nowrap ${
                      isSelected
                        ? "font-semibold text-[#00450D]"
                        : "font-medium text-[#41493E] group-hover:text-[#00450D]"
                    }`}
                  >
                    {texture.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mt-10">
      
          <div className="flex flex-col gap-4">
            <div className="flex justify-between">
              <label className="font-semibold text-[#171D14] text-sm">
                pH Level
              </label>
              <span className="font-semibold text-[#00450D] text-xl">
                {phLevel}
              </span>
            </div>
            <div className="relative h-3 bg-[#DEE5D6] rounded-md">
              <input
                type="range"
                min={phMin}
                max={phMax}
                step={0.1}
                value={phLevel}
                onChange={(e) => setPhLevel(Number.parseFloat(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-[#00450D] rounded-xl"
                style={{ left: `calc(${phPercent}% - 12px)` }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-semibold text-[#41493E]">
              <span>ACIDIC</span>
              <span>NEUTRAL</span>
              <span>ALKALINE</span>
            </div>
          </div>

     
          <div className="flex flex-col gap-4">
            <div className="flex justify-between">
              <label className="font-semibold text-[#171D14] text-sm">
                Moisture Content
              </label>
              <span className="font-semibold text-[#003E63] text-xl">
                {moisture}%
              </span>
            </div>
            <div className="relative h-3 bg-[#DEE5D6] rounded-full">
              <div
                className="absolute left-0 top-0 h-full bg-[#003E63] rounded-full"
                style={{ width: `${moisture}%` }}
              />
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={moisture}
                onChange={(e) => setMoisture(Number(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
            <div className="flex justify-between text-[10px] font-semibold text-[#41493E]">
              <span>DRY</span>
              <span>OPTIMAL</span>
              <span>SATURATED</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6 mt-10 pt-6 border-t border-[#C0C9BB1A]">
          <div className="flex items-center gap-3">
            <img
              src="/soil/chemical-comp.svg"
              alt="NPK"
              className="w-[13.54px] h-[13.5px]"
            />
            <span className="font-bold text-[#171D14] text-sm tracking-[1.40px]">
              CHEMICAL COMPOSITION (NPK)
            </span>
          </div>
          <div className="flex flex-col gap-6">
            {npkFields.map((field) => (
              <div key={field.id} className="flex items-center gap-6">
                <label className="w-24 font-semibold text-[#41493E] text-[10px]">
                  {field.label}
                </label>
                <input
                  type="number"
                  name={field.name}
                  value={npkValues[field.name]}
                  onChange={(e) => handleNpkChange(field.name, e.target.value)}
                  placeholder="mg/kg"
                  className="flex-1 px-4 py-3 bg-[#E3EBDC] rounded-md outline-none font-normal text-gray-500 text-sm"
                />
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={handleSubmit}
          className="flex items-center justify-center gap-3 w-full py-5 mt-8 bg-[#00450D] rounded-full cursor-pointer hover:bg-[#005610] transition-colors shadow-[0px_8px_10px_-6px_#00450D33,0px_20px_25px_-5px_#00450D33]"
        >
          <img
            src="/soil/analyze.svg"
            alt="Save"
            className="w-[18px] h-[18px]"
          />
          <span className="font-semibold text-white text-base">
            Save and Analyze Soil Profile
          </span>
        </button>
      </div>
    </div>
  );
}
