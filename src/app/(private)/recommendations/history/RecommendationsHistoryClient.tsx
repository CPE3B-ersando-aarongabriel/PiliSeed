"use client";

import { useEffect, useMemo, useState } from "react";
import type { User } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import QuickNavigation from "@/components/layout/QuickNavigation";
import { getClientAuth } from "@/lib/firebaseClient";
import {
	groupRecommendationsBySession,
	type RecommendationSession,
	type RecommendationSessionRecord,
} from "@/lib/recommendationSessions";
import { ChevronDown } from "lucide-react";

type FarmOption = {
	id: string;
	name: string;
	location: string | null;
	isActive: boolean;
};

type CropRecommendationRecord = RecommendationSessionRecord & {
	sessionId: string;
	sessionStartedAt: string | null;
};

type RecommendationsPayload = {
	farmId: string;
	recommendations: CropRecommendationRecord[];
	count: number;
	limit: number;
};

function getErrorMessage(body: unknown, fallbackMessage: string) {
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

function formatDateTime(value: string | null) {
	if (!value) {
		return "Unknown time";
	}

	const parsedDate = new Date(value);

	if (Number.isNaN(parsedDate.getTime())) {
		return "Unknown time";
	}

	return parsedDate.toLocaleString();
}

function getSelectedCropStorageKey(farmId: string, sessionId: string) {
	return `piliSeed.selectedCrop.${farmId}.${sessionId}`;
}

function readSelectedCrop(farmId: string, sessionId: string) {
	if (typeof window === "undefined") {
		return null;
	}

	return window.localStorage.getItem(getSelectedCropStorageKey(farmId, sessionId));
}

export default function RecommendationsHistoryClient() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const selectedFarmIdFromQuery = searchParams.get("farmId") ?? "";
	const selectedSessionIdFromQuery = searchParams.get("sessionId") ?? "";

	const [currentUser, setCurrentUser] = useState<User | null>(null);
	const [farms, setFarms] = useState<FarmOption[]>([]);
	const [selectedFarmId, setSelectedFarmId] = useState("");
	const [recommendations, setRecommendations] = useState<CropRecommendationRecord[]>([]);
	const [isFarmDropdownOpen, setIsFarmDropdownOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [farmError, setFarmError] = useState("");
	const [dataError, setDataError] = useState("");

	useEffect(() => {
		const auth = getClientAuth();

		const unsubscribe = onAuthStateChanged(auth, async (user) => {
			setCurrentUser(user);

			if (!user) {
				setFarmError("Sign in to load recommendation history.");
				setIsLoading(false);
				return;
			}

			try {
				setFarmError("");
				setDataError("");
				const token = await user.getIdToken();
				const farmsResponse = await fetch("/api/farms", {
					headers: { Authorization: `Bearer ${token}` },
				});
				const farmsBody: unknown = await farmsResponse.json().catch(() => null);

				if (!farmsResponse.ok) {
					throw new Error(getErrorMessage(farmsBody, "Unable to load farms right now."));
				}

				const farmList =
					typeof farmsBody === "object" &&
					farmsBody !== null &&
					"data" in farmsBody &&
					typeof (farmsBody as { data?: unknown }).data === "object"
						? (((farmsBody as { data?: { farms?: FarmOption[] } }).data?.farms ?? []) as FarmOption[])
						: [];

				setFarms(farmList);

				const nextSelectedFarmId =
					selectedFarmIdFromQuery && farmList.some((farm) => farm.id === selectedFarmIdFromQuery)
						? selectedFarmIdFromQuery
						: farmList.find((farm) => farm.isActive)?.id ?? farmList[0]?.id ?? "";

				setSelectedFarmId(nextSelectedFarmId);

				if (!nextSelectedFarmId) {
					setIsLoading(false);
					return;
				}

				setIsLoading(true);

				const recommendationsResponse = await fetch(
					`/api/farms/${nextSelectedFarmId}/recommendations?limit=100`,
					{ headers: { Authorization: `Bearer ${token}` } },
				);
				const recommendationsBody: unknown = await recommendationsResponse.json().catch(() => null);

				if (!recommendationsResponse.ok) {
					throw new Error(
						getErrorMessage(
							recommendationsBody,
							"Unable to load recommendation history right now.",
						),
					);
				}

				const recommendationList =
					typeof recommendationsBody === "object" &&
					recommendationsBody !== null &&
					"data" in recommendationsBody &&
					typeof (recommendationsBody as { data?: unknown }).data === "object"
						? (((recommendationsBody as { data?: RecommendationsPayload }).data?.recommendations ?? []) as CropRecommendationRecord[])
						: [];

				setRecommendations(recommendationList);
			} catch (error) {
				const message =
					error instanceof Error ? error.message : "Unable to load recommendation history right now.";
				setDataError(message);
			} finally {
				setIsLoading(false);
			}
		});

		return () => unsubscribe();
	}, [selectedFarmIdFromQuery]);

	useEffect(() => {
		if (selectedFarmIdFromQuery) {
			setSelectedFarmId(selectedFarmIdFromQuery);
		}
	}, [selectedFarmIdFromQuery]);

	const selectedFarm = farms.find((farm) => farm.id === selectedFarmId) ?? null;
	const recommendationSessions = useMemo(
		() => groupRecommendationsBySession(recommendations),
		[recommendations],
	);
	const selectedSession: RecommendationSession | null = useMemo(() => {
		if (!recommendationSessions.length) {
			return null;
		}

		if (selectedSessionIdFromQuery) {
			return (
				recommendationSessions.find(
					(session) => session.sessionId === selectedSessionIdFromQuery,
				) ?? recommendationSessions[0]
			);
		}

		return recommendationSessions[0];
	}, [recommendationSessions, selectedSessionIdFromQuery]);
	const selectedSessionRecommendations = selectedSession?.records ?? [];
	const selectedCrop = selectedFarm && selectedSession
		? readSelectedCrop(selectedFarm.id, selectedSession.sessionId) ?? selectedSessionRecommendations[0]?.recommendedCrops[0]?.crop ?? null
		: null;

	function handleFarmChange(farmId: string) {
		setSelectedFarmId(farmId);
		setIsFarmDropdownOpen(false);
		router.push(`/recommendations/history?farmId=${farmId}`);
	}

	return (
		<div className="min-h-screen bg-[#EFF6E7]">
			<main className="max-w-300 mx-auto px-4 sm:px-6 py-6 sm:py-8">
				<div className="mb-8 sm:mb-10 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
					<div className="max-w-2xl space-y-4">
						<h1 className="text-3xl sm:text-4xl lg:text-5xl leading-tight font-extrabold text-[#171d14]">
							Crop Recommendation History
						</h1>
						<p className="text-sm sm:text-base text-[#41493e]">
							Each recommendation run is grouped into its own session so old parameter inputs stay viewable without mixing into the current result.
						</p>
					</div>

					<div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
						<div className="flex flex-col min-w-0 flex-1 sm:flex-none">
							<label className="text-[10px] font-semibold text-[#41493E] tracking-widest mb-1.5">
								SELECTED FARM
							</label>
							<div className="relative">
								<button
									onClick={() => setIsFarmDropdownOpen((previousValue) => !previousValue)}
									disabled={isLoading || farms.length === 0}
									className="w-full sm:w-55 h-10 bg-white rounded-full shadow-sm flex items-center justify-between px-5 border border-gray-200 disabled:cursor-not-allowed disabled:opacity-70"
								>
									<span className="flex-1 min-w-0 pr-2 font-semibold text-[#00450D] text-sm truncate text-left">
										{selectedFarm?.name ?? (isLoading ? "Loading farms..." : "Select a farm")}
									</span>
									<ChevronDown className="w-5 h-5 text-[#6B7280]" />
								</button>

								{isFarmDropdownOpen && farms.length > 0 && (
									<>
										<div className="fixed inset-0 z-40" onClick={() => setIsFarmDropdownOpen(false)} />
										<div className="absolute left-0 mt-2 w-full sm:w-55 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">
											{farms.map((farm) => (
												<button
													key={farm.id}
													onClick={() => handleFarmChange(farm.id)}
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
								<p className="mt-2 text-xs font-semibold text-[#9C4A00]">{farmError}</p>
							)}
						</div>

					</div>
				</div>

				{dataError && (
					<div className="mb-8 rounded-2xl border border-[#FDCDBC] bg-[#fff7f3] px-5 py-4 text-sm font-semibold text-[#9C4A00]">
						{dataError}
					</div>
				)}

				{isLoading ? (
					<div className="rounded-4xl border border-[#C0C9BB1A] bg-white px-6 py-10 text-[#41493E]">
						Loading recommendation history...
					</div>
				) : recommendationSessions.length === 0 ? (
					<div className="rounded-4xl border border-[#C0C9BB1A] bg-white px-6 py-10 text-[#41493E]">
						No recommendation sessions have been created for this farm yet.
					</div>
				) : (
					<div className="grid grid-cols-1 gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
						<div className="space-y-4">
							{recommendationSessions.map((session) => {
								const firstCrop = session.latestRecord.recommendedCrops[0]?.crop ?? "Mixed crops";
								const selectedCropForSession = readSelectedCrop(selectedFarmId, session.sessionId) ?? firstCrop;

								return (
									<Link
										key={session.sessionId}
										href={`/history?farmId=${selectedFarmId}&sessionId=${session.sessionId}`}
										className={`block rounded-3xl border px-5 py-4 transition-colors ${
											session.sessionId === selectedSession?.sessionId
												? "border-[#00450D] bg-white"
												: "border-[#C0C9BB1A] bg-white/80 hover:border-[#00450D]/40"
										}`}
									>
										<p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#00450D]">
											Session {formatDateTime(session.sessionCreatedAt)}
										</p>
										<h3 className="mt-2 text-lg font-bold text-[#171D14]">{firstCrop}</h3>
										<p className="mt-2 text-sm text-[#41493E]">
											{session.records.length} recommendation record{session.records.length === 1 ? "" : "s"}
										</p>
										<p className="mt-2 text-sm font-semibold text-[#00450D]">
											Selected crop: {selectedCropForSession}
										</p>
									</Link>
								);
							})}
						</div>

						<div className="rounded-[48px] bg-white p-6 sm:p-8 shadow-[0px_25px_50px_-12px_#00000020]">
							{selectedSession ? (
								<div className="space-y-6">
									<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
										<div>
											<p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#00450D]">Session details</p>
											<h2 className="mt-2 text-2xl font-bold text-[#171D14]">
												{selectedSession.latestRecord.recommendedCrops[0]?.crop ?? "Crop recommendations"}
											</h2>
											<p className="mt-2 text-sm text-[#41493E]">
												Started {formatDateTime(selectedSession.sessionCreatedAt)} for {selectedFarm?.name ?? "this farm"}.
											</p>
										</div>
										<div className="rounded-full bg-[#00450D]/10 px-4 py-2 text-xs font-semibold text-[#00450D]">
											Session ID: {selectedSession.sessionId.slice(0, 8)}
										</div>
									</div>

									<div className="grid gap-4 sm:grid-cols-3">
										<div className="rounded-3xl bg-[#EFF6E7] p-4">
											<p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#41493E]">Records</p>
											<p className="mt-2 text-2xl font-bold text-[#171D14]">{selectedSession.records.length}</p>
										</div>
										<div className="rounded-3xl bg-[#EFF6E7] p-4">
											<p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#41493E]">Selected crop</p>
											<p className="mt-2 text-2xl font-bold text-[#171D14]">{selectedCrop ?? "Not confirmed"}</p>
										</div>
										<div className="rounded-3xl bg-[#EFF6E7] p-4">
											<p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#41493E]">Top score</p>
											<p className="mt-2 text-2xl font-bold text-[#171D14]">{selectedSession.latestRecord.recommendedCrops[0]?.score ?? 0}%</p>
										</div>
									</div>

									<div className="space-y-4">
										{selectedSession.records.map((record, index) => (
											<div key={record.id} className="rounded-3xl border border-[#C0C9BB1A] p-4">
												<p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#00450D]">
													Record {index + 1} · {formatDateTime(record.createdAt)}
												</p>
												<div className="mt-3 space-y-2">
													{record.recommendedCrops.slice(0, 3).map((crop) => (
														<div key={`${record.id}-${crop.crop}`} className="flex items-start justify-between gap-4">
															<div>
																<p className="font-semibold text-[#171D14]">{crop.crop}</p>
																<p className="text-sm text-[#41493E]">{crop.reason}</p>
																</div>
															<span className="rounded-full bg-[#00450D]/10 px-3 py-1 text-xs font-semibold text-[#00450D]">{Math.round(crop.score)}%</span>
														</div>
													))}
												</div>
											</div>
										))}
									</div>
								</div>
							) : (
								<div className="text-[#41493E]">Select a session to see the full recommendation details.</div>
							)}
						</div>
					</div>
				)}

				<QuickNavigation currentPage="crop-recommendations" />
			</main>
		</div>
	);
}