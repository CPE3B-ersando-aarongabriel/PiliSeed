import type { DecodedIdToken } from "firebase-admin/auth";
import {
  FieldValue,
  type CollectionReference,
  type DocumentData,
} from "firebase-admin/firestore";

import { UnauthorizedError } from "./authMiddleware";
import {
  type RecommendationItem,
  type SoilClassificationProbability,
} from "./analysisContracts";
import { firestore } from "./firebaseAdmin";

export const firestoreCollections = {
  users: "users",
  farms: "farms",
  soilProfiles: "soilProfiles",
  weatherSnapshots: "weatherSnapshots",
  cropRecommendations: "cropRecommendations",
  yieldForecasts: "yieldForecasts",
} as const;

const usersCollection = firestore.collection(firestoreCollections.users);
const farmsCollection = firestore.collection(firestoreCollections.farms);
const soilProfilesCollection = firestore.collection(
  firestoreCollections.soilProfiles,
);
const weatherSnapshotsCollection = firestore.collection(
  firestoreCollections.weatherSnapshots,
);
const cropRecommendationsCollection = firestore.collection(
  firestoreCollections.cropRecommendations,
);
const yieldForecastsCollection = firestore.collection(
  firestoreCollections.yieldForecasts,
);

type TimestampLike = {
  toDate: () => Date;
};

type FirestoreQueryError = {
  code?: string | number;
  message?: string;
  details?: string;
};

export type UserProfile = {
  uid: string;
  email: string | null;
  name: string | null;
  photoURL: string | null;
  phone: string | null;
  address: string | null;
  providerIds: string[];
  createdAt: string | null;
  updatedAt: string | null;
  lastLoginAt: string | null;
};

export type Farm = {
  id: string;
  uid: string;
  name: string;
  location: string | null;
  isActive: boolean;
  createdAt: string | null;
  updatedAt: string | null;
};

export type SoilProfile = {
  id: string;
  uid: string;
  farmId: string;
  texture: string | null;
  soilClass: string | null;
  soilClassValue: number | null;
  soilClassProbability: number | null;
  soilClassProbabilities: SoilClassificationProbability[];
  pH: number | null;
  moistureContent: number | null;
  nitrogen: number | null;
  phosphorus: number | null;
  potassium: number | null;
  soilSource: "manual" | "api" | "mixed" | "unknown";
  classificationJson: DocumentData | null;
  analysisJson: DocumentData | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export type WeatherSnapshot = {
  id: string;
  uid: string;
  farmId: string;
  temperatureC: number | null;
  humidity: number | null;
  rainfallMm: number | null;
  recordedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export type CropRecommendation = {
  id: string;
  uid: string;
  farmId: string;
  recommendedCrops: RecommendationItem[];
  analysisText: string;
  warningFlags: string[];
  generatedBy: "deterministic" | "openai" | "hybrid";
  recommendationJson: DocumentData | null;
  createdAt: string | null;
  updatedAt: string | null;
};

type EnsureUserScaffoldInput = {
  decodedToken: DecodedIdToken;
  requestedName?: string | null;
};

type EnsureUserScaffoldResult = {
  profile: UserProfile;
  farmId: string;
  created: boolean;
};

type UserProfileUpdates = {
  name?: string;
  phone?: string;
  address?: string;
};

type FarmCreateInput = {
  name: string;
  location?: string | null;
  isActive?: boolean;
};

type FarmUpdateInput = {
  name?: string;
  location?: string | null;
  isActive?: boolean;
};

type SoilProfileCreateInput = {
  pH: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
};

type SoilAnalysisCreateInput = {
  texture?: string | null;
  pH: number | null;
  moistureContent: number | null;
  nitrogen: number | null;
  phosphorus: number | null;
  potassium: number | null;
  soilSource?: "manual" | "api" | "mixed";
  soilClass?: string | null;
  soilClassValue?: number | null;
  soilClassProbability?: number | null;
  soilClassProbabilities: SoilClassificationProbability[];
  classificationJson: DocumentData;
  analysisJson: DocumentData;
};

type CropRecommendationCreateInput = {
  recommendedCrops: RecommendationItem[];
  analysisText: string;
  warningFlags: string[];
  generatedBy: "deterministic" | "openai" | "hybrid";
  recommendationJson: DocumentData;
};

type WeatherSnapshotCreateInput = {
  temperatureC: number | null;
  humidity: number | null;
  rainfallMm: number | null;
};

function normalizeText(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return null;
  }

  return trimmedValue.slice(0, maxLength);
}

function isTimestampLike(value: unknown): value is TimestampLike {
  return (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof (value as TimestampLike).toDate === "function"
  );
}

function toIsoString(value: unknown): string | null {
  if (!isTimestampLike(value)) {
    return null;
  }

  return value.toDate().toISOString();
}

function toTimestampMillis(value: unknown): number {
  if (!isTimestampLike(value)) {
    return 0;
  }

  return value.toDate().getTime();
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
}

function toNullableNumber(value: unknown): number | null {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return null;
  }

  return value;
}

function toUserProfile(uid: string, data: DocumentData): UserProfile {
  return {
    uid,
    email: normalizeText(data.email, 120),
    name: normalizeText(data.name, 80),
    photoURL: normalizeText(data.photoURL, 500),
    phone: normalizeText(data.phone, 30),
    address: normalizeText(data.address, 180),
    providerIds: toStringArray(data.providerIds),
    createdAt: toIsoString(data.createdAt),
    updatedAt: toIsoString(data.updatedAt),
    lastLoginAt: toIsoString(data.lastLoginAt),
  };
}

function toFarm(id: string, data: DocumentData): Farm {
  return {
    id,
    uid: normalizeText(data.uid, 128) ?? "",
    name: normalizeText(data.name, 120) ?? "Untitled Farm",
    location: normalizeText(data.location, 180),
    isActive: data.isActive === true,
    createdAt: toIsoString(data.createdAt),
    updatedAt: toIsoString(data.updatedAt),
  };
}

function toSoilProfile(id: string, data: DocumentData): SoilProfile {
  return {
    id,
    uid: normalizeText(data.uid, 128) ?? "",
    farmId: normalizeText(data.farmId, 128) ?? "",
    texture: normalizeText(data.texture, 100),
    soilClass: normalizeText(data.soilClass, 100),
    soilClassValue: toNullableNumber(data.soilClassValue),
    soilClassProbability: toNullableNumber(data.soilClassProbability),
    soilClassProbabilities: Array.isArray(data.soilClassProbabilities)
      ? (data.soilClassProbabilities.filter(
          (item): item is SoilClassificationProbability =>
            typeof item === "object" &&
            item !== null &&
            typeof (item as SoilClassificationProbability).className === "string" &&
            typeof (item as SoilClassificationProbability).probability === "number",
        ) as SoilClassificationProbability[])
      : [],
    pH: toNullableNumber(data.ph ?? data.pH),
    moistureContent: toNullableNumber(data.moistureContent ?? data.moisture),
    nitrogen: toNullableNumber(data.nitrogen),
    phosphorus: toNullableNumber(data.phosphorus),
    potassium: toNullableNumber(data.potassium),
    soilSource:
      data.soilSource === "manual" ||
      data.soilSource === "api" ||
      data.soilSource === "mixed"
        ? data.soilSource
        : "unknown",
    classificationJson:
      typeof data.classificationJson === "object" && data.classificationJson !== null
        ? data.classificationJson
        : null,
    analysisJson:
      typeof data.analysisJson === "object" && data.analysisJson !== null
        ? data.analysisJson
        : null,
    createdAt: toIsoString(data.createdAt),
    updatedAt: toIsoString(data.updatedAt),
  };
}

