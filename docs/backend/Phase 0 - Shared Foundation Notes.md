# Phase 0 - Shared Foundation Notes

This file documents the cross-cutting foundation used by all API phases.

## Foundation Flow

All routes are expected to follow this backend flow:

auth -> ownership -> validation -> normalization -> deterministic logic -> optional AI generation -> persistence -> response envelope

## Foundational Areas

### 1. API routing and endpoint structure

- API handlers live under [src/app/api](../src/app/api).
- HTTP methods are implemented per route file using Next.js route handlers.
- Dynamic route params use folder segments like [farmId].

Key route groups:
- Auth: [src/app/api/auth](../src/app/api/auth)
- Profile: [src/app/api/profile](../src/app/api/profile)
- Farms and farm sub-resources: [src/app/api/farms](../src/app/api/farms)
- Location utilities: [src/app/api/location](../src/app/api/location)
- Legacy protected placeholders: [src/app/api/soil](../src/app/api/soil)
- Dashboard aggregates: [src/app/api/dashboard](../src/app/api/dashboard)

### 2. Proxy and route protection

File: [src/proxy.ts](../src/proxy.ts)

- Enforces token verification for protected API prefixes.
- Returns uniform UNAUTHORIZED JSON for blocked requests.
- Covers matcher groups:
	- /api/dashboard/*
	- /api/farms/*
	- /api/location/*
	- /api/profile/*
	- /api/soil/*
	- /api/test/*

### 3. Auth foundation

Files:
- [src/lib/authMiddleware.ts](../src/lib/authMiddleware.ts)
- [src/lib/firebaseAdmin.ts](../src/lib/firebaseAdmin.ts)

Responsibilities:
- Parse and validate Bearer tokens.
- Verify Firebase ID tokens.
- Expose decoded claims for ownership and user-scaffold operations.
- Initialize Firebase Admin auth/firestore using server credentials.

### 4. Response envelope and error mapping

File: [src/lib/apiResponse.ts](../src/lib/apiResponse.ts)

- successResponse: standard success envelope.
- errorResponse: standard failure envelope with code/message/details.
- handleRouteError: maps auth, analysis, firebase, and internal failures.

All routes should use this layer to keep frontend contracts stable.

### 5. Core logic and analysis services

Files:
- [src/lib/analysisService.ts](../src/lib/analysisService.ts)
- [src/lib/analysisContracts.ts](../src/lib/analysisContracts.ts)
- [src/lib/analysisErrors.ts](../src/lib/analysisErrors.ts)
- [src/lib/analysisHttp.ts](../src/lib/analysisHttp.ts)
- [src/lib/analysisEnv.ts](../src/lib/analysisEnv.ts)

Core logic coverage:
- Deterministic soil/weather scoring.
- Recommendation/yield computation helpers.
- Normalized cross-service data contracts.
- External provider request and normalization helpers.
- Environment guardrails for provider config.

### 6. Provider adapters and AI wrapper

Files:
- [src/lib/geocodingService.ts](../src/lib/geocodingService.ts)
- [src/lib/weatherService.ts](../src/lib/weatherService.ts)
- [src/lib/soilService.ts](../src/lib/soilService.ts)
- [src/lib/marketService.ts](../src/lib/marketService.ts)
- [src/lib/openaiService.ts](../src/lib/openaiService.ts)

Purpose:
- Isolate provider-specific payload shapes.
- Keep route handlers thin.
- Reuse normalized outputs across phases.

### 7. Database foundation (Firestore)

Files:
- [src/lib/firestoreSchema.ts](../src/lib/firestoreSchema.ts)
- [firestore.rules](../firestore.rules)

Collections managed by schema layer:
- users
- farms
- soilProfiles
- weatherSnapshots
- cropRecommendations
- yieldForecasts

Schema layer responsibilities:
- Ownership-safe CRUD helpers.
- User scaffold creation.
- Active farm switching.
- Latest/recent retrieval helpers for dashboards and analytics.

Rules responsibilities:
- Require auth.
- Enforce uid ownership on read/write.
- Deny all unmatched documents.

### 8. Users and scaffold behavior

Primary user onboarding is handled through:
- [src/app/api/auth/signup/route.ts](../src/app/api/auth/signup/route.ts)
- [src/app/api/auth/login/route.ts](../src/app/api/auth/login/route.ts)
- [src/lib/firestoreSchema.ts](../src/lib/firestoreSchema.ts)

ensureUserScaffold behavior:
- Create or update user profile.
- Ensure a default farm exists.
- Seed dependent collections if missing.

## Cross-Phase Implementation Rules

1. Keep business logic in lib services, not in route handlers.
2. Always verify auth and ownership before accessing farm-linked data.
3. Validate input with zod before touching providers or database.
4. Persist normalized values so downstream phases remain stable.
5. Keep endpoint responses inside the shared envelope format.
6. Prefer deterministic logic first, AI generation second.

## Baseline Validation for Any Foundation Change

- Run npm run lint.
- Run npm run build.
- Validate at least one protected endpoint with valid and invalid token.
- Validate firestore ownership behavior using non-owned farm ids.