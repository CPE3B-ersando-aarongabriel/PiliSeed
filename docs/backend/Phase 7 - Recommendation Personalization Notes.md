# Phase 7 - Recommendation Personalization Notes

This document defines the phase 7 backend implementation for personalized crop recommendations with integrated yield forecasting.

## Scope

Endpoint:
- `/api/farms/:farmId/recommendations/personalize`

Goal:
- Accept user personalization inputs after an initial recommendation.
- Re-rank recommendations using farm context + latest soil + latest weather + latest generated recommendation.
- Generate yield guidance from the same phase 7 input payload.
- Keep output shape aligned with phase 6 generate/more responses while extending with yield data.
- Persist personalized recommendation history for dashboard/activity use.

## Why Phase 7

Phase 6 already generates recommendations and allows requesting more options.
Phase 7 adds explicit user-driven personalization so users can refine recommendation quality for their specific constraints.

## Input Contract (Personalization)

Method:
- `POST`

Path:
- `/api/farms/:farmId/recommendations/personalize`

Auth:
- Required (`Authorization: Bearer <Firebase ID token>`)

Request JSON:
- `budget`: optional string (max 40)
- `demandSignal`: optional string (max 80)
- `supplySignal`: optional string (max 80)
- `goal`: optional string (max 80)
- `landSize`: optional string (max 80)
- `plantingDuration`: optional string (max 80)

Notes:
- Personalization does not require crop preference fields.
- Yield forecast generation uses this same payload; no separate yield input is required in phase 7.
- Request body must be a JSON object.
- Unknown fields should be ignored or rejected consistently based on schema mode.

## Expected Route Behavior

File target:
- `src/app/api/farms/[farmId]/recommendations/personalize/route.ts`

Flow:
1. Validate `farmId` route param and request body.
2. Verify token and farm ownership.
3. Load latest soil and weather snapshots.
4. Load latest recommendation record for the farm.
5. Build personalization context from request + latest recommendation + farm context.
6. Call OpenAI with explicit instruction to re-rank existing options and add alternatives if needed.
7. Validate AI JSON response with strict Zod schema.
8. Normalize and sort output by score descending.
9. Persist personalized recommendation record in `cropRecommendations`.
10. Build deterministic yield forecast using top personalized crop and same phase 7 inputs.
11. Persist yield forecast record in `yieldForecasts`.
12. Return structured response with metadata mode `personalized` and integrated yield payload.

## Response Contract

Success shape:
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
    "previousRecommendationId": "rec_base_123",
    "recommendation": {
      "recommendedCrops": [
        { "crop": "rice", "score": 86, "reason": "..." },
        { "crop": "corn", "score": 79, "reason": "..." }
      ],
      "analysisText": "Personalized ranking prioritizes demand and budget fit.",
      "warningFlags": []
    },
    "recommendationRecord": {
      "id": "rec_personalized_456"
    },
    "yieldForecast": {
      "expectedYield": 4.62,
      "unit": "tons_per_hectare",
      "estimatedRevenue": 129360,
      "marketContext": {
        "priceTrend": "stable",
        "localDemand": "high",
        "supplySignal": "balanced",
        "confidence": 0.6
      },
      "analysisText": "Yield outlook is positive if farm conditions remain stable.",
      "warningFlags": []
    },
    "yieldForecastRecord": {
      "id": "yield_personalized_456"
    },
    "metadata": {
      "aiUsed": true,
      "generatedBy": "openai",
      "mode": "personalized",
      "yieldIncluded": true
    }
  }
}
```

## Persistence Strategy

Collection:
- `cropRecommendations`
- `yieldForecasts`

Store in `recommendationJson`:
- `mode: "personalized"`
- `previousRecommendationId`
- `contextSummary`
- personalization input subset used for generation

Store in `forecastJson`:
- `mode: "personalized"`
- linked recommendation id
- cropType/season/forecastPeriod
- deterministic yield output
- context summary

This keeps baseline (`generate`), alternative (`more`), personalized recommendation, and linked personalized yield records distinguishable in history.

## Validation and Safety Rules

- Reject non-object request bodies with `400 INVALID_REQUEST_BODY`.
- Reject invalid strings/lengths with `400 VALIDATION_ERROR`.
- Reject unauthorized requests with `401 UNAUTHORIZED`.
- Reject unknown farm or non-owner access with `404 FARM_NOT_FOUND`.
- Map malformed AI output to `5xx EXTERNAL_SERVICE_ERROR` with controlled details.

## Test Checklist

1. Happy path
- Send valid personalization fields and verify `201` response.
- Confirm response metadata mode is `personalized`.
- Confirm `yieldForecast` and `yieldForecastRecord` are present.

2. Re-ranking behavior
- Use same farm context with different personalization values.
- Verify ranking/explanation changes in a traceable way.

3. Ownership validation
- Use another user's farm id and verify `404 FARM_NOT_FOUND`.

4. Body validation
- Send invalid field types or too-long strings and verify `400 VALIDATION_ERROR`.

5. Partial context degradation
- Run without latest soil or weather snapshot and verify controlled output.

6. Persistence integrity
- Verify saved record includes `mode: "personalized"` and links to previous recommendation id when available.
- Verify a linked yield forecast record is saved for the same request.

7. Build/lint
- Run `npm run lint`
- Run `npm run build`

## Suggested Branch and Commits

Branch:
- `person2/phase-07-recommendations-personalize`

Commits:
- `feat(recommendations): add personalize route schema and context builder`
- `feat(recommendations): persist personalized recommendation metadata`
- `test(recommendations): cover personalization validation and output contract`
