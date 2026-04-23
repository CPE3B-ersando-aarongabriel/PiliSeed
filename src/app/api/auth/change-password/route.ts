import { z } from "zod";
import { FieldValue } from "firebase-admin/firestore";

import {
  errorResponse,
  handleRouteError,
  successResponse,
} from "../../../../lib/apiResponse";
import { verifyTokenWithClaims } from "../../../../lib/authMiddleware";
import { auth, firestore } from "../../../../lib/firebaseAdmin";
import {
  createRawResetToken,
  getResetTokenExpiresAtIso,
  hashPassword,
  hashResetToken,
} from "../../../../lib/passwordSecurity";
import { sendResetLinkEmail } from "../../../../lib/emailjsService";

export const runtime = "nodejs";

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(8).max(128),
    newPassword: z.string().min(8).max(128),
    confirmNewPassword: z.string().min(8).max(128),
  })
  .refine((value) => value.newPassword === value.confirmNewPassword, {
    message: "New passwords do not match.",
    path: ["confirmNewPassword"],
  })
  .refine((value) => value.currentPassword !== value.newPassword, {
    message: "New password must be different from current password.",
    path: ["newPassword"],
  });

async function verifyCurrentPasswordWithFirebase(email: string, currentPassword: string) {
  const firebaseApiKey =
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.trim() ||
    process.env.FIREBASE_WEB_API_KEY?.trim() ||
    "";

  if (!firebaseApiKey) {
    throw new Error(
      "Missing Firebase Web API key. Set NEXT_PUBLIC_FIREBASE_API_KEY or FIREBASE_WEB_API_KEY.",
    );
  }

  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${firebaseApiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password: currentPassword,
        returnSecureToken: false,
      }),
    },
  );

  if (response.ok) {
    return true;
  }

  const body = await response.json().catch(() => null);
  const code =
    typeof body === "object" &&
    body !== null &&
    "error" in body &&
    typeof (body as { error?: { message?: unknown } }).error?.message === "string"
      ? (body as { error: { message: string } }).error.message
      : "";

  if (
    code.includes("INVALID_PASSWORD") ||
    code.includes("EMAIL_NOT_FOUND") ||
    code.includes("INVALID_LOGIN_CREDENTIALS")
  ) {
    return false;
  }

  throw new Error("Unable to verify your current password at this time.");
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);

    if (body === null || typeof body !== "object" || Array.isArray(body)) {
      return errorResponse(400, "INVALID_REQUEST_BODY", "Request body must be a JSON object.");
    }

    const validation = changePasswordSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse(
        400,
        "VALIDATION_ERROR",
        "Invalid change password payload.",
        validation.error.flatten(),
      );
    }

    const decodedToken = await verifyTokenWithClaims(request);
    const firebaseUser = await auth.getUser(decodedToken.uid);

    if (!firebaseUser.email) {
      return errorResponse(400, "EMAIL_NOT_AVAILABLE", "A verified email is required to change password.");
    }

    const passwordProvider = firebaseUser.providerData.find((provider) => provider.providerId === "password");

    if (!passwordProvider) {
      return errorResponse(
        400,
        "PASSWORD_AUTH_NOT_ENABLED",
        "Password change is only available for email/password accounts.",
      );
    }

    const isCurrentPasswordValid = await verifyCurrentPasswordWithFirebase(
      firebaseUser.email,
      validation.data.currentPassword,
    );

    if (!isCurrentPasswordValid) {
      return errorResponse(400, "WRONG_CURRENT_PASSWORD", "Current password is incorrect.");
    }

    await auth.updateUser(decodedToken.uid, {
      password: validation.data.newPassword,
    });

    const digest = hashPassword(validation.data.newPassword);

    await firestore.collection("users").doc(decodedToken.uid).set(
      {
        passwordHash: digest.hash,
        passwordSalt: digest.salt,
        passwordHashAlgorithm: digest.algorithm,
        passwordUpdatedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    const requestUrl = new URL(request.url);
    const email = firebaseUser.email.toLowerCase();
    const rawToken = createRawResetToken();
    const tokenHash = hashResetToken(rawToken, email);
    const expiresAt = getResetTokenExpiresAtIso();

    await firestore.collection("passwordResetTokens").doc(tokenHash).set({
      uid: firebaseUser.uid,
      email,
      tokenHash,
      expiresAt,
      usedAt: null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    const resetLink = `${requestUrl.origin}/reset-password?token=${encodeURIComponent(rawToken)}&email=${encodeURIComponent(email)}`;

    try {
      await sendResetLinkEmail(email, resetLink);
    } catch (error) {
      console.warn("[ChangePassword] EmailJS send failed:", error);
    }

    return successResponse({
      message: "Password changed successfully.",
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
