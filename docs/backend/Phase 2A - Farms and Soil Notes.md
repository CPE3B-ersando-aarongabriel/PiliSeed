# Phase 2 - Farms and Soil Notes

This document defines the comprehensive notes for farm management and soil endpoints.

## Scope

Farm endpoints:
- GET /api/farms
- POST /api/farms
- GET /api/farms/:farmId
- PATCH /api/farms/:farmId
- DELETE /api/farms/:farmId
- PATCH /api/farms/:farmId/activate
- POST /api/farms/:farmId/activate

Farm soil endpoints:
- POST /api/farms/:farmId/soil
- GET /api/farms/:farmId/soil/latest
- POST /api/farms/:farmId/soil/analyze

Legacy protected placeholders:
- GET /api/soil/:farmId (NOT_IMPLEMENTED)
- POST /api/soil/:farmId (NOT_IMPLEMENTED)
- GET /api/soil/:farmId/latest (NOT_IMPLEMENTED)

## Files Involved

Routing files:
- src/app/api/farms/route.ts
- src/app/api/farms/[farmId]/route.ts
- src/app/api/farms/[farmId]/activate/route.ts
- src/app/api/farms/[farmId]/soil/route.ts
- src/app/api/farms/[farmId]/soil/latest/route.ts
- src/app/api/farms/[farmId]/soil/analyze/route.ts
- src/app/api/soil/[farmId]/route.ts
- src/app/api/soil/[farmId]/latest/route.ts

Service and schema files:
- src/lib/firestoreSchema.ts
- src/lib/geocodingService.ts
- src/lib/soilService.ts
- src/lib/analysisService.ts
- src/lib/authMiddleware.ts
- src/lib/apiResponse.ts

## Farms API Contract

### GET /api/farms
Returns:
- data.farms array for authenticated uid.

### POST /api/farms
Body:
- name required string 1..120
- location optional nullable string 2..180
- isActive optional boolean

Returns:
- 201 with data.farm.

### GET /api/farms/:farmId
Returns:
- data.farm when farm belongs to user.

### PATCH /api/farms/:farmId
Body (at least one required):
- name optional
- location optional nullable
- isActive optional

Returns:
- data.farm.

### DELETE /api/farms/:farmId
Returns:
- data.deleted = true.

### PATCH/POST /api/farms/:farmId/activate
Returns:
- data.farm with active state switched to this farm.

## Soil API Contract (farm namespace)

### POST /api/farms/:farmId/soil
Body:
- pH required 0..14 (alias ph supported)
- nitrogen required >= 0
- phosphorus required >= 0
- potassium required >= 0

Returns:
- 201 with data.soilProfile.

### GET /api/farms/:farmId/soil/latest
Returns:
- data.soilProfile
- 404 SOIL_PROFILE_NOT_FOUND when missing.

### POST /api/farms/:farmId/soil/analyze
Body:
- latitude optional (-90..90), alias lat
- longitude optional (-180..180), alias lon
- locationText optional
- numberClasses optional int 1..10, alias number_classes
- nitrogen optional >= 0, alias n
- phosphorus optional >= 0, alias p
- potassium optional >= 0, alias k

Rules:
- latitude/longitude must be provided together.
- NPK values are all-or-none.
- empty string and null NPK values are treated as omitted.
- location is required for successful analysis (lat/lon, locationText, or farm.location).

Behavior:
- If complete NPK exists: manual scoring path.
- Else: SoilGrids classification + classification scoring path.

Response data:
- farmId
- geocode
- soilClassification (nullable when manual NPK path)
- soilProfile
- soilAnalysis
- metadata.analysisBasis = manual_npk | api_classification

## Legacy Soil Endpoints

- /api/soil/:farmId and /api/soil/:farmId/latest are protected but intentionally return NOT_IMPLEMENTED.
- They remain for compatibility while farm-scoped soil endpoints are the active contract.

## Ownership and Security Notes

- All farm and soil endpoints require valid token.
- Farm ownership is checked before reads/writes.
- Non-owned or missing farms return FARM_NOT_FOUND.
- Firestore rules and schema both enforce uid ownership.

## Test Checklist

Farms:
1. Create farm and verify list includes it.
2. Update farm name/location/isActive and verify readback.
3. Activate farm and ensure active flag behavior is correct.
4. Delete farm and verify not found afterward.

Soil:
5. Create manual soil profile via POST /farms/:farmId/soil.
6. Read latest soil profile and verify values.
7. Analyze with full NPK + location and verify manual_npk basis.
8. Analyze with omitted/empty NPK and verify api_classification basis.
9. Analyze with partial NPK and verify VALIDATION_ERROR.
10. Analyze without any resolvable location and verify FARM_LOCATION_REQUIRED.

Validation:
11. Verify auth failures return UNAUTHORIZED.
12. Run npm run lint and npm run build.
