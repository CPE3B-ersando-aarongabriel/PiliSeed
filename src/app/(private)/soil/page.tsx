"use client";

import { useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import QuickNavigation from "@/components/layout/QuickNavigation";
import SoilInputForm from "@/components/layout/soil/SoilInputForm";
import { getClientAuth } from "@/lib/firebaseClient";
import { Droplet, Diamond, Clover, ChevronDown } from "lucide-react";
type FarmOption = {
  id: string;
  name: string;
  location: string | null;
  isActive: boolean;
};

const metrics = [
  {
    icon: <Droplet className="h-[20px] w-[20px] text-[#00450D]" />,
    iconBg: "bg-[#00450d1a]",
    title: "Moisture Balance",
    description:
      "Proper hydration prevents root rot while ensuring nutrient transport from soil to stalk.",
  },
  {
    icon: <Diamond className="h-[20px] w-[20px] text-[#7A5649]" />,
    iconBg: "bg-[#fdcdbc4c]",
    title: "pH Equilibrium",
    description:
      "Solubility of nutrients is directly linked to pH. Most cereal crops thrive between 6.0 and 7.5.",
  },
  {
    icon: <Clover className="h-[20px] w-[20px] text-[#003E63]" />,
    iconBg: "bg-[#cee5ff]",
    title: "NPK Vitality",
    description:
      "Nitrogen for foliage, Phosphorus for roots and fruit, and Potassium for overall plant health.",
  },
];

function getErrorMessage(body: unknown, fallbackMessage: string) {
  if (typeof body !== "object" || body === null || !("error" in body)) {
    return fallbackMessage;
  }

  const errorObject = (body as { error?: { message?: unknown } }).error;

  if (errorObject && typeof errorObject.message === "string") {
    return errorObject.message;
  }

  return fallbackMessage;
}

export default function SoilData() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [farms, setFarms] = useState<FarmOption[]>([]);
  const [selectedFarmId, setSelectedFarmId] = useState("");
  const [isFarmDropdownOpen, setIsFarmDropdownOpen] = useState(false);
  const [isLoadingFarms, setIsLoadingFarms] = useState(true);
  const [farmError, setFarmError] = useState("");

  useEffect(() => {
    const auth = getClientAuth();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (!user) {
        setFarms([]);
        setSelectedFarmId("");
        setFarmError("Sign in to load farms for soil analysis.");
        setIsLoadingFarms(false);
        return;
      }

      setIsLoadingFarms(true);
      setFarmError("");

      try {
        const token = await user.getIdToken();
        const response = await fetch("/api/farms", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const responseBody: unknown = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(
            getErrorMessage(responseBody, "Unable to load farms right now."),
          );
        }

        const farmList =
          typeof responseBody === "object" &&
          responseBody !== null &&
          "data" in responseBody &&
          typeof (responseBody as { data?: unknown }).data === "object"
            ? (((responseBody as { data?: { farms?: FarmOption[] } }).data
                ?.farms ?? []) as FarmOption[])
            : [];

        setFarms(farmList);
        setSelectedFarmId((currentSelectedFarmId) => {
          if (
            currentSelectedFarmId &&
            farmList.some((farm) => farm.id === currentSelectedFarmId)
          ) {
            return currentSelectedFarmId;
          }

          return (
            farmList.find((farm) => farm.isActive)?.id ?? farmList[0]?.id ?? ""
          );
        });
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Unable to load farms right now.";
        setFarmError(message);
        setFarms([]);
        setSelectedFarmId("");
      } finally {
        setIsLoadingFarms(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const selectedFarm = farms.find((farm) => farm.id === selectedFarmId) ?? null;
  const selectedFarmLabel =
    selectedFarm?.name ??
    (isLoadingFarms ? "Loading farms..." : "Select a farm");

  return (
    <div className="min-h-screen bg-[#EFF6E7]">
      <div className="px-6 mt-8">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-2">
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold text-gray-900">
              Input Soil Data
            </h1>
            <p className="text-gray-600 text-base max-w-2xl">
              Capture the precise biological composition of your soil to unlock
              AI-driven crop optimization and yield forecasting.
            </p>
          </div>

          <div className="flex flex-col">
            <label className="text-[10px] font-semibold text-[#41493E] tracking-widest mb-1.5">
              SELECTED FARM
            </label>

            <div className="relative">
              <button
                onClick={() =>
                  setIsFarmDropdownOpen((previousValue) => !previousValue)
                }
                disabled={isLoadingFarms || farms.length === 0}
                className="w-full sm:w-60 h-10 bg-white rounded-full shadow-sm flex items-center justify-between px-5 border border-gray-200 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <span className="font-semibold text-[#00450D] text-sm truncate max-w-42.5 text-left">
                  {selectedFarmLabel}
                </span>
                <ChevronDown className="w-5 h-5 text-[#6B7280]"/>
              </button>

              {isFarmDropdownOpen && farms.length > 0 && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsFarmDropdownOpen(false)}
                  />
                  <div className="absolute left-0 mt-2 w-55 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">
                    {farms.map((farm) => (
                      <button
                        key={farm.id}
                        onClick={() => {
                          setSelectedFarmId(farm.id);
                          setIsFarmDropdownOpen(false);
                        }}
                        className={`w-full text-left px-5 py-2.5 text-sm hover:bg-[#e3ebdc] transition ${
                          farm.id === selectedFarmId
                            ? "text-[#00450d] font-medium bg-[#eef3ea]"
                            : "text-[#171d14]"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="truncate">{farm.name}</span>
                          {farm.isActive && (
                            <span className="rounded-full bg-[#00450D]/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.18em] text-[#00450D]">
                              Active
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {farmError && (
              <p className="mt-2 text-xs font-semibold text-[#9C4A00]">
                {farmError}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 p-4 md:p-6">
        <div className="flex-1 w-full">
          <SoilInputForm
            farm={selectedFarm}
            farms={farms}
            onSelectFarm={setSelectedFarmId}
            currentUser={currentUser}
          />
        </div>

        <div className="w-full lg:w-[380px] flex flex-col gap-6 lg:gap-8">
          <div className="rounded-[48px] overflow-hidden shadow-[0px_25px_50px_-12px_#00000040]">
            <div className="h-40 sm:h-44 md:h-48 lg:h-52 bg-[url(/soil/soildatabg.png)] bg-cover bg-center" />
            <div className="p-6 bg-linear-to-t from-black/60 to-transparent -mt-16 relative">
              <p className="font-medium text-white text-xs leading-4">
                "The foundation of every great harvest is the
                <br />
                invisible life within the earth."
              </p>
            </div>
          </div>

          <div className="p-8 bg-[#e3ebdc] rounded-[48px]">
            <h2 className="font-bold text-[#171d14] text-xl mb-6">
              Why these metrics matter
            </h2>
            <div className="flex flex-col gap-6">
              {metrics.map((metric, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div
                    className={`flex w-10 h-10 items-center justify-center ${metric.iconBg} rounded-full`}
                  >
                    {metric.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-[#171d14] text-sm mb-1">
                      {metric.title}
                    </h3>
                    <p className="font-normal text-[#41493e] text-xs leading-[19.5px]">
                      {metric.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-12 pb-8">
        <QuickNavigation currentPage="soil-data" />
      </div>
    </div>
  );
}
