import admin from "firebase-admin";

function getRequiredEnvVar(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

const projectId = getRequiredEnvVar("FIREBASE_ADMIN_PROJECT_ID");
const clientEmail = getRequiredEnvVar("FIREBASE_ADMIN_CLIENT_EMAIL");
const privateKey = getRequiredEnvVar("FIREBASE_ADMIN_PRIVATE_KEY").replace(
  /\\n/g,
  "\n",
);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
}

export const auth = admin.auth();
export const firestore = admin.firestore();
