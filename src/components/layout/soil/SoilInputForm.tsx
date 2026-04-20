"use client";

import { useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { useRouter } from "next/navigation";

type FarmOption = {
	id: string;
	name: string;
	location: string | null;
	isActive: boolean;
};

type SoilInputFormProps = {
	farm: FarmOption | null;
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
};

type DeviceNotice = {
	kind: "idle" | "info" | "success" | "error";
	message: string;
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
};

const npkFields = [
	{ id: "nitrogen", label: "Nitrogen (N)", name: "nitrogen" as const, placeholder: "mg/kg" },
	{ id: "phosphorus", label: "Phosphorus (P)", name: "phosphorus" as const, placeholder: "mg/kg" },
	{ id: "potassium", label: "Potassium (K)", name: "potassium" as const, placeholder: "mg/kg" },
];

const environmentalFields = [
	{ id: "moistureContent", label: "Soil Moisture", name: "moistureContent" as const, placeholder: "%" },
	{ id: "pH", label: "Soil pH", name: "pH" as const, placeholder: "pH" },
	{ id: "lightLevel", label: "Light Level", name: "lightLevel" as const, placeholder: "lux" },
	{ id: "temperatureC", label: "Temperature", name: "temperatureC" as const, placeholder: "°C" },
	{ id: "humidity", label: "Humidity", name: "humidity" as const, placeholder: "%" },
];

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
	if (
		typeof body !== "object" ||
		body === null ||
		!("error" in body)
	) {
		return fallbackMessage;
	}

	const errorObject = (body as { error?: { message?: unknown } }).error;

	if (errorObject && typeof errorObject.message === "string") {
		return errorObject.message;
	}

	return fallbackMessage;
}

