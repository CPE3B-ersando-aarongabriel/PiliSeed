# Phase 5 - Soil Analysis Notes

This document describes the farm soil analysis endpoint that supports two analysis bases:
- Manual NPK scoring when complete NPK is provided.
- SoilGrids WRB classification when NPK is not provided.

## Scope

Endpoint:
- `/api/farms/:farmId/soil/analyze`

SoilGrids source endpoint:
- `GET https://rest.isric.org/soilgrids/v2.0/classification/query?lat=...&lon=...&number_classes=...`

Goal:
- Require a resolvable location source for every request.
- Resolve coordinates from request input or farm location.
- Fetch WRB soil classification probabilities from SoilGrids.
- Produce a deterministic backend analysis score and guidance.
- Persist the analyzed soil record in Firestore.
- Return a frontend-friendly response for either manual NPK or API classification basis.

Why this approach:
- Some users can provide measured NPK, which should directly inform analysis.
- Many users still do not have NPK, so SoilGrids remains the fallback path.
- Location is always required so the farm context remains spatially anchored for downstream flows.

## Files Involved

1. `src/app/api/farms/[farmId]/soil/analyze/route.ts`
- Validates the request, resolves coordinates, calls SoilGrids, scores the result, stores the record, and returns JSON.

2. `src/lib/soilService.ts`
- Wraps the SoilGrids WRB classification query endpoint.
- Normalizes the response into a stable internal soil classification shape.

3. `src/lib/analysisService.ts`
- Contains `scoreSoilClassification(...)` for deterministic scoring and flags.
- Keeps the scoring rule set on the backend.

4. `src/lib/firestoreSchema.ts`
- Contains `createSoilAnalysisForFarm(...)`.
- Persists soil class metadata, probability list, classification JSON, and analysis JSON.

5. `src/lib/geocodingService.ts`
- Resolves farm location text or user-provided location text to coordinates.

6. `src/lib/apiResponse.ts`
- Provides the standard success/error envelopes.

7. `src/lib/authMiddleware.ts`
- Verifies Firebase ID tokens and enforces owner-based access.

## Endpoint Definition

Method:
- `POST`

Path:
- `/api/farms/:farmId/soil/analyze`

Auth:
- Required (`Authorization: Bearer <Firebase ID token>`)

Accepted request body fields:
- `latitude` optional number, range `-90..90`
- `longitude` optional number, range `-180..180`
- `locationText` optional string
- `numberClasses` optional integer, range `1..10`
- `nitrogen` optional number, minimum `0`
- `phosphorus` optional number, minimum `0`
- `potassium` optional number, minimum `0`
- NPK rule: provide all three values together or omit all three
- Empty-string or null NPK values are treated as omitted

Accepted aliases:
- `lat` -> `latitude`
- `lon` -> `longitude`
- `number_classes` -> `numberClasses`
- `n` -> `nitrogen`
- `p` -> `phosphorus`
- `k` -> `potassium`

Resolution order:
1. Normalize optional NPK values (`""` and `null` become omitted).
2. Resolve coordinates from `latitude`+`longitude`, or `locationText`, or the farm's stored `location`.
3. If no resolvable location is available, return `FARM_LOCATION_REQUIRED`.
4. If full NPK is provided, run manual-NPK scoring.
5. Otherwise run SoilGrids classification + classification scoring.

## Route Functions and Behavior

File: `src/app/api/farms/[farmId]/soil/analyze/route.ts`

### `soilAnalyzeRequestSchema`
- Validates the request body.
- Ensures latitude and longitude are provided together when either one is present.
- Ensures NPK values are either all provided or all omitted.
- Accepts optional SoilGrids class count.

### `normalizeOptionalNumericInput(value)`
- Treats `null`, `undefined`, and empty strings as omitted optional numeric values.
- Applied to NPK fields and aliases before schema validation.

### `resolveCoordinates(farmLocation, input)`
- Converts request data or farm location text into coordinates.
- Returns a geocode object for the response.
- Uses direct coordinates when provided, otherwise geocoding.

### `POST(request, context)`
Flow:
1. Validate the farm route param.
2. Verify the Firebase ID token.
3. Load the farm for the authenticated user.
4. Parse request body and normalize optional NPK values.
5. Validate the request body.
6. Resolve coordinates from request input or farm location (required for all successful requests).
7. If full NPK is provided:
  - Score with `scoreSoilSnapshot(...)` using manual NPK input.
  - Persist profile as `soilSource: "manual"`.
  - Persist manual classification JSON marker and return `soilClassification: null`.
8. If NPK is not provided:
  - Call SoilGrids WRB classification.
  - Score with `scoreSoilClassification(...)`.
  - Persist profile as `soilSource: "api"`.
9. Return the farm id, geocode, classification payload (nullable), stored soil profile, analysis output, and metadata basis.
10. Map unexpected failures through `handleRouteError`.

## SoilGrids Adapter

File: `src/lib/soilService.ts`

### `createSoilService(baseUrl?)`
- Uses the SoilGrids v2 base URL by default.
- Falls back to SoilGrids automatically if a placeholder example URL is configured.
- Calls the WRB classification query endpoint.

### `fetchSoilClassification({ latitude, longitude, numberClasses })`
- Sends `lat`, `lon`, and optional `number_classes`.
- Returns a normalized internal structure with:
  - `dominantClass`
  - `dominantClassValue`
  - `dominantClassProbability`
  - `classProbabilities`
  - `queryTimeSeconds`
  - `raw`

### `normalizeSoilClassification(payload)`
- Normalizes the live SoilGrids response.
- Extracts the top WRB class name and probability list.
- Converts the `coordinates` array into latitude and longitude.

