import { z } from "zod";

import { errorResponse, handleRouteError } from "../../../../lib/apiResponse";
import { verifyTokenWithClaims } from "../../../../lib/authMiddleware";

export const runtime = "nodejs";

const geocodeQuerySchema = z.object({
  address: z.string().trim().min(2).max(180).optional(),
});

export async function GET(request: Request) {
  try {
    await verifyTokenWithClaims(request);

    const url = new URL(request.url);
    const validationResult = geocodeQuerySchema.safeParse({
      address: url.searchParams.get("address") ?? undefined,
    });

    if (!validationResult.success) {
      return errorResponse(
        400,
        "VALIDATION_ERROR",
        "Invalid geocode query parameters.",
        validationResult.error.flatten(),
      );
    }

    return errorResponse(
      501,
      "NOT_IMPLEMENTED",
      "Geocode endpoint placeholder is ready, but geocoding integration is not implemented yet.",
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
