"use client";

import { useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { 
  Clover,
  Droplet,
  FlaskRound,
  Search,
 } from "lucide-react";
 
type FarmOption = {
  id: string;
  name: string;
  location: string | null;
  isActive: boolean;
};

type SoilInputFormProps = {
  farm: FarmOption | null;
  farms: FarmOption[];
  onSelectFarm: (farmId: string) => void;
  currentUser: User | null;
};

type SoilInputValues = {
  nitrogen: string;
  phosphorus: string;
  potassium: string;
  moistureContent: string;
  pH: string;
  lightLevel: string;
  temperatureC: string;
  humidity: string;
  landSize: string;
  plantingDuration: string;
  budget: string;
  goal: string;
};

type DeviceNotice = {
  kind: "idle" | "info" | "success" | "error";
  message: string;
  collectedAt?: string | null;
};

type DeviceLinkFormValues = {
  deviceName: string;
  deviceId: string;
  deviceToken: string;
  targetFarmId: string;
};

type DeviceStatusPayload = {
  device?: {
    id?: string;
    name?: string;
    tokenHint?: string | null;
  };
  activation?: {
    pending?: boolean;
  };
  readings?: {
    moistureContent?: number;
    pH?: number;
    lightLevel?: number;
    temperatureC?: number;
    humidity?: number;
  } | null;
  collectedAt?: string | null;
};

const initialValues: SoilInputValues = {
  nitrogen: "",
  phosphorus: "",
  potassium: "",
  moistureContent: "",
  pH: "",
  lightLevel: "",
  temperatureC: "",
  humidity: "",
  landSize: "",
  plantingDuration: "",
  budget: "",
  goal: "",
};

const npkFields = [
  {
    id: "nitrogen",
    label: "Nitrogen (N)",
    name: "nitrogen" as const,
    placeholder: "mg/kg",
  },
  {
    id: "phosphorus",
    label: "Phosphorus (P)",
    name: "phosphorus" as const,
    placeholder: "mg/kg",
  },
  {
    id: "potassium",
    label: "Potassium (K)",
    name: "potassium" as const,
    placeholder: "mg/kg",
  },
];

const environmentalFields = [
  {
    id: "moistureContent",
    label: "Soil Moisture",
    name: "moistureContent" as const,
    placeholder: "%",
  },
  {
    id: "pH",
    label: "Soil pH (manual)",
    name: "pH" as const,
    placeholder: "pH",
  },
  {
    id: "lightLevel",
    label: "Light Level",
    name: "lightLevel" as const,
    placeholder: "lux",
  },
  {
    id: "temperatureC",
    label: "Temperature",
    name: "temperatureC" as const,
    placeholder: "°C",
  },
  {
    id: "humidity",
    label: "Humidity",
    name: "humidity" as const,
    placeholder: "%",
  },
];

const planningFields = [
  {
    id: "landSize",
    label: "Land Size (hectares)",
    name: "landSize" as const,
    placeholder: "e.g., 2.5 hectares",
  },
  {
    id: "plantingDuration",
    label: "Planting Duration",
    name: "plantingDuration" as const,
    placeholder: "e.g., 90 days",
  },
  {
    id: "goal",
    label: "Primary Goal",
    name: "goal" as const,
    placeholder: "e.g., maximize profit",
  },
];

function getSoilInputCacheKey(farmId: string) {
  return `piliSeed.soilInput.${farmId}`;
}

function readSoilInputCache(farmId: string): SoilInputValues | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(getSoilInputCacheKey(farmId));

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<SoilInputValues>;

    return {
      ...initialValues,
      ...parsed,
    };
  } catch {
    return null;
  }
}

function writeSoilInputCache(farmId: string, values: SoilInputValues) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    getSoilInputCacheKey(farmId),
    JSON.stringify(values),
  );
}

function parseOptionalNumber(value: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return undefined;
  }

  const parsedValue = Number(trimmedValue);

  return Number.isFinite(parsedValue) ? parsedValue : undefined;
}

