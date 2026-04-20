# Phase 4 - Weather Refresh Notes

This document describes the Phase 4 implementation for the weather refresh endpoint.

## Scope

Phase 4 target endpoint:
- /api/farms/:farmId/weather/refresh

Phase 4 goals:
- Reuse shared weather service logic instead of adding provider logic in route.
- Force a fresh provider fetch for current conditions.
- Persist a new snapshot on every refresh request.
- Return the same payload shape as Phase 2 current-weather endpoint.

## Files Involved

1. src/app/api/farms/[farmId]/weather/refresh/route.ts
- Implements the refresh endpoint handler.
- Handles auth, farm ownership, geocoding, fresh weather fetch, snapshot persistence, and response mapping.

2. src/lib/weatherService.ts
- Reused `refreshWeatherSnapshot(...)` service method.
- Keeps provider-specific fetch and normalization outside route layer.

3. src/lib/firestoreSchema.ts
- Reused `createWeatherSnapshotForFarm(...)` to persist refreshed weather snapshot.

4. src/lib/geocodingService.ts
- Reused to resolve farm location text to coordinates.

## Endpoint Definition

Method:
- POST

Path:
- /api/farms/:farmId/weather/refresh

Auth:
- Required (Firebase ID token)

## Route Functions and Behavior

File: src/app/api/farms/[farmId]/weather/refresh/route.ts

### farmParamsSchema
- Validates dynamic route params.
- Requires farmId to be a non-empty trimmed string.

### POST(request, context)
Flow:
1. Validate route params.
2. Verify auth using verifyTokenWithClaims.
3. Load farm in user scope using getFarmByIdForUser.
4. Return FARM_NOT_FOUND if farm is missing or not owned.
5. Return FARM_LOCATION_REQUIRED if farm location is empty.
6. Resolve farm location via geocoding service (`limit: 1`).
7. Return FARM_LOCATION_UNRESOLVED when geocoding returns no match.
8. Call weatherService.refreshWeatherSnapshot(...) to force fresh provider fetch.
9. Persist snapshot via createWeatherSnapshotForFarm(...).
10. Return success payload with the same contract as current-weather endpoint.
11. Route-level failures are mapped by handleRouteError.

## Design Decision for Snapshot Writes

Chosen behavior:
- Create a new snapshot record on every refresh call.

Reason:
- Preserves a historical timeline of observed conditions.
- Enables trend and analytics use cases.
- Supports later timeline merges where observed data should override inferred/forecast values.

## Response Contract

Refresh response is intentionally aligned with current weather response:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "farmId": "farm_123",
    "geocode": {
      "latitude": 14.84,
      "longitude": 120.86,
      "formattedAddress": "Plaridel, Bulacan, Philippines",
      "confidence": 0.9,
      "source": "geocoding"
    },
    "weather": {
      "temperatureC": 31,
      "humidity": 74,
      "rainfallMm": 1.2,
      "rainRisk": "low",
      "alertText": null,
      "forecast": [],
      "source": "open-meteo"
    },
    "weatherSnapshot": {
      "id": "snapshot_123",
      "uid": "user_123",
      "farmId": "farm_123",
      "temperatureC": 31,
      "humidity": 74,
      "rainfallMm": 1.2,
      "recordedAt": "2026-04-19T10:00:00.000Z",
      "createdAt": "2026-04-19T10:00:00.000Z",
      "updatedAt": "2026-04-19T10:00:00.000Z"
    }
  }
}
```

## Error Cases

- 400 VALIDATION_ERROR
  - Invalid farmId route param.
- 401 UNAUTHORIZED
  - Missing/invalid Firebase ID token.
- 404 FARM_NOT_FOUND
  - Farm does not exist or is not owned by authenticated user.
- 400 FARM_LOCATION_REQUIRED
  - Farm has no location text.
- 400 FARM_LOCATION_UNRESOLVED
  - Location could not be geocoded.
- Controlled upstream errors are surfaced through shared handleRouteError mapping.

## Test Checklist

1. Happy path refresh
- POST /api/farms/:farmId/weather/refresh
- Expect 200 and payload includes farmId, geocode, weather, weatherSnapshot.

2. Contract parity check
- Compare current endpoint response and refresh endpoint response keys.
- Verify both include: farmId, geocode, weather, weatherSnapshot.

3. Ownership check
- Use another user's farm ID.
- Expect 404 FARM_NOT_FOUND.

4. Missing location check
- Use farm with blank location.
- Expect 400 FARM_LOCATION_REQUIRED.

5. Geocode unresolved check
- Use invalid location text.
- Expect 400 FARM_LOCATION_UNRESOLVED.

6. Snapshot persistence behavior
- Call refresh twice.
- Verify two non-seed snapshot records exist (new record each refresh).

7. Upstream failure safety
- Simulate provider failure.
- Verify route returns controlled error and does not write partial broken data.

8. Lint/build validation
- npm run lint
- npm run build
