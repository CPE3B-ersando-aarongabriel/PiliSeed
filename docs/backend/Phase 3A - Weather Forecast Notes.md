# Phase 3 - Weather Forecast Notes

This document describes the Phase 3 implementation for the weather forecast endpoint.

## Scope

Phase 3 target endpoint:
- `/api/farms/:farmId/weather/forecast`

Phase 3 goals:
- Load farm context with user ownership validation.
- Support optional forecast range via `days` query parameter.
- Resolve farm location text to coordinates through geocoding.
- Fetch and normalize forecast data using the shared weather service.
- Return stable JSON even when provider payload is partial.
- Persist a weather snapshot for the latest metric values.

## Files Involved

1. `src/app/api/farms/[farmId]/weather/forecast/route.ts`
- Route handler for forecast retrieval.
- Handles validation, auth, farm ownership, geocoding, forecast fetch, response shaping, and snapshot persistence.

2. `src/lib/weatherService.ts`
- Shared weather adapter used by this endpoint.
- Provides `fetchWeatherForecast(...)` and normalization for Open-Meteo `daily` payloads.

3. `src/lib/geocodingService.ts`
- Resolves farm `location` text to coordinates.

4. `src/lib/firestoreSchema.ts`
- Reused `createWeatherSnapshotForFarm(...)` to persist latest weather metric snapshot.

## Endpoint Definition

Method:
- `GET`

Path:
- `/api/farms/:farmId/weather/forecast`

Auth:
- Required (`Authorization: Bearer <Firebase ID token>`)

Query params:
- `days` (optional): integer `1..16`
- Default when omitted: `7`

## Route Functions and Behavior

File: `src/app/api/farms/[farmId]/weather/forecast/route.ts`

### `farmParamsSchema`
- Validates route param `farmId` as a non-empty trimmed string.

### `forecastQuerySchema`
- Validates query-level `days` input.
- Ensures values outside `1..16` are rejected with a controlled `VALIDATION_ERROR`.

### `buildForecastWarnings(forecastLength)`
- Returns an empty array when forecast entries exist.
- Returns a warning when forecast list is empty so clients can handle partial upstream responses gracefully.

### `GET(request, context)`
1. Validates route params.
2. Parses and validates query params (`days`).
3. Verifies auth with `verifyTokenWithClaims`.
4. Loads farm with user ownership check (`getFarmByIdForUser`).
5. Returns `FARM_LOCATION_REQUIRED` when farm has no location text.
6. Geocodes farm location to coordinates (`limit: 1`).
7. Returns `FARM_LOCATION_UNRESOLVED` when coordinates cannot be derived.
8. Calls `weatherService.fetchWeatherForecast(...)` with latitude/longitude and requested day range.
9. Persists latest weather metrics via `createWeatherSnapshotForFarm(...)`.
10. Returns standardized success payload with `requestedDays`, `geocode`, normalized `weather`, `warnings`, and `weatherSnapshot`.

## Service Functions Used

File: `src/lib/weatherService.ts`

### `fetchWeatherForecast({ latitude, longitude, days? })`
- Public weather-service method used by Phase 3 route.
- Internally calls `fetchWeatherSnapshot(...)` in forecast mode.
- Includes Open-Meteo `daily` fields and optional `forecast_days`.

### `normalizeWeatherSnapshot(payload)`
- Converts provider payload into internal `NormalizedWeatherSnapshot`:
  - `temperatureC`
  - `humidity`
  - `rainfallMm`
  - `rainRisk`
  - `alertText`
  - `forecast`
  - `source`
- Produces stable shape for consumers even when some provider fields are missing.

### `normalizeOpenMeteoForecast(daily)`
- Converts Open-Meteo daily arrays into compact forecast objects:
  - `date`
  - `temperatureMaxC`
  - `temperatureMinC`
  - `rainfallMm`

## Firestore Write Behavior

File: `src/lib/firestoreSchema.ts`

### `createWeatherSnapshotForFarm(uid, farmId, input)`
- Verifies ownership before write.
- Persists latest weather metrics with timestamps.
- Returns normalized stored snapshot.

Stored fields:
- `temperatureC`
- `humidity`
- `rainfallMm`
- `recordedAt`
- `createdAt`
- `updatedAt`

## Success Response Shape

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "farmId": "farm_123",
    "requestedDays": 7,
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
      "forecast": [
        {
          "date": "2026-04-19",
          "temperatureMaxC": 34.1,
          "temperatureMinC": 25.4,
          "rainfallMm": 2.1
        }
      ],
      "source": "open-meteo"
    },
    "warnings": [],
    "weatherSnapshot": {
      "id": "snapshot_123",
      "uid": "user_123",
      "farmId": "farm_123",
      "temperatureC": 31,
      "humidity": 74,
      "rainfallMm": 1.2,
      "recordedAt": "2026-04-19T09:00:00.000Z",
      "createdAt": "2026-04-19T09:00:00.000Z",
      "updatedAt": "2026-04-19T09:00:00.000Z"
    }
  }
}
```

## Partial Data Example

When provider omits daily forecast values, route still returns stable JSON:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "farmId": "farm_123",
    "requestedDays": 7,
    "geocode": {
      "latitude": 14.84,
      "longitude": 120.86,
      "formattedAddress": "Plaridel, Bulacan, Philippines",
      "confidence": 0.9,
      "source": "geocoding"
    },
    "weather": {
      "temperatureC": 30.2,
      "humidity": 70,
      "rainfallMm": null,
      "rainRisk": "unknown",
      "alertText": null,
      "forecast": [],
      "source": "open-meteo"
    },
    "warnings": [
      "Forecast data is currently limited. The response includes only available weather fields."
    ],
    "weatherSnapshot": {
      "id": "snapshot_124",
      "uid": "user_123",
      "farmId": "farm_123",
      "temperatureC": 30.2,
      "humidity": 70,
      "rainfallMm": null,
      "recordedAt": "2026-04-19T10:00:00.000Z",
      "createdAt": "2026-04-19T10:00:00.000Z",
      "updatedAt": "2026-04-19T10:00:00.000Z"
    }
  }
}
```

## Error Cases

- `400 VALIDATION_ERROR`
  - Invalid `farmId` or invalid `days` query parameter.
- `401 UNAUTHORIZED`
  - Missing/invalid Firebase ID token.
- `404 FARM_NOT_FOUND`
  - Farm does not exist or is not owned by authenticated user.
- `400 FARM_LOCATION_REQUIRED`
  - Farm location is missing.
- `400 FARM_LOCATION_UNRESOLVED`
  - Geocoding could not derive coordinates.
- Controlled upstream errors from shared `handleRouteError`.

## Test Checklist

1. Default forecast test:
- `GET /api/farms/:farmId/weather/forecast`
- Expect `requestedDays = 7` and normalized forecast payload.

2. Custom range test:
- `GET /api/farms/:farmId/weather/forecast?days=10`
- Expect `requestedDays = 10` and provider response aligned to that range.

3. Range validation test:
- `GET /api/farms/:farmId/weather/forecast?days=0`
- Expect `400 VALIDATION_ERROR`.

4. Ownership test:
- Use another user's farm id.
- Expect `404 FARM_NOT_FOUND`.

5. Partial payload safety test:
- Simulate provider returning limited fields.
- Expect stable response shape and warning entry.

6. Lint/build:
- `npm run lint`
- `npm run build`
