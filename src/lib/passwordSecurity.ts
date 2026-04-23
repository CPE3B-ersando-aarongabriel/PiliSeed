import crypto from "crypto";

const DEFAULT_RESET_TOKEN_TTL_MS = 1000 * 60 * 30;

function getResetTokenSecret() {
  const configured = process.env.RESET_TOKEN_SECRET?.trim();

  if (configured) {
    return configured;
  }

  const adminKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.trim();

  if (adminKey) {
    return adminKey;
  }

  return "piliseed-dev-reset-token-secret";
}

export function createRawResetToken() {
  return crypto.randomBytes(32).toString("hex");
}

export function hashResetToken(rawToken: string, email: string) {
  const normalizedEmail = email.trim().toLowerCase();

  return crypto
    .createHmac("sha256", getResetTokenSecret())
    .update(`${rawToken}:${normalizedEmail}`)
    .digest("hex");
}

export function getResetTokenExpiresAtIso(ttlMs = DEFAULT_RESET_TOKEN_TTL_MS) {
  return new Date(Date.now() + ttlMs).toISOString();
}

export function isExpiredIsoDate(isoDate: string) {
  return Date.parse(isoDate) <= Date.now();
}

export function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(password, salt, 64).toString("hex");

  return {
    salt,
    hash: derived,
    algorithm: "scrypt-sha256",
  } as const;
}
