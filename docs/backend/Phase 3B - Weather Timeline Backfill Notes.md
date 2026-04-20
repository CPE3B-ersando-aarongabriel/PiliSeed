# Phase 3.5 - Weather Timeline Backfill Notes

This document describes the Phase 3.5 enhancement that merges observed weather, backfilled historical provider data, and forecast data into a single frontend-ready 7-day timeline.

## Why Phase 3.5 exists

Phase 3 returned normalized forecast data, but the frontend requires a week view where past days remain visible.

Example behavior:
- If today is Wednesday, Monday and Tuesday should still be present.
- If a user account/farm is new (for example created Thursday), previous days in the same week can still be shown using provider backfill until observed snapshots exist.

## Endpoint Updated

Method:
- `GET`

Path:
- `/api/farms/:farmId/weather/forecast`

File:
- `src/app/api/farms/[farmId]/weather/forecast/route.ts`

Auth:
- Required (Firebase ID token)

## Timeline strategy

For each day in Monday-Sunday of the current ISO week:
1. Use `observed` data if Firestore snapshot exists for that date.
2. Else if day is in the past, use provider `backfilled` data.
3. Else use provider `forecast` data.

This creates a stable 7-day timeline while preserving source provenance.

## Source typing

Each timeline item includes:
- `sourceType`: `observed | backfilled | forecast`
- `isInferred`: boolean
  - `false` for observed
  - `true` for backfilled and forecast

## Files Changed

1. `src/app/api/farms/[farmId]/weather/forecast/route.ts`
- Added timeline-window calculation and merge logic.
- Added weather timeline output.
- Added warnings for missing timeline day values.

2. `src/lib/weatherService.ts`
- Added forecast-mode support for `past_days` in provider request.
- Extended `fetchWeatherForecast` input to include optional `pastDays`.

3. `src/lib/firestoreSchema.ts`
- Added `listRecentWeatherSnapshotsForFarm(uid, farmId, limit?)`.
- Used to collect observed snapshots for timeline merge.

## Function explanations

### Route (`src/app/api/farms/[farmId]/weather/forecast/route.ts`)

`toIsoDateString(value)`
- Converts `Date` -> `YYYY-MM-DD` for stable day-key matching.

`startOfIsoWeekUtc(value)`
- Computes the Monday of the current ISO week in UTC.

`toRainRisk(rainfallMm)`
- Maps rainfall to `low | medium | high | unknown`.

`toTimelineDateRange(now?)`
- Builds Monday-Sunday date keys for the current week.
- Returns `weekDates`, `weekStartDate`, `weekEndDate`, `todayDate`.

`toProviderDailyMap(forecast)`
- Converts provider daily forecast array into a `date -> entry` lookup map.

`toObservedDailyMap(snapshots)`
- Converts Firestore weather snapshots into `date -> observed metrics`.
- Uses latest snapshot encountered per date.

`buildWeatherTimeline(input)`
- Merges observed and provider data for each week date.
- Applies source precedence and source typing (`observed/backfilled/forecast`).

`buildForecastWarnings(forecastLength)`
- Keeps existing warning behavior when provider forecast data is sparse.

`GET(request, context)`
- Existing auth + ownership + geocode + forecast flow.
- Now additionally:
  - calculates weekly timeline date window,
  - requests provider forecast with both future and past range (`forecast_days` + `past_days`),
  - fetches recent observed snapshots,
  - merges timeline entries,
  - returns `timelineWindow` and `weatherTimeline`.

### Weather service (`src/lib/weatherService.ts`)

`fetchWeatherSnapshot(query)`
- In forecast mode, now supports optional `pastDays`.
- Sends `past_days` query param for Open-Meteo when provided.

`fetchWeatherForecast(query)`
- Accepts `pastDays` and forwards to forecast fetch.

### Firestore helper (`src/lib/firestoreSchema.ts`)

`listRecentWeatherSnapshotsForFarm(uid, farmId, limit?)`
- Verifies ownership.
- Returns non-seed snapshots sorted by newest first.
- Includes fallback query path if composite index is missing.

## Response additions

The endpoint response now includes:
- `timelineWindow`
  - `startDate`
  - `endDate`
  - `todayDate`
- `weatherTimeline`: array of 7 day entries

Each `weatherTimeline` entry:
- `date`
- `sourceType`
- `temperatureC`
- `humidity`
- `rainfallMm`
- `rainRisk`
- `isInferred`

## Example response (trimmed)

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "farmId": "farm_123",
    "requestedDays": 7,
    "timelineWindow": {
      "startDate": "2026-04-13",
      "endDate": "2026-04-19",
      "todayDate": "2026-04-19"
    },
    "weatherTimeline": [
      {
        "date": "2026-04-13",
        "sourceType": "backfilled",
        "temperatureC": 33.1,
        "humidity": null,
        "rainfallMm": 2.2,
        "rainRisk": "medium",
        "isInferred": true
      },
      {
        "date": "2026-04-14",
        "sourceType": "observed",
        "temperatureC": 31.8,
        "humidity": 72,
        "rainfallMm": 0.8,
        "rainRisk": "low",
        "isInferred": false
      },
      {
        "date": "2026-04-19",
        "sourceType": "forecast",
        "temperatureC": 32.5,
        "humidity": null,
        "rainfallMm": 1.1,
        "rainRisk": "low",
        "isInferred": true
      }
    ],
    "warnings": []
  }
}
```

## Testing checklist for Phase 3.5

1. Existing farm with prior snapshots:
- Expect timeline to show `observed` entries for those dates.

2. New farm/user with no snapshots:
- Expect past dates as `backfilled` and future/today as `forecast`.

3. Mixed scenario:
- Some dates observed, others inferred.
- Verify precedence chooses `observed` over provider data.

4. Provider partial data:
- Expect warnings when dates are missing both observed and provider values.

5. Access control:
- Another user's farm should still return `404 FARM_NOT_FOUND`.

6. Validation:
- Invalid `days` query should still return `400 VALIDATION_ERROR`.