Live SoilGrids sample response shape:
```json
{
  "type": "Point",
  "coordinates": [120.864, 14.887],
  "query_time_s": 1.84,
  "wrb_class_name": "Gleysols",
  "wrb_class_value": 12,
  "wrb_class_probability": [
    ["Gleysols", 25],
    ["Cambisols", 15],
    ["Fluvisols", 13],
    ["Vertisols", 13],
    ["Acrisols", 9]
  ]
}
```

## Scoring Behavior

File: `src/lib/analysisService.ts`

### `scoreSoilClassification(classification)`
- Produces a deterministic score from the WRB classification output.
- Uses probability strength, class separation, and class-group hints.
- Returns:
  - `score`
  - `summary`
  - `flags`
  - `nextSteps`
  - `explanation`
  - `raw`

The score reflects classification confidence and management hints, not hidden nutrient values.

## Persistence Behavior

File: `src/lib/firestoreSchema.ts`

### `createSoilAnalysisForFarm(uid, farmId, input)`
- Verifies farm ownership before writing.
- Creates a new soil profile record.
- Stores:
  - `soilClass`
  - `soilClassValue`
  - `soilClassProbability`
  - `soilClassProbabilities`
  - `classificationJson`
  - `analysisJson`
  - the normalized soil source and summary metadata
- Returns the normalized soil profile shape.

### `toSoilProfile(id, data)`
- Reads the stored classification fields back into the public soil profile response shape.

## Response Contract

Successful response example:
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "farmId": "farm_123",
    "geocode": {
      "latitude": 14.887,
      "longitude": 120.864,
      "formattedAddress": "Plaridel, Bulacan",
      "confidence": 1,
      "source": "manual"
    },
    "soilClassification": {
      "latitude": 14.887,
      "longitude": 120.864,
      "dominantClass": "Gleysols",
      "dominantClassValue": 12,
      "dominantClassProbability": 25,
      "classProbabilities": [
        { "className": "Gleysols", "probability": 25 },
        { "className": "Cambisols", "probability": 15 },
        { "className": "Fluvisols", "probability": 13 },
        { "className": "Vertisols", "probability": 13 },
        { "className": "Acrisols", "probability": 9 }
      ],
      "queryTimeSeconds": 1.84,
      "source": "soilgrids-classification",
      "raw": {}
    },
    "soilProfile": {
      "id": "soil_123",
      "uid": "user_123",
      "farmId": "farm_123",
      "texture": "Gleysols",
      "soilClass": "Gleysols",
      "soilClassValue": 12,
      "soilClassProbability": 25,
      "soilClassProbabilities": [],
      "pH": null,
      "moistureContent": null,
      "nitrogen": null,
      "phosphorus": null,
      "potassium": null,
      "soilSource": "api",
      "classificationJson": {},
      "analysisJson": {},
      "createdAt": "2026-04-19T09:22:59.592Z",
      "updatedAt": "2026-04-19T09:22:59.592Z"
    },
    "soilAnalysis": {
      "score": 78,
      "summary": "WRB classification is usable, but Gleysols should be validated with a site sample.",
      "flags": [],
      "nextSteps": [
        "Confirm the soil class with a field sample.",
        "Review drainage, texture, and nutrient tests before planting decisions."
      ],
      "explanation": null,
      "raw": {}
    }
  }
}
```

## Error Cases

- `400 INVALID_REQUEST_BODY`
  - Body is not a JSON object.

- `400 VALIDATION_ERROR`
  - Latitude/longitude are malformed or only one coordinate was provided.
  - NPK fields were partially provided instead of all-or-none.

- `400 FARM_LOCATION_REQUIRED`
  - No coordinates, location text, or farm location were available.

- `400 FARM_LOCATION_UNRESOLVED`
  - The supplied location text could not be geocoded.

- `401 UNAUTHORIZED`
  - Missing or invalid Firebase ID token.

- `404 FARM_NOT_FOUND`
  - The farm does not belong to the authenticated user.

- `5xx EXTERNAL_SERVICE_ERROR`
  - SoilGrids or geocoding failed.

## Test Checklist

1. Happy path (API fallback)
- POST `/api/farms/:farmId/soil/analyze` with valid auth and coordinates, without NPK.
- Expect `201`, non-null `geocode`, and a `soilClassification` payload.

2. Happy path (manual NPK)
- POST `/api/farms/:farmId/soil/analyze` with valid auth, resolvable location, and complete NPK.
- Expect `201`, non-null `geocode`, `soilClassification: null`, and `metadata.analysisBasis = manual_npk`.

3. Farm location fallback
- Send an empty body for a farm that has a stored location.
- Expect geocoding + SoilGrids classification.

4. Validation checks
- Send only `latitude` or only `longitude`.
- Expect `400 VALIDATION_ERROR`.

5. NPK all-or-none validation
- Send only one or two NPK fields.
- Expect `400 VALIDATION_ERROR`.

6. Empty NPK handling
- Send `nitrogen`, `phosphorus`, and `potassium` as empty strings.
- Expect values treated as omitted and API fallback behavior.

7. No location checks
- Send an empty body for a farm with no stored location.
- Expect `400 FARM_LOCATION_REQUIRED`.

8. Ownership check
- Use another user’s farm id.
- Expect `404 FARM_NOT_FOUND`.

9. Persistence check
- Confirm a new soil profile document is written to Firestore.
- Confirm the latest soil endpoint can read the stored record.

10. Lint/build validation
- Run `npm run lint`
- Run `npm run build`
