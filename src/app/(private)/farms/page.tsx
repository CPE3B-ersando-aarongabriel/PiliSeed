"use client";
import { useState } from "react";
import FarmCard from "@/components/layout/farms/FarmCard";
import AddFarmCard from "@/components/layout/farms/AddFarmCard";
import AddFarmForm from "@/components/layout/farms/AddFarmForm";

const MAX_FARMS = 5;

const initialFarms = [
  {
    id: 1,
    name: "Emerald\nValley",
    location: "Sonoma County, CA",
    isActive: true,
    bgColor: "#e9f0e1",
  },
  {
    id: 2,
    name: "Highland\nRidge",
    location: "Asheville, NC",
    isActive: false,
    bgColor: "#e9f0e1",
  },
];

export default function FarmsPage() {
  const [farms, setFarms] = useState(initialFarms);
  const [farmName, setFarmName] = useState("");
  const [locationCoords, setLocationCoords] = useState("");

  const handleToggle = (id: number) => {
    setFarms((prevFarms) =>
      prevFarms.map((farm) => ({
        ...farm,
        isActive: farm.id === id
      }))
    );
  };

  const isDuplicateFarm = (name: string, location: string) => {
    const normalizedName = name.toLowerCase().trim();
    const normalizedLocation = location.toLowerCase().trim();
    
    return farms.some(
      (farm) => {
        const farmName = farm.name.replace(/\n/g, ' ').toLowerCase().trim();
        const farmLocation = farm.location.toLowerCase().trim();
        return farmName === normalizedName || farmLocation === normalizedLocation;
      }
    );
  };

 
  const handleAddFarmFromModal = (name: string, location: string) => {
    if (farms.length >= MAX_FARMS) {
      alert(`Maximum ${MAX_FARMS} farms allowed`);
      return;
    }

    if (isDuplicateFarm(name, location)) {
      alert("A farm with this name or location already exists");
      return;
    }

    const newFarm = {
      id: Date.now(),
      name: name,
      location: location,
      isActive: false,
      bgColor: "#e9f0e1",
    };

    setFarms((prevFarms) => [...prevFarms, newFarm]);
  };

 
  const handleAddFarmFromForm = () => {
    if (farms.length >= MAX_FARMS) {
      alert(`Maximum ${MAX_FARMS} farms allowed`);
      return;
    }

    if (!farmName.trim() || !locationCoords.trim()) return;

    if (isDuplicateFarm(farmName, locationCoords)) {
      alert("A farm with this name or location already exists");
      return;
    }

    const newFarm = {
      id: Date.now(),
      name: farmName,
      location: locationCoords,
      isActive: false,
      bgColor: "#e9f0e1",
    };

    setFarms((prevFarms) => [...prevFarms, newFarm]);
    setFarmName("");
    setLocationCoords("");
  };

  return (
    <div className="flex flex-col min-h-[1176px] items-start gap-16 p-12 relative self-stretch w-full flex-[0_0_auto] bg-[#EFF6E7]">
      <div className="flex items-end relative self-stretch w-full flex-[0_0_auto]">
        <div className="inline-flex flex-col items-start gap-[8.5px] relative flex-[0_0_auto]">
          <div className="relative flex items-center w-[200.28px] h-5 mt-[-1.00px] [font-family:'Inter-SemiBold',Helvetica] font-semibold text-[#7a5649] text-sm tracking-[1.40px] leading-5 whitespace-nowrap">
            MANAGEMENT CONSOLE
          </div>
          <div className="relative flex items-center w-[245px] h-12 font-extrabold text-[#00450d] text-5xl tracking-[-2.40px] leading-[48px] whitespace-nowrap">
            My Farms
          </div>
        </div>
      </div>

      <div className="flex flex-row flex-wrap gap-8">
    
        <AddFarmCard 
          onAdd={handleAddFarmFromModal}
          currentFarmCount={farms.length}
          maxFarms={MAX_FARMS}
        />
        
      
        {farms.map((farm) => (
          <FarmCard
            key={farm.id}
            {...farm}
            onToggle={handleToggle}
          />
        ))}
      </div>

      <div className="flex flex-col items-start pt-20 pb-12 px-12 relative self-stretch w-full flex-[0_0_auto] bg-[#e3ebdc] rounded-[48px]">
        <div className="flex items-center justify-center gap-12 relative self-stretch w-full flex-[0_0_auto]">
          <div className="flex flex-col items-start gap-4 relative flex-1 grow">
            <div className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]">
              <div className="relative flex items-center self-stretch mt-[-1.00px] [font-family:'Inter-ExtraBold',Helvetica] font-extrabold text-[#00450d] text-3xl tracking-[-0.75px] leading-[30px]">
                Connect a New Plot
              </div>
            </div>
            <div className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]">
              <p className="relative self-stretch mt-[-1.00px] [font-family:'Inter-Regular',Helvetica] font-normal text-[#41493e] text-base tracking-[0] leading-[26px]">
                Enter your farm details to begin satellite
                <br />
                synchronization and soil health monitoring.
              </p>
            </div>
          </div>

          <AddFarmForm
            farmName={farmName}
            locationCoords={locationCoords}
            onFarmNameChange={setFarmName}
            onLocationChange={setLocationCoords}
            onSubmit={handleAddFarmFromForm}
          />
        </div>
      </div>
    </div>
  );
}