<img src="public/landing/Hero.png">

# PiliSeed

<details>
<summary>Table of Contents</summary>

- [PiliSeed](#piliseed)
- [Introduction](#introduction)
- [Our Target SDG Goals](#our-target-sdg-goals)
- [Features](#features)
- [Getting Started](#getting-started)
- [User Guide](#user-guide)
- [Project Architecture](#project-architecture)
- [SYSTEM ARCHITECTURE](#system-architecture)
- [API DOCUMENTATION](#api-documentation)
- [DATABASE SCHEMA](#database-schema)
- [DEPLOYMENT DIAGRAM](#deployment-diagram)
- [Libraries](#libraries)
- [Data Sources and Integrations](#data-sources-and-integrations)
- [Project Documentation](#project-documentation)
- [Firmware](#firmware)
- [Contributors](#contributors)

</details>

## Introduction

PiliSeed is a smart agriculture advisory platform that combines farm context, weather signals, soil analysis, market context, and AI-assisted reasoning to support better crop planning decisions.

The backend is built as a Next.js App Router API with Firebase Auth and Firestore, deterministic analysis logic, and optional AI generation for explanations. The frontend provides public and authenticated experiences for farm onboarding, monitoring, and recommendation review.

### Our Target SDG Goals

PiliSeed supports practical outcomes aligned with:

- SDG 2: Zero Hunger
- SDG 12: Responsible Consumption and Production
- SDG 13: Climate Action

## Features

#### 1. Authentication and Profile Management

Secure sign-up, login, and profile management powered by Firebase Auth with protected API contracts for user profile retrieval and updates.

#### 2. Farm Management and Activation

Users can create, update, delete, and activate farms. Farm activation drives the active context for dashboard and analytics endpoints.

#### 3. Location Intelligence (Geocode and Reverse Geocode)

Address-to-coordinate and coordinate-to-address endpoints normalize location context before downstream weather and soil analysis.

#### 4. Weather Monitoring and Forecasting

Farm-scoped weather endpoints support current weather, forecast timeline, and refresh operations with normalized snapshots for downstream scoring.

#### 5. Soil Profiles and SoilGrids Classification

Soil profiles support manual and API-backed workflows. Soil classification uses ISRIC SoilGrids WRB outputs and persists classification metadata with probabilities.

#### 6. Crop Recommendation Engine

Recommendations use deterministic scoring first, with optional AI generation for richer explanation text. Session-aware recommendation history is supported.

#### 7. Yield Prediction and Revenue Estimation

Yield forecasts combine farm context with soil, weather, and optional market signals, then persist results for dashboard reporting.

#### 8. Dashboard Summary, Analytics, and Activity

Dashboard APIs return summary cards, chart-ready trend series, and timeline activity events across weather, soil, recommendations, and yield.

#### 9. IoT Device Integration (ESP32)

Firmware for ESP32 + DHT22 + soil moisture + LDR + OLED sends farm readings to backend endpoints and displays top crop recommendations.

#### 10. Secure API and Firestore Ownership Model

Protected API groups are validated through token middleware, and Firestore rules enforce user ownership across farm-scoped documents.

## Getting Started

> [!IMPORTANT]
> This project requires Firebase configuration and server-side credentials to run authenticated APIs.

1. Clone this repository.
2. Install dependencies:

```bash
npm install
```

3. Create your local environment file from the template:

```bash
cp .env.example .env
```

4. Fill required values in .env:

- NEXT_PUBLIC_FIREBASE_API_KEY
- NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
- NEXT_PUBLIC_FIREBASE_PROJECT_ID
- NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
- NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
- NEXT_PUBLIC_FIREBASE_APP_ID
- FIREBASE_ADMIN_PROJECT_ID
- FIREBASE_ADMIN_CLIENT_EMAIL
- FIREBASE_ADMIN_PRIVATE_KEY
- CLOUDINARY_CLOUD_NAME
- CLOUDINARY_API_KEY
- CLOUDINARY_API_SECRET

5. Start development server:

```bash
npm run dev
```

6. Open http://localhost:3000

7. Validate code quality before commits:

```bash
npm run lint
npm run build
```

## User Guide

### Public Page: Landing (/)

| Mobile                                              | Guide                                                                                               |
| --------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| <img src="public/assets/landing.png" width="220"/> | Entry page for product overview, problem framing, and navigation to login/signup and feature pages. |

### Public Page: About (/about)

| Mobile                                          | Guide                                                                |
| ----------------------------------------------- | -------------------------------------------------------------------- |
| <img src="public/assets/about.png" width="220"/> | Presents team, product context, and background details for PiliSeed. |

### Public Page: Features (/features)

| Mobile                                            | Guide                                                                     |
| ------------------------------------------------- | ------------------------------------------------------------------------- |
| <img src="public/assets/features.png" width="220"/> | Shows major product capabilities and value propositions in feature cards. |

### Public Page: How It Works (/how-it-works)

| Mobile                                                | Guide                                                                           |
| ----------------------------------------------------- | ------------------------------------------------------------------------------- |
| <img src="public/assets/how-it-works.png" width="220"/> | Explains the end-to-end flow from data input to recommendations and monitoring. |

### Public Page: Login (/login)

| Mobile                                          | Guide                                                                                   |
| ----------------------------------------------- | --------------------------------------------------------------------------------------- |
| <img src="public/assets/login.png" width="220"/> | Authenticates users through Firebase-backed sign-in flow before private feature access. |

### Public Page: Signup (/signup)

| Mobile                                            | Guide                                                                             |
| ------------------------------------------------- | --------------------------------------------------------------------------------- |
| <img src="public/assets/signup.png" width="220"/> | Registers new users and creates the initial profile scaffold for farm onboarding. |

### Private Tab: Dashboard (/dashboard)

| Mobile                                               | Guide                                                                                             |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| <img src="assets/dashboard.png" width="220"/> | Aggregates summary insights across weather, soil, recommendations, and yield for the active farm. |

### Private Tab: Farms (/farms)

| Mobile                                              | Guide                                                                                                  |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| <img src="public/assets/farms.png" width="220"/> | Manage farm records, location details, and active farm selection used by analytics and dashboard APIs. |

### Private Tab: Recommendations (/recommendations)

| Mobile                                              | Guide                                                                                          |
| --------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| <img src="public/assets/recommendations.png" width="220"/> | Displays ranked crops, recommendation analysis text, warning flags, and latest session output. |

### Private Tab: Weather (/weather)

| Mobile                                                | Guide                                                                                       |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| <img src="public/assets/weather.png" width="220"/> | Visualizes current and forecast weather signals that feed recommendation and yield context. |

### Private Tab: Yield (/yield)

| Mobile                                                     | Guide                                                                                       |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| <img src="public/assets/yield.png" width="220"/> | Presents expected yield and revenue signals derived from soil, weather, and market context. |

### Private Tab: Profile (/profile)

| Mobile                                            | Guide                                                                                |
| ------------------------------------------------- | ------------------------------------------------------------------------------------ |
| <img src="public/assets/profile.png" width="220"/> | Allows user profile updates including identity details and profile image management. |

### Private Tab: Parameters (/parameters)

| Mobile                                                     | Guide                                                                                |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| <img src="public/assets/parameters.png" width="220"/> | Hosts configurable preferences and operational parameters used by private workflows. |

### Private Tab: History (/history)

| Mobile                                            | Guide                                                                             |
| ------------------------------------------------- | --------------------------------------------------------------------------------- |
| <img src="public/assets/history.png" width="220"/> | Displays historical activity and recommendation sessions for longitudinal review. |

## Project Architecture

![PiliSeed Architecture](docs/frontend/image.png)

High-level backend flow:

auth -> ownership validation -> input validation -> provider normalization -> deterministic scoring -> optional AI explanation -> Firestore persistence -> API response envelope

## SYSTEM ARCHITECTURE

```mermaid
flowchart LR
	A[Web Client Next.js Frontend] --> B[Next.js API Routes]
	B --> C[Auth Middleware Firebase Token Verification]
	C --> D[Domain Services]
	D --> E[Firestore]
	D --> F[External Providers\nWeather/Geocode/Soil/Market/OpenAI]
	G[ESP32 Device] --> B
```

## API DOCUMENTATION

Main route groups:

- Auth: /api/auth/login, /api/auth/signup, /api/auth/logout, /api/auth/me
- Profile and upload: /api/profile, /api/upload/profile-image
- Farms: /api/farms and /api/farms/[farmId] with activate, soil, weather, market, recommendations, and yield sub-routes
- Dashboard: /api/dashboard/summary, /api/dashboard/analytics, /api/dashboard/activity
- Location: /api/location/geocode, /api/location/reverse
- Legacy compatibility (protected placeholders): /api/soil/[farmId], /api/soil/[farmId]/latest

For full JSON contracts, see docs/backend/API JSON Input Output Summary.md

## DATABASE SCHEMA

PiliSeed uses **Google Firestore (NoSQL)** with a **collection-based, document-oriented structure**. There are no SQL joins or foreign-key constraints in the database itself, so relationships are handled through `uid` for ownership and `farmId` for farm-scoped data. Every important document is linked to the authenticated user, and most operational records are also linked to a specific farm.

### Core Firestore Design Principles

- **Collections represent domains**, not tables in the SQL sense.
- **Documents are stored flat and queryable** so the app can scale cleanly.
- **Ownership is enforced using `uid`** across all user-owned records.
- **Farm-scoped records include `farmId`** for easy filtering and dashboard aggregation.
- **Time-series data is stored as separate documents**, not as arrays in a single document.
- **Structured AI outputs are stored as JSON fields** so the system can keep raw and processed results.
- **Device, weather, soil, recommendation, yield, and market data are all linked to farms**.

---

## Firestore Collections

### 1. `users`

Stores the authenticated user’s profile and account metadata.

Fields:

- `uid`
- `email`
- `name`
- `photoURL`
- `phone`
- `address`
- `providerIds`
- `createdAt`
- `updatedAt`
- `lastLoginAt`

### 2. `farms`

Stores farm records owned by a user.

Fields:

- `id`
- `uid`
- `name`
- `location`
- `isActive`
- `createdAt`
- `updatedAt`

### 3. `farmDevices`

Stores IoT device links and device state for a farm.

Fields:

- `id`
- `uid`
- `farmId`
- `deviceId`
- `deviceName`
- `tokenHash`
- `tokenHint`
- `activationPending`
- `lastReadings`
- `lastCollectedAt`
- `lastActivationRequestedAt`
- `lastActivationFulfilledAt`
- `lastSeenAt`
- `linkedAt`
- `createdAt`
- `updatedAt`

### 4. `soilProfiles`

Stores manual, API-based, and device-assisted soil records.

Fields:

- `id`
- `uid`
- `farmId`
- `texture`
- `soilClass`
- `soilClassValue`
- `soilClassProbability`
- `soilClassProbabilities`
- `pH`
- `moistureContent`
- `lightLevel`
- `temperatureC`
- `humidity`
- `nitrogen`
- `phosphorus`
- `potassium`
- `soilSource`
- `classificationJson`
- `analysisJson`
- `createdAt`
- `updatedAt`

### 5. `weatherSnapshots`

Stores weather records for a farm.

Fields:

- `id`
- `uid`
- `farmId`
- `temperatureC`
- `humidity`
- `rainfallMm`
- `recordedAt`
- `createdAt`
- `updatedAt`

### 6. `cropRecommendations`

Stores recommendation sessions and ranked crop outputs.

Fields:

- `id`
- `uid`
- `farmId`
- `sessionId`
- `sessionStartedAt`
- `recommendedCrops`
- `analysisText`
- `warningFlags`
- `generatedBy`
- `recommendationJson`
- `createdAt`
- `updatedAt`

### 7. `yieldForecasts`

Stores yield estimates and revenue forecasts.

Fields:

- `id`
- `uid`
- `farmId`
- `cropType`
- `season`
- `forecastPeriod`
- `expectedYield`
- `unit`
- `estimatedRevenue`
- `marketContext`
- `analysisText`
- `warningFlags`
- `generatedBy`
- `forecastJson`
- `createdAt`
- `updatedAt`

### 8. `marketSnapshots`

Stores normalized commodity market data for yield and revenue context.

Fields:

- `id`
- `uid`
- `farmId`
- `commodityName`
- `symbol`
- `price`
- `unit`
- `currency`
- `sourceDate`
- `createdAt`
- `updatedAt`

---

## Firestore Relationships (Mermaid)

```mermaid
erDiagram
    USERS {
        string uid PK
        string email
        string name
        string photoURL
        string phone
        string address
        json providerIds
        timestamp createdAt
        timestamp updatedAt
        timestamp lastLoginAt
    }

    FARMS {
        string id PK
        string uid
        string name
        string location
        boolean isActive
        timestamp createdAt
        timestamp updatedAt
    }

    FARM_DEVICES {
        string id PK
        string uid
        string farmId
        string deviceId
        string deviceName
        string tokenHash
        string tokenHint
        boolean activationPending
        json lastReadings
        timestamp lastSeenAt
        timestamp linkedAt
    }

    SOIL_PROFILES {
        string id PK
        string uid
        string farmId
        number pH
        number nitrogen
        number phosphorus
        number potassium
        number moistureContent
        number temperatureC
        number humidity
        string soilClass
        number soilClassProbability
        json classificationJson
        json analysisJson
        timestamp createdAt
    }

    WEATHER_SNAPSHOTS {
        string id PK
        string uid
        string farmId
        number temperatureC
        number humidity
        number rainfallMm
        timestamp recordedAt
    }

    CROP_RECOMMENDATIONS {
        string id PK
        string uid
        string farmId
        string sessionId
        json recommendedCrops
        string analysisText
        json warningFlags
        string generatedBy
        json recommendationJson
        timestamp createdAt
    }

    YIELD_FORECASTS {
        string id PK
        string uid
        string farmId
        string cropType
        string season
        number expectedYield
        number estimatedRevenue
        string generatedBy
        json forecastJson
        timestamp createdAt
    }

    MARKET_SNAPSHOTS {
        string id PK
        string uid
        string farmId
        string commodityName
        string symbol
        number price
        string currency
        timestamp sourceDate
    }

    USERS ||--o{ FARMS : owns
    USERS ||--o{ FARM_DEVICES : owns
    FARMS ||--o{ SOIL_PROFILES : has
    FARMS ||--o{ WEATHER_SNAPSHOTS : has
    FARMS ||--o{ CROP_RECOMMENDATIONS : generates
    FARMS ||--o{ YIELD_FORECASTS : produces
    FARMS ||--o{ MARKET_SNAPSHOTS : tracks
    FARMS ||--|| FARM_DEVICES : linked_device
```

## DEPLOYMENT DIAGRAM

```mermaid
flowchart TB
	U[User Browser] --> V[Vercel Next.js App]
	V --> R[Next.js API Runtime Node.js]
	R --> FA[Firebase Auth]
	R --> FS[Firestore]
	R --> CL[Cloudinary]
	R --> EX[External APIs]
	I[ESP32 IoT Node] --> R
```

## Libraries

- Next.js 16
- React 19
- TypeScript 5
- Firebase + Firebase Admin
- Zod
- Cloudinary
- Framer Motion
- Recharts
- Lucide React
- Sonner
- Tailwind CSS 4

## Data Sources and Integrations

- Firebase Auth and Firestore
- Cloudinary (profile image uploads)
- Open-Meteo weather endpoints (default)
- Open-Meteo geocoding + reverse geocoding fallback support
- ISRIC SoilGrids WRB classification endpoints
- Configurable market provider endpoints
- OpenAI-compatible responses endpoint for AI explanations

## Firmware

Firmware files are located in firmware/.

- firmware/esp32.ino: ESP32 sketch for sensor capture and recommendation display
- firmware/config.h.example: credentials and backend endpoint template

Workflow summary:

1. ESP32 reads moisture, temperature, humidity, and light.
2. Device sends readings to /api/farms/[farmId]/soil/device/readings.
3. Device checks activation/request endpoints and displays top recommendations on OLED.

## Contributors

PiliSeed Team
| Name | Username | Role |
| --- | --- | --- |
| ERSANDO, Aaron Gabriel | CPE3B-ersando-aarongabriel | Project Manager and Backend Developer |
| CAGARA, Josh "Lendi" Lendl | aysi19 | Quality Assurance and Frontend Developer |
| FABROS, Adrian Jude | Adrian-Fab | Web Design and Frontend Developer|
| NAVARRO, Francine Nicole | kuulaid | Backend Developer and Resident |
| VILLANUEVA, Kie Sha | CPE3B-villanueva-kiesha | Web Design and Frontend Developer |
