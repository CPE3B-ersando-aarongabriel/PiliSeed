# General Backend Documentation - Phases 0 to 11

This document provides a single backend overview across all phases, including architecture summary, service relationships, data model relationships, and phase-by-phase coverage from 0 through 11.

## 1. Backend Summary

The backend is a Next.js App Router API system with Firebase Auth + Firestore, provider adapters (geocoding, weather, soil, market), deterministic analysis logic, and optional AI generation.

Core backend flow:

auth -> ownership -> validation -> normalization -> deterministic logic -> optional AI generation -> firestore persistence -> response envelope

Primary design principles:
- Keep route handlers thin.
- Keep domain logic in shared lib services.
- Normalize third-party payloads before use.
- Use deterministic scoring before AI explanations.
- Return consistent success/error JSON contracts.

## 2. Foundational Components

Routing and APIs:
- src/app/api/**/route.ts

Core shared libraries:
- src/lib/apiResponse.ts
- src/lib/authMiddleware.ts
- src/lib/firebaseAdmin.ts
- src/lib/firestoreSchema.ts
- src/lib/analysisContracts.ts
- src/lib/analysisService.ts
- src/lib/analysisHttp.ts
- src/lib/analysisErrors.ts
- src/lib/analysisEnv.ts
- src/lib/geocodingService.ts
- src/lib/weatherService.ts
- src/lib/soilService.ts
- src/lib/marketService.ts
- src/lib/openaiService.ts

Security and boundary enforcement:
- src/proxy.ts
- firestore.rules

## 3. Data Model Relationships

Main collections:
- users
- farms
- soilProfiles
- weatherSnapshots
- cropRecommendations
- yieldForecasts

Ownership model:
- Every farm-scoped collection document stores uid and farmId.
- Route layer enforces ownership using user-scoped helpers.
- Firestore rules enforce the same ownership constraints server-side.

Entity relationships:
- One user owns many farms.
- One farm has many soil profiles (manual + analyzed).
- One farm has many weather snapshots.
- One farm has many recommendation records.
- One farm has many yield forecast records.
- Dashboard endpoints aggregate latest/recent data across these farm-scoped collections.

## 4. Service Relationships

Context relationship chain:
- Location context (geocode/reverse geocode)
  -> weather and soil provider coordinates
  -> normalized farm context
  -> recommendation and yield reasoning
  -> dashboard summary, analytics, and activity timelines

Soil relationship chain:
- Manual soil input and/or soil analysis
  -> latest soil profile
  -> recommendation context
  -> yield context
  -> dashboard soil and trend visualizations

Weather relationship chain:
- Weather current/forecast/refresh
  -> stored weather snapshots
  -> recommendation and yield context
  -> dashboard weather and trend visualizations

Recommendation/yield chain:
- Recommendation generation/personalization
  -> recommendation records
  -> yield forecast generation and storage
  -> dashboard preview, analytics, and activity events

## 5. Phase Coverage (0 to 11)

### Phase 0 - Shared Foundation
Purpose:
- Shared backend scaffolding for auth, validation, normalization, provider adapters, deterministic logic, persistence, and response contracts.

Primary reference:
- docs/backend/Phase 0 - Shared Foundation Notes.md

### Phase 1 - Profile
Purpose:
- Authenticated profile retrieval and update with scaffold guarantees.

Primary reference:
- docs/backend/Phase 1 - Profile Notes.md

### Phase 2 - Farms and Soil
Purpose:
- Farm CRUD, activation, manual soil save/read, and soil analysis baseline support.

Primary reference:
- docs/backend/Phase 2 - Farms and Soil Notes.md

### Phase 3 - Weather Forecast
Purpose:
- Forecast endpoint and normalized weather timeline inputs for planning.

Primary reference:
- docs/backend/Phase 3A - Weather Forecast Notes.md

### Phase 4 - Weather Refresh
Purpose:
- Fresh weather snapshot refresh and persistence.

Primary reference:
- docs/backend/Phase 4 - Weather Refresh Notes.md

### Phase 5 - Soil Analysis
Purpose:
- Analyze soil using either complete optional NPK (manual basis) or API classification fallback.

Primary reference:
- docs/backend/Phase 5 - Soil Analysis Notes.md

### Phase 6 - Recommendation Generate
Purpose:
- Generate crop recommendations using farm + soil + weather context.

Primary reference:
- docs/backend/Phase 6 - Recommendation Generate Notes.md

### Phase 7 - Recommendation Personalization
Purpose:
- Personalize recommendations and generate related yield context outputs.

Primary reference:
- docs/backend/Phase 7 - Recommendation Personalization Notes.md

### Phase 8 - Yield Prediction
Purpose:
- Standalone yield forecast generation and latest yield retrieval.

Primary reference:
- docs/backend/Phase 8 - Yield Prediction Notes.md

### Phase 9 - Dashboard Summary
Purpose:
- Return active-farm summary cards and key previews.

Primary reference:
- docs/backend/Phase 9 - Dashboard Summary Notes.md

### Phase 10 - Dashboard Analytics
Purpose:
- Return chart-ready trend series and aggregates.

Primary reference:
- docs/backend/Phase 10 - Dashboard Analytics Notes.md

### Phase 11 - Dashboard Activity
Purpose:
- Return timeline-style activity events across weather, soil, recommendations, and yield.

Primary reference:
- docs/backend/Phase 11 - Dashboard Activity Notes.md

## 6. Supporting Sub-Phases and Compatibility Tracks

These documents support the 0-11 phase flow and are still relevant:
- docs/backend/Phase 1A - Location Geocode Notes.md
- docs/backend/Phase 1B - Reverse Geocode Notes.md
- docs/backend/Phase 2A - Weather Current Notes.md
- docs/backend/Phase 2B - Weather Current Notes.md
- docs/backend/Phase 3B - Weather Timeline Backfill Notes.md

Legacy compatibility placeholders:
- /api/soil/:farmId
- /api/soil/:farmId/latest

These remain protected but intentionally return NOT_IMPLEMENTED while farm-scoped equivalents are the active contract.

## 7. API Contract Reference

For endpoint-by-endpoint input/output JSON contracts, use:
- docs/backend/API JSON Input Output Summary.md

## 8. End-to-End Validation Baseline

Run after backend changes:
- npm run lint
- npm run build

Recommended runtime checks:
- Unauthorized request check on protected routes.
- Ownership check using non-owned farm ids.
- Farm creation and activation flow.
- Soil analyze (manual NPK and API fallback).
- Recommendation and yield generation.
- Dashboard summary, analytics, and activity consistency.

## 9. Notes Maintenance Rule

When changing endpoint behavior:
1. Update the relevant phase note.
2. Update API JSON Input Output Summary.
3. Update this general backend documentation if architecture or phase relationships changed.
