import { z } from "zod";

import {
  errorResponse,
  handleRouteError,
  successResponse,
} from "../../../../lib/apiResponse";
import { verifyTokenWithClaims } from "../../../../lib/authMiddleware";
import { createGeocodingService } from "../../../../lib/geocodingService";

export const runtime = "nodejs";

const geocodeRequestSchema = z.object({
  locationText: z.string().trim().min(2).max(180),
  countryCode: z
    .string()
    .trim()
    .regex(/^[a-zA-Z]{2}$/)
    .optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

const geocodingService = createGeocodingService();

function buildLowConfidenceWarnings(confidence: number) {
  if (confidence >= 0.35) {
    return [];
  }

  return [
    "The geocoding result confidence is low. Ask the user to confirm or refine the location text.",
  ];
}

async function runGeocode(input: {
  locationText: string;
  countryCode?: string;
  limit?: number;
}) {
  const geocodes = await geocodingService.geocodeLocationText(input.locationText, {
    countryCode: input.countryCode,
    limit: input.limit,
  });
  const geocode = geocodes[0];

  return successResponse({
    geocodes,
    geocode,
    warnings: buildLowConfidenceWarnings(geocode.confidence),
  });
}

export async function GET(request: Request) {
  try {
    await verifyTokenWithClaims(request);

    const url = new URL(request.url);
    const validationResult = geocodeRequestSchema.safeParse({
      locationText:
        url.searchParams.get("locationText") ??
        url.searchParams.get("address") ??
        undefined,
      countryCode: url.searchParams.get("countryCode") ?? undefined,
      limit: url.searchParams.get("limit")
        ? Number(url.searchParams.get("limit"))
        : undefined,
    });

    if (!validationResult.success) {
      return errorResponse(
        400,
        "VALIDATION_ERROR",
        "Invalid geocode query parameters.",
        validationResult.error.flatten(),
      );
    }

    return await runGeocode(validationResult.data);
  } catch (error) {
    return handleRouteError(error);
  }
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

    const validationResult = geocodeRequestSchema.safeParse(requestBody);

    if (!validationResult.success) {
      return errorResponse(
        400,
        "VALIDATION_ERROR",
        "Invalid geocode payload.",
        validationResult.error.flatten(),
      );
    }

    return await runGeocode(validationResult.data);
  } catch (error) {
    return handleRouteError(error);
  }
}