function formatSyncTimestamp(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return `${date.toISOString().replace("T", " ").slice(0, 19)} UTC`;
}

function getResponseMessage(body: unknown, fallbackMessage: string) {
  if (typeof body !== "object" || body === null || !("error" in body)) {
    return fallbackMessage;
  }

  const errorObject = (body as { error?: { message?: unknown } }).error;

  if (errorObject && typeof errorObject.message === "string") {
    return errorObject.message;
  }

  return fallbackMessage;
}

function getResponseCode(body: unknown) {
  if (typeof body !== "object" || body === null || !("error" in body)) {
    return "";
  }

  const errorObject = (body as { error?: { code?: unknown } }).error;

  return typeof errorObject?.code === "string" ? errorObject.code : "";
}

function readDeviceStatusPayload(body: unknown): DeviceStatusPayload | null {
  if (typeof body !== "object" || body === null || !("data" in body)) {
    return null;
  }

  const data = (body as { data?: unknown }).data;

  if (typeof data !== "object" || data === null) {
    return null;
  }

  return data as DeviceStatusPayload;
}

async function waitFor(milliseconds: number) {
  await new Promise<void>((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });
}

async function fetchJsonWithAuth(
  user: User,
  path: string,
  init: RequestInit = {},
) {
  const idToken = await user.getIdToken();

  return fetch(path, {
    ...init,
    headers: {
      Authorization: `Bearer ${idToken}`,
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...(init.headers ?? {}),
    },
  });
}

