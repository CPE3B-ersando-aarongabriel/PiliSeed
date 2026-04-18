import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth";

const firebaseClientEnv = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
} as const;

const firebaseClientEnvVarNames = {
  apiKey: "NEXT_PUBLIC_FIREBASE_API_KEY",
  authDomain: "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  projectId: "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  storageBucket: "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  messagingSenderId: "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  appId: "NEXT_PUBLIC_FIREBASE_APP_ID",
} as const;

type FirebaseClientEnvKey = keyof typeof firebaseClientEnv;

let cachedApp: FirebaseApp | null = null;
let cachedAuth: Auth | null = null;
let cachedGoogleProvider: GoogleAuthProvider | null = null;

function readPublicEnvVar(key: FirebaseClientEnvKey) {
  const value = firebaseClientEnv[key];

  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

export function getMissingFirebaseClientEnvVars() {
  return (Object.keys(firebaseClientEnvVarNames) as FirebaseClientEnvKey[])
    .filter((key) => !readPublicEnvVar(key))
    .map((key) => firebaseClientEnvVarNames[key]);
}

function ensureFirebaseClientConfig() {
  const missingVars = getMissingFirebaseClientEnvVars();

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required Firebase client environment variables: ${missingVars.join(
        ", ",
      )}`,
    );
  }

  return {
    apiKey: readPublicEnvVar("apiKey"),
    authDomain: readPublicEnvVar("authDomain"),
    projectId: readPublicEnvVar("projectId"),
    storageBucket: readPublicEnvVar("storageBucket"),
    messagingSenderId: readPublicEnvVar("messagingSenderId"),
    appId: readPublicEnvVar("appId"),
  };
}

function ensureBrowserContext() {
  if (typeof window === "undefined") {
    throw new Error("Firebase client SDK can only be used in a browser context.");
  }
}

function getClientApp() {
  ensureBrowserContext();

  if (cachedApp) {
    return cachedApp;
  }

  const firebaseConfig = ensureFirebaseClientConfig();
  cachedApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

  return cachedApp;
}

export function getClientAuth() {
  if (cachedAuth) {
    return cachedAuth;
  }

  cachedAuth = getAuth(getClientApp());

  return cachedAuth;
}

export function getClientGoogleProvider() {
  if (cachedGoogleProvider) {
    return cachedGoogleProvider;
  }

  cachedGoogleProvider = new GoogleAuthProvider();
  cachedGoogleProvider.setCustomParameters({ prompt: "select_account" });

  return cachedGoogleProvider;
}
