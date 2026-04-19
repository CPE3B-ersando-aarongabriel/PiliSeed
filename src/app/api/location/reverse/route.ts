import { z } from "zod";

import {
  errorResponse,
  handleRouteError,
  successResponse,
} from "../../../../lib/apiResponse";
import { verifyTokenWithClaims } from "../../../../lib/authMiddleware";
import { createGeocodingService } from "../../../../lib/geocodingService";

export const runtime = "nodejs";

const reverseGeocodeRequestSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  limit: z.number().int().min(1).max(10).optional(),
});

const geocodingService = createGeocodingService();

function buildLowConfidenceWarnings(confidence: number) {
  if (confidence >= 0.35) {
    return [];
  }

  return [
    "The reverse geocoding result confidence is low. Consider confirming the exact location.",
  ];
}

async function runReverseGeocode(input: {
  latitude: number;
  longitude: number;
  limit?: number;
}) {
  const reverseGeocodes = await geocodingService.reverseGeocodeCoordinates(
    input.latitude,
    input.longitude,
    {
      limit: input.limit,
    },
  );
  const reverseGeocode = reverseGeocodes[0];

  return successResponse({
    reverseGeocodes,
    reverseGeocode,
    warnings: buildLowConfidenceWarnings(reverseGeocode.confidence),
  });
}

export async function POST(request: Request) {
  try {
    await verifyTokenWithClaims(request);

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

    const validationResult = reverseGeocodeRequestSchema.safeParse(requestBody);

    if (!validationResult.success) {
      return errorResponse(
        400,
        "VALIDATION_ERROR",
        "Invalid reverse geocode payload.",
        validationResult.error.flatten(),
      );
    }

    return await runReverseGeocode(validationResult.data);
  } catch (error) {
    return handleRouteError(error);
  }
}
