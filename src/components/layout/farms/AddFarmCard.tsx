"use client";
import { useState } from "react";
import type { User } from "firebase/auth";
import { Plus, Search } from "lucide-react";
import { extractApiData, fetchWithAuth, getApiErrorMessage } from "@/lib/apiClient";
import type { SelectedGeocodeLocation } from "@/lib/analysisContracts";

interface AddFarmCardProps {
  onAdd: (
    farmName: string,
    location: string,
    geocode: SelectedGeocodeLocation | null,
  ) => void | Promise<void>;
  currentFarmCount: number;
  maxFarms: number;
  currentUser: User | null;
}

export default function AddFarmCard({
  onAdd,
  currentFarmCount,
  maxFarms,
  currentUser,
}: AddFarmCardProps) {
  const MAX_FARM_NAME_LENGTH = 25;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [farmName, setFarmName] = useState("");
  const [location, setLocation] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [matches, setMatches] = useState<SelectedGeocodeLocation[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<SelectedGeocodeLocation | null>(null);
  const [error, setError] = useState("");

  function dedupeMatches(entries: SelectedGeocodeLocation[]) {
    const uniqueMatches = new Map<string, SelectedGeocodeLocation>();
    for (const entry of entries) {
      const key = [entry.formattedAddress.trim().toLowerCase()].join("|");
      if (!uniqueMatches.has(key)) {
        uniqueMatches.set(key, entry);
      }
    }
    return Array.from(uniqueMatches.values());
  }

  async function handleSearch() {
    setError("");
    setSearchError("");
    if (!currentUser) {
      setSearchError("Sign in before searching for a location.");
      return;
    }

    if (!location.trim()) {
      setSearchError("Please enter a location to search.");
      return;
    }

    setIsSearching(true);
    setMatches([]);
    setSelectedMatch(null);

    try {
      const { response, body } = await fetchWithAuth(
        currentUser,
        "/api/location/geocode",
        {
          method: "POST",
          body: JSON.stringify({
            locationText: location.trim(),
            limit: 5,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          getApiErrorMessage(body, "Unable to search for this location.")
        );
      }

      const data = extractApiData<{ geocodes?: SelectedGeocodeLocation[] }>(body);
      const geocodes = data?.geocodes ?? [];

      if (geocodes.length === 0) {
        setSearchError("No matching locations were found.");
        return;
      }

      const normalizedMatches = dedupeMatches(
        geocodes.map((geocode) => ({
          ...geocode,
          queryText: location.trim(),
        }))
      );

      setMatches(normalizedMatches);
      setSelectedMatch(normalizedMatches[0] ?? null);
    } catch (searchError) {
      setSearchError(
        searchError instanceof Error
          ? searchError.message
          : "Unable to search for this location."
      );
    } finally {
      setIsSearching(false);
    }
  }

  const handleSubmit = async () => {
    setError("");

    if (!farmName.trim()) {
      setError("Please enter a farm name");
      return;
    }

    if (farmName.trim().length > MAX_FARM_NAME_LENGTH) {
      setError(`Farm name must be ${MAX_FARM_NAME_LENGTH} characters or less`);
      return;
    }

    if (!location.trim()) {
      setError("Please enter a location");
      return;
    }

    if (!selectedMatch) {
      setError("Search and select one of the location matches.");
      return;
    }

    if (currentFarmCount >= maxFarms) {
      setError(`Maximum ${maxFarms} farms allowed`);
      return;
    }

    setIsAdding(true);

    try {
      await Promise.resolve(
        onAdd(farmName, selectedMatch.formattedAddress, selectedMatch)
      );
      setFarmName("");
      setLocation("");
      setMatches([]);
      setSelectedMatch(null);
      setError("");
      setSearchError("");
      setIsModalOpen(false);
    } finally {
      setIsAdding(false);
    }
  };

  const handleClose = () => {
    setFarmName("");
    setLocation("");
    setMatches([]);
    setSelectedMatch(null);
    setError("");
    setSearchError("");
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
                maxLength={MAX_FARM_NAME_LENGTH}
              />
              <p className="mt-1 text-xs text-[#41493E]/60 text-right">
                {farmName.trim().length}/{MAX_FARM_NAME_LENGTH}
              </p>
            </div>

            <div className="mb-6">
              <label className="text-xs font-semibold text-[#41493E] block mb-1">
                LOCATION
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="City and state"
                  className="flex-1 text-[#000000] px-4 py-3 border border-[#41493E]/20 rounded-xl outline-none focus:border-[#00450D] transition"
                  value={location}
                  onChange={(e) => {
                    setLocation(e.target.value);
                    setSelectedMatch(null);
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
                <button
                  type="button"
                  onClick={handleSearch}
                  disabled={isSearching || !currentUser}
                  className="shrink-0 rounded-xl bg-[#00450D] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#005610] disabled:cursor-not-allowed disabled:opacity-60 flex items-center gap-2"
                >
                  <Search className="h-4 w-4" />
                  {isSearching ? "Searching..." : "Search"}
                </button>
              </div>
              {searchError && (
                <div className="mt-2 text-sm text-[#9C4A00]">
                  {searchError}
                </div>
              )}
              <div
                className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
                  matches.length > 0
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="min-h-0 overflow-hidden">
                  {matches.length > 0 && (
                    <div className="mt-3 max-h-56 space-y-2 overflow-y-auto pr-1 [scrollbar-gutter:stable] [scrollbar-width:thin] [scrollbar-color:#00450D_#E3EBDC] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-[#E3EBDC] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#00450D] [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb]:border-solid [&::-webkit-scrollbar-thumb]:border-[#E3EBDC]">
                      {matches.map((match) => {
                        const isSelected =
                          selectedMatch?.latitude === match.latitude &&
                          selectedMatch?.longitude === match.longitude &&
                          selectedMatch?.formattedAddress ===
                            match.formattedAddress;
                        return (
                          <button
                            key={`${match.formattedAddress}-${match.latitude}-${match.longitude}`}
                            type="button"
                            onClick={() => setSelectedMatch(match)}
                            className={`w-full rounded-xl border px-4 py-3 text-left transition ${
                              isSelected
                                ? "border-[#00450D] bg-[#EAF4E2]"
                                : "border-[#41493E]/20 bg-white hover:bg-[#F8FAF5]"
                            }`}
                          >
                            <div className="text-sm font-semibold text-[#171D14]">
                              {match.formattedAddress}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
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
                disabled={isAdding}
                className="flex-1 px-4 py-3 bg-[#00450D] text-white rounded-full font-semibold hover:bg-[#005610] transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isAdding ? "Adding..." : "Add Farm"}
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
