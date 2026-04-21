"use client";

import { useEffect, useMemo, useState } from "react";
import type { User } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter, useSearchParams } from "next/navigation";

import QuickNavigation from "@/components/layout/QuickNavigation";
import FeaturedCropCard from "@/components/layout/recommendations/FeatureCropCard";
import CropRecommendationCard from "@/components/layout/recommendations/CropRecommendationCard";
import DiversificationCard from "@/components/layout/recommendations/Diversification";
import { getClientAuth } from "@/lib/firebaseClient";
import { ChevronDown } from "lucide-react";

type FarmOption = {
	id: string;
	name: string;
	location: string | null;
	isActive: boolean;
};

type RecommendationItem = {
	crop: string;
	score: number;
	reason: string;
};

type CropRecommendationRecord = {
	id: string;
	recommendedCrops: RecommendationItem[];
	analysisText: string;
	warningFlags: string[];
	generatedBy: "deterministic" | "openai" | "hybrid";
	createdAt: string | null;
	updatedAt: string | null;
};

type SoilProfile = {
	moistureContent: number | null;
	temperatureC: number | null;
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

function formatScore(score: number) {
	return `${Math.max(0, Math.min(100, Math.round(score)))}%`;
}

function cropImageFor(cropName: string) {
	const normalizedName = cropName.toLowerCase();

	if (normalizedName.includes("wheat")) return "/recommendations/hard-red-winter-wheat.png";
	if (normalizedName.includes("corn") || normalizedName.includes("maize")) return "/recommendations/yellow-dent-corn.png";
	if (normalizedName.includes("soy")) return "/recommendations/soybean-crop.png";
	if (normalizedName.includes("barley")) return "/recommendations/barley-crop.png";

	return undefined;
}

export default function RecommendationsClient() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const selectedFarmIdFromQuery = searchParams.get("farmId") ?? "";

	const [currentUser, setCurrentUser] = useState<User | null>(null);
	const [farms, setFarms] = useState<FarmOption[]>([]);
	const [selectedFarmId, setSelectedFarmId] = useState("");
	const [recommendations, setRecommendations] = useState<CropRecommendationRecord[]>([]);
	const [soilProfile, setSoilProfile] = useState<SoilProfile | null>(null);
	const [isFarmDropdownOpen, setIsFarmDropdownOpen] = useState(false);
	const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [farmError, setFarmError] = useState("");
	const [dataError, setDataError] = useState("");
	const [sortBy, setSortBy] = useState("Suitability Score");
	const [selectedCrop, setSelectedCrop] = useState("");
	const [confirmedCrop, setConfirmedCrop] = useState<string | null>(null);
	const [showCropPrompt, setShowCropPrompt] = useState(false);
	const [cropPromptError, setCropPromptError] = useState("");
	const [isRequestingMore, setIsRequestingMore] = useState(false);

	const sortOptions = ["Suitability Score", "Alphabetical", "Recently Added"];

	useEffect(() => {
		const auth = getClientAuth();

		const unsubscribe = onAuthStateChanged(auth, async (user) => {
			setCurrentUser(user);

			if (!user) {
				setFarmError("Sign in to load recommendations.");
				setIsLoading(false);
				return;
			}

			try {
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

				const [recommendationsResponse, soilResponse] = await Promise.all([
					fetch(`/api/farms/${nextSelectedFarmId}/recommendations?limit=10`, {
						headers: { Authorization: `Bearer ${token}` },
					}),
					fetch(`/api/farms/${nextSelectedFarmId}/soil/latest`, {
						headers: { Authorization: `Bearer ${token}` },
					}),
				]);

				const recommendationsBody: unknown = await recommendationsResponse.json().catch(
					() => null,
				);
				const soilBody: unknown = await soilResponse.json().catch(() => null);

				if (!recommendationsResponse.ok) {
					throw new Error(
						getErrorMessage(
							recommendationsBody,
							"Unable to load recommendations right now.",
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

				const soilData =
					typeof soilBody === "object" &&
					soilBody !== null &&
					"data" in soilBody &&
					typeof (soilBody as { data?: unknown }).data === "object"
						? (((soilBody as { data?: { soilProfile?: SoilProfile } }).data?.soilProfile ?? null) as SoilProfile | null)
						: null;

				setRecommendations(recommendationList);
				setSoilProfile(soilData);
			} catch (error) {
				const message =
					error instanceof Error ? error.message : "Unable to load recommendations right now.";
				setDataError(message);
				setRecommendations([]);
				setSoilProfile(null);
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
	const selectedRecommendation = recommendations[0] ?? null;
	const recommendedCrops = useMemo(() => {
		const seen = new Set<string>();
		const combined = recommendations.flatMap((record) => record.recommendedCrops);
		const unique = combined.filter((crop) => {
			const key = crop.crop.trim().toLowerCase();
			if (seen.has(key)) {
				return false;
			}
			seen.add(key);
			return true;
		});

		if (sortBy === "Alphabetical") {
			return [...unique].sort((first, second) => first.crop.localeCompare(second.crop));
		}

		if (sortBy === "Recently Added") {
			return unique;
		}

		return [...unique].sort((first, second) => {
			if (second.score !== first.score) {
				return second.score - first.score;
			}

			return first.crop.localeCompare(second.crop);
		});
	}, [recommendations, sortBy]);

	useEffect(() => {
		if (!selectedFarmId || recommendedCrops.length === 0) {
			setSelectedCrop("");
			setConfirmedCrop(null);
			setShowCropPrompt(false);
			return;
		}

		const storageKey = `piliSeed.selectedCrop.${selectedFarmId}`;
		const storedSelection = typeof window !== "undefined"
			? window.localStorage.getItem(storageKey)
			: null;
		const defaultCrop = recommendedCrops[0]?.crop ?? "";

		if (storedSelection) {
			setSelectedCrop(storedSelection);
			setConfirmedCrop(storedSelection);
			setShowCropPrompt(false);
			return;
		}

		setSelectedCrop(defaultCrop);
		setConfirmedCrop(null);
		setShowCropPrompt(true);
		setCropPromptError("");
	}, [recommendedCrops, selectedFarmId]);

	function handleFarmChange(farmId: string) {
		setSelectedFarmId(farmId);
		setIsFarmDropdownOpen(false);
		router.push(`/recommendations?farmId=${farmId}`);
	}

	const featuredCrop = recommendedCrops[0] ?? null;
	const secondaryCrops = recommendedCrops.slice(1);
	const moistureNeed =
		soilProfile?.moistureContent !== null && soilProfile?.moistureContent !== undefined
			? `${soilProfile.moistureContent}%`
			: null;
	const tempRange =
		soilProfile?.temperatureC !== null && soilProfile?.temperatureC !== undefined
			? `${Math.max(-10, Math.round(soilProfile.temperatureC - 3))}°C - ${Math.round(soilProfile.temperatureC + 3)}°C`
			: null;

	function handleConfirmCropSelection() {
		if (!selectedCrop) {
			setCropPromptError("Choose a crop to continue.");
			return;
		}

		const storageKey = `piliSeed.selectedCrop.${selectedFarmId}`;
		setConfirmedCrop(selectedCrop);
		setShowCropPrompt(false);
		setCropPromptError("");

		if (typeof window !== "undefined") {
			window.localStorage.setItem(storageKey, selectedCrop);
		}
	}

	function handleChangeCropSelection() {
		setShowCropPrompt(true);
		setCropPromptError("");
	}

	async function handleRecommendMore() {
		if (!currentUser || !selectedFarmId) {
			setDataError("Select a farm and sign in before requesting more recommendations.");
			return;
		}

		setIsRequestingMore(true);
		setDataError("");

		try {
			const token = await currentUser.getIdToken();
			const response = await fetch(
				`/api/farms/${selectedFarmId}/recommendations/more`,
				{
					method: "POST",
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json",
					},
					body: JSON.stringify({}),
				},
			);
			const responseBody: unknown = await response.json().catch(() => null);

			if (!response.ok) {
				throw new Error(
					getErrorMessage(
						responseBody,
						"Unable to request more recommendations right now.",
					),
				);
			}

			const responseData =
				typeof responseBody === "object" &&
				responseBody !== null &&
				"data" in responseBody &&
				typeof (responseBody as { data?: unknown }).data === "object"
					? ((responseBody as { data?: {
						recommendation?: CropRecommendationRecord;
						recommendationRecord?: { id?: string };
						metadata?: { generatedBy?: "deterministic" | "openai" | "hybrid" };
					} }).data ?? null)
					: null;

			if (responseData?.recommendation) {
				const nowIso = new Date().toISOString();
				const newRecord: CropRecommendationRecord = {
					id: responseData.recommendationRecord?.id ?? `rec-${nowIso}`,
					recommendedCrops: responseData.recommendation.recommendedCrops,
					analysisText: responseData.recommendation.analysisText,
					warningFlags: responseData.recommendation.warningFlags ?? [],
					generatedBy: responseData.metadata?.generatedBy ?? "openai",
					createdAt: nowIso,
					updatedAt: nowIso,
				};

				setRecommendations((previous) => [newRecord, ...previous]);
				return;
			}

			const refreshed = await fetch(
				`/api/farms/${selectedFarmId}/recommendations?limit=10`,
				{ headers: { Authorization: `Bearer ${token}` } },
			);
			const refreshedBody: unknown = await refreshed.json().catch(() => null);

			if (!refreshed.ok) {
				throw new Error(
					getErrorMessage(
						refreshedBody,
						"Unable to refresh recommendations right now.",
					),
				);
			}

			const refreshedList =
				typeof refreshedBody === "object" &&
				refreshedBody !== null &&
				"data" in refreshedBody &&
				typeof (refreshedBody as { data?: unknown }).data === "object"
					? (((refreshedBody as { data?: RecommendationsPayload }).data?.recommendations ?? []) as CropRecommendationRecord[])
					: [];

			setRecommendations(refreshedList);
		} catch (error) {
			const message =
				error instanceof Error
					? error.message
					: "Unable to request more recommendations right now.";
			setDataError(message);
		} finally {
			setIsRequestingMore(false);
		}
	}

	return (
		<div className="min-h-screen bg-[#EFF6E7]">
			<main className="max-w-300 mx-auto px-6 py-8">
				<div className="flex flex-col md:flex-row justify-between gap-6 mb-10">
					<div className="max-w-2xl space-y-4">
						<h1 className="text-5xl font-extrabold text-[#171d14]">
							Personalized Crop <br /> Recommendations
						</h1>
						<p className="text-[#41493e] text-medium">
							AI-driven insights analyzing your soil inputs, farm context, and generated recommendation history to find your next harvest.
						</p>
					</div>

					<div className="flex items-start gap-4">
						<div className="flex flex-col">
							<label className="text-[10px] font-semibold text-[#41493E] tracking-widest mb-1.5">
								SELECTED FARM
							</label>
							<div className="relative">
								<button
									onClick={() => setIsFarmDropdownOpen((previousValue) => !previousValue)}
									disabled={isLoading || farms.length === 0}
									className="w-55 h-10 bg-white rounded-full shadow-sm flex items-center justify-between px-5 border border-gray-200 disabled:cursor-not-allowed disabled:opacity-70"
								>
									<span className="font-semibold text-[#00450D] text-sm truncate max-w-37.5 text-left">
										{selectedFarm?.name ?? (isLoading ? "Loading farms..." : "Select a farm")}
									</span>
									<ChevronDown className="w-5 h-5 text-[#6B7280]"/>
								</button>

								{isFarmDropdownOpen && farms.length > 0 && (
									<>
										<div className="fixed inset-0 z-40" onClick={() => setIsFarmDropdownOpen(false)} />
										<div className="absolute left-0 mt-2 w-55 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">
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

						<div className="flex flex-col">
							<label className="text-[10px] font-semibold text-[#41493E] tracking-widest mb-1.5">
								SORT BY
							</label>
							<div className="relative">
								<button
									onClick={() => setIsSortDropdownOpen((previousValue) => !previousValue)}
									className="w-42.5 h-10 bg-white rounded-full shadow-sm flex items-center justify-between px-5 border border-gray-200"
								>
									<span className="font-semibold text-[#00450D] text-sm">{sortBy}</span>
									<ChevronDown className="w-5 h-5 text-[#6B7280]"/>
								</button>
								{isSortDropdownOpen && (
									<>
										<div className="fixed inset-0 z-40" onClick={() => setIsSortDropdownOpen(false)} />
										<div className="absolute left-0 mt-2 w-42.5 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">
											{sortOptions.map((option) => (
												<button
													key={option}
													onClick={() => {
														setSortBy(option);
														setIsSortDropdownOpen(false);
													}}
													className={`w-full text-left px-5 py-2.5 text-sm hover:bg-[#e3ebdc] transition ${
														option === sortBy
															? "text-[#00450D] font-medium bg-[#eef3ea]"
															: "text-[#171d14]"
													}`}
												>
													{option}
												</button>
											))}
										</div>
									</>
								)}
							</div>
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
						Loading recommendations...
					</div>
				) : selectedRecommendation && featuredCrop ? (
					<>
						<div className="mb-12 rounded-4xl border border-[#C0C9BB1A] bg-white px-6 py-6">
							<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
								<div>
									<p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#00450D]">
										Planting decision
									</p>
									<h3 className="text-2xl font-bold text-[#171D14]">
										Which crop will you plant?
									</h3>
									<p className="mt-2 text-sm text-[#41493E]">
										Confirm your choice so we can tailor yield and market insights for this farm.
									</p>
								</div>
								{confirmedCrop && !showCropPrompt && (
									<div className="rounded-full bg-[#00450D]/10 px-4 py-2 text-xs font-semibold text-[#00450D]">
										Selected: {confirmedCrop}
									</div>
								)}
							</div>

							{showCropPrompt ? (
								<div className="mt-5 flex flex-col gap-4 md:flex-row md:items-center">
									<div className="flex-1">
										<label className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#41493E]">
											Select crop
										</label>
										<select
											value={selectedCrop}
											onChange={(event) => setSelectedCrop(event.target.value)}
											className="mt-2 w-full rounded-full border border-[#C0C9BB] bg-white px-4 py-3 text-sm font-semibold text-[#171D14]"
										>
											{recommendedCrops.map((crop) => (
												<option key={crop.crop} value={crop.crop}>
													{crop.crop}
												</option>
											))}
										</select>
										{cropPromptError && (
											<p className="mt-2 text-xs font-semibold text-[#9C4A00]">
												{cropPromptError}
											</p>
										)}
									</div>
									<div className="flex items-center gap-3">
										<button
											onClick={handleConfirmCropSelection}
											className="rounded-full bg-[#00450D] px-6 py-3 text-sm font-semibold text-white shadow-[0px_8px_10px_-6px_#00450D33,0px_20px_25px_-5px_#00450D33]"
										>
											Confirm crop
										</button>
									</div>
								</div>
							) : (
								<button
									onClick={handleChangeCropSelection}
									className="mt-5 rounded-full border border-[#00450D] px-5 py-2 text-xs font-semibold text-[#00450D]"
								>
									Change selection
								</button>
							)}
						</div>

						<div className="grid grid-cols-1 gap-6 mb-12">
							<FeaturedCropCard
								cropName={featuredCrop.crop}
								description={featuredCrop.reason || selectedRecommendation.analysisText}
								match={formatScore(featuredCrop.score)}
								imageUrl={cropImageFor(featuredCrop.crop)}
								{...(moistureNeed ? { moistureNeed } : {})}
								{...(tempRange ? { tempRange } : {})}
							/>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
							{secondaryCrops.map((crop, index) => {
								if (index === 0 && crop.crop.toLowerCase().includes("divers")) {
									return (
										<DiversificationCard
											key={`${crop.crop}-${index}`}
											cropName={crop.crop}
											description={crop.reason}
											match={formatScore(crop.score)}
										/>
									);
								}

								return (
									<CropRecommendationCard
										key={`${crop.crop}-${index}`}
										cropName={crop.crop}
										description={crop.reason}
										match={formatScore(crop.score)}
										imageUrl={cropImageFor(crop.crop)}
									/>
								);
							})}
						</div>


						<div className="mb-12 flex justify-center">
							<button
								onClick={handleRecommendMore}
								disabled={isRequestingMore || !currentUser || !selectedFarmId}
								className="rounded-full border border-[#00450D] px-8 py-3 text-sm font-semibold text-[#00450D] transition-colors hover:bg-[#00450D] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
							>
								{isRequestingMore ? "Fetching more..." : "Recommend more"}
							</button>
						</div>
					</>
				) : (
					<div className="rounded-4xl border border-[#C0C9BB1A] bg-white px-6 py-10 text-[#41493E]">
						No recommendations found for this farm yet. Run soil analysis and generate recommendations from the soil page.
					</div>
				)}

				<QuickNavigation currentPage="crop-recommendations" />
			</main>
		</div>
	);
}
