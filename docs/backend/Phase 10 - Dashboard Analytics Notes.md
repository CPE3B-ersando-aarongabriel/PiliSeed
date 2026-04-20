# Phase 10 - Dashboard Analytics Notes

This document describes the phase 10 backend implementation for dashboard analytics.

## Scope

Endpoint:
- `/api/dashboard/analytics`

Goal:
- Return chart-friendly trend data for dashboard analytics.
- Aggregate stored weather, soil, recommendation, and yield records.
- Support selectable analytics windows (`7d`, `30d`, `90d`).
- Keep payload compact and frontend-ready.

## Files Involved

1. `src/app/api/dashboard/analytics/route.ts`
- New phase 10 route implementation.
- Handles auth, date-range validation, aggregation, and trend shaping.

2. `src/lib/firestoreSchema.ts`
- Added trend-oriented read helpers used by phase 10:
  - `listRecentSoilProfilesForFarm(...)`
  - `listRecentYieldForecastsForFarm(...)`
- Reuses existing helpers:
  - `listFarmsByUid(...)`
  - `listRecentWeatherSnapshotsForFarm(...)`
  - `listRecentCropRecommendationsForFarm(...)`

3. `src/lib/authMiddleware.ts`
- Shared Firebase ID token verification.

4. `src/lib/apiResponse.ts`
- Shared response envelope and error handling.

## Endpoint Definition

Method:
- `GET`

Path:
- `/api/dashboard/analytics`

Auth:
- Required (`Authorization: Bearer <Firebase ID token>`)

Query params:
- `dateRange`: optional enum
  - `7d`
  - `30d` (default)
  - `90d`

## Route Functions and Uses

File: `src/app/api/dashboard/analytics/route.ts`

### `analyticsQuerySchema`
- Validates supported date range values.

### `toDays(dateRange)`
- Converts dateRange enum to day count.

### `startDateForDays(days)`
- Computes UTC start boundary for selected window.

### `toDaySeries(days)`
- Produces continuous day keys for chart x-axis.

### `emptyPoints(dayKeys)` and `mergePoint(points, date, value)`
- Build and populate normalized time-series arrays with nullable values.

### `GET(request)` flow
1. Validate query params.
2. Verify user token.
3. Resolve active farm (`isActive` else first farm fallback).
4. Load recent stored records in parallel.
5. Filter records by selected date window.
6. Build chart-friendly time-series for weather, soil, recommendations, and yield.
7. Return compact analytics payload with totals.

## Response Contract

Success example:

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
    "window": {
      "dateRange": "30d",
      "days": 30,
      "startDate": "2026-03-21",
      "endDate": "2026-04-19"
    },
    "series": {
      "weather": {
        "rainfallMm": [
          { "date": "2026-04-17", "value": 12 },
          { "date": "2026-04-18", "value": 7 },
          { "date": "2026-04-19", "value": null }
        ],
        "temperatureC": [
          { "date": "2026-04-17", "value": 31 },
          { "date": "2026-04-18", "value": 30 },
          { "date": "2026-04-19", "value": null }
        ],
        "humidity": [
          { "date": "2026-04-17", "value": 74 },
          { "date": "2026-04-18", "value": 77 },
          { "date": "2026-04-19", "value": null }
        ]
      },
      "soil": {
        "phLevel": [
          { "date": "2026-04-17", "value": 6.1 },
          { "date": "2026-04-18", "value": null },
          { "date": "2026-04-19", "value": null }
        ]
      },
      "recommendations": {
        "topScore": [
          { "date": "2026-04-17", "value": 89 },
          { "date": "2026-04-18", "value": 84 },
          { "date": "2026-04-19", "value": null }
        ],
        "topCropByDay": [
          { "date": "2026-04-17", "crop": "rice" },
          { "date": "2026-04-18", "crop": "corn" },
          { "date": "2026-04-19", "crop": null }
        ]
      },
      "yield": {
        "expectedYield": [
          { "date": "2026-04-17", "value": 4.8 },
          { "date": "2026-04-18", "value": 4.6 },
          { "date": "2026-04-19", "value": null }
        ],
        "estimatedRevenuePhp": [
          { "date": "2026-04-17", "value": 132000 },
          { "date": "2026-04-18", "value": 128000 },
          { "date": "2026-04-19", "value": null }
        ]
      }
    },
    "totals": {
      "weatherSnapshots": 18,
      "soilProfiles": 5,
      "recommendations": 7,
      "yieldForecasts": 6
    },
    "messages": []
  }
}
```

No farm example:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "activeFarm": null,
    "window": null,
    "series": null,
    "messages": [
      "No active farm found. Create a farm and activate it to view analytics."
    ]
  }
}
```

## Error and Validation Behavior

- Invalid `dateRange` returns a safe response payload with guidance message.
- Unauthorized requests return standard auth error via shared error handler.
- Unexpected backend failures are mapped by `handleRouteError(...)`.

## Test Checklist

1. Default window
- Call endpoint without query params.
- Verify `30d` window and structured series arrays.

2. Window switching
- Call with `dateRange=7d` and `dateRange=90d`.
- Verify `window.days` and start/end dates update.

3. Empty datasets
- Use farm with no records.
- Verify series arrays still exist with null values and no crash.

4. Active farm selection
- With multiple farms, confirm active farm is selected.
- If none active, verify fallback to first farm.

5. Auth
- Call without token and verify unauthorized response.

6. Build and lint
- `npm run lint`
- `npm run build`
