"use client";

import { useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";

import FarmCard from "@/components/layout/farms/FarmCard";
import AddFarmCard from "@/components/layout/farms/AddFarmCard";
import AddFarmForm from "@/components/layout/farms/AddFarmForm";
import { fetchWithAuth, extractApiData, getApiErrorMessage } from "@/lib/apiClient";
import { getClientAuth } from "@/lib/firebaseClient";
import { MapPin } from "lucide-react";

const MAX_FARMS = 5;
const FARM_CARD_BG = "#e9f0e1";

type FarmRecord = {
  id: string;
  name: string;
  location: string | null;
  isActive: boolean;
};

export default function FarmsPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [farms, setFarms] = useState<FarmRecord[]>([]);
  const [farmName, setFarmName] = useState("");
  const [locationText, setLocationText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [pageError, setPageError] = useState("");

  useEffect(() => {
    const auth = getClientAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (!user) {
        setFarms([]);
        setIsLoading(false);
        setPageError("Sign in to manage farms.");
        return;
      }

      setIsLoading(true);
      setPageError("");

      try {
        const { response, body } = await fetchWithAuth(user, "/api/farms");

        if (!response.ok) {
          throw new Error(
            getApiErrorMessage(body, "Unable to load farms right now."),
          );
        }

        const data = extractApiData<{ farms: FarmRecord[] }>(body);
        setFarms(data?.farms ?? []);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unable to load farms right now.";
        setPageError(message);
        setFarms([]);
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleToggle = async (id: string) => {
    if (!currentUser) {
      setPageError("Sign in to update farms.");
      return;
    }

    setIsSaving(true);
    setPageError("");

    try {
      const { response, body } = await fetchWithAuth(
        currentUser,
        `/api/farms/${id}/activate`,
        { method: "POST" },
      );

      if (!response.ok) {
        throw new Error(
          getApiErrorMessage(body, "Unable to update the active farm."),
        );
      }

      const data = extractApiData<{ farm: FarmRecord }>(body);

      if (!data?.farm) {
        throw new Error("Active farm response did not include farm data.");
      }

      setFarms((prevFarms) =>
        prevFarms.map((farm) => ({
          ...farm,
          isActive: farm.id === data.farm.id,
        })),
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to update the active farm.";
      setPageError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const isDuplicateFarm = (name: string, location: string) => {
    const normalizedName = name.toLowerCase().trim();
    const normalizedLocation = location.toLowerCase().trim();

    return farms.some((farm) => {
      const farmName = farm.name.toLowerCase().trim();
      const farmLocation = (farm.location ?? "").toLowerCase().trim();
      return farmName === normalizedName || farmLocation === normalizedLocation;
    });
  };

  const createFarm = async (name: string, location: string) => {
    if (!currentUser) {
      setPageError("Sign in to add farms.");
      return;
    }

    setIsSaving(true);
    setPageError("");

    try {
      const payload = {
        name: name.trim(),
        location: location.trim() || null,
      };
      const { response, body } = await fetchWithAuth(currentUser, "/api/farms", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(
          getApiErrorMessage(body, "Unable to add the farm right now."),
        );
      }

      const data = extractApiData<{ farm: FarmRecord }>(body);

      if (!data?.farm) {
        throw new Error("Farm response did not include farm data.");
      }

      setFarms((prevFarms) => [...prevFarms, data.farm]);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to add the farm right now.";
      setPageError(message);
    } finally {
      setIsSaving(false);
    }
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

    createFarm(name, location);
  };

  const handleAddFarmFromForm = () => {
    if (farms.length >= MAX_FARMS) {
      alert(`Maximum ${MAX_FARMS} farms allowed`);
      return;
    }

    if (!farmName.trim()) return;

    if (isDuplicateFarm(farmName, locationText)) {
      alert("A farm with this name or location already exists");
      return;
    }

    createFarm(farmName, locationText);
    setFarmName("");
    setLocationText("");
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

      {(isLoading || isSaving) && (
        <p className="text-sm font-semibold text-[#00450D]">
          {isLoading ? "Loading farms..." : "Updating farms..."}
        </p>
      )}
      {pageError && (
        <p className="text-sm font-semibold text-[#9C4A00]">{pageError}</p>
      )}

      <div className="flex flex-row flex-wrap gap-8">
    
        <AddFarmCard 
          onAdd={handleAddFarmFromModal}
          currentFarmCount={farms.length}
          maxFarms={MAX_FARMS}
        />
        
      
        {farms.map((farm) => (
          <FarmCard
            key={farm.id}
            id={farm.id}
            name={farm.name}
            location={farm.location}
            isActive={farm.isActive}
            locationIcon={MapPin}
            bgColor={FARM_CARD_BG}
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
            locationCoords={locationText}
            onFarmNameChange={setFarmName}
            onLocationChange={setLocationText}
            onSubmit={handleAddFarmFromForm}
          />
        </div>
      </div>
    </div>
  );
}