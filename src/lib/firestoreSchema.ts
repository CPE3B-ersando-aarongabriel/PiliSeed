import type { DecodedIdToken } from "firebase-admin/auth";
import {
  FieldValue,
  type CollectionReference,
  type DocumentData,
} from "firebase-admin/firestore";

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

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
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
