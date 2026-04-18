import { handleRouteError, successResponse } from "../../../../lib/apiResponse";
import { verifyTokenWithClaims } from "../../../../lib/authMiddleware";
import {
  getLatestSoilProfileForFarm,
  getLatestWeatherSnapshotForFarm,
  listFarmsByUid,
} from "../../../../lib/firestoreSchema";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const decodedToken = await verifyTokenWithClaims(request);
    const farms = await listFarmsByUid(decodedToken.uid);
    const activeFarm = farms.find((farm) => farm.isActive) ?? null;

    if (!activeFarm) {
      return successResponse({
        activeFarm: null,
        latestSoilProfile: null,
        weather: null,
        messages: [
          "No active farm found. Create a farm and activate it to view dashboard insights.",
        ],
      });
    }

    const latestSoilProfile = await getLatestSoilProfileForFarm(
      decodedToken.uid,
      activeFarm.id,
    );
    const latestWeatherSnapshot = await getLatestWeatherSnapshotForFarm(
      decodedToken.uid,
      activeFarm.id,
    );
    const messages: string[] = [];

    if (!latestSoilProfile) {
      messages.push(
        "No soil data found for the active farm yet. Add a soil reading to improve recommendations.",
      );
    }

    if (!latestWeatherSnapshot) {
      messages.push("Weather support data is not available yet for this farm.");
    }

    return successResponse({
      activeFarm,
      latestSoilProfile,
      weather: latestWeatherSnapshot
        ? {
            temperatureC: latestWeatherSnapshot.temperatureC,
            humidity: latestWeatherSnapshot.humidity,
            rainfallMm: latestWeatherSnapshot.rainfallMm,
            recordedAt: latestWeatherSnapshot.recordedAt,
            updatedAt: latestWeatherSnapshot.updatedAt,
          }
        : null,
      messages,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
