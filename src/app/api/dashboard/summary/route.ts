import { handleRouteError, successResponse } from "../../../../lib/apiResponse";
import { verifyTokenWithClaims } from "../../../../lib/authMiddleware";
import {
  getLatestCropRecommendationForFarm,
  getLatestSoilProfileForFarm,
  getLatestWeatherSnapshotForFarm,
  getLatestYieldForecastForFarm,
  listFarmsByUid,
} from "../../../../lib/firestoreSchema";

export const runtime = "nodejs";

function toRainRisk(rainfallMm: number | null): "low" | "medium" | "high" | "unknown" {
  if (rainfallMm === null) {
    return "unknown";
  }

  if (rainfallMm >= 12) {
    return "high";
  }

  if (rainfallMm >= 4) {
    return "medium";
  }

  return "low";
}

function toSoilOverallStatus(input: {
  phLevel: number | null;
  hasClassification: boolean;
}) {
  if (input.phLevel !== null) {
    if (input.phLevel < 5.5 || input.phLevel > 7.5) {
      return "needs_attention";
    }

    return "good";
  }

  if (input.hasClassification) {
    return "usable";
  }

  return "unknown";
}

export async function GET(request: Request) {
  try {
    const decodedToken = await verifyTokenWithClaims(request);
    const farms = await listFarmsByUid(decodedToken.uid);
    const activeFarm = farms.find((farm) => farm.isActive) ?? farms[0] ?? null;

    if (!activeFarm) {
      return successResponse({
        activeFarm: null,
        weather: null,
        soilStatus: null,
        recommendationPreview: null,
        yieldPreview: null,
        messages: [
          "No active farm found. Create a farm and activate it to view dashboard insights.",
        ],
      });
    }

    const [latestSoilProfile, latestWeatherSnapshot, latestRecommendation, latestYieldForecast] = await Promise.all([
      getLatestSoilProfileForFarm(decodedToken.uid, activeFarm.id),
      getLatestWeatherSnapshotForFarm(decodedToken.uid, activeFarm.id),
      getLatestCropRecommendationForFarm(decodedToken.uid, activeFarm.id),
      getLatestYieldForecastForFarm(decodedToken.uid, activeFarm.id),
    ]);

    const messages: string[] = [];

    if (!latestSoilProfile) {
      messages.push(
        "No soil data found for the active farm yet. Add a soil reading to improve recommendations.",
      );
    }

    if (!latestWeatherSnapshot) {
      messages.push("Weather support data is not available yet for this farm.");
    }

    if (!latestRecommendation) {
      messages.push("No recommendation generated yet for the active farm.");
    }

    if (!latestYieldForecast) {
      messages.push("No yield forecast generated yet for the active farm.");
    }

    const weather = latestWeatherSnapshot
      ? {
          temperatureC: latestWeatherSnapshot.temperatureC,
          humidity: latestWeatherSnapshot.humidity,
          rainfallMm: latestWeatherSnapshot.rainfallMm,
          rainRisk: toRainRisk(latestWeatherSnapshot.rainfallMm),
          recordedAt: latestWeatherSnapshot.recordedAt,
          updatedAt: latestWeatherSnapshot.updatedAt,
        }
      : null;

    const soilStatus = latestSoilProfile
      ? {
          phLevel: latestSoilProfile.pH,
          texture: latestSoilProfile.texture,
          soilClass: latestSoilProfile.soilClass,
          overallStatus: toSoilOverallStatus({
            phLevel: latestSoilProfile.pH,
            hasClassification: latestSoilProfile.soilClass !== null,
          }),
          updatedAt: latestSoilProfile.updatedAt,
        }
      : null;

    const topCrop = latestRecommendation?.recommendedCrops[0] ?? null;

    const recommendationPreview = latestRecommendation
      ? {
          recommendationId: latestRecommendation.id,
          topCrop: topCrop?.crop ?? null,
          topScore: topCrop?.score ?? null,
          previewText: latestRecommendation.analysisText || null,
          updatedAt: latestRecommendation.updatedAt,
        }
      : null;

    const yieldPreview = latestYieldForecast
      ? {
          forecastId: latestYieldForecast.id,
          cropType: latestYieldForecast.cropType,
          expectedYield: latestYieldForecast.expectedYield,
          unit: latestYieldForecast.unit,
          estimatedRevenuePhp: latestYieldForecast.estimatedRevenue,
          updatedAt: latestYieldForecast.updatedAt,
        }
      : null;

    return successResponse({
      activeFarm: {
        id: activeFarm.id,
        name: activeFarm.name,
        location: activeFarm.location,
        isActive: activeFarm.isActive,
      },
      weather,
      soilStatus,
      recommendationPreview,
      yieldPreview,
      messages,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
