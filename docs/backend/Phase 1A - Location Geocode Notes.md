# Phase 1A - Location Geocode Notes

This document describes the completed Phase 1A implementation for the geocoding endpoint.

## Scope

Phase 1A target endpoint:
- `/api/location/geocode`

Phase 1A goals:
- Validate geocode input.
- Call a shared geocoding service.
- Normalize external provider output into a stable internal shape.
- Return consistent JSON response envelopes.
- Handle errors safely and predictably.

## Files Involved

1. `src/app/api/location/geocode/route.ts`
- Route handler for geocoding requests.
- Handles auth, validation, request parsing, service invocation, and response formatting.

2. `src/lib/geocodingService.ts`
- Shared geocoding adapter and normalization logic.
- Encapsulates provider URL creation and response parsing.

3. `src/lib/apiResponse.ts`
- Standard API success and error response wrappers.
- Route-level exception mapping via `handleRouteError`.

4. `src/lib/analysisContracts.ts`
- Type definition used by geocoding output: `NormalizedGeocodeResult`.

5. `src/lib/analysisErrors.ts`
- Shared custom error types for configuration and external-service failures.

6. `src/lib/analysisHttp.ts`
- Shared HTTP helper (`requestJson`) and normalization helpers used by geocoding service.

## Route Functions and Behavior

File: `src/app/api/location/geocode/route.ts`

### `geocodeRequestSchema`
Validates input:
- `locationText`: required, trimmed string, min 2, max 180.
- `countryCode`: optional, 2-letter alphabetic code.
- `limit`: optional integer, range 1 to 100.

### `buildLowConfidenceWarnings(confidence: number)`
- Returns `[]` when confidence is at least `0.35`.
- Returns warning message when confidence is below `0.35`.
- Purpose: do not hard-fail low confidence results, but guide the client to confirm location.

### `runGeocode(input)`
- Calls `geocodingService.geocodeLocationText(...)`.
- Returns `successResponse` with:
  - `data.geocodes` array of normalized geocode objects.
  - `data.geocode` top-ranked normalized geocode object (kept for compatibility).
  - `data.warnings` optional warning messages for low confidence.

### `GET(request)`
- Requires auth with `verifyTokenWithClaims`.
- Supports query parameter usage for convenience testing.
- Supports both `locationText` and legacy `address` query alias.
- Validates query params with `geocodeRequestSchema`.
- Calls `runGeocode` on success.

### `POST(request)`
- Requires auth with `verifyTokenWithClaims`.
- Accepts JSON body.
- Rejects non-object body with `INVALID_REQUEST_BODY`.
- Validates body using `geocodeRequestSchema`.
- Calls `runGeocode` on success.

## Service Functions and Behavior

File: `src/lib/geocodingService.ts`

### `toNumber(value)`
- Converts numbers and numeric strings to finite number.
- Returns `null` if invalid.

### `toConfidence(value)`
- Normalizes provider confidence values into `[0, 1]`.
- Handles values already in `0..1` and values that look like percentages (`> 1`).

### `extractCandidates(payload)`
- Supports multiple provider response shapes:
  - raw array
  - `{ results: [...] }`
  - `{ data: [...] }`
  - `{ features: [...] }`
  - fallback single-object payload

### `normalizeGeocodeCandidate(candidate)`
- Parses coordinates from multiple possible fields:
  - `latitude/lat`, `longitude/lng/lon`
  - GeoJSON style `geometry.coordinates`
- Builds display address from:
  - `formattedAddress`, `formatted`, `display_name`, `address`, `label`
  - fallback composed from `name`, `admin1`, `country`
- Produces normalized output:
  - `latitude`
  - `longitude`
  - `formattedAddress`
  - `confidence` (0..1)
  - `source`

### `normalizeGeocodeResults(payload)`
- Normalizes all candidates.
- Returns candidates sorted by:
  1. highest confidence
  2. tie-break with alphabetic `formattedAddress`

### `createGeocodingService(baseUrl?, apiKey?)`
- Provider base URL priority:
  1. function argument
  2. `GEOCODING_API_BASE_URL`
  3. default `https://geocoding-api.open-meteo.com/v1`
- Endpoint path:
  - `GEOCODING_API_ENDPOINT_PATH` or default `search`
  - leading slashes are stripped before URL join to avoid dropping `/v1` from base path
