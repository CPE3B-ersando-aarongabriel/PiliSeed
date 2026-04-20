# Phase 11 - Dashboard Activity Notes

This document describes the phase 11 backend implementation for dashboard activity.

## Scope

Endpoint:
- `/api/dashboard/activity`

Goal:
- Return a normalized, newest-first activity timeline for the authenticated user.
- Source activity events from user-owned farm history records.
- Support limit and cursor-style pagination (`before` timestamp).
- Keep payload compact and safe for timeline rendering.

## Files Involved

1. `src/app/api/dashboard/activity/route.ts`
- New phase 11 route implementation.
- Handles query validation, farm-scoped activity aggregation, sorting, and pagination metadata.

2. `src/lib/firestoreSchema.ts`
- Reuses read helpers:
  - `listFarmsByUid(...)`
  - `listRecentWeatherSnapshotsForFarm(...)`
  - `listRecentSoilProfilesForFarm(...)`
  - `listRecentCropRecommendationsForFarm(...)`
  - `listRecentYieldForecastsForFarm(...)`

3. `src/lib/authMiddleware.ts`
- Shared Firebase ID token verification.

4. `src/lib/apiResponse.ts`
- Shared success/error response envelope.

## Endpoint Definition

Method:
- `GET`

Path:
- `/api/dashboard/activity`

Auth:
- Required (`Authorization: Bearer <Firebase ID token>`)

Query params:
- `limit`: optional integer `1..100` (default `20`)
- `before`: optional ISO timestamp used as pagination cursor

## Route Functions and Uses

File: `src/app/api/dashboard/activity/route.ts`

### `activityQuerySchema`
- Validates `limit` and `before` query params.

### `pushIfRecent({ target, item, beforeBoundary })`
- Applies cursor filter (`before`) and safely appends valid activity items.

### `GET(request)` flow
1. Validate query params.
2. Verify user token.
3. Load user farms.
4. For each farm, fetch recent records from weather/soil/recommendation/yield collections.
5. Normalize each record into common activity shape:
   - `weather_snapshot`
   - `soil_update`
   - `recommendation_generated`
   - `yield_forecast_generated`
6. Merge and sort all events by timestamp descending.
7. Apply `limit`, return pagination metadata (`hasMore`, `nextCursor`).

## Activity Payload Shape

Each item:
- `id`
- `type`
- `farmId`
- `farmName`
- `timestamp`
- `title`
- `description`
- `metadata` (type-specific fields)

## Response Contract

Success example:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "activities": [
      {
        "id": "yield:yield_123",
        "type": "yield_forecast_generated",
        "farmId": "farm_123",
        "farmName": "Main Rice Farm",
        "timestamp": "2026-04-19T12:05:00.000Z",
        "title": "Yield Forecast Generated",
        "description": "Forecast for rice at 4.8 tons_per_hectare.",
        "metadata": {
          "cropType": "rice",
          "expectedYield": 4.8,
          "unit": "tons_per_hectare",
          "estimatedRevenuePhp": 132000,
          "generatedBy": "openai"
        }
      },
      {
        "id": "recommendation:rec_456",
        "type": "recommendation_generated",
        "farmId": "farm_123",
        "farmName": "Main Rice Farm",
        "timestamp": "2026-04-19T11:59:00.000Z",
        "title": "Recommendation Generated",
        "description": "Top suggestion: rice (score 89).",
        "metadata": {
          "generatedBy": "openai",
          "topCrop": "rice",
          "topScore": 89
        }
      }
    ],
    "count": 2,
    "limit": 20,
    "hasMore": true,
    "nextCursor": "2026-04-19T11:59:00.000Z",
    "messages": []
  }
}
```

No farms example:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "activities": [],
    "count": 0,
    "limit": 20,
    "hasMore": false,
    "nextCursor": null,
    "messages": [
      "No farms found yet. Create a farm to start generating activity."
    ]
  }
}
```

Invalid query example behavior:
- Returns safe empty payload with guidance message.

## Test Checklist

1. Base retrieval
- Call endpoint with valid token and verify activities are returned newest-first.

2. Limit behavior
- Call with `?limit=5` and verify at most 5 entries are returned.

3. Cursor behavior
- Call with `?before=<ISO timestamp>` and verify newer/equal events are excluded.

4. Empty state
- Use user without farms and verify empty timeline response (no error).

5. Ownership filtering
- Confirm only user-owned farm activities appear.

6. Query validation
- Send invalid `limit` or malformed `before` and verify safe response with message.

7. Build/lint
- `npm run lint`
- `npm run build`
