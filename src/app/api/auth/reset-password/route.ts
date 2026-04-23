import { z } from "zod";
import { FieldValue } from "firebase-admin/firestore";

import {
  errorResponse,
  handleRouteError,
  successResponse,
} from "../../../../lib/apiResponse";
import { auth, firestore } from "../../../../lib/firebaseAdmin";
import {
  hashPassword,
  hashResetToken,
  isExpiredIsoDate,
} from "../../../../lib/passwordSecurity";

export const runtime = "nodejs";

const resetPasswordSchema = z
  .object({
    email: z.string().trim().email().max(120),
    token: z.string().trim().min(20),
    newPassword: z.string().min(8).max(128),
    confirmPassword: z.string().min(8).max(128),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);

    if (body === null || typeof body !== "object" || Array.isArray(body)) {
      return errorResponse(400, "INVALID_REQUEST_BODY", "Request body must be a JSON object.");
    }

    const validation = resetPasswordSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse(
        400,
        "VALIDATION_ERROR",
        "Invalid reset password payload.",
        validation.error.flatten(),
      );
    }

    const email = validation.data.email.trim().toLowerCase();
    const tokenHash = hashResetToken(validation.data.token, email);

    const tokenRef = firestore.collection("passwordResetTokens").doc(tokenHash);
    const tokenSnapshot = await tokenRef.get();

    if (!tokenSnapshot.exists) {
      return errorResponse(400, "INVALID_TOKEN", "Reset token is invalid.");
    }

    const tokenData = tokenSnapshot.data() ?? {};
    const tokenEmail = typeof tokenData.email === "string" ? tokenData.email : "";
    const tokenUid = typeof tokenData.uid === "string" ? tokenData.uid : "";
    const usedAt = tokenData.usedAt;
    const expiresAt = typeof tokenData.expiresAt === "string" ? tokenData.expiresAt : "";

    if (!tokenUid || !tokenEmail || tokenEmail !== email) {
      return errorResponse(400, "INVALID_TOKEN", "Reset token is invalid.");
    }

    if (usedAt) {
      return errorResponse(400, "TOKEN_ALREADY_USED", "Reset token has already been used.");
    }

    if (!expiresAt || isExpiredIsoDate(expiresAt)) {
      return errorResponse(400, "TOKEN_EXPIRED", "Reset token has expired.");
    }

    await auth.updateUser(tokenUid, {
      password: validation.data.newPassword,
    });

    const passwordDigest = hashPassword(validation.data.newPassword);

    await Promise.all([
      tokenRef.update({
        usedAt: new Date().toISOString(),
        updatedAt: FieldValue.serverTimestamp(),
      }),
      firestore.collection("users").doc(tokenUid).set(
        {
          passwordHash: passwordDigest.hash,
          passwordSalt: passwordDigest.salt,
          passwordHashAlgorithm: passwordDigest.algorithm,
          passwordUpdatedAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      ),
    ]);

    return successResponse({
      message: "Password reset successful. You can now log in with your new password.",
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
