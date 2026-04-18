import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

function getRequiredPublicEnvVar(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

const firebaseConfig = {
  apiKey: getRequiredPublicEnvVar("NEXT_PUBLIC_FIREBASE_API_KEY"),
  authDomain: getRequiredPublicEnvVar("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"),
  projectId: getRequiredPublicEnvVar("NEXT_PUBLIC_FIREBASE_PROJECT_ID"),
  storageBucket: getRequiredPublicEnvVar("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: getRequiredPublicEnvVar(
    "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  ),
  appId: getRequiredPublicEnvVar("NEXT_PUBLIC_FIREBASE_APP_ID"),
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const clientAuth = getAuth(app);
export const clientGoogleProvider = new GoogleAuthProvider();

clientGoogleProvider.setCustomParameters({ prompt: "select_account" });
