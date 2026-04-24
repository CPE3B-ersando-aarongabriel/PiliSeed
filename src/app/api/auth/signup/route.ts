import { z } from "zod";

import {
  errorResponse,
  handleRouteError,
  successResponse,
} from "../../../../lib/apiResponse";
import { verifyTokenWithClaims } from "../../../../lib/authMiddleware";
import { ensureUserScaffold } from "../../../../lib/firestoreSchema";

export const runtime = "nodejs";

const signupBodySchema = z.object({
  name: z.string().trim().min(1).max(50).optional(),
});

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") ?? "";
    let requestBody: unknown = {};

    if (contentType.includes("application/json")) {
      requestBody = await request.json().catch(() => null);

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
    }

    const validationResult = signupBodySchema.safeParse(requestBody);

    if (!validationResult.success) {
      return errorResponse(
        400,
        "VALIDATION_ERROR",
        "Invalid signup payload.",
        validationResult.error.flatten(),
      );
    }

    const decodedToken = await verifyTokenWithClaims(request);
    const scaffoldResult = await ensureUserScaffold({
      decodedToken,
      requestedName: validationResult.data.name,
    });

    return successResponse(
      {
        uid: scaffoldResult.profile.uid,
        providerIds: scaffoldResult.profile.providerIds,
        profile: scaffoldResult.profile,
        defaultFarmId: scaffoldResult.farmId,
      },
      scaffoldResult.created ? 201 : 200,
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
