# Phase 2A - Weather Current Notes

This document describes the Phase 2A implementation for the current weather endpoint.

## Scope

Phase 2A target endpoint:
- `/api/farms/:farmId/weather/current`

Phase 2A goals:
- Load farm context with ownership validation.
- Resolve farm location to coordinates.
- Fetch current weather from a provider using normalized output.
- Persist a weather snapshot for dashboard/analysis reuse.
- Return a consistent route response contract.

## Files Involved

1. `src/app/api/farms/[farmId]/weather/current/route.ts`
- Implements the current weather route.
- Handles farmId validation, auth, farm ownership check, geocoding, weather fetch, persistence, and response mapping.

2. `src/lib/weatherService.ts`
- Weather provider adapter and payload normalization.
- Supports Open-Meteo-style payloads and generic weather payloads.

3. `src/lib/firestoreSchema.ts`
- Added `createWeatherSnapshotForFarm(...)` to persist weather snapshots under user-owned farm context.

4. `src/lib/geocodingService.ts`
- Reused for resolving farm `location` into coordinates before weather fetch.

## Route Behavior

File: `src/app/api/farms/[farmId]/weather/current/route.ts`

Flow:
1. Validate route params (`farmId`).
2. Verify auth (`verifyTokenWithClaims`).
3. Load farm by user (`getFarmByIdForUser`).
4. Fail with `FARM_LOCATION_REQUIRED` when farm has no location text.
5. Resolve location via geocoding service (top result only).
6. Fetch current weather via weather service using latitude/longitude.
7. Persist normalized snapshot (`temperatureC`, `humidity`, `rainfallMm`).
8. Return success payload with farm/weather context.

## Function Explanations

### Route functions (`src/app/api/farms/[farmId]/weather/current/route.ts`)

`farmParamsSchema`
- Validates dynamic route params and ensures `farmId` is present and non-empty.

`GET(request, context)`
- Main endpoint handler for current weather.
- Validates route params first to fail fast on malformed requests.
- Verifies Firebase token and extracts user identity.
- Loads the farm within user scope (`getFarmByIdForUser`) to enforce ownership.
- Returns `FARM_LOCATION_REQUIRED` when farm location is blank because weather lookup depends on coordinates.
- Uses geocoding service to convert farm location text to coordinates (`limit: 1`).
- Returns `FARM_LOCATION_UNRESOLVED` when no coordinate candidate is found.
- Fetches normalized weather snapshot from provider with latitude/longitude.
- Persists weather metrics in Firestore via `createWeatherSnapshotForFarm`.
- Returns `successResponse` containing `farmId`, `geocode`, `weather`, and stored `weatherSnapshot`.
- Wraps all runtime failures through shared `handleRouteError` for consistent error envelopes.

### Weather service functions (`src/lib/weatherService.ts`)

`resolveWeatherBaseUrl(explicitBaseUrl?)`
- Determines which base URL to use for weather provider calls.
- Priority: explicit argument -> `WEATHER_API_BASE_URL` -> Open-Meteo default.
- Replaces scaffold placeholder (`example-weather.com`) with Open-Meteo default to avoid accidental bad configs in local dev.

`toRainRisk(rainfallMm)`
- Maps rainfall to internal risk bands:
  - `high` for >= 8 mm
  - `medium` for >= 2 mm
  - `low` for lower non-null values
  - `unknown` when rainfall is missing

`normalizeOpenMeteoForecast(daily)`
- Converts Open-Meteo `daily` arrays into a list of forecast objects.
- Produces per-day entries with date, min/max temperature, and rainfall.

`normalizeWeatherSnapshot(payload)`
- Normalizes provider payload into `NormalizedWeatherSnapshot`.
- Supports both generic payload shapes and Open-Meteo (`current` + `daily`) shape.
- Prioritizes provider `rainRisk` if present; otherwise computes it from rainfall.
- Ensures output fields are stable for downstream endpoints regardless of provider response format.

