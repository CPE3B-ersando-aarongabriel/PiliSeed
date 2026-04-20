# Phase 6 - Recommendation Generate Notes

This document describes the phase 6 backend implementation for crop recommendation generation.

## Scope

Endpoint:
- /api/farms/:farmId/recommendations/generate
- /api/farms/:farmId/recommendations/more

Goal:
- Build recommendation context from farm + latest soil + latest weather.
- Send full available context to OpenAI for recommendation generation.
- Parse and validate OpenAI JSON response into the API contract.
- Persist recommendation output for dashboard reuse.
- Return a structured response contract for the frontend.

## Files Involved

1. src/app/api/farms/[farmId]/recommendations/generate/route.ts
- New phase 6 endpoint.
- Handles auth, input validation, context assembly, ranking, persistence, and response mapping.

2. src/app/api/farms/[farmId]/recommendations/more/route.ts
- New endpoint for requesting another recommendation set after the first result.
- Reuses the same planning inputs and context sources but asks OpenAI for alternative options.

3. src/lib/analysisService.ts
- Reused summarizeAnalysisInput(input).
- Context-summary helpers are reused for metadata only.

4. src/lib/firestoreSchema.ts
- Added createCropRecommendationForFarm(uid, farmId, input).
- Added CropRecommendation type and toCropRecommendation mapper.
- Added getLatestCropRecommendationForFarm(uid, farmId) for the /more endpoint context.

5. src/lib/openaiService.ts
- Primary recommendation generation using the Responses API.
- Returns JSON that is validated in the route before persistence.

6. src/lib/apiResponse.ts
- Shared success and error envelopes.

7. src/lib/authMiddleware.ts
- Shared Firebase ID token verification.

## Endpoint Definition

Method:
- POST

Path:
- /api/farms/:farmId/recommendations/generate
- /api/farms/:farmId/recommendations/more

Auth:
- Required (Firebase ID token)

Request JSON:
- budget: optional string
- goal: optional string
- landSize: optional string
- plantingDuration: optional string

Validation rules:
- route param farmId must be non-empty

## Route Functions and Behavior

File: src/app/api/farms/[farmId]/recommendations/generate/route.ts

### generateRecommendationSchema
- Validates optional planning inputs (budget, goal, land size, planting duration).

### toNormalizedSoilSnapshot(soilProfile)
- Converts Firestore soil profile to analysis contract shape.
- Returns null if no soil profile exists.

### toNormalizedWeatherSnapshot(weatherSnapshot)
- Converts Firestore weather snapshot to analysis contract shape.
- Derives rainRisk from rainfallMm.
- Returns null if no weather snapshot exists.

### buildOpenAIPrompt(input)
- Builds the OpenAI prompt with farm location, latest soil snapshot, latest weather snapshot, and planning inputs.
- Instructs strict JSON output format for recommendation payload.

### generateOpenAIRecommendation(input)
- Calls OpenAI using full available farm context.
- Validates response using aiRecommendationSchema.
- Returns normalized recommendation output (recommendedCrops, analysisText, warningFlags).
- Returns EXTERNAL_SERVICE_ERROR when OpenAI response is malformed.

### normalizeAIRecommendation(aiPayload)
- Sorts recommended crops by descending score.
- Normalizes score bounds to 0..100.
- Produces RecommendationResult shape.

### sanitizeRecommendationRecord(input)
- Stores only Firestore-safe recommendation summary payload.
- Avoids persisting unnecessary nested raw context.

### POST(request, context)
Flow:
1. Validate route param and request body.
2. Verify token and farm ownership.
3. Read latest soil + weather snapshots.
4. Build recommendation context.
5. Send full context to OpenAI for crop recommendations.
6. Validate and normalize OpenAI output.
7. Persist recommendation record in Firestore.
8. Return recommendation + persistence metadata.

### POST /more(request, context)
Flow:
1. Validate route param and request body.
2. Verify token and farm ownership.
3. Read latest soil + weather snapshots and latest recommendation.
4. Build recommendation context.
5. Ask OpenAI for an alternative recommendation set.
6. Validate and normalize OpenAI output.
7. Persist recommendation record in Firestore.
8. Return recommendation + previousRecommendationId + mode metadata.

## Firestore Persistence

File: src/lib/firestoreSchema.ts

### CropRecommendation type
Fields:
- id
- uid
- farmId
- recommendedCrops
- analysisText
- warningFlags
- generatedBy (deterministic | openai | hybrid)
- recommendationJson
- createdAt
- updatedAt

### createCropRecommendationForFarm(uid, farmId, input)
- Verifies ownership using assertFarmOwnership.
- Writes a new cropRecommendations document.
- Returns normalized CropRecommendation object.

### toCropRecommendation(id, data)
- Normalizes and validates stored recommendation fields.

## Response Contract

Success example:

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
    "recommendation": {
      "recommendedCrops": [
        {
          "crop": "rice",
          "score": 84,
          "reason": "Strong match with the current farm context."
        },
        {
          "crop": "corn",
          "score": 77,
          "reason": "Possible option with manageable adjustments."
        }
      ],
      "analysisText": "Rice is the strongest option based on the current farm context.",
      "warningFlags": [],
      "raw": {
        "input": {},
        "soilScore": 72,
        "weatherScore": 81
      }
    },
    "recommendationRecord": {
      "id": "rec_123",
      "uid": "user_123",
      "farmId": "farm_123",
      "recommendedCrops": [
        {
          "crop": "rice",
          "score": 84,
          "reason": "Strong match with the current farm context."
        }
      ],
      "analysisText": "Rice is the strongest option based on the current farm context.",
      "warningFlags": [],
      "generatedBy": "deterministic",
      "recommendationJson": {
        "farmId": "farm_123",
        "generatedBy": "deterministic",
        "recommendedCrops": [],
        "warningFlags": [],
        "contextSummary": {
          "hasSoil": true,
          "hasWeather": true
        }
      },
      "createdAt": "2026-04-19T10:00:00.000Z",
      "updatedAt": "2026-04-19T10:00:00.000Z"
    },
    "metadata": {
      "aiUsed": true,
      "generatedBy": "openai"
    }
  }
}
```

## Error Cases

- 400 INVALID_REQUEST_BODY
  - Request body is not a valid JSON object.

- 400 VALIDATION_ERROR
  - Invalid payload fields (type/length/shape).

- 401 UNAUTHORIZED
  - Missing or invalid Firebase ID token.

- 404 FARM_NOT_FOUND
  - Farm not found or not owned by authenticated user.

- 5xx INTERNAL_SERVER_ERROR / EXTERNAL_SERVICE_ERROR
  - Unexpected persistence failure or invalid OpenAI/provider response.

## Test Checklist

1. OpenAI happy path
- POST with valid token and optional context fields.
- Expect 201 and ranked recommendedCrops from OpenAI output.

2. Schema validation check
- Force malformed OpenAI output in test/mock setup.
- Expect controlled EXTERNAL_SERVICE_ERROR.

3. Missing context degradation
- Test with no latest soil and/or no latest weather.
- Expect valid response if OpenAI can still generate from partial context.

4. Ownership check
- Use another user’s farmId.
- Expect 404 FARM_NOT_FOUND.

5. Validation check
- Send invalid string fields for budget, goal, landSize, or plantingDuration.
- Expect 400 VALIDATION_ERROR.

6. Persistence check
- Confirm recommendation document is created in cropRecommendations.

7. Build/lint
- npm run lint
- npm run build