function toWeatherSnapshot(id: string, data: DocumentData): WeatherSnapshot {
  return {
    id,
    uid: normalizeText(data.uid, 128) ?? "",
    farmId: normalizeText(data.farmId, 128) ?? "",
    temperatureC: toNullableNumber(data.temperatureC),
    humidity: toNullableNumber(data.humidity),
    rainfallMm: toNullableNumber(data.rainfallMm),
    recordedAt: toIsoString(data.recordedAt),
    createdAt: toIsoString(data.createdAt),
    updatedAt: toIsoString(data.updatedAt),
  };
}

function toCropRecommendation(
  id: string,
  data: DocumentData,
): CropRecommendation {
  return {
    id,
    uid: normalizeText(data.uid, 128) ?? "",
    farmId: normalizeText(data.farmId, 128) ?? "",
    recommendedCrops: Array.isArray(data.recommendedCrops)
      ? (data.recommendedCrops.filter(
          (item): item is RecommendationItem =>
            typeof item === "object" &&
            item !== null &&
            typeof (item as RecommendationItem).crop === "string" &&
            typeof (item as RecommendationItem).score === "number" &&
            typeof (item as RecommendationItem).reason === "string",
        ) as RecommendationItem[])
      : [],
    analysisText: normalizeText(data.analysisText, 1200) ?? "",
    warningFlags: Array.isArray(data.warningFlags)
      ? data.warningFlags.filter(
          (item): item is string => typeof item === "string",
        )
      : [],
    generatedBy:
      data.generatedBy === "openai" ||
      data.generatedBy === "hybrid" ||
      data.generatedBy === "deterministic"
        ? data.generatedBy
        : "deterministic",
    recommendationJson:
      typeof data.recommendationJson === "object" &&
      data.recommendationJson !== null
        ? data.recommendationJson
        : null,
    createdAt: toIsoString(data.createdAt),
    updatedAt: toIsoString(data.updatedAt),
  };
}

function isMissingFirestoreIndexError(
  error: unknown,
): error is FirestoreQueryError {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  const typedError = error as FirestoreQueryError;
  const code = String(typedError.code ?? "");
  const message = String(typedError.message ?? "");
  const details = String(typedError.details ?? "");

  return (
    code === "9" &&
    (message.includes("requires an index") ||
      details.includes("requires an index"))
  );
}

async function assertFarmOwnership(uid: string, farmId: string) {
  const farmRef = farmsCollection.doc(farmId);
  const farmSnapshot = await farmRef.get();

  if (!farmSnapshot.exists) {
    return null;
  }

  const farmData = farmSnapshot.data() ?? {};

  if (normalizeText(farmData.uid, 128) !== uid) {
    throw new UnauthorizedError("You are not allowed to access this farm.");
  }

  return {
    farmRef,
    farmSnapshot,
    farmData,
  };
}

async function setActiveFarmState(uid: string, activeFarmId: string) {
  const userFarmSnapshot = await farmsCollection.where("uid", "==", uid).get();
  const batch = firestore.batch();
  let hasChanges = false;

  for (const farmDoc of userFarmSnapshot.docs) {
    const nextIsActive = farmDoc.id === activeFarmId;
    const currentIsActive = farmDoc.data().isActive === true;

    if (currentIsActive !== nextIsActive) {
      hasChanges = true;
      batch.update(farmDoc.ref, {
        isActive: nextIsActive,
        updatedAt: FieldValue.serverTimestamp(),
      });
    }
  }

  if (hasChanges) {
    await batch.commit();
  }
}

function extractProviderIds(decodedToken: DecodedIdToken): string[] {
  const providerIds = new Set<string>();
  const signInProvider = decodedToken.firebase?.sign_in_provider;

  if (signInProvider) {
    providerIds.add(signInProvider);
  }

  const identities = decodedToken.firebase?.identities;

  if (identities && typeof identities === "object") {
    for (const key of Object.keys(identities)) {
      if (key) {
        providerIds.add(key);
      }
    }
  }

  providerIds.delete("anonymous");
  providerIds.delete("custom");

  return Array.from(providerIds);
}

