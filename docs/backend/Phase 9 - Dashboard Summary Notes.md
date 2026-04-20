# Phase 9 - Dashboard Summary Notes

This document describes the phase 9 backend implementation for dashboard summary aggregation.

## Scope

Endpoint:
- `/api/dashboard/summary`

Goal:
- Return a compact dashboard payload for the authenticated user.
- Resolve the active farm deterministically.
- Aggregate latest stored weather, soil status, recommendation preview, and yield preview.
- Keep response lightweight and stable for fast dashboard rendering.

## Files Involved

1. `src/app/api/dashboard/summary/route.ts`
- Phase 9 route implementation.
- Handles auth, active farm selection, summary aggregation, and response mapping.

2. `src/lib/firestoreSchema.ts`
- Uses existing read helpers:
  - `listFarmsByUid(...)`
  - `getLatestSoilProfileForFarm(...)`
  - `getLatestWeatherSnapshotForFarm(...)`
  - `getLatestCropRecommendationForFarm(...)`
  - `getLatestYieldForecastForFarm(...)`

3. `src/lib/authMiddleware.ts`
- Shared Firebase ID token validation.

4. `src/lib/apiResponse.ts`
- Shared success and error response envelope.

## Endpoint Definition

Method:
- `GET`

Path:
- `/api/dashboard/summary`

Auth:
- Required (`Authorization: Bearer <Firebase ID token>`)

Request params:
- None

## Route Functions and Behavior

File: `src/app/api/dashboard/summary/route.ts`

### `toRainRisk(rainfallMm)`
- Converts rainfall in mm to normalized risk level:
  - `high` (`>= 12`)
  - `medium` (`>= 4`)
  - `low`
  - `unknown` (null)

### `toSoilOverallStatus({ phLevel, hasClassification })`
- Produces compact soil status for dashboard display:
  - `good` for pH in expected range
  - `needs_attention` for pH out of range
  - `usable` when classification exists but pH is unavailable
  - `unknown` when no usable soil status exists

### `GET(request)` flow
1. Verify Firebase token.
2. Load user farms.
3. Resolve active farm using:
   - `farm.isActive === true`, otherwise first farm in list.
4. If no farm exists, return empty dashboard payload with guidance message.
5. In parallel, load latest stored records for active farm:
   - soil profile
   - weather snapshot
   - recommendation record
   - yield forecast record
6. Build compact preview objects:
   - `weather`
   - `soilStatus`
   - `recommendationPreview`
   - `yieldPreview`
7. Add messages for missing sections.
8. Return aggregated summary payload.

## Response Contract

Success example (all sections available):

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "activeFarm": {
      "id": "farm_123",
      "name": "Main Rice Farm",
      "location": "Candaba, Pampanga",
      "isActive": true
    },
    "weather": {
      "temperatureC": 31,
      "humidity": 74,
      "rainfallMm": 12,
      "rainRisk": "high",
      "recordedAt": "2026-04-19T10:00:00.000Z",
      "updatedAt": "2026-04-19T10:00:00.000Z"
    },
    "soilStatus": {
      "phLevel": 6.1,
      "texture": "Loam",
      "soilClass": "Cambisols",
      "overallStatus": "good",
      "updatedAt": "2026-04-19T09:50:00.000Z"
    },
    "recommendationPreview": {
      "recommendationId": "rec_123",
      "topCrop": "rice",
      "topScore": 89,
      "previewText": "Rice remains the best option for current farm conditions.",
      "updatedAt": "2026-04-19T10:03:00.000Z"
    },
    "yieldPreview": {
      "forecastId": "yield_123",
      "cropType": "rice",
      "expectedYield": 4.8,
      "unit": "tons_per_hectare",
      "estimatedRevenuePhp": 132000,
      "updatedAt": "2026-04-19T10:05:00.000Z"
    },
    "messages": []
  }
}
```

Success example (no active farm):

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "activeFarm": null,
    "weather": null,
    "soilStatus": null,
    "recommendationPreview": null,
    "yieldPreview": null,
    "messages": [
      "No active farm found. Create a farm and activate it to view dashboard insights."
    ]
  }
}
```

## Error Cases

- `401 UNAUTHORIZED`
  - Missing or invalid Firebase ID token.

- `500 INTERNAL_SERVER_ERROR`
  - Unexpected backend failure during aggregation.

## Test Checklist

1. Active farm summary
- User has an active farm with records.
- Verify all preview sections are populated.

2. Multiple farms selection
- User has multiple farms, only one active.
- Verify active farm rule is respected.

3. No active flag fallback
- User farms exist but none marked active.
- Verify first farm is selected as fallback.

4. Missing sections
- Remove soil/recommendation/yield records.
- Verify corresponding preview fields are null and messages are added.

5. No farms
- User has no farms.
- Verify empty summary payload with guidance message.

6. Auth check
- Call endpoint without token.
- Verify unauthorized error.

7. Build/lint
- Run `npm run lint`
- Run `npm run build`
