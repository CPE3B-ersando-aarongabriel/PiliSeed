# Phase 8 - Yield Prediction Notes

This document describes the phase 8 backend implementation for yield forecasting.

## Scope

Endpoints:
- `/api/farms/:farmId/yield` (GET latest yield forecast)
- `/api/farms/:farmId/yield/predict` (POST generate new yield forecast)

Goal:
- Build deterministic yield forecasts from farm context, soil, weather, and optional market context.
- Use OpenAI for explanation text only (not numeric generation).
- Persist yield forecasts for dashboard and historical reuse.
- Return stable, frontend-friendly JSON contracts.

## Files Involved

1. `src/app/api/farms/[farmId]/yield/predict/route.ts`
- New phase 8 route for generating yield forecasts.
- Handles auth, validation, deterministic scoring, optional AI explanation, persistence, and response mapping.

2. `src/app/api/farms/[farmId]/yield/route.ts`
- Updated to return the latest stored yield forecast for a farm.

3. `src/lib/analysisService.ts`
- Reuses `buildYieldForecast(...)` deterministic logic.
- Reuses `scoreSoilSnapshot(...)`, `scoreWeatherSnapshot(...)`, and `summarizeAnalysisInput(...)`.

4. `src/lib/analysisContracts.ts`
- `YieldForecastResult` now includes `warningFlags`.

5. `src/lib/firestoreSchema.ts`
- Added `YieldForecast` type.
- Added `createYieldForecastForFarm(...)`.
- Added `getLatestYieldForecastForFarm(...)`.

6. `src/lib/openaiService.ts`
- Used by phase 8 route to generate explanation text JSON.

7. `src/lib/apiResponse.ts`
- Shared success/error envelopes.

8. `src/lib/authMiddleware.ts`
- Shared Firebase ID token verification.

## Endpoint Definition

### POST `/api/farms/:farmId/yield/predict`

Auth:
- Required (`Authorization: Bearer <Firebase ID token>`)

Request JSON:
- `cropType`: required string (1..80)
- `season`: required string (1..40)
- `forecastPeriod`: required string (1..60)
- `marketContext`: optional object
  - `priceTrend`: optional string (1..80)
  - `localDemand`: optional string (1..80)
  - `supplySignal`: optional string (1..80)
  - `confidence`: optional number (0..1)

Behavior:
1. Validates route param and body.
2. Verifies token and farm ownership.
3. Loads latest soil and weather snapshots.
4. Builds normalized market context from request.
5. Computes deterministic forecast via `buildYieldForecast(...)`.
6. Requests AI explanation JSON with strict schema (fallback to deterministic explanation if unavailable/invalid).
7. Persists a new yield forecast record.
8. Returns forecast, metrics, metadata, and saved record.

### GET `/api/farms/:farmId/yield`

Auth:
- Required (`Authorization: Bearer <Firebase ID token>`)

Behavior:
1. Validates route param.
2. Verifies token and farm ownership.
3. Fetches latest stored yield forecast.
4. Returns `YIELD_FORECAST_NOT_FOUND` when none exists.

## Route Functions and Uses

File: `src/app/api/farms/[farmId]/yield/predict/route.ts`

### `yieldPredictSchema`
- Validates required forecasting inputs and optional market context.

### `toNormalizedSoilSnapshot(...)`
- Maps stored soil profile to analysis contract shape.

### `toNormalizedWeatherSnapshot(...)`
- Maps stored weather snapshot to analysis contract shape and derives rain risk.

### `toNormalizedMarketContext(...)`
- Converts request market fields into `NormalizedMarketContext` used by deterministic forecast logic.

### `buildYieldExplanationPrompt(...)`
- Builds the OpenAI prompt while locking deterministic numeric values.
- Instructs AI to explain numbers only and return strict JSON.

### `maybeGenerateAIExplanation(...)`
- Calls OpenAI JSON endpoint and validates `analysisText` + `warningFlags`.
- Falls back to deterministic explanation when AI is unavailable or malformed.

### `POST(request, context)`
- End-to-end orchestration from validation to persistence to response.

File: `src/app/api/farms/[farmId]/yield/route.ts`

### `GET(request, context)`
- Returns latest persisted yield forecast for the authenticated user and farm.

## Persistence Model

File: `src/lib/firestoreSchema.ts`