function getResponseCode(body: unknown) {
	if (
		typeof body !== "object" ||
		body === null ||
		!("error" in body)
	) {
		return "";
	}

	const errorObject = (body as { error?: { code?: unknown } }).error;

	return typeof errorObject?.code === "string" ? errorObject.code : "";
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
	currentUser,
}: SoilInputFormProps) {
	const router = useRouter();
	const [values, setValues] = useState<SoilInputValues>(initialValues);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isFetchingDevice, setIsFetchingDevice] = useState(false);
	const [submitError, setSubmitError] = useState("");
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

	useEffect(() => {
		setValues(initialValues);
		setSubmitError("");
		setDeviceNotice({ kind: "idle", message: "" });
	}, [farm?.id]);

	function handleFieldChange(field: keyof SoilInputValues, value: string) {
		setValues((previousValues) => ({
			...previousValues,
			[field]: value,
		}));
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
			const response = await fetchJsonWithAuth(
				currentUser,
				`/api/farms/${farm.id}/soil/device`,
			);
			const responseBody: unknown = await response.json().catch(() => null);

			if (!response.ok) {
				const errorCode = getResponseCode(responseBody);

				if (errorCode === "DEVICE_NOT_CONNECTED" || response.status === 404) {
					setDeviceNotice({
						kind: "info",
						message:
							"No device is linked to this farm yet. You can continue with manual entries.",
					});
					return;
				}

				throw new Error(
					getResponseMessage(
						responseBody,
						"Unable to fetch device readings right now.",
					),
				);
			}

			const data =
				typeof responseBody === "object" &&
				responseBody !== null &&
				"data" in responseBody
					? ((responseBody as {
						data?: {
							readings?: {
								moistureContent?: number;
								pH?: number;
								lightLevel?: number;
								temperatureC?: number;
								humidity?: number;
							};
							collectedAt?: string | null;
						};
					}).data ?? null)
					: null;

			if (!data?.readings) {
				throw new Error("Device response did not include readings.");
			}

			const readings = data.readings;

			setValues((previousValues) => ({
				...previousValues,
				moistureContent:
					typeof readings.moistureContent === "number"
						? String(readings.moistureContent)
						: "",
				pH: typeof readings.pH === "number" ? String(readings.pH) : "",
				lightLevel:
					typeof readings.lightLevel === "number"
						? String(readings.lightLevel)
						: "",
				temperatureC:
					typeof readings.temperatureC === "number"
						? String(readings.temperatureC)
						: "",
				humidity:
					typeof readings.humidity === "number"
						? String(readings.humidity)
						: "",
			}));

			setDeviceNotice({
				kind: "success",
				message: "Device readings loaded for the selected farm.",
				collectedAt: data.collectedAt ?? null,
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
			setSubmitError("The selected farm needs a saved location before analysis can run.");
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

			const response = await fetchJsonWithAuth(currentUser, `/api/farms/${farm.id}/soil/analyze`, {
				method: "POST",
				body: JSON.stringify(requestBody),
			});
			const responseBody: unknown = await response.json().catch(() => null);

			if (!response.ok) {
				throw new Error(
					getResponseMessage(
						responseBody,
						"Unable to analyze the selected farm right now.",
					),
				);
			}

			const recommendationResponse = await fetchJsonWithAuth(
				currentUser,
				`/api/farms/${farm.id}/recommendations/generate`,
				{
					method: "POST",
					body: JSON.stringify({}),
				},
			);
			const recommendationBody: unknown = await recommendationResponse.json().catch(
				() => null,
			);

			if (!recommendationResponse.ok) {
				throw new Error(
					getResponseMessage(
						recommendationBody,
						"Unable to generate crop recommendation right now.",
					),
				);
			}

			router.push(`/recommendations?farmId=${farm.id}`);
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Unable to analyze the selected farm right now.";
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
						Choose a farm from the dropdown above to lock the location and load the soil analysis fields.
					</p>
				</div>
			</div>
		);
	}

	return (
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
						The farm location is read-only and comes from the currently selected farm.
					</p>
					{!hasFarmLocation && (
						<p className="text-xs font-semibold text-[#9C4A00]">
							Set a location on this farm before running soil analysis.
						</p>
					)}
				</div>

				<div className="border-t border-[#C0C9BB1A] pt-6">
					<button
						type="button"
						onClick={handleSubmit}
						disabled={isSubmitting || !currentUser || !hasFarmLocation}
						className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-full bg-[#00450D] py-5 shadow-[0px_8px_10px_-6px_#00450D33,0px_20px_25px_-5px_#00450D33] transition-colors hover:bg-[#005610] disabled:cursor-not-allowed disabled:opacity-60"
					>
						<img
							src="/soil/analyze.svg"
							alt="Analyze"
							className="h-4.5 w-4.5"
						/>
						<span className="text-base font-semibold text-white">
							{isSubmitting ? "Analyzing Soil..." : "Get Crop Reccomendation"}
						</span>
					</button>

					{submitError && (
						<p className="mt-4 text-sm font-semibold text-[#9C4A00]">{submitError}</p>
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
					<div className="flex items-center justify-between gap-4">
						<div className="flex items-center gap-3">
							<img
								src="/soil/chemical-comp.svg"
								alt="NPK"
								className="h-[13.5px] w-[13.54px]"
							/>
							<span className="text-sm font-bold tracking-[1.40px] text-[#171D14]">
								CHEMICAL COMPOSITION (NPK)
							</span>
						</div>
					</div>

					<div className="mt-6 flex flex-col gap-6">
						{npkFields.map((field) => (
							<div key={field.id} className="flex flex-col gap-2">
								<label className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#41493E]">
									{field.label}
								</label>
								<input
									type="number"
									name={field.name}
									value={values[field.name]}
									onChange={(event) => handleFieldChange(field.name, event.target.value)}
									placeholder={field.placeholder}
									className="flex-1 rounded-md bg-[#E3EBDC] px-4 py-3 text-sm font-normal text-[#41493E] outline-none placeholder:text-[#7B8776]"
								/>
							</div>
						))}
					</div>
				</div>

				<div className="border-t border-[#C0C9BB1A] pt-6">
					<div className="flex items-center justify-between gap-4">
						<div className="flex items-center gap-3">
							<img
								src="/soil/moisture.svg"
								alt="Sensor"
								className="h-[13.5px] w-[13.54px]"
							/>
							<span className="text-sm font-bold tracking-[1.40px] text-[#171D14]">
								ENVIRONMENTAL READINGS
							</span>
						</div>
						<button
							type="button"
							onClick={handleDeviceSync}
							disabled={isFetchingDevice || !currentUser}
							className="inline-flex items-center gap-2 rounded-full bg-[#00450D] px-4 py-2 text-sm font-semibold text-white shadow-[0px_8px_10px_-6px_#00450D33,0px_20px_25px_-5px_#00450D33] transition-colors hover:bg-[#005610] disabled:cursor-not-allowed disabled:opacity-60"
						>
							{isFetchingDevice ? (
								<>
									<span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
									Fetching device data
								</>
							) : (
								"Get Data from Device"
							)}
						</button>
					</div>

					<div className="mt-6 grid gap-5">
						{environmentalFields.map((field) => (
							<div key={field.id} className="flex flex-col gap-2">
								<label className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#41493E]">
									{field.label}
								</label>
								<input
									type="number"
									name={field.name}
									value={values[field.name]}
									onChange={(event) => handleFieldChange(field.name, event.target.value)}
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
							{deviceNotice.collectedAt ? ` Last synced ${formatSyncTimestamp(deviceNotice.collectedAt)}.` : ""}
						</p>
					)}
				</div>

				<div className="border-t border-[#C0C9BB1A] pt-6">
					<p className="text-xs leading-5 text-[#41493E]">
						Environmental readings and soil chemistry are optional. Use the device button for a quick import, or enter values manually below.
					</p>
				</div>

				<div className="border-t border-[#C0C9BB1A] pt-6">
					<button
						type="button"
						onClick={handleSubmit}
						disabled={isSubmitting || !currentUser || !hasFarmLocation}
						className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-full bg-[#00450D] py-5 shadow-[0px_8px_10px_-6px_#00450D33,0px_20px_25px_-5px_#00450D33] transition-colors hover:bg-[#005610] disabled:cursor-not-allowed disabled:opacity-60"
					>
						<img
							src="/soil/analyze.svg"
							alt="Analyze"
							className="h-4.5 w-4.5"
						/>
						<span className="text-base font-semibold text-white">
							{isSubmitting ? "Analyzing Soil..." : "Get Crop Reccomendation"}
						</span>
					</button>

					{submitError && (
						<p className="mt-4 text-sm font-semibold text-[#9C4A00]">{submitError}</p>
					)}
				</div>
			</div>
		</div>
	);
}