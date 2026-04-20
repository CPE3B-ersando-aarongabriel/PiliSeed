import { createHash } from "crypto";
import { z } from "zod";

import {
  errorResponse,
  handleRouteError,
  successResponse,
} from "../../../../../../../lib/apiResponse";
import {
  completeFarmDeviceReadingUpload,
  createSoilAnalysisForFarm,
  getFarmDeviceLinkByFarmId,
} from "../../../../../../../lib/firestoreSchema";

export const runtime = "nodejs";

const farmParamsSchema = z.object({
  farmId: z.string().trim().min(1),
});

const deviceReadingsSchema = z
  .object({
    deviceId: z.string().trim().min(1).max(128).optional(),
    moistureContent: z.number().min(0).max(100).optional(),
    pH: z.number().min(0).max(14).optional(),
    lightLevel: z.number().min(0).optional(),
    temperatureC: z.number().min(-50).max(80).optional(),
    humidity: z.number().min(0).max(100).optional(),
  })
  .refine(
    (payload) =>
      payload.moistureContent !== undefined ||
      payload.pH !== undefined ||
      payload.lightLevel !== undefined ||
      payload.temperatureC !== undefined ||
      payload.humidity !== undefined,
    {
      message: "At least one sensor reading is required.",
      path: ["moistureContent"],
    },
  );

type SoilDeviceReadingsContext = {
  params: Promise<{ farmId: string }>;
};

function hashToken(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function normalizeOptionalNumericInput(value: unknown): number | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();

    if (!trimmed) {
      return undefined;
    }

    const parsed = Number(trimmed);

    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

export async function POST(request: Request, context: SoilDeviceReadingsContext) {
  try {
    const routeParams = await context.params;
    const farmIdResult = farmParamsSchema.safeParse(routeParams);

    if (!farmIdResult.success) {
      return errorResponse(400, "VALIDATION_ERROR", "Invalid farm id.");
    }

    const deviceToken = request.headers.get("x-device-token")?.trim();

    if (!deviceToken) {
      return errorResponse(
        401,
        "DEVICE_TOKEN_REQUIRED",
        "Missing X-Device-Token header.",
      );
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

    const normalizedBody = {
      ...(requestBody as Record<string, unknown>),
    };

    if (
      normalizedBody.deviceId === undefined &&
      typeof normalizedBody.sensorId === "string"
    ) {
      normalizedBody.deviceId = normalizedBody.sensorId;
    }

    if (
      normalizedBody.deviceId === undefined &&
      typeof normalizedBody.sensor_id === "string"
    ) {
      normalizedBody.deviceId = normalizedBody.sensor_id;
    }

    if (
      normalizedBody.moistureContent === undefined &&
      normalizedBody.moisture !== undefined
    ) {
      normalizedBody.moistureContent = normalizedBody.moisture;
    }

    if (
      normalizedBody.moistureContent === undefined &&
      normalizedBody.soil_moisture_pct !== undefined
    ) {
      normalizedBody.moistureContent = normalizedBody.soil_moisture_pct;
    }

    if (normalizedBody.pH === undefined && normalizedBody.ph !== undefined) {
      normalizedBody.pH = normalizedBody.ph;
    }

    if (
      normalizedBody.lightLevel === undefined &&
      normalizedBody.light !== undefined
    ) {
      normalizedBody.lightLevel = normalizedBody.light;
    }

    if (
      normalizedBody.lightLevel === undefined &&
      normalizedBody.light_lux !== undefined
    ) {
      normalizedBody.lightLevel = normalizedBody.light_lux;
    }

    if (
      normalizedBody.temperatureC === undefined &&
      normalizedBody.temperature !== undefined
    ) {
      normalizedBody.temperatureC = normalizedBody.temperature;
    }

    if (
      normalizedBody.temperatureC === undefined &&
      normalizedBody.temperature_c !== undefined
    ) {
      normalizedBody.temperatureC = normalizedBody.temperature_c;
    }

    if (
      normalizedBody.humidity === undefined &&
      normalizedBody.humidity_pct !== undefined
    ) {
      normalizedBody.humidity = normalizedBody.humidity_pct;
    }

    const validationResult = deviceReadingsSchema.safeParse({
      deviceId:
        typeof normalizedBody.deviceId === "string"
          ? normalizedBody.deviceId.trim()
          : undefined,
      moistureContent: normalizeOptionalNumericInput(normalizedBody.moistureContent),
      pH: normalizeOptionalNumericInput(normalizedBody.pH),
      lightLevel: normalizeOptionalNumericInput(normalizedBody.lightLevel),
      temperatureC: normalizeOptionalNumericInput(normalizedBody.temperatureC),
      humidity: normalizeOptionalNumericInput(normalizedBody.humidity),
    });

    if (!validationResult.success) {
      return errorResponse(
        400,
        "VALIDATION_ERROR",
        "Invalid soil device readings payload.",
        validationResult.error.flatten(),
      );
    }

    const linkedDevice = await getFarmDeviceLinkByFarmId(farmIdResult.data.farmId);

    if (!linkedDevice) {
      return errorResponse(
        404,
        "DEVICE_NOT_CONNECTED",
        "No soil sensor device is currently linked to this farm.",
      );
    }

    const hashedToken = hashToken(deviceToken);

    if (linkedDevice.tokenHash !== hashedToken) {
      return errorResponse(
        401,
        "DEVICE_AUTH_FAILED",
        "Device credentials are not valid for this farm.",
      );
    }

    if (
      validationResult.data.deviceId &&
      validationResult.data.deviceId !== linkedDevice.deviceId
    ) {
      return errorResponse(
        401,
        "DEVICE_AUTH_FAILED",
        "The provided device id does not match the linked farm device.",
      );
    }

    const collectedAt = new Date().toISOString();
    const readingsPayload = {
      moistureContent: validationResult.data.moistureContent,
      pH: validationResult.data.pH,
      lightLevel: validationResult.data.lightLevel,
      temperatureC: validationResult.data.temperatureC,
      humidity: validationResult.data.humidity,
    };

    const soilProfile = await createSoilAnalysisForFarm(linkedDevice.uid, linkedDevice.farmId, {
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
        source: "soil-device-readings",
        collectedAt,
      },
      analysisJson: {
        inputMode: "device-readings",
        collectedAt,
        source: "soil-device-readings",
        sensorContext: readingsPayload,
      },
    });

    if (!soilProfile) {
      return errorResponse(404, "FARM_NOT_FOUND", "Farm not found.");
    }

    const updatedDevice = await completeFarmDeviceReadingUpload(linkedDevice.farmId, {
      ...readingsPayload,
      collectedAt,
    });

    if (!updatedDevice) {
      return errorResponse(
        404,
        "DEVICE_NOT_CONNECTED",
        "No soil sensor device is currently linked to this farm.",
      );
    }

    return successResponse(
      {
        farmId: linkedDevice.farmId,
        deviceId: linkedDevice.deviceId,
        readings: updatedDevice.lastReadings,
        collectedAt: updatedDevice.lastCollectedAt ?? collectedAt,
        activation: {
          pending: updatedDevice.activationPending,
          fulfilledAt: updatedDevice.lastActivationFulfilledAt,
        },
        soilProfileId: soilProfile.id,
        source: "device",
      },
      201,
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
