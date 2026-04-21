# 🌱 PiliSeed Frontend Documentation

## Public Pages

---

## 💡 Introduction

PiliSeed is a web-based agricultural intelligence platform designed to help farmers make smarter, data-driven decisions. By integrating location data, real-time weather information, and soil conditions, the platform delivers personalized crop recommendations, risk assessments, and actionable insights.

Many farmers rely on generalized advice that does not account for local environmental conditions. This often leads to poor crop selection, reduced yields, and increased exposure to climate risks. PiliSeed addresses this problem by providing precise, localized recommendations powered by artificial intelligence.

---

## 🚶 User Journey Overview

1. User lands on the Home page via direct link or search engine
2. Explores Features, How It Works, and About pages
3. Decides to Sign Up or Log In
4. Navigates through public pages via the navigation bar
5. Receives feedback and guidance at every step

---

# 🏠 Home (Landing) Page

## 🎯 Purpose

The Home page serves as the first point of contact for users. It introduces PiliSeed, communicates its value, and guides users toward key actions such as signing up, logging in, or exploring features.

## 🧩 UI Elements

* **Hero Section:** Branding, tagline, and agriculture-themed visuals
* **Feature Highlights:** Key features presented as icons or cards
* **Call-to-Action Buttons:** Login, Sign Up, Learn More
* **Navigation Bar:** Links to About, Features, How It Works
* **Footer:** Contact info, social links, legal notices
* **Responsive Design:** Optimized for all devices

## 🔄 User Flow

1. User arrives on the Home page
2. Views hero section and value proposition
3. Scrolls to explore features
4. Clicks a CTA (Login, Sign Up, Learn More)
5. Navigates to other pages if needed

## 🎨 UX & Design Notes

* Clean, agriculture-inspired design
* Clear and concise messaging
* Accessible (keyboard + ARIA support)
* Fast loading performance
* Trust indicators (About links, contact info)

## ⚙️ Technical Notes

* Built with Next.js and TypeScript
* Uses global CSS for consistent styling
* Client-side routing for smooth navigation

## ✅ Best Practices

* Keep CTAs visible and prominent
* Use testimonials or statistics if available
* Regularly update visuals and content

---

# 🌟 Features Page

## 🎯 Purpose

Highlight PiliSeed’s core features and benefits.

## 🧩 UI Elements

* Feature cards with icons or illustrations
* Short descriptions
* Links to Sign Up or Learn More

## 🔄 User Flow

1. User clicks Features in navigation
2. Browses key features
3. Navigates to Sign Up or other pages

## 🎨 Design Notes

* Card-based layout
* Use infographics and real-world examples
* Responsive grid system

---

# ⚙️ How It Works Page

## 🎯 Purpose

Explain how PiliSeed works end-to-end, including data processing, AI usage, and delivered value.

## 🔄 Process Overview

1. Registration
2. Farm Setup
3. Data Collection
# PiliSeed Frontend Documentation: Private (Authenticated) Pages

---

## Step-by-Step Private User Journey

### 1. Login & Authentication
1. User lands on the login page and enters credentials.
2. Credentials are validated client-side (format, required fields).
3. On submit, credentials are sent securely to the backend via HTTPS.
4. Backend verifies credentials and returns a secure session token.
5. On success, user is redirected to the Dashboard; on failure, error feedback is shown.
6. Session token is stored securely (e.g., HTTP-only cookie).

---

### 2. Dashboard Overview
1. User arrives at the Dashboard after login.
2. Dashboard fetches summary data: active farm, weather, recommendations, yield, and notifications.
3. Overview cards display:
	- Active farm name and quick stats
	- Weather summary (current and forecast)
	- Latest recommendations
	- Yield predictions
4. User can click any card to navigate to the detailed module.
5. Dashboard is responsive and adapts to all devices.
6. Loading indicators and error states are handled for each data fetch.

---

### 3. Farm Management
1. User navigates to the Farms page from the dashboard or sidebar.
2. All farms for the user are fetched and displayed as cards or a list.
3. User can:
	- Add a new farm (opens a form: name, location, set as active)
	- Edit an existing farm (updates name/location/active status)
	- Delete a farm (with confirmation dialog)
	- Set a farm as active (only one active at a time)
4. Adding/editing triggers validation (required fields, length, etc.).
5. API requests are made to create/update/delete farms; UI updates optimistically.
6. Errors (e.g., duplicate name, network issues) are shown inline.
7. Changing the active farm updates context for all other modules.

---

