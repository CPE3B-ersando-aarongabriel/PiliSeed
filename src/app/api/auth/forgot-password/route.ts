import { z } from "zod";
import { FieldValue } from "firebase-admin/firestore";

import {
  errorResponse,
  handleRouteError,
  successResponse,
} from "../../../../lib/apiResponse";
import { auth, firestore } from "../../../../lib/firebaseAdmin";
import {
  createRawResetToken,
  getResetTokenExpiresAtIso,
  hashResetToken,
} from "../../../../lib/passwordSecurity";
import { sendResetLinkEmail } from "../../../../lib/emailjsService";

export const runtime = "nodejs";

const forgotPasswordSchema = z.object({
  email: z.string().trim().email().max(120),
});

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);

    if (body === null || typeof body !== "object" || Array.isArray(body)) {
      return errorResponse(400, "INVALID_REQUEST_BODY", "Request body must be a JSON object.");
    }

    const validation = forgotPasswordSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse(
        400,
        "VALIDATION_ERROR",
        "Invalid forgot password payload.",
        validation.error.flatten(),
      );
    }

    const email = validation.data.email.trim().toLowerCase();

    let firebaseUser;

    try {
      firebaseUser = await auth.getUserByEmail(email);
    } catch (error) {
      const code =
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        typeof (error as { code?: unknown }).code === "string"
          ? (error as { code: string }).code
          : "";

      if (code === "auth/user-not-found") {
        return errorResponse(404, "USER_NOT_FOUND", "No user account was found for this email.");
      }

      throw error;
    }

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

    const requestUrl = new URL(request.url);
    const resetLink = `${requestUrl.origin}/reset-password?token=${encodeURIComponent(rawToken)}&email=${encodeURIComponent(email)}`;

    // Simulated email send required by the feature request.
    console.log("[ForgotPassword] Reset link generated:", resetLink);

    let emailDelivery = { delivered: false, reason: "Simulated only" };

    try {
      emailDelivery = await sendResetLinkEmail(email, resetLink);
    } catch (error) {
      console.warn("[ForgotPassword] EmailJS send failed:", error);
      emailDelivery = { delivered: false, reason: "EmailJS request failed; link logged on server." };
    }

    return successResponse({
      email,
      expiresAt,
      emailDelivery,
      message: "If your email exists, a reset link has been generated.",
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
