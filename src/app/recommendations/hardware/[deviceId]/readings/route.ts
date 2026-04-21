import { createHash } from "crypto";
import { z } from "zod";

import {
  errorResponse,
  handleRouteError,
} from "../../../../../lib/apiResponse";
import {
  completeFarmDeviceReadingUpload,
  createSoilAnalysisForFarm,
  getFarmDeviceLinkByDeviceId,
  getLatestCropRecommendationForFarm,
} from "../../../../../lib/firestoreSchema";

export const runtime = "nodejs";

const hardwareParamsSchema = z.object({
  deviceId: z.string().trim().min(1).max(128),
});

const hardwareReadingsSchema = z
  .object({
    soil_moisture_pct: z.number().min(0).max(100).optional(),
    moistureContent: z.number().min(0).max(100).optional(),
    temperature_c: z.number().min(-50).max(80).optional(),
    temperatureC: z.number().min(-50).max(80).optional(),
    humidity_pct: z.number().min(0).max(100).optional(),
    humidity: z.number().min(0).max(100).optional(),
    light_lux: z.number().min(0).optional(),
    lightLevel: z.number().min(0).optional(),
    ph: z.number().min(0).max(14).optional(),
    pH: z.number().min(0).max(14).optional(),
  })
  .refine(
    (payload) =>
      payload.soil_moisture_pct !== undefined ||
      payload.moistureContent !== undefined ||
      payload.temperature_c !== undefined ||
      payload.temperatureC !== undefined ||
      payload.humidity_pct !== undefined ||
      payload.humidity !== undefined ||
      payload.light_lux !== undefined ||
      payload.lightLevel !== undefined,
    {
      message: "At least one hardware reading is required.",
      path: ["soil_moisture_pct"],
    },
  );

type HardwareReadingsContext = {
  params: Promise<{ deviceId: string }>;
};

function hashToken(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export async function POST(request: Request, context: HardwareReadingsContext) {
  try {
    const routeParams = await context.params;
    const paramsValidation = hardwareParamsSchema.safeParse(routeParams);

    if (!paramsValidation.success) {
      return errorResponse(400, "VALIDATION_ERROR", "Invalid device id.");
    }

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

    const payloadValidation = hardwareReadingsSchema.safeParse(requestBody);

    if (!payloadValidation.success) {
      return errorResponse(
        400,
        "VALIDATION_ERROR",
        "Invalid hardware readings payload.",
        payloadValidation.error.flatten(),
      );
    }

    const deviceToken = request.headers.get("x-device-token")?.trim();

    if (!deviceToken) {
      return errorResponse(
        401,
        "DEVICE_TOKEN_REQUIRED",
        "Missing X-Device-Token header.",
      );
    }

    const linkedDevice = await getFarmDeviceLinkByDeviceId(
      paramsValidation.data.deviceId,
    );

    if (!linkedDevice) {
      return errorResponse(
        404,
        "DEVICE_NOT_CONNECTED",
        "This hardware device is not linked to a farm.",
      );
    }

    if (linkedDevice.tokenHash !== hashToken(deviceToken)) {
      return errorResponse(
        401,
        "DEVICE_AUTH_FAILED",
        "Device credentials are not valid.",
      );
    }

    const readingsPayload = {
      moistureContent:
        payloadValidation.data.moistureContent ??
        payloadValidation.data.soil_moisture_pct,
      temperatureC:
        payloadValidation.data.temperatureC ??
        payloadValidation.data.temperature_c,
      humidity:
        payloadValidation.data.humidity ?? payloadValidation.data.humidity_pct,
      lightLevel:
        payloadValidation.data.lightLevel ?? payloadValidation.data.light_lux,
      pH: payloadValidation.data.pH ?? payloadValidation.data.ph,
    };

    const collectedAt = new Date().toISOString();

    const soilProfile = await createSoilAnalysisForFarm(
      linkedDevice.uid,
      linkedDevice.farmId,
      {
        texture: null,
        soilClass: null,
        soilClassValue: null,
        soilClassProbability: null,
        soilClassProbabilities: [],
        pH: readingsPayload.pH ?? null,
        moistureContent: readingsPayload.moistureContent ?? null,
        lightLevel: readingsPayload.lightLevel ?? null,
        temperatureC: readingsPayload.temperatureC ?? null,
        humidity: readingsPayload.humidity ?? null,
        nitrogen: null,
        phosphorus: null,
        potassium: null,
        soilSource: "device",
        classificationJson: {
          source: "hardware-readings-route",
          collectedAt,
        },
        analysisJson: {
          inputMode: "device-readings",
          source: "hardware-readings-route",
          collectedAt,
          sensorContext: readingsPayload,
        },
      },
    );

    if (!soilProfile) {
      return errorResponse(404, "FARM_NOT_FOUND", "Farm not found.");
    }

    await completeFarmDeviceReadingUpload(linkedDevice.farmId, {
      ...readingsPayload,
      collectedAt,
    });

    const recommendation = await getLatestCropRecommendationForFarm(
      linkedDevice.uid,
      linkedDevice.farmId,
    );

    const top3Crops =
      recommendation?.recommendedCrops.slice(0, 3).map((item) => item.crop) ??
      [];

    return Response.json(
      {
        top_3_crops: top3Crops,
        message:
          top3Crops.length > 0
            ? "Readings received. Returning the latest farm recommendations."
            : "Readings received. No recommendation record found yet; generate recommendations in the app.",
        total_crops_generated: top3Crops.length,
        farm_id: linkedDevice.farmId,
        device_id: linkedDevice.deviceId,
        collected_at: collectedAt,
      },
      { status: 200 },
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
