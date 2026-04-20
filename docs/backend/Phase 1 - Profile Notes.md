# Phase 1 - Profile Notes

This document defines the comprehensive notes for profile management.

## Scope

Primary endpoint:
- /api/profile

Methods:
- GET /api/profile
- PATCH /api/profile

Goal:
- Provide authenticated user profile retrieval and updates.
- Guarantee user profile scaffolding exists before writes.
- Keep a stable JSON contract for profile pages and onboarding flows.

## Files Involved

1. src/app/api/profile/route.ts
- Route implementation for GET and PATCH profile operations.

2. src/lib/firestoreSchema.ts
- getUserProfile
- updateUserProfile
- ensureUserScaffold

3. src/lib/authMiddleware.ts
- verifyTokenWithClaims

4. src/lib/apiResponse.ts
- successResponse
- errorResponse
- handleRouteError

## Endpoint Behavior

### GET /api/profile

Flow:
1. Verify token.
2. Try to load profile by uid.
3. If missing, call ensureUserScaffold and return scaffolded profile.
4. Return data.profile.

Response data:
- profile
  - uid
  - email
  - name
  - photoURL
  - phone
  - address
  - providerIds
  - createdAt
  - updatedAt
  - lastLoginAt

### PATCH /api/profile

Accepted body fields (at least one required):
- name: string 1..80
- phone: string 5..30
- address: string 5..180

Flow:
1. Parse and validate JSON object body.
2. Validate with zod and at-least-one-field rule.
3. Verify token.
4. Ensure scaffold exists.
5. Update profile and return data.profile.

Error conditions:
- 400 INVALID_REQUEST_BODY
- 400 VALIDATION_ERROR
- 401 UNAUTHORIZED
- 500 INTERNAL_SERVER_ERROR (or mapped provider/admin errors)

## Data and Ownership Notes

- Profile ownership is uid-bound.
- Rules and schema enforce that users can only read/update their own profile records.
- PATCH does not allow arbitrary field writes outside the allowed profile fields.

## Example Payloads

PATCH request:

{
  "name": "Juan Dela Cruz",
  "phone": "09171234567",
  "address": "San Luis, Pampanga"
}

Success response data:

{
  "profile": {
    "uid": "user_123",
    "email": "user@example.com",
    "name": "Juan Dela Cruz",
    "photoURL": null,
    "phone": "09171234567",
    "address": "San Luis, Pampanga",
    "providerIds": ["password"],
    "createdAt": "2026-04-20T08:00:00.000Z",
    "updatedAt": "2026-04-20T08:05:00.000Z",
    "lastLoginAt": "2026-04-20T08:05:00.000Z"
  }
}

## Test Checklist

1. GET with valid token and existing profile returns 200 profile.
2. GET with valid token and no profile creates scaffold and returns 200 profile.
3. PATCH with valid fields returns 200 and updated profile.
4. PATCH with empty object returns 400 VALIDATION_ERROR.
5. PATCH with invalid field lengths returns 400 VALIDATION_ERROR.
6. Calls without token return 401.
7. Run npm run lint and npm run build.
