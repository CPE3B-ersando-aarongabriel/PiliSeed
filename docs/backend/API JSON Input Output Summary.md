# API JSON Input and Output Summary

This file summarizes request and response JSON contracts for all current API routes under `src/app/api`.

## Global Response Envelope

Successful responses use:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {}
}
```

Error responses use:

```json
{
  "success": false,
  "message": "...",
  "errors": [],
  "error": {
    "code": "...",
    "message": "...",
    "details": {}
  }
}
```

## Auth

### POST /api/auth/signup
- Request JSON:
  - `name` optional string
- Response data:
  - `uid`
  - `providerIds`
  - `profile`
  - `defaultFarmId`

### POST /api/auth/login
- Request JSON:
  - `name` optional string
- Response data:
  - `uid`
  - `providerIds`
  - `profile`
  - `defaultFarmId`

### POST /api/auth/logout
- Request JSON: none
- Response data:
  - `uid`
  - `message`

### GET /api/auth/me
- Request JSON: none
- Response data:
  - `uid`

## Profile

### GET /api/profile
- Request JSON: none
- Response data:
  - `profile`

### PATCH /api/profile
- Request JSON (at least one):
  - `name` optional string
  - `phone` optional string
  - `address` optional string
- Response data:
  - `profile`

## Farms

### GET /api/farms
- Request JSON: none
- Response data:
  - `farms` array

### POST /api/farms
- Request JSON:
  - `name` required string
  - `location` optional nullable string
  - `isActive` optional boolean
- Response data:
  - `farm`

### GET /api/farms/:farmId
- Request JSON: none
- Response data:
  - `farm`

### PATCH /api/farms/:farmId
- Request JSON (at least one):
  - `name` optional string
  - `location` optional nullable string
  - `isActive` optional boolean
- Response data:
  - `farm`

### DELETE /api/farms/:farmId
- Request JSON: none
- Response data:
  - `deleted` boolean

### PATCH /api/farms/:farmId/activate
### POST /api/farms/:farmId/activate
- Request JSON: none
- Response data:
  - `farm`

## Location

### GET /api/location/geocode
- Query params:
  - `locationText` required string (or `address` alias)
  - `countryCode` optional 2-letter string
  - `limit` optional int
- Response data:
  - `geocodes` array
  - `geocode` first result
  - `warnings` array

### POST /api/location/geocode
- Request JSON:
  - `locationText` required string
  - `countryCode` optional 2-letter string
  - `limit` optional int
- Response data:
  - `geocodes` array
  - `geocode` first result
  - `warnings` array

### POST /api/location/reverse
- Request JSON:
  - `latitude` required number
  - `longitude` required number
  - `limit` optional int
- Response data:
  - `reverseGeocodes` array
  - `reverseGeocode` first result
  - `warnings` array

## Soil (Legacy namespace)

### GET /api/soil/:farmId
### POST /api/soil/:farmId
- Current status: placeholder
- Response: NOT_IMPLEMENTED error payload

### GET /api/soil/:farmId/latest
- Current status: placeholder
- Response: NOT_IMPLEMENTED error payload

## Soil (Farm namespace)

### POST /api/farms/:farmId/soil
- Request JSON:
  - `pH` required number (or `ph` alias)
  - `nitrogen` required number
  - `phosphorus` required number
  - `potassium` required number
- Response data:
  - `soilProfile`

### GET /api/farms/:farmId/soil/latest
- Request JSON: none
- Response data:
  - `soilProfile`

### POST /api/farms/:farmId/soil/analyze
- Request JSON:
  - `latitude` optional number (`lat` alias)
  - `longitude` optional number (`lon` alias)
  - `locationText` optional string
  - `numberClasses` optional int (`number_classes` alias)
  - `nitrogen` optional number (`n` alias)
  - `phosphorus` optional number (`p` alias)
  - `potassium` optional number (`k` alias)
  - NPK rule: provide all three (`nitrogen`, `phosphorus`, `potassium`) together or omit all three
  - Empty NPK values (`""` or `null`) are treated as omitted
  - Location is required for successful analysis (via lat/lon, locationText, or farm location)
- Response data:
  - `farmId`
  - `geocode`
  - `soilClassification` (null when manual NPK basis is used)
  - `soilProfile`
  - `soilAnalysis`
  - `metadata.analysisBasis` (`manual_npk` or `api_classification`)

## Weather

### GET /api/farms/:farmId/weather
- Current status: placeholder
- Response: NOT_IMPLEMENTED error payload

### GET /api/farms/:farmId/weather/current
- Request JSON: none
- Response data:
  - `farmId`
  - `geocode`
  - `weather`
  - `weatherSnapshot`

### POST /api/farms/:farmId/weather/refresh
- Request JSON: none
- Response data:
  - `farmId`
  - `geocode`
  - `weather`
  - `weatherSnapshot`

### GET /api/farms/:farmId/weather/forecast
- Query params:
  - `days` optional int (1..16)
- Response data:
  - `farmId`
  - `requestedDays`
  - `timelineWindow`
  - `geocode`
  - `weather`
  - `weatherTimeline`
  - `warnings`
  - `weatherSnapshot`

## Recommendations

### GET /api/farms/:farmId/recommendations
- Query params:
  - `limit` optional int (1..100, default 10)
- Response data:
  - `farmId`
  - `recommendations` array
  - `count`
  - `limit`

### POST /api/farms/:farmId/recommendations/generate
- Request JSON (all optional):
  - `budget`
  - `goal`
  - `landSize`
  - `plantingDuration`
- Response data:
  - `farmId`
  - `contextSummary`
  - `recommendation`
  - `recommendationRecord`
  - `metadata`

### POST /api/farms/:farmId/recommendations/more
- Request JSON (all optional):
  - `budget`
  - `goal`
  - `landSize`
  - `plantingDuration`
- Response data:
  - `farmId`
  - `contextSummary`
  - `previousRecommendationId`
  - `recommendation`
  - `recommendationRecord`
  - `metadata` (includes `mode: "more"`)

### POST /api/farms/:farmId/recommendations/personalize
- Request JSON (all optional):
  - `budget`
  - `demandSignal`
  - `supplySignal`
  - `goal`
  - `landSize`
  - `plantingDuration`
- Response data:
  - `farmId`
  - `contextSummary`
  - `previousRecommendationId`
  - `recommendation`
  - `recommendationRecord`
  - `yieldForecast`
  - `yieldForecastRecord`
  - `metadata` (includes `mode: "personalized"` and `yieldIncluded`)

## Yield

### POST /api/farms/:farmId/yield/predict
- Request JSON:
  - `cropType` required string
  - `season` required string
  - `forecastPeriod` required string
  - `marketContext` optional object
    - `priceTrend` optional string
    - `localDemand` optional string
    - `supplySignal` optional string
    - `confidence` optional number 0..1
- Response data:
  - `farmId`
  - `contextSummary`
  - `forecast`
    - `expectedYield`
    - `unit`
    - `estimatedRevenuePhp`
    - `estimatedRevenueCurrency` (`PHP`)
    - `marketContext`
    - `analysisText`
    - `warningFlags`
  - `yieldForecastRecord`
  - `metadata`

### GET /api/farms/:farmId/yield
- Request JSON: none
- Response data:
  - `farmId`
  - `yieldForecast`
    - includes `estimatedRevenuePhp`
    - includes `estimatedRevenueCurrency` (`PHP`)

## Dashboard

### GET /api/dashboard/summary
- Request JSON: none
- Response data:
  - `activeFarm`
  - `weather`
  - `soilStatus`
  - `recommendationPreview`
  - `yieldPreview`
  - `messages`

### GET /api/dashboard/analytics
- Query params:
  - `dateRange` optional enum: `7d`, `30d`, `90d`
- Response data:
  - `activeFarm`
  - `window`
  - `series`
    - `weather`
    - `soil`
    - `recommendations`
    - `yield`
  - `totals`
  - `messages`

### GET /api/dashboard/activity
- Query params:
  - `limit` optional int (1..100)
  - `before` optional ISO timestamp
- Response data:
  - `activities` array
  - `count`
  - `limit`
  - `hasMore`
  - `nextCursor`
  - `messages`

## Test Route

### GET /api/test
- Request JSON: none
- Response data:
  - `uid`

## Notes

- All routes above require auth except where a route is explicitly designed otherwise; current listed routes are protected by token verification.
- Placeholder routes currently return `NOT_IMPLEMENTED` and should not be treated as stable contracts for frontend consumption.