### 4. Profile Management
1. User navigates to the Profile page.
2. Profile info (name, email, etc.) is fetched and displayed.
3. User can edit profile fields (name, phone, address, etc.).
4. User can change password (with current password confirmation).
5. User can log out (session token cleared, redirected to login).
6. All forms have real-time validation and accessibility features.

---

### 5. Recommendations Module
1. User navigates to Recommendations (from dashboard or sidebar).
2. Recommendations for the active farm are fetched from the backend.
3. Each recommendation card shows:
	- Crop/action suggestion
	- Suitability score
	- Explanation/reasoning
	- Option to filter/sort recommendations
4. User can provide feedback on recommendations (like/dislike, comments).
5. Recommendations update as new data (soil, weather) is entered.
6. Errors and loading states are handled gracefully.

---

### 6. Soil Data Module
1. User navigates to Soil from dashboard or sidebar.
2. Soil data for the active farm is fetched and displayed as charts and tables.
3. User can input new soil data (pH, nutrients, moisture, etc.).
4. Form validation ensures all required fields are present and within valid ranges.
5. On submit, data is sent to the backend and UI updates optimistically.
6. Historical soil data is visualized for trends and analysis.
7. Errors (e.g., invalid input, network) are shown inline.

---

### 7. Weather Module
1. User navigates to Weather from dashboard or sidebar.
2. Current and forecasted weather for the active farm is fetched from external APIs.
3. Weather data is displayed as summary cards, charts, and alerts.
4. Severe weather alerts are highlighted.
5. User can view hourly/daily breakdowns and historical weather trends.
6. All data visualizations are accessible and responsive.

---

### 8. Yield Module
1. User navigates to Yield from dashboard or sidebar.
2. Yield predictions and historical yield data for the active farm are fetched.
3. Data is visualized as graphs, tables, and comparison charts.
4. User can filter by crop, season, or year.
5. Insights and recommendations are provided based on trends.
6. Export options for reports and data.

---

### 9. Navigation & Routing
1. Persistent sidebar or top navigation is present on all private pages.
2. Navigation highlights the current page/module.
3. Mobile menu is available for small screens.
4. Client-side routing ensures fast transitions.
5. Breadcrumbs or quick links for deep navigation.

---

### 10. Accessibility & Responsiveness
1. All interactive elements are keyboard-navigable.
2. Sufficient color contrast and large, legible fonts.
3. Responsive layouts for mobile, tablet, and desktop.
4. ARIA roles and labels for all forms and navigation.
5. Focus management for modals and dialogs.

---

### 11. Error Handling & Feedback
1. Inline error messages for all forms and actions.
2. Toast notifications for major actions (success, error, warning).
3. Clear feedback for navigation errors (404, unauthorized, etc.).
4. Loading indicators for all async actions.

---

### 12. Security Considerations
1. All API requests require authentication with secure tokens.
2. Sensitive actions (delete, update) require confirmation dialogs.
3. HTTPS enforced for all requests.
4. Session expiration and re-authentication flows.

---

### 13. API Contracts & Integration
1. All modules interact with RESTful backend APIs.
2. API endpoints:
	- /api/farms (GET, POST, PATCH, DELETE)
	- /api/farms/[farmId]/recommendations
	- /api/soil/[farmId]
	- /api/soil/[farmId]/latest
	- /api/farms/[farmId]/weather
	- /api/farms/[farmId]/yield
	- /api/profile
3. All requests and responses are JSON.
4. Error codes and messages are standardized.
5. Integration with third-party weather APIs.

---

### 14. Best Practices
1. Use semantic HTML for all content.
2. Lazy load data and non-critical scripts.
3. Minimize bundle size for fast load times.
4. Regularly test accessibility with screen readers and keyboard only.
5. Use optimistic UI updates for a smooth user experience.

---

### 15. Example User Scenarios
#### Scenario 1: New User Onboarding
1. Logs in for the first time, lands on dashboard.
2. Adds a new farm, inputs soil data.
3. Receives first recommendations and yield predictions.
4. Explores weather and analytics modules.
5. Updates profile and logs out.

#### Scenario 2: Power User Workflow
1. Logs in, reviews dashboard analytics.
2. Switches active farm, updates farm details.
3. Inputs new soil data, checks updated recommendations.
4. Exports yield report for the season.
5. Logs out securely.

---

### 16. Wireframes & Visuals
- [Insert wireframes, screenshots, or Figma links here.]

---

### 17. FAQ
- [Insert frequently asked questions and answers.]

---

# [Continue expanding each section with more technical, UX, and API details as needed.]