### `YieldForecast` type fields
- `id`, `uid`, `farmId`
- `cropType`, `season`, `forecastPeriod`
- `expectedYield`, `unit`, `estimatedRevenue`
- `marketContext`, `analysisText`, `warningFlags`
- `generatedBy` (`deterministic | hybrid | openai`)
- `forecastJson`, `createdAt`, `updatedAt`

### `createYieldForecastForFarm(uid, farmId, input)`
- Verifies farm ownership.
- Writes new `yieldForecasts` document.
- Returns normalized `YieldForecast`.

### `getLatestYieldForecastForFarm(uid, farmId)`
- Returns newest non-seed yield forecast by `createdAt`.
- Includes composite-index fallback path.

## Response Contract

### POST success example

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "farmId": "farm_123",
    "contextSummary": {
      "hasSoil": true,
      "hasWeather": true
    },
    "forecast": {
      "expectedYield": 4.76,
      "unit": "tons_per_hectare",
      "estimatedRevenue": 133280,
      "marketContext": {
        "priceTrend": "stable",
        "localDemand": "high",
        "supplySignal": "balanced",
        "confidence": 0.8
      },
      "analysisText": "Yield is projected to remain stable if rainfall remains near current patterns.",
      "warningFlags": []
    },
    "metrics": {
      "soilScore": 74,
      "weatherScore": 71
    },
    "yieldForecastRecord": {
      "id": "yield_123",
      "uid": "user_123",
      "farmId": "farm_123",
      "cropType": "rice",
      "season": "wet",
      "forecastPeriod": "2026-Q3",
      "expectedYield": 4.76,
      "unit": "tons_per_hectare",
      "estimatedRevenue": 133280,
      "marketContext": {
        "priceTrend": "stable",
        "localDemand": "high",
        "supplySignal": "balanced",
        "confidence": 0.8
      },
      "analysisText": "Yield is projected to remain stable if rainfall remains near current patterns.",
      "warningFlags": [],
      "generatedBy": "hybrid",
      "forecastJson": {},
      "createdAt": "2026-04-19T12:00:00.000Z",
      "updatedAt": "2026-04-19T12:00:00.000Z"
    },
    "metadata": {
      "aiUsed": true,
      "generatedBy": "hybrid"
    }
  }
}
```

### GET success example

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "farmId": "farm_123",
    "yieldForecast": {
      "id": "yield_123",
      "uid": "user_123",
      "farmId": "farm_123",
      "cropType": "rice",
      "season": "wet",
      "forecastPeriod": "2026-Q3",
      "expectedYield": 4.76,
      "unit": "tons_per_hectare",
      "estimatedRevenue": 133280,
      "marketContext": {
        "priceTrend": "stable"
      },
      "analysisText": "Yield is projected to remain stable if rainfall remains near current patterns.",
      "warningFlags": [],
      "generatedBy": "hybrid",
      "forecastJson": {},
      "createdAt": "2026-04-19T12:00:00.000Z",
      "updatedAt": "2026-04-19T12:00:00.000Z"
    }
  }
}
```

## Error Cases

- `400 INVALID_REQUEST_BODY`
  - Body is not a JSON object.

- `400 VALIDATION_ERROR`
  - Missing or invalid `cropType`, `season`, `forecastPeriod`, or market context values.

- `401 UNAUTHORIZED`
  - Missing or invalid Firebase ID token.

- `404 FARM_NOT_FOUND`
  - Farm does not exist or is not owned by the user.

- `404 YIELD_FORECAST_NOT_FOUND`
  - GET latest yield called before any forecast has been generated.

- `500 INTERNAL_SERVER_ERROR`
  - Unexpected failure in persistence or route orchestration.

## Test Checklist

1. Happy path predict
- POST valid payload and verify 201 with forecast + stored record.

2. Deterministic stability
- Re-run same input/context and verify core numeric outputs are reproducible.

3. AI fallback
- Simulate OpenAI failure and verify deterministic `analysisText` still returns with warning flag.

4. Validation
- Send missing fields and invalid market confidence (>1) to verify 400.

5. Ownership
- Use another user's farm id and verify 404.

6. Latest forecast read
- Generate forecast, call GET `/yield`, verify latest record is returned.

7. Build/lint
- Run `npm run lint`
- Run `npm run build`
