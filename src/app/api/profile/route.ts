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
  updateUserProfile,
} from "../../../lib/firestoreSchema";

export const runtime = "nodejs";

const profileUpdateSchema = z
  .object({
    name: z.string().trim().min(1).max(80).optional(),
    phone: z.string().trim().min(5).max(30).optional(),
    address: z.string().trim().min(5).max(180).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one profile field is required.",
  });

export async function GET(request: Request) {
  try {
    const decodedToken = await verifyTokenWithClaims(request);
    let profile = await getUserProfile(decodedToken.uid);

    if (!profile) {
      const scaffoldResult = await ensureUserScaffold({ decodedToken });
      profile = scaffoldResult.profile;
    }

    return successResponse({ profile });
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

    const profile = await updateUserProfile(
      decodedToken.uid,
      validationResult.data,
    );

    return successResponse({ profile });
  } catch (error) {
    return handleRouteError(error);
  }
}
