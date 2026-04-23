import { z } from "zod";

import {
  errorResponse,
  handleRouteError,
  successResponse,
} from "../../../lib/apiResponse";
import { verifyTokenWithClaims } from "../../../lib/authMiddleware";
import {
  ensureUserScaffold,
  getUserProfile,
  type UserProfile,
  updateUserProfile,
} from "../../../lib/firestoreSchema";

export const runtime = "nodejs";

const imageUrlSchema = z.string().trim().url().max(500);

const profileUpdateSchema = z
  .object({
    name: z.string().trim().min(1).max(80).optional(),
    phone: z.string().trim().min(5).max(30).optional(),
    address: z.string().trim().min(5).max(180).optional(),
    photoURL: imageUrlSchema.optional(),
    profileImageUrl: imageUrlSchema.optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one profile field is required.",
  });

function withProfileImageUrl(profile: UserProfile) {
  return {
    ...profile,
    profileImageUrl: profile.photoURL,
  };
}

export async function GET(request: Request) {
  try {
    const decodedToken = await verifyTokenWithClaims(request);
    let profile = await getUserProfile(decodedToken.uid);

    if (!profile) {
      const scaffoldResult = await ensureUserScaffold({ decodedToken });
      profile = scaffoldResult.profile;
    }

    if (!profile) {
      return errorResponse(
        500,
        "PROFILE_LOAD_FAILED",
        "Unable to load profile for this account.",
      );
    }

    return successResponse({ profile: withProfileImageUrl(profile) });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const requestBody = await request.json().catch(() => null);

    if (
      requestBody === null ||
      typeof requestBody !== "object" ||
      Array.isArray(requestBody)
    ) {
      return errorResponse(
        400,
        "INVALID_REQUEST_BODY",
        "Request body must be a valid JSON object.",
      );
    }

    const validationResult = profileUpdateSchema.safeParse(requestBody);

    if (!validationResult.success) {
      return errorResponse(
        400,
        "VALIDATION_ERROR",
        "Invalid profile payload.",
        validationResult.error.flatten(),
      );
    }

    const decodedToken = await verifyTokenWithClaims(request);

    await ensureUserScaffold({ decodedToken });

    const updatesPayload: {
      name?: string;
      phone?: string;
      address?: string;
      photoURL?: string;
    } = {};

    if (Object.prototype.hasOwnProperty.call(validationResult.data, "name")) {
      updatesPayload.name = validationResult.data.name;
    }

    if (Object.prototype.hasOwnProperty.call(validationResult.data, "phone")) {
      updatesPayload.phone = validationResult.data.phone;
    }

    if (
      Object.prototype.hasOwnProperty.call(validationResult.data, "address")
    ) {
      updatesPayload.address = validationResult.data.address;
    }

    if (
      Object.prototype.hasOwnProperty.call(validationResult.data, "photoURL")
    ) {
      updatesPayload.photoURL = validationResult.data.photoURL;
    }

    if (
      Object.prototype.hasOwnProperty.call(
        validationResult.data,
        "profileImageUrl",
      )
    ) {
      updatesPayload.photoURL = validationResult.data.profileImageUrl;
    }

    const profile = await updateUserProfile(decodedToken.uid, updatesPayload);

    return successResponse({ profile: withProfileImageUrl(profile) });
  } catch (error) {
    return handleRouteError(error);
  }
}