async function ensureSeedDocument(
  collection: CollectionReference<DocumentData>,
  uid: string,
  farmId: string,
  seedData: DocumentData,
) {
  const existingSnapshot = await collection
    .where("uid", "==", uid)
    .where("farmId", "==", farmId)
    .limit(1)
    .get();

  if (!existingSnapshot.empty) {
    return existingSnapshot.docs[0].id;
  }

  const docRef = collection.doc();

  await docRef.set({
    uid,
    farmId,
    ...seedData,
    isSeedData: true,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  const createdSnapshot = await docRef.get();

  if (!createdSnapshot.exists) {
    throw new Error(`Failed to initialize ${collection.id} collection.`);
  }

  return docRef.id;
}

async function ensureDefaultFarm(uid: string): Promise<string> {
  const farmSnapshot = await farmsCollection
    .where("uid", "==", uid)
    .limit(1)
    .get();

  if (!farmSnapshot.empty) {
    return farmSnapshot.docs[0].id;
  }

  const farmRef = farmsCollection.doc();

  await farmRef.set({
    uid,
    name: "My First Farm",
    location: null,
    isActive: true,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  const createdFarmSnapshot = await farmRef.get();

  if (!createdFarmSnapshot.exists) {
    throw new Error("Failed to initialize farms collection.");
  }

  return farmRef.id;
}

async function initializeRelatedCollections(uid: string, farmId: string) {
  await ensureSeedDocument(soilProfilesCollection, uid, farmId, {
    ph: null,
    pH: null,
    moisture: null,
    nitrogen: null,
    phosphorus: null,
    potassium: null,
    recordedAt: FieldValue.serverTimestamp(),
  });

  await ensureSeedDocument(weatherSnapshotsCollection, uid, farmId, {
    temperatureC: null,
    humidity: null,
    rainfallMm: null,
    recordedAt: FieldValue.serverTimestamp(),
  });

  await ensureSeedDocument(cropRecommendationsCollection, uid, farmId, {
    recommendedCrop: null,
    confidence: null,
    reason: null,
    generatedAt: FieldValue.serverTimestamp(),
  });

  await ensureSeedDocument(yieldForecastsCollection, uid, farmId, {
    predictedYield: null,
    unit: "kg",
    confidence: null,
    generatedAt: FieldValue.serverTimestamp(),
  });
}

export async function ensureUserScaffold({
  decodedToken,
  requestedName,
}: EnsureUserScaffoldInput): Promise<EnsureUserScaffoldResult> {
  const uid = decodedToken.uid;
  const userRef = usersCollection.doc(uid);
  const existingUserSnapshot = await userRef.get();
  const existingData = existingUserSnapshot.exists
    ? existingUserSnapshot.data()
    : undefined;
  const existingProviderIds = toStringArray(existingData?.providerIds);
  const providerIds = Array.from(
    new Set([...existingProviderIds, ...extractProviderIds(decodedToken)]),
  );

  await userRef.set(
    {
      uid,
      email:
        normalizeText(decodedToken.email, 120) ??
        normalizeText(existingData?.email, 120),
      name:
        normalizeText(requestedName, 80) ??
        normalizeText(decodedToken.name, 80) ??
        normalizeText(existingData?.name, 80),
      photoURL:
        normalizeText(decodedToken.picture, 500) ??
        normalizeText(existingData?.photoURL, 500),
      phone: normalizeText(existingData?.phone, 30),
      address: normalizeText(existingData?.address, 180),
      providerIds,
      updatedAt: FieldValue.serverTimestamp(),
      lastLoginAt: FieldValue.serverTimestamp(),
      ...(existingUserSnapshot.exists
        ? {}
        : { createdAt: FieldValue.serverTimestamp() }),
    },
    { merge: true },
  );

  const farmId = await ensureDefaultFarm(uid);
  await initializeRelatedCollections(uid, farmId);

  const verifiedUserSnapshot = await userRef.get();

  if (!verifiedUserSnapshot.exists) {
    throw new Error("Failed to create or fetch user profile.");
  }

  return {
    profile: toUserProfile(uid, verifiedUserSnapshot.data() ?? {}),
    farmId,
    created: !existingUserSnapshot.exists,
  };
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const userSnapshot = await usersCollection.doc(uid).get();

  if (!userSnapshot.exists) {
    return null;
  }

  return toUserProfile(uid, userSnapshot.data() ?? {});
}

export async function updateUserProfile(
  uid: string,
  updates: UserProfileUpdates,
): Promise<UserProfile> {
  const userRef = usersCollection.doc(uid);
  const existingSnapshot = await userRef.get();
  const payload: DocumentData = {
    uid,
    updatedAt: FieldValue.serverTimestamp(),
  };

  if (Object.prototype.hasOwnProperty.call(updates, "name")) {
    payload.name = normalizeText(updates.name, 80);
  }

  if (Object.prototype.hasOwnProperty.call(updates, "phone")) {
    payload.phone = normalizeText(updates.phone, 30);
  }

  if (Object.prototype.hasOwnProperty.call(updates, "address")) {
    payload.address = normalizeText(updates.address, 180);
  }

  if (!existingSnapshot.exists) {
    payload.createdAt = FieldValue.serverTimestamp();
    payload.lastLoginAt = FieldValue.serverTimestamp();
    payload.email = null;
    payload.photoURL = null;
    payload.providerIds = [];
  }

  await userRef.set(payload, { merge: true });

  const updatedSnapshot = await userRef.get();

  if (!updatedSnapshot.exists) {
    throw new Error("Failed to update user profile.");
  }

  return toUserProfile(uid, updatedSnapshot.data() ?? {});
}

export async function listFarmsByUid(uid: string): Promise<Farm[]> {
  const farmSnapshot = await farmsCollection.where("uid", "==", uid).get();

  return farmSnapshot.docs.map((farmDoc) => toFarm(farmDoc.id, farmDoc.data()));
}

export async function createFarm(
  uid: string,
  input: FarmCreateInput,
): Promise<Farm> {
  const farmRef = farmsCollection.doc();
  const shouldBeActive = input.isActive === true;

  await farmRef.set({
    uid,
    name: normalizeText(input.name, 120),
    location: normalizeText(input.location, 180),
    isActive: shouldBeActive,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  if (shouldBeActive) {
    await setActiveFarmState(uid, farmRef.id);
  }

  const createdSnapshot = await farmRef.get();

  if (!createdSnapshot.exists) {
    throw new Error("Failed to create farm.");
  }

  return toFarm(createdSnapshot.id, createdSnapshot.data() ?? {});
}

export async function getFarmByIdForUser(
  uid: string,
  farmId: string,
): Promise<Farm | null> {
  const ownership = await assertFarmOwnership(uid, farmId);

  if (!ownership) {
    return null;
  }

  return toFarm(ownership.farmSnapshot.id, ownership.farmData);
}

export async function updateFarmByIdForUser(
  uid: string,
  farmId: string,
  updates: FarmUpdateInput,
): Promise<Farm | null> {
  const ownership = await assertFarmOwnership(uid, farmId);

  if (!ownership) {
    return null;
  }

  const updatePayload: DocumentData = {
    updatedAt: FieldValue.serverTimestamp(),
  };

  if (Object.prototype.hasOwnProperty.call(updates, "name")) {
    updatePayload.name = normalizeText(updates.name, 120);
  }

  if (Object.prototype.hasOwnProperty.call(updates, "location")) {
    updatePayload.location = normalizeText(updates.location, 180);
  }

  if (Object.prototype.hasOwnProperty.call(updates, "isActive")) {
    updatePayload.isActive = updates.isActive === true;
  }

  await ownership.farmRef.set(updatePayload, { merge: true });

  if (updates.isActive === true) {
    await setActiveFarmState(uid, farmId);
  }

  const updatedSnapshot = await ownership.farmRef.get();

  if (!updatedSnapshot.exists) {
    throw new Error("Failed to update farm.");
  }

  return toFarm(updatedSnapshot.id, updatedSnapshot.data() ?? {});
}

export async function deleteFarmByIdForUser(
  uid: string,
  farmId: string,
): Promise<boolean> {
  const ownership = await assertFarmOwnership(uid, farmId);

  if (!ownership) {
    return false;
  }

  await ownership.farmRef.delete();

  return true;
}

export async function activateFarmByIdForUser(
  uid: string,
  farmId: string,
): Promise<Farm | null> {
  const ownership = await assertFarmOwnership(uid, farmId);

  if (!ownership) {
    return null;
  }

  await setActiveFarmState(uid, farmId);

  const activeSnapshot = await ownership.farmRef.get();

  if (!activeSnapshot.exists) {
    throw new Error("Failed to activate farm.");
  }

  return toFarm(activeSnapshot.id, activeSnapshot.data() ?? {});
}

export async function createSoilProfileForFarm(
  uid: string,
  farmId: string,
  input: SoilProfileCreateInput,
): Promise<SoilProfile | null> {
  const ownership = await assertFarmOwnership(uid, farmId);

  if (!ownership) {
    return null;
  }

  const soilDocRef = soilProfilesCollection.doc();

  await soilDocRef.set({
    uid,
    farmId,
    ph: input.pH,
    pH: input.pH,
    nitrogen: input.nitrogen,
    phosphorus: input.phosphorus,
    potassium: input.potassium,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  const createdSnapshot = await soilDocRef.get();

  if (!createdSnapshot.exists) {
    throw new Error("Failed to create soil profile.");
  }

  return toSoilProfile(createdSnapshot.id, createdSnapshot.data() ?? {});
}

export async function createSoilAnalysisForFarm(
  uid: string,
  farmId: string,
  input: SoilAnalysisCreateInput,
): Promise<SoilProfile | null> {
  const ownership = await assertFarmOwnership(uid, farmId);

  if (!ownership) {
    return null;
  }

  const soilDocRef = soilProfilesCollection.doc();

  await soilDocRef.set({
    uid,
    farmId,
    texture: normalizeText(input.texture, 100),
    soilClass: normalizeText(input.soilClass, 100),
    soilClassValue: input.soilClassValue,
    soilClassProbability: input.soilClassProbability,
    soilClassProbabilities: input.soilClassProbabilities,
    ph: input.pH,
    pH: input.pH,
    moistureContent: input.moistureContent,
    nitrogen: input.nitrogen,
    phosphorus: input.phosphorus,
    potassium: input.potassium,
    soilSource: input.soilSource ?? "api",
    classificationJson: input.classificationJson,
    analysisJson: input.analysisJson,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  const createdSnapshot = await soilDocRef.get();

  if (!createdSnapshot.exists) {
    throw new Error("Failed to create soil analysis.");
  }

  return toSoilProfile(createdSnapshot.id, createdSnapshot.data() ?? {});
}

export async function createWeatherSnapshotForFarm(
  uid: string,
  farmId: string,
  input: WeatherSnapshotCreateInput,
): Promise<WeatherSnapshot | null> {
  const ownership = await assertFarmOwnership(uid, farmId);

  if (!ownership) {
    return null;
  }

  const weatherDocRef = weatherSnapshotsCollection.doc();

  await weatherDocRef.set({
    uid,
    farmId,
    temperatureC: input.temperatureC,
    humidity: input.humidity,
    rainfallMm: input.rainfallMm,
    recordedAt: FieldValue.serverTimestamp(),
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  const createdSnapshot = await weatherDocRef.get();

  if (!createdSnapshot.exists) {
    throw new Error("Failed to create weather snapshot.");
  }

  return toWeatherSnapshot(createdSnapshot.id, createdSnapshot.data() ?? {});
}

export async function createCropRecommendationForFarm(
  uid: string,
  farmId: string,
  input: CropRecommendationCreateInput,
): Promise<CropRecommendation | null> {
  const ownership = await assertFarmOwnership(uid, farmId);

  if (!ownership) {
    return null;
  }

  const recommendationDocRef = cropRecommendationsCollection.doc();

  await recommendationDocRef.set({
    uid,
    farmId,
    recommendedCrops: input.recommendedCrops,
    analysisText: normalizeText(input.analysisText, 1200),
    warningFlags: input.warningFlags,
    generatedBy: input.generatedBy,
    recommendationJson: input.recommendationJson,
    generatedAt: FieldValue.serverTimestamp(),
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  const createdSnapshot = await recommendationDocRef.get();

  if (!createdSnapshot.exists) {
    throw new Error("Failed to create crop recommendation.");
  }

  return toCropRecommendation(createdSnapshot.id, createdSnapshot.data() ?? {});
}

export async function getLatestSoilProfileForFarm(
  uid: string,
  farmId: string,
): Promise<SoilProfile | null> {
  const ownership = await assertFarmOwnership(uid, farmId);

  if (!ownership) {
    return null;
  }

  let latestDataDoc:
    | (typeof soilProfilesCollection extends CollectionReference<infer T>
        ? import("firebase-admin/firestore").QueryDocumentSnapshot<T>
        : never)
    | null = null;

  try {
    const indexedSnapshot = await soilProfilesCollection
      .where("uid", "==", uid)
      .where("farmId", "==", farmId)
      .orderBy("createdAt", "desc")
      .limit(10)
      .get();

    latestDataDoc =
      indexedSnapshot.docs.find((doc) => doc.data().isSeedData !== true) ??
      null;
  } catch (error) {
    if (!isMissingFirestoreIndexError(error)) {
      throw error;
    }

    // Fallback path for environments where the composite index is not created yet.
    const fallbackSnapshot = await soilProfilesCollection
      .where("farmId", "==", farmId)
      .get();

    const candidateDocs = fallbackSnapshot.docs.filter((doc) => {
      const data = doc.data();

      return data.isSeedData !== true && normalizeText(data.uid, 128) === uid;
    });

    candidateDocs.sort((firstDoc, secondDoc) => {
      const firstData = firstDoc.data();
      const secondData = secondDoc.data();
      const firstCreatedAt = toTimestampMillis(firstData.createdAt);
      const secondCreatedAt = toTimestampMillis(secondData.createdAt);

      return secondCreatedAt - firstCreatedAt;
    });

    latestDataDoc = candidateDocs[0] ?? null;
  }

  if (!latestDataDoc) {
    return null;
  }

  return toSoilProfile(latestDataDoc.id, latestDataDoc.data());
}

export async function getLatestWeatherSnapshotForFarm(
  uid: string,
  farmId: string,
): Promise<WeatherSnapshot | null> {
  const ownership = await assertFarmOwnership(uid, farmId);

  if (!ownership) {
    return null;
  }

  let latestDataDoc:
    | (typeof weatherSnapshotsCollection extends CollectionReference<infer T>
        ? import("firebase-admin/firestore").QueryDocumentSnapshot<T>
        : never)
    | null = null;

  try {
    const indexedSnapshot = await weatherSnapshotsCollection
      .where("uid", "==", uid)
      .where("farmId", "==", farmId)
      .orderBy("createdAt", "desc")
      .limit(10)
      .get();

    latestDataDoc =
      indexedSnapshot.docs.find((doc) => doc.data().isSeedData !== true) ??
      null;
  } catch (error) {
    if (!isMissingFirestoreIndexError(error)) {
      throw error;
    }

    // Fallback path for environments where the composite index is not created yet.
    const fallbackSnapshot = await weatherSnapshotsCollection
      .where("farmId", "==", farmId)
      .get();

    const candidateDocs = fallbackSnapshot.docs.filter((doc) => {
      const data = doc.data();

      return data.isSeedData !== true && normalizeText(data.uid, 128) === uid;
    });

    candidateDocs.sort((firstDoc, secondDoc) => {
      const firstData = firstDoc.data();
      const secondData = secondDoc.data();
      const firstCreatedAt = toTimestampMillis(firstData.createdAt);
      const secondCreatedAt = toTimestampMillis(secondData.createdAt);

      return secondCreatedAt - firstCreatedAt;
    });

    latestDataDoc = candidateDocs[0] ?? null;
  }

  if (!latestDataDoc) {
    return null;
  }

  return toWeatherSnapshot(latestDataDoc.id, latestDataDoc.data());
}

export async function listRecentWeatherSnapshotsForFarm(
  uid: string,
  farmId: string,
  limit = 30,
): Promise<WeatherSnapshot[]> {
  const ownership = await assertFarmOwnership(uid, farmId);

  if (!ownership) {
    return [];
  }

  const safeLimit = Math.max(1, Math.min(120, Math.trunc(limit)));

  try {
    const indexedSnapshot = await weatherSnapshotsCollection
      .where("uid", "==", uid)
      .where("farmId", "==", farmId)
      .orderBy("createdAt", "desc")
      .limit(safeLimit)
      .get();

    return indexedSnapshot.docs
      .filter((doc) => doc.data().isSeedData !== true)
      .map((doc) => toWeatherSnapshot(doc.id, doc.data()));
  } catch (error) {
    if (!isMissingFirestoreIndexError(error)) {
      throw error;
    }

    // Fallback path for environments where the composite index is not created yet.
    const fallbackSnapshot = await weatherSnapshotsCollection
      .where("farmId", "==", farmId)
      .get();

    const candidateDocs = fallbackSnapshot.docs.filter((doc) => {
      const data = doc.data();

      return data.isSeedData !== true && normalizeText(data.uid, 128) === uid;
    });

    candidateDocs.sort((firstDoc, secondDoc) => {
      const firstData = firstDoc.data();
      const secondData = secondDoc.data();
      const firstCreatedAt = toTimestampMillis(firstData.createdAt);
      const secondCreatedAt = toTimestampMillis(secondData.createdAt);

      return secondCreatedAt - firstCreatedAt;
    });

    return candidateDocs
      .slice(0, safeLimit)
      .map((doc) => toWeatherSnapshot(doc.id, doc.data()));
  }
}

export async function getLatestCropRecommendationForFarm(
  uid: string,
  farmId: string,
): Promise<CropRecommendation | null> {
  const ownership = await assertFarmOwnership(uid, farmId);

  if (!ownership) {
    return null;
  }

  let latestDataDoc:
    | (typeof cropRecommendationsCollection extends CollectionReference<infer T>
        ? import("firebase-admin/firestore").QueryDocumentSnapshot<T>
        : never)
    | null = null;

  try {
    const indexedSnapshot = await cropRecommendationsCollection
      .where("uid", "==", uid)
      .where("farmId", "==", farmId)
      .orderBy("createdAt", "desc")
      .limit(10)
      .get();

    latestDataDoc =
      indexedSnapshot.docs.find((doc) => doc.data().isSeedData !== true) ??
      null;
  } catch (error) {
    if (!isMissingFirestoreIndexError(error)) {
      throw error;
    }

    // Fallback path for environments where the composite index is not created yet.
    const fallbackSnapshot = await cropRecommendationsCollection
      .where("farmId", "==", farmId)
      .get();

    const candidateDocs = fallbackSnapshot.docs.filter((doc) => {
      const data = doc.data();

      return data.isSeedData !== true && normalizeText(data.uid, 128) === uid;
    });

    candidateDocs.sort((firstDoc, secondDoc) => {
      const firstData = firstDoc.data();
      const secondData = secondDoc.data();
      const firstCreatedAt = toTimestampMillis(firstData.createdAt);
      const secondCreatedAt = toTimestampMillis(secondData.createdAt);

      return secondCreatedAt - firstCreatedAt;
    });

    latestDataDoc = candidateDocs[0] ?? null;
  }

  if (!latestDataDoc) {
    return null;
  }

  return toCropRecommendation(latestDataDoc.id, latestDataDoc.data());
}