export default function SoilInputForm({
  farm,
  farms,
  onSelectFarm,
  currentUser,
}: SoilInputFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<SoilInputValues>(initialValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingDevice, setIsFetchingDevice] = useState(false);
  const [isLinkingDevice, setIsLinkingDevice] = useState(false);
  const [isCheckingDeviceStatus, setIsCheckingDeviceStatus] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [linkedDeviceId, setLinkedDeviceId] = useState<string | null>(null);
  const [linkedDeviceName, setLinkedDeviceName] = useState<string | null>(null);
  const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false);
  const [deviceLinkError, setDeviceLinkError] = useState("");
  const [deviceLinkValues, setDeviceLinkValues] =
    useState<DeviceLinkFormValues>({
      deviceName: "",
      deviceId: "",
      deviceToken: "",
      targetFarmId: farm?.id ?? "",
    });
  const [deviceNotice, setDeviceNotice] = useState<DeviceNotice>({
    kind: "idle",
    message: "",
  });

  const farmLocation = farm?.location?.trim() ?? "";
  const hasFarmLocation = farmLocation.length > 0;
  const allNpkFilled =
    values.nitrogen.trim().length > 0 &&
    values.phosphorus.trim().length > 0 &&
    values.potassium.trim().length > 0;
  const anyNpkFilled =
    values.nitrogen.trim().length > 0 ||
    values.phosphorus.trim().length > 0 ||
    values.potassium.trim().length > 0;
  const isDeviceActionDisabled =
    isFetchingDevice ||
    isLinkingDevice ||
    isCheckingDeviceStatus ||
    !currentUser;
  const deviceActionLabel = linkedDeviceId
    ? "Get Data from Device"
    : "Connect Device";

  useEffect(() => {
    if (!farm?.id) {
      setValues(initialValues);
      setSubmitError("");
      setDeviceNotice({ kind: "idle", message: "" });
      return;
    }

    const cached = readSoilInputCache(farm.id);

    setValues(cached ?? initialValues);
    setSubmitError("");
    setDeviceNotice({ kind: "idle", message: "" });
  }, [farm?.id]);

  useEffect(() => {
    if (!farm?.id) {
      return;
    }

    writeSoilInputCache(farm.id, values);
  }, [farm?.id, values]);

  useEffect(() => {
    setDeviceLinkValues((previousValues) => ({
      ...previousValues,
      targetFarmId: farm?.id ?? "",
    }));
  }, [farm?.id]);

  async function refreshDeviceStatus(farmId: string) {
    if (!currentUser) {
      setLinkedDeviceId(null);
      setLinkedDeviceName(null);
      return null;
    }

    const response = await fetchJsonWithAuth(
      currentUser,
      `/api/farms/${farmId}/soil/device`,
    );
    const responseBody: unknown = await response.json().catch(() => null);

    if (!response.ok) {
      const errorCode = getResponseCode(responseBody);

      if (errorCode === "DEVICE_NOT_CONNECTED" || response.status === 404) {
        setLinkedDeviceId(null);
        setLinkedDeviceName(null);
        return null;
      }

      throw new Error(
        getResponseMessage(
          responseBody,
          "Unable to check linked device status.",
        ),
      );
    }

    const statusPayload = readDeviceStatusPayload(responseBody);

    setLinkedDeviceId(statusPayload?.device?.id?.trim() || null);
    setLinkedDeviceName(statusPayload?.device?.name?.trim() || null);

    return statusPayload;
  }

  useEffect(() => {
    let isCancelled = false;

    async function hydrateDeviceStatus() {
      if (!farm?.id || !currentUser) {
        setLinkedDeviceId(null);
        setLinkedDeviceName(null);
        return;
      }

      setIsCheckingDeviceStatus(true);

      try {
        await refreshDeviceStatus(farm.id);
      } catch (error) {
        if (!isCancelled) {
          setDeviceNotice({
            kind: "error",
            message:
              error instanceof Error
                ? error.message
                : "Unable to check linked device status.",
          });
        }
      } finally {
        if (!isCancelled) {
          setIsCheckingDeviceStatus(false);
        }
      }
    }

    hydrateDeviceStatus();

    return () => {
      isCancelled = true;
    };
  }, [farm?.id, currentUser]);

  function applyDeviceReadings(
    readings: NonNullable<DeviceStatusPayload["readings"]>,
  ) {
    setValues((previousValues) => ({
      ...previousValues,
      moistureContent:
        typeof readings.moistureContent === "number"
          ? String(readings.moistureContent)
          : previousValues.moistureContent,
      pH:
        typeof readings.pH === "number"
          ? String(readings.pH)
          : previousValues.pH,
      lightLevel:
        typeof readings.lightLevel === "number"
          ? String(readings.lightLevel)
          : previousValues.lightLevel,
      temperatureC:
        typeof readings.temperatureC === "number"
          ? String(readings.temperatureC)
          : previousValues.temperatureC,
      humidity:
        typeof readings.humidity === "number"
          ? String(readings.humidity)
          : previousValues.humidity,
    }));
  }

  function handleFieldChange(field: keyof SoilInputValues, value: string) {
    setValues((previousValues) => ({
      ...previousValues,
      [field]: value,
    }));
  }

  function handleDeviceLinkFieldChange(
    field: keyof DeviceLinkFormValues,
    value: string,
  ) {
    setDeviceLinkValues((previousValues) => ({
      ...previousValues,
      [field]: value,
    }));
  }

  function openDeviceLinkModal() {
    setDeviceLinkError("");
    setDeviceLinkValues((previousValues) => ({
      ...previousValues,
      targetFarmId: farm?.id ?? previousValues.targetFarmId,
    }));
    setIsDeviceModalOpen(true);
  }

  async function handleLinkDevice() {
    if (!currentUser) {
      setDeviceLinkError("Sign in before linking a device.");
      return;
    }

    if (!deviceLinkValues.targetFarmId.trim()) {
      setDeviceLinkError("Select a farm to link this device.");
      return;
    }

    if (!deviceLinkValues.deviceName.trim()) {
      setDeviceLinkError("Enter a device name.");
      return;
    }

    if (!deviceLinkValues.deviceId.trim()) {
      setDeviceLinkError("Enter a device ID.");
      return;
    }

    if (!deviceLinkValues.deviceToken.trim()) {
      setDeviceLinkError("Enter a device token.");
      return;
    }

    setIsLinkingDevice(true);
    setDeviceLinkError("");

    try {
      const response = await fetchJsonWithAuth(
        currentUser,
        `/api/farms/${deviceLinkValues.targetFarmId}/soil/device/link`,
        {
          method: "POST",
          body: JSON.stringify({
            deviceName: deviceLinkValues.deviceName.trim(),
            deviceId: deviceLinkValues.deviceId.trim(),
            deviceToken: deviceLinkValues.deviceToken.trim(),
          }),
        },
      );
      const responseBody: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          getResponseMessage(
            responseBody,
            "Unable to link this device right now.",
          ),
        );
      }

      if (farm?.id !== deviceLinkValues.targetFarmId) {
        onSelectFarm(deviceLinkValues.targetFarmId);
      }

      setIsDeviceModalOpen(false);
      setDeviceLinkValues((previousValues) => ({
        ...previousValues,
        deviceToken: "",
      }));
      setDeviceNotice({
        kind: "success",
        message:
          "Device linked successfully. Press Get Data from Device to request a fresh reading.",
      });

      await refreshDeviceStatus(deviceLinkValues.targetFarmId);
    } catch (error) {
      setDeviceLinkError(
        error instanceof Error
          ? error.message
          : "Unable to link this device right now.",
      );
    } finally {
      setIsLinkingDevice(false);
    }
  }

  async function handleDeviceSync() {
    if (!farm || !currentUser) {
      setDeviceNotice({
        kind: "error",
        message: "Sign in and select a farm before loading device readings.",
      });
      return;
    }

    setIsFetchingDevice(true);
    setSubmitError("");
    setDeviceNotice({ kind: "idle", message: "" });

    try {
      const currentDeviceStatus = await refreshDeviceStatus(farm.id);

      if (!currentDeviceStatus?.device?.id) {
        openDeviceLinkModal();
        setDeviceNotice({
          kind: "info",
          message:
            "No linked device found for this farm. Connect a device first.",
        });
        return;
      }

      const requestResponse = await fetchJsonWithAuth(
        currentUser,
        `/api/farms/${farm.id}/soil/device/request`,
        { method: "POST" },
      );
      const requestBody: unknown = await requestResponse
        .json()
        .catch(() => null);

      if (!requestResponse.ok) {
        throw new Error(
          getResponseMessage(
            requestBody,
            "Unable to trigger the linked device right now.",
          ),
        );
      }

      setDeviceNotice({
        kind: "info",
        message:
          "Reading request sent. Waiting for the device to upload fresh sensor data...",
      });

      let latestStatus: DeviceStatusPayload | null = null;

      for (let attempt = 0; attempt < 12; attempt += 1) {
        await waitFor(2500);

        const nextStatus = await refreshDeviceStatus(farm.id);

        if (nextStatus?.readings && nextStatus.activation?.pending !== true) {
          latestStatus = nextStatus;
          break;
        }
      }

      if (!latestStatus?.readings) {
        setDeviceNotice({
          kind: "info",
          message:
            "Device request is still pending. Keep the ESP32 powered on and press Get Data from Device again shortly.",
        });
        return;
      }

      applyDeviceReadings(latestStatus.readings);
      setDeviceNotice({
        kind: "success",
        message:
          "Device readings loaded. Soil pH remains manual unless your device sends pH.",
        collectedAt: latestStatus.collectedAt ?? null,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to fetch device readings right now.";

      setDeviceNotice({
        kind: "error",
        message,
      });
    } finally {
      setIsFetchingDevice(false);
    }
  }

  async function handleSubmit() {
    if (!farm) {
      setSubmitError("Select a farm before saving soil analysis.");
      return;
    }

    if (!currentUser) {
      setSubmitError("Sign in before saving soil analysis.");
      return;
    }

    if (!hasFarmLocation) {
      setSubmitError(
        "The selected farm needs a saved location before analysis can run.",
      );
      return;
    }

    if (anyNpkFilled && !allNpkFilled) {
      setSubmitError(
        "Fill in all NPK fields together, or leave all three blank.",
      );
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const requestBody: Record<string, number> = {};

      if (allNpkFilled) {
        requestBody.nitrogen = parseOptionalNumber(values.nitrogen) ?? 0;
        requestBody.phosphorus = parseOptionalNumber(values.phosphorus) ?? 0;
        requestBody.potassium = parseOptionalNumber(values.potassium) ?? 0;
      }

      const moistureContent = parseOptionalNumber(values.moistureContent);
      const pH = parseOptionalNumber(values.pH);
      const lightLevel = parseOptionalNumber(values.lightLevel);
      const temperatureC = parseOptionalNumber(values.temperatureC);
      const humidity = parseOptionalNumber(values.humidity);

      if (moistureContent !== undefined) {
        requestBody.moistureContent = moistureContent;
      }

      if (pH !== undefined) {
        requestBody.pH = pH;
      }

      if (lightLevel !== undefined) {
        requestBody.lightLevel = lightLevel;
      }

      if (temperatureC !== undefined) {
        requestBody.temperatureC = temperatureC;
      }

      if (humidity !== undefined) {
        requestBody.humidity = humidity;
      }

      const response = await fetchJsonWithAuth(
        currentUser,
        `/api/farms/${farm.id}/soil/analyze`,
        {
          method: "POST",
          body: JSON.stringify(requestBody),
        },
      );
      const responseBody: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          getResponseMessage(
            responseBody,
            "Unable to analyze the selected farm right now.",
          ),
        );
      }

      const recommendationPayload = {
        ...(values.landSize.trim() ? { landSize: values.landSize.trim() } : {}),
        ...(values.plantingDuration.trim()
          ? { plantingDuration: values.plantingDuration.trim() }
          : {}),
        ...(values.goal.trim() ? { goal: values.goal.trim() } : {}),
        ...(values.budget.trim() ? { budget: values.budget.trim() } : {}),
      };
      const hasPersonalizationInput =
        Object.keys(recommendationPayload).length > 0;

      const recommendationResponse = await fetchJsonWithAuth(
        currentUser,
        `/api/farms/${farm.id}/recommendations/generate`,
        {
          method: "POST",
          body: JSON.stringify(recommendationPayload),
        },
      );
      const recommendationBody: unknown = await recommendationResponse
        .json()
        .catch(() => null);

      if (!recommendationResponse.ok) {
        throw new Error(
          getResponseMessage(
            recommendationBody,
            "Unable to generate crop recommendation right now.",
          ),
        );
      }

      if (hasPersonalizationInput) {
        const personalizeResponse = await fetchJsonWithAuth(
          currentUser,
          `/api/farms/${farm.id}/recommendations/personalize`,
          {
            method: "POST",
            body: JSON.stringify(recommendationPayload),
          },
        );
        const personalizeBody: unknown = await personalizeResponse
          .json()
          .catch(() => null);

        if (!personalizeResponse.ok) {
          throw new Error(
            getResponseMessage(
              personalizeBody,
              "Unable to personalize recommendations right now.",
            ),
          );
        }
      }

      router.push(`/recommendations?farmId=${farm.id}`);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to analyze the selected farm right now.";
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!farm) {
    return (
      <div className="flex flex-col items-start rounded-[48px] border border-solid border-[#C0C9BB1A] bg-white px-10 pb-14 pt-10">
        <div className="w-full rounded-4xl border border-dashed border-[#C0C9BB] bg-[#F7FAF2] px-6 py-8 text-[#41493E]">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#00450D]">
            Select a farm
          </p>
          <p className="mt-3 text-sm leading-6">
            Choose a farm from the dropdown above to lock the location and load
            the soil analysis fields.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col items-start rounded-[48px] border border-solid border-[#C0C9BB1A] bg-white px-10 pb-14 pt-10">
        <div className="w-full space-y-10">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <label className="text-sm font-semibold text-[#171D14]">
                Location
              </label>
              <span className="rounded-full bg-[#00450D]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#00450D]">
                System locked
              </span>
            </div>
            <div className="rounded-[20px] border border-[#C0C9BB] bg-[#F1F5EB] px-4 py-3">
              <input
                type="text"
                readOnly
                disabled
                value={farmLocation}
                placeholder="Farm location is not set yet"
                className="w-full bg-transparent text-sm font-semibold text-[#41493E] outline-none placeholder:text-[#41493E]/50 disabled:cursor-not-allowed"
              />
            </div>
            <p className="text-xs leading-5 text-[#41493E]">
              The farm location is read-only and comes from the currently
              selected farm.
            </p>
            {!hasFarmLocation && (
              <p className="text-xs font-semibold text-[#9C4A00]">
                Set a location on this farm before running soil analysis.
              </p>
            )}
          </div>
          <div className="border-t border-[#C0C9BB1A] pt-6">
            <div className="flex items-center gap-3">
              <Clover className="h-[18px] w-[18px] text-[#003E63]"/>
              <span className="text-sm font-bold tracking-[1.40px] text-[#171D14]">
                PLANTING PLAN INPUTS
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {planningFields.map((field) => (
                <div key={field.id} className="flex flex-col gap-2">
                  <label className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#41493E]">
                    {field.label}
                  </label>
                  <input
                    type="text"
                    name={field.name}
                    value={values[field.name]}
                    onChange={(event) =>
                      handleFieldChange(field.name, event.target.value)
                    }
                    placeholder={field.placeholder}
                    className="flex-1 rounded-md bg-[#E3EBDC] px-4 py-3 text-sm font-normal text-[#41493E] outline-none placeholder:text-[#7B8776]"
                  />
                </div>
              ))}

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#41493E]">
                  Budget
                </label>
                <select
                  name="budget"
                  value={values.budget}
                  onChange={(event) =>
                    handleFieldChange("budget", event.target.value)
                  }
                  className="flex-1 rounded-md bg-[#E3EBDC] px-4 py-3 text-sm font-normal text-[#41493E] outline-none"
                >
                  <option value="">Select budget level</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
          </div>

          <div className="border-t border-[#C0C9BB1A] pt-6">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || !currentUser || !hasFarmLocation}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#00450D] px-4 py-2.5 sm:py-4 text-xs sm:text-base shadow-[0px_8px_10px_-6px_#00450D33,0px_20px_25px_-5px_#00450D33] transition-colors hover:bg-[#005610] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Search className="h-3.5 w-3.5 sm:h-5 sm:w-5 shrink-0 text-[#FFFFFF]"/>
              <span className="text-center leading-tight whitespace-nowrap font-semibold text-white">
                {isSubmitting ? "Analyzing Soil..." : "Get Crop Recommendation"}
              </span>
            </button>

            {submitError && (
              <p className="mt-4 text-sm font-semibold text-[#9C4A00]">
                {submitError}
              </p>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-[#C0C9BB1A]" />
            <span className="rounded-full bg-[#00450D]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#00450D]">
              Optional
            </span>
            <div className="h-px flex-1 bg-[#C0C9BB1A]" />
          </div>

          <div className="border-t border-[#C0C9BB1A] pt-6">
            <details className="group">
              <summary className="flex cursor-pointer items-center justify-between gap-4 list-none">
                <span className="text-sm font-bold tracking-[1.40px] text-[#171D14]">
                  CHEMICAL COMPOSITION
                </span>
                <span className="text-xl font-semibold text-[#00450D] transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>

              <div className="mt-6 flex flex-col gap-4 md:gap-6">
                <div className="flex items-center gap-3">
                  <FlaskRound className="h-[18px] w-[18px] text-[#41493E]"/>
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#41493E]">
                    NPK inputs
                  </span>
                </div>

                {npkFields.map((field) => (
                  <div key={field.id} className="flex flex-col gap-2">
                    <label className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#41493E]">
                      {field.label}
                    </label>
                    <input
                      type="number"
                      name={field.name}
                      value={values[field.name]}
                      onChange={(event) =>
                        handleFieldChange(field.name, event.target.value)
                      }
                      placeholder={field.placeholder}
                      className="flex-1 rounded-md bg-[#E3EBDC] px-4 py-3 text-sm font-normal text-[#41493E] outline-none placeholder:text-[#7B8776]"
                    />
                  </div>
                ))}
              </div>
            </details>
          </div>

          <div className="border-t border-[#C0C9BB1A] pt-6">
            <details className="group">
              <summary className="flex cursor-pointer items-center justify-between gap-4 list-none">
                <span className="text-sm font-bold tracking-[1.40px] text-[#171D14]">
                  ENVIRONMENTAL READINGS
                </span>
                <span className="text-xl font-semibold text-[#00450D] transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>

              <div className="mt-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Droplet className="h-[18px] w-[18px] text-[#00450D]"/>
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#41493E]">
                        Sensor inputs
                      </span>
                      <span className="text-[11px] font-semibold text-[#41493E]">
                        {linkedDeviceId
                          ? `Connected: ${linkedDeviceName ?? linkedDeviceId}`
                          : "No linked device"}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleDeviceSync}
                    disabled={isDeviceActionDisabled}
                    className="inline-flex items-center gap-2 rounded-full bg-[#00450D] px-4 py-2 text-sm font-semibold text-white shadow-[0px_8px_10px_-6px_#00450D33,0px_20px_25px_-5px_#00450D33] transition-colors hover:bg-[#005610] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isFetchingDevice ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Requesting device data
                      </>
                    ) : isCheckingDeviceStatus ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Checking device
                      </>
                    ) : (
                      deviceActionLabel
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {environmentalFields.map((field) => (
                    <div key={field.id} className="flex flex-col gap-2">
                      <label className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#41493E]">
                        {field.label}
                      </label>
                      <input
                        type="number"
                        name={field.name}
                        value={values[field.name]}
                        onChange={(event) =>
                          handleFieldChange(field.name, event.target.value)
                        }
                        placeholder={field.placeholder}
                        className="flex-1 rounded-md bg-[#E3EBDC] px-4 py-3 text-sm font-normal text-[#41493E] outline-none placeholder:text-[#7B8776]"
                      />
                    </div>
                  ))}
                </div>

                {deviceNotice.kind !== "idle" && deviceNotice.message && (
                  <p
                    className={`mt-4 text-xs font-semibold ${
                      deviceNotice.kind === "error"
                        ? "text-[#9C4A00]"
                        : deviceNotice.kind === "success"
                          ? "text-[#00450D]"
                          : "text-[#003E63]"
                    }`}
                  >
                    {deviceNotice.message}
                    {deviceNotice.collectedAt
                      ? ` Last synced ${formatSyncTimestamp(deviceNotice.collectedAt)}.`
                      : ""}
                  </p>
                )}

                {!linkedDeviceId && (
                  <p className="mt-3 text-xs font-semibold text-[#003E63]">
                    No device is linked to this farm yet. Use Connect Device to
                    pair a sensor node.
                  </p>
                )}
              </div>
            </details>
          </div>

          <div className="border-t border-[#C0C9BB1A] pt-6">
            <p className="text-xs leading-5 text-[#41493E]">
              Environmental readings and soil chemistry are optional. Device
              import currently includes moisture, light, temperature, and
              humidity. Soil pH remains manually editable unless a connected
              device sends it.
            </p>
          </div>

          <div className="border-t border-[#C0C9BB1A] pt-6">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || !currentUser || !hasFarmLocation}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[#00450D] px-4 py-2.5 sm:py-4 text-xs sm:text-base font-semibold text-white hover:bg-[#005610] disabled:opacity-60"
            >
              <Search className="h-3.5 w-3.5 sm:h-5 sm:w-5 shrink-0 text-[#FFFFFF]" />
              <span className="text-center leading-tight whitespace-nowrap">
                {isSubmitting ? "Analyzing Soil..." : "Get Crop Recommendation"}
              </span>
            </button>

            {submitError && (
              <p className="mt-4 text-sm font-semibold text-[#9C4A00]">
                {submitError}
              </p>
            )}
          </div>
        </div>
      </div>

      {isDeviceModalOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40"
            onClick={() => {
              if (!isLinkingDevice) {
                setIsDeviceModalOpen(false);
              }
            }}
          />

          <div className="fixed left-1/2 top-1/2 z-50 w-140 max-w-[92vw] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-bold text-[#00450D]">
                Connect Farm Device
              </h2>
              <button
                type="button"
                onClick={() => setIsDeviceModalOpen(false)}
                disabled={isLinkingDevice}
                className="text-2xl font-semibold leading-none text-[#41493E]/70 hover:text-[#41493E] disabled:cursor-not-allowed disabled:opacity-60"
              >
                x
              </button>
            </div>

            <p className="mt-2 text-sm text-[#41493E]">
              Save the pairing details for this farm. The app stores link
              settings for ownership and activation, not hardware internals.
            </p>

            <div className="mt-5 grid gap-4">
              <div className="grid gap-2">
                <label className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#41493E]">
                  Target farm
                </label>
                <select
                  value={deviceLinkValues.targetFarmId}
                  onChange={(event) =>
                    handleDeviceLinkFieldChange(
                      "targetFarmId",
                      event.target.value,
                    )
                  }
                  className="w-full rounded-xl border border-[#C0C9BB] bg-[#F5F9EF] px-4 py-3 text-sm text-[#41493E] outline-none"
                >
                  <option value="">Select a farm</option>
                  {farms.map((farmOption) => (
                    <option key={farmOption.id} value={farmOption.id}>
                      {farmOption.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-2">
                <label className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#41493E]">
                  Device name
                </label>
                <input
                  type="text"
                  value={deviceLinkValues.deviceName}
                  onChange={(event) =>
                    handleDeviceLinkFieldChange(
                      "deviceName",
                      event.target.value,
                    )
                  }
                  placeholder="e.g., Greenhouse Node 01"
                  className="w-full rounded-xl border border-[#C0C9BB] bg-[#F5F9EF] px-4 py-3 text-sm text-[#41493E] outline-none placeholder:text-[#7B8776]"
                />
              </div>

              <div className="grid gap-2">
                <label className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#41493E]">
                  Device ID
                </label>
                <input
                  type="text"
                  value={deviceLinkValues.deviceId}
                  onChange={(event) =>
                    handleDeviceLinkFieldChange("deviceId", event.target.value)
                  }
                  placeholder="e.g., esp32-soil-node-001"
                  className="w-full rounded-xl border border-[#C0C9BB] bg-[#F5F9EF] px-4 py-3 text-sm text-[#41493E] outline-none placeholder:text-[#7B8776]"
                />
              </div>

              <div className="grid gap-2">
                <label className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#41493E]">
                  Device token
                </label>
                <input
                  type="password"
                  value={deviceLinkValues.deviceToken}
                  onChange={(event) =>
                    handleDeviceLinkFieldChange(
                      "deviceToken",
                      event.target.value,
                    )
                  }
                  placeholder="Pairing token"
                  className="w-full rounded-xl border border-[#C0C9BB] bg-[#F5F9EF] px-4 py-3 text-sm text-[#41493E] outline-none placeholder:text-[#7B8776]"
                />
              </div>
            </div>

            {deviceLinkError && (
              <p className="mt-4 text-sm font-semibold text-[#9C4A00]">
                {deviceLinkError}
              </p>
            )}

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setIsDeviceModalOpen(false)}
                disabled={isLinkingDevice}
                className="flex-1 rounded-full border border-[#C0C9BB] px-4 py-3 text-sm font-semibold text-[#41493E] transition hover:bg-[#F5F9EF] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLinkDevice}
                disabled={isLinkingDevice}
                className="flex-1 rounded-full bg-[#00450D] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#005610] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLinkingDevice ? "Linking device..." : "Connect device"}
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
