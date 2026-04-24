"use client";

import { useCallback, useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { MapPin } from "lucide-react";
import { toast } from "sonner";

import AddFarmCard from "@/components/layout/farms/AddFarmCard";
import FarmCard from "@/components/layout/farms/FarmCard";
import { fetchWithAuth, extractApiData, getApiErrorMessage } from "@/lib/apiClient";
import { getClientAuth } from "@/lib/firebaseClient";
import type { SelectedGeocodeLocation } from "@/lib/analysisContracts";

const MAX_FARMS = 5;
const FARM_CARD_STRIP_COLORS = ["#CFE6B8", "#E8DFA3"];

type FarmRecord = {
  id: string;
  name: string;
  location: string | null;
  locationLatitude: number | null;
  locationLongitude: number | null;
  locationConfidence: number | null;
  locationSource: string | null;
  isActive: boolean;
};

export default function FarmsPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [farms, setFarms] = useState<FarmRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [pageError, setPageError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<FarmRecord | null>(null);

  const loadFarms = useCallback(async (user: User) => {
    const { response, body } = await fetchWithAuth(user, "/api/farms");

    if (!response.ok) {
      throw new Error(getApiErrorMessage(body, "Unable to load farms right now."));
    }

    const data = extractApiData<{ farms: FarmRecord[] }>(body);
    return data?.farms ?? [];
  }, []);

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
        const farmList = await loadFarms(user);
        setFarms(farmList);
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
  }, [loadFarms]);

  const handleToggle = async (id: string) => {
    if (!currentUser) {
      setPageError("Sign in to update farms.");
      return;
    }

    const selectedFarm = farms.find((farm) => farm.id === id);

    if (!selectedFarm) {
      setPageError("Farm not found.");
      return;
    }

    setIsSaving(true);
    setPageError("");

    try {
      const { response, body } = selectedFarm.isActive
        ? await fetchWithAuth(currentUser, `/api/farms/${id}`, {
            method: "PATCH",
            body: JSON.stringify({ isActive: false }),
          })
        : await fetchWithAuth(currentUser, `/api/farms/${id}/activate`, {
            method: "POST",
          });

      if (!response.ok) {
        throw new Error(
          getApiErrorMessage(body, "Unable to update the active farm."),
        );
      }

      if (selectedFarm.isActive) {
        setFarms((prevFarms) =>
          prevFarms.map((farm) =>
            farm.id === selectedFarm.id ? { ...farm, isActive: false } : farm,
          ),
        );
      } else {
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
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to update the active farm.";
      setPageError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteFarm = (id: string) => {
    const farmToDelete = farms.find((farm) => farm.id === id) ?? null;
    setDeleteTarget(farmToDelete);
  };

  const confirmDeleteFarm = async () => {
    if (!currentUser || !deleteTarget) {
      return;
    }

    setIsSaving(true);
    setPageError("");

    try {
      const { response, body } = await fetchWithAuth(
        currentUser,
        `/api/farms/${deleteTarget.id}`,
        { method: "DELETE" },
      );

      if (!response.ok) {
        throw new Error(
          getApiErrorMessage(body, "Unable to delete the farm right now."),
        );
      }

      toast.success("Farm deleted successfully");
      setFarms((prevFarms) => prevFarms.filter((farm) => farm.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to delete the farm right now.";
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

  const createFarm = async (
    name: string,
    location: string,
    geocode: SelectedGeocodeLocation | null,
  ) => {
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
        locationLatitude: geocode?.latitude ?? null,
        locationLongitude: geocode?.longitude ?? null,
        locationConfidence: geocode?.confidence ?? null,
        locationSource: geocode?.source ?? null,
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

  const handleAddFarmFromModal = (
    name: string,
    location: string,
    geocode: SelectedGeocodeLocation | null,
  ) => {
    if (isDuplicateFarm(name, location)) {
      toast.error("A farm with this name or location already exists");
      return;
    }

    return createFarm(name, location, geocode);
  };

  return (
    <div className="flex w-full flex-col items-start gap-8 sm:gap-10 lg:gap-12 bg-[#EFF6E7]">
      <div className="flex items-end relative self-stretch w-full flex-[0_0_auto]">
        <div className="inline-flex flex-col items-start gap-2 relative flex-[0_0_auto]">
          <div className="relative flex items-center mt-[-1.00px] [font-family:'Inter-SemiBold',Helvetica] font-semibold text-[#7a5649] text-xs sm:text-sm tracking-[1.20px] sm:tracking-[1.40px] leading-5 whitespace-nowrap">
            MANAGEMENT CONSOLE
          </div>
          <div className="relative flex items-center font-extrabold text-[#00450d] text-3xl sm:text-4xl lg:text-5xl tracking-[-1.60px] sm:tracking-[-2.40px] leading-tight whitespace-nowrap">
            My Farms
          </div>
        </div>
      </div>

      <div className="min-h-6" aria-live="polite">
        {(isLoading || isSaving) && (
          <p className="text-sm font-semibold text-[#00450D]">
            {isLoading ? "Loading farms..." : "Updating farms..."}
          </p>
        )}
      </div>

      {pageError && <p className="text-sm font-semibold text-[#9C4A00]">{pageError}</p>}

      {deleteTarget && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50"
            onClick={() => setDeleteTarget(null)}
          />

          <div className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-[450px] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-4 shadow-xl sm:p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h2 className="text-2xl font-bold text-[#00450D]">
                  Delete Farm?
                </h2>
                <p className="mt-1 text-sm text-[#41493E]">
                  This will permanently remove {deleteTarget.name}. This action cannot be undone.
                </p>
              </div>
              <button
                onClick={() => setDeleteTarget(null)}
                className="text-[#41493E]/50 text-2xl hover:text-[#41493E]"
              >
                ✕
              </button>
            </div>

            <div className="mb-6 rounded-xl border border-[#DDE5D3] bg-[#F4F8EF] p-4">
              <p className="text-xs font-semibold tracking-[0.12em] text-[#B3261E]">
                FARM TO BE DELETED
              </p>
              <p className="mt-1 text-base font-bold text-[#171D14]">
                {deleteTarget.name}
              </p>
              <div className="mt-1 flex items-center gap-1.5 text-sm text-[#41493E]">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span>{deleteTarget.location ?? "Location pending"}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 rounded-full border border-[#41493E]/20 px-4 py-3 font-semibold text-[#41493E] transition hover:bg-gray-50"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteFarm}
                className="flex-1 rounded-full bg-[#C62828] px-4 py-3 font-semibold text-white transition hover:bg-[#B71C1C] disabled:cursor-not-allowed disabled:opacity-70"
                disabled={isSaving}
              >
                {isSaving ? "Deleting..." : "Delete Farm"}
              </button>
            </div>
          </div>
        </>
      )}

      <div className="flex w-full flex-row flex-wrap gap-4 sm:gap-6 lg:gap-8">
        <AddFarmCard
          onAdd={handleAddFarmFromModal}
          currentFarmCount={farms.length}
          maxFarms={MAX_FARMS}
          currentUser={currentUser}
        />

        {farms.map((farm, index) => (
          <FarmCard
            key={farm.id}
            id={farm.id}
            name={farm.name}
            location={farm.location}
            isActive={farm.isActive}
            locationIcon={MapPin}
            bgColor={FARM_CARD_STRIP_COLORS[index % FARM_CARD_STRIP_COLORS.length]}
            onToggle={handleToggle}
            onDelete={handleDeleteFarm}
          />
        ))}
      </div>

      {farms.length >= MAX_FARMS && (
        <div className="flex flex-col items-start px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10 relative self-stretch w-full flex-[0_0_auto] bg-[#e3ebdc] rounded-[24px] sm:rounded-[32px] lg:rounded-[40px]">
          <div className="flex flex-col gap-3 relative self-stretch w-full">
            <div className="relative flex items-center mt-[-1.00px] [font-family:'Inter-ExtraBold',Helvetica] font-extrabold text-[#00450d] text-xl sm:text-2xl tracking-[-0.75px] leading-tight">
              Maximum Farms Reached
            </div>
            <p className="relative mt-[-1.00px] [font-family:'Inter-Regular',Helvetica] font-normal text-[#7a5649] text-sm sm:text-base tracking-[0] leading-6">
              You've reached the maximum of {MAX_FARMS} farms. Remove a farm to add a new one.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}