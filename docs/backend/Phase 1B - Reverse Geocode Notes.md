# Phase 1B - Reverse Geocode Notes

This document describes the reverse geocoding endpoint added for coordinate-to-address conversion.

## Scope

Endpoint:
- /api/location/reverse

Goal:
- Convert latitude/longitude coordinates into a normalized address response for frontend display and internal workflows.

Use cases:
- Show readable address text for map-selected coordinates.
- Convert stored coordinates to address labels in UI.
- Internal utility for weather/analytics/address rendering pipelines.

## Files Involved

1. src/app/api/location/reverse/route.ts
- Route handler for reverse geocoding.
- Handles auth, input validation, service invocation, response formatting, and error mapping.

2. src/lib/geocodingService.ts
- Shared geocoding adapter.
- Added reverse geocode method:
  - reverseGeocodeCoordinates(latitude, longitude, options?)

3. src/lib/apiResponse.ts
- Shared JSON envelopes and route error mapping.

4. src/lib/authMiddleware.ts
- Reused token verification via verifyTokenWithClaims.

## Endpoint Definition

Method:
- POST

Path:
- /api/location/reverse

Auth:
- Required (Firebase ID token)

Request JSON:
- latitude: number, range -90..90
- longitude: number, range -180..180
- limit: optional integer, range 1..10

## Route Functions and Behavior

File: src/app/api/location/reverse/route.ts

### reverseGeocodeRequestSchema
- Validates incoming JSON payload.
- Rejects out-of-range latitude/longitude and invalid limit values.

### buildLowConfidenceWarnings(confidence)
- Returns [] when confidence >= 0.35.
- Returns warning array when confidence < 0.35.
- Helps frontend prompt user confirmation for uncertain matches.

### runReverseGeocode(input)
- Calls geocodingService.reverseGeocodeCoordinates(...).
- Returns successResponse with:
  - reverseGeocodes (all normalized matches)
  - reverseGeocode (top-ranked match)
  - warnings (if low confidence)

### POST(request)
Flow:
1. Verify auth via verifyTokenWithClaims.
2. Parse JSON body and validate object shape.
3. Validate fields using reverseGeocodeRequestSchema.
4. Call runReverseGeocode.
5. Map all failures through handleRouteError for controlled error payloads.

## Geocoding Service Functions Used

File: src/lib/geocodingService.ts

### reverseGeocodeCoordinates(latitude, longitude, options?)
- Validates finite latitude/longitude values.
- Builds provider URL using reverse endpoint path.
- Sends provider request with optional count limit.
- Handles provider payload-level errors (`error`, `reason`).
- Normalizes results with normalizeGeocodeResults.
- Throws INVALID_INPUT when no address matches are found.

### normalizeGeocodeResults(payload)
- Converts provider output to stable internal shape and sorts by confidence.

### normalizeGeocodeCandidate(candidate)
- Produces normalized result fields:
  - latitude
  - longitude
  - formattedAddress
  - confidence
  - source

## Environment Variables

Used by reverse geocode flow:
- GEOCODING_API_BASE_URL (optional, defaults to Open-Meteo geocoding base)
- GEOCODING_API_KEY (optional for keyless providers)
- GEOCODING_API_REVERSE_ENDPOINT_PATH (optional, default: reverse)

Example (Open-Meteo style):
- GEOCODING_API_BASE_URL=https://geocoding-api.open-meteo.com/v1
- GEOCODING_API_REVERSE_ENDPOINT_PATH=reverse
- GEOCODING_API_KEY=

## Success Response Example

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "reverseGeocodes": [
      {
        "latitude": 14.844,
        "longitude": 120.811,
        "formattedAddress": "Plaridel, Bulacan, Philippines",
        "confidence": 0.92,
        "source": "geocoding"
      },
      {
        "latitude": 14.84,
        "longitude": 120.81,
        "formattedAddress": "Plaridel, Central Luzon, Philippines",
        "confidence": 0.81,
        "source": "geocoding"
      }
    ],
    "reverseGeocode": {
      "latitude": 14.844,
      "longitude": 120.811,
      "formattedAddress": "Plaridel, Bulacan, Philippines",
      "confidence": 0.92,
      "source": "geocoding"
    },
    "warnings": []
  }
}
```

## Error Cases

- 400 INVALID_REQUEST_BODY
  - Request body is not a valid JSON object.

- 400 VALIDATION_ERROR
  - Invalid latitude/longitude/limit.

- 401 UNAUTHORIZED
  - Missing/invalid Firebase ID token.

- 400 INVALID_INPUT
  - No reverse geocode matches found for coordinates.

- 5xx controlled upstream errors
  - Provider/network failures mapped through shared route error handling.

## Postman Test Checklist

1. Happy path
- POST /api/location/reverse with valid token and coordinates.
- Expect 200 and reverseGeocode fields.

2. Validation checks
- latitude 95 or longitude 190 -> expect 400 VALIDATION_ERROR.
- limit 0 or 99 -> expect 400 VALIDATION_ERROR.

3. Auth check
- Remove Authorization header.
- Expect 401 UNAUTHORIZED.

4. No-result check
- Use coordinates unlikely to map to known address.
- Expect 400 INVALID_INPUT.

5. Low-confidence check
- Use ambiguous coordinates near boundaries.
- Verify warnings array may contain low-confidence notice.

6. Lint/build checks
- npm run lint
- npm run build