- API key optional:
  - from argument or `GEOCODING_API_KEY`
  - Authorization header included only when key exists
- Returns object with:
  - `geocodeLocationText(locationText, options?)`
  - `normalizeGeocodeResults`

### `geocodeLocationText(locationText, options?)`
- Validates non-empty location text.
- Builds request URL and sets parameters:
  - `name` from `locationText`
  - optional `countryCode`
  - optional `count`
- Calls `requestJson`.
- Detects provider payload-level errors (`error`, `reason`) and throws controlled external-service error.
- Normalizes and returns all candidates.
- If no candidates and input contains a comma (for example `city, province`), retries once using only the first segment.
- Throws invalid-input error when no valid candidate is produced.

## Response Contract

Success envelope (`successResponse`):
- `success: true`
- `message: "Operation completed successfully"`
- `data: { geocodes, geocode, warnings }`

Error envelope (`errorResponse`):
- `success: false`
- `message`
- `errors`
- `error: { code, message, details? }`

## Expected Phase 1 Payloads

POST request example:
```json
{
  "locationText": "San Luis, Pampanga",
  "countryCode": "PH",
  "limit": 10
}
```

Success response example:
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "geocodes": [
      {
        "latitude": 15.0397,
        "longitude": 120.7704,
        "formattedAddress": "San Luis, Pampanga, Philippines",
        "confidence": 0.92,
        "source": "geocoding"
      },
      {
        "latitude": 15.041,
        "longitude": 120.768,
        "formattedAddress": "San Luis, Central Luzon, Philippines",
        "confidence": 0.81,
        "source": "geocoding"
      }
    ],
    "geocode": {
      "latitude": 15.0397,
      "longitude": 120.7704,
      "formattedAddress": "San Luis, Pampanga, Philippines",
      "confidence": 0.92,
      "source": "geocoding"
    },
    "warnings": []
  }
}
```

Low-confidence response example:
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "geocodes": [
      {
        "latitude": 15.0,
        "longitude": 120.7,
        "formattedAddress": "San Luis",
        "confidence": 0.2,
        "source": "geocoding"
      }
    ],
    "geocode": {
      "latitude": 15.0,
      "longitude": 120.7,
      "formattedAddress": "San Luis",
      "confidence": 0.2,
      "source": "geocoding"
    },
    "warnings": [
      "The geocoding result confidence is low. Ask the user to confirm or refine the location text."
    ]
  }
}
```

## Environment Variables Used in Phase 1

Required for auth-protected route behavior:
- Firebase env vars already used by auth middleware/admin.

Geocoding-specific:
- `GEOCODING_API_BASE_URL` (optional because code has default)
- `GEOCODING_API_ENDPOINT_PATH` (optional)
- `GEOCODING_API_KEY` (optional for keyless providers like Open-Meteo)

Recommended for Open-Meteo:
- `GEOCODING_API_BASE_URL=https://geocoding-api.open-meteo.com/v1`
- `GEOCODING_API_ENDPOINT_PATH=search`
- leave `GEOCODING_API_KEY` empty

## Test Checklist for Phase 1

1. Auth check
- Call endpoint without bearer token.
- Expect `401 UNAUTHORIZED`.

2. Validation check
- Missing `locationText`.
- Expect `400 VALIDATION_ERROR`.

3. Valid request check
- Provide valid location text.
- Expect `data.geocodes` to contain normalized candidates (`latitude`, `longitude`, `formattedAddress`, `confidence`, `source`).
- Expect `data.geocode` to match the top-ranked item in `data.geocodes`.

4. Country filter check
- Provide `countryCode` and verify result shifts within that country.

5. Low confidence check
- Use ambiguous query and verify warning appears in `data.warnings`.

6. Upstream failure check
- Use broken base URL and verify controlled error response.

7. Multi-result limit check
- Send `limit` above 5 (for example 20).
- Verify response can include more than 5 candidates when provider returns them.

8. Lint/build check
- `npm run lint`
- `npm run build`

## Known Notes

- Current route supports both GET and POST, but POST is preferred for app integration.
- Query alias `address` is supported in GET for backward compatibility.
- Phase 1 focuses on geocoding only; weather and other downstream phases will consume these coordinates next.