`createWeatherService(baseUrl?, apiKey?)`
- Factory that returns weather fetch functions bound to resolved provider config.
- Reads optional API key and endpoint path from env (`WEATHER_API_KEY`, `WEATHER_API_ENDPOINT_PATH`).

`fetchWeatherSnapshot(query)` (internal function inside `createWeatherService`)
- Builds request URL using normalized base URL + endpoint path.
- Sets Open-Meteo-compatible query params (`latitude`, `longitude`, `current`, `timezone`).
- Adds `daily` and optional `forecast_days` when mode is `forecast`.
- Performs HTTP request with shared `requestJson` helper and optional bearer auth.
- Normalizes response and throws a controlled configuration error when payload shape is unrecognized.

`fetchCurrentWeather(query)`
- Public wrapper around `fetchWeatherSnapshot` with mode `current`.

`fetchWeatherForecast(query)`
- Public wrapper around `fetchWeatherSnapshot` with mode `forecast`.

`refreshWeatherSnapshot(query)`
- Public wrapper around `fetchWeatherSnapshot` with mode `refresh`.
- Prepares reuse for Phase 4 refresh endpoint without duplicating fetch logic.

### Firestore function (`src/lib/firestoreSchema.ts`)

`createWeatherSnapshotForFarm(uid, farmId, input)`
- Verifies farm ownership before writing any weather data.
- Inserts a new weather snapshot document with normalized metric fields.
- Adds server timestamps (`recordedAt`, `createdAt`, `updatedAt`) for consistent ordering/auditing.
- Reads back and returns the created snapshot in internal `WeatherSnapshot` shape.

## Weather Service Notes

File: `src/lib/weatherService.ts`

Implemented updates:
- Added Open-Meteo-compatible query generation:
  - `latitude`, `longitude`
  - `current=temperature_2m,relative_humidity_2m,precipitation`
  - `timezone=auto`
- Added Open-Meteo payload normalization:
  - `current.temperature_2m -> temperatureC`
  - `current.relative_humidity_2m -> humidity`
  - `current.precipitation -> rainfallMm`
- Added rain-risk derivation from rainfall when provider does not provide explicit `rainRisk`.
- Added fallback base URL resolver to ignore scaffold placeholder `example-weather.com` and use `https://api.open-meteo.com/v1`.

## Firestore Persistence Notes

File: `src/lib/firestoreSchema.ts`

Added:
- `createWeatherSnapshotForFarm(uid, farmId, input)`

Behavior:
- Enforces farm ownership via existing ownership guard.
- Creates a weather snapshot document with:
  - `temperatureC`
  - `humidity`
  - `rainfallMm`
  - `recordedAt`
  - `createdAt`
  - `updatedAt`

## Response Shape

Success response:
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "farmId": "...",
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
      "id": "...",
      "uid": "...",
      "farmId": "...",
      "temperatureC": 31,
      "humidity": 74,
      "rainfallMm": 1.2,
      "recordedAt": "...",
      "createdAt": "...",
      "updatedAt": "..."
    }
  }
}
```

Error examples:
- `400 VALIDATION_ERROR` for invalid farm id.
- `404 FARM_NOT_FOUND` for unknown farm or non-owned farm.
- `400 FARM_LOCATION_REQUIRED` when farm location is missing.
- Standard controlled external service errors via shared `handleRouteError`.

## Test Checklist

1. Owned farm, valid location:
- Expect `200` with `geocode`, normalized `weather`, and `weatherSnapshot`.

2. Farm not owned / not found:
- Expect `404 FARM_NOT_FOUND`.

3. Farm without location:
- Expect `400 FARM_LOCATION_REQUIRED`.

4. Upstream weather failure:
- Expect controlled error payload (no raw provider leak).

5. Snapshot persistence:
- Call endpoint twice and verify two non-seed weather snapshots are created.

6. Validation + lint/build:
- `npm run lint`
- `npm run build`
