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
4. AI Analysis
5. Recommendations
6. Continuous Updates
7. Dashboard Insights

## 📌 Step-by-Step

### 1. Registration

* User signs up with name, email, and password
* Email verification is required

### 2. Farm Setup

* User inputs farm details (location, optional soil data)
* System initializes farm profile

### 3. Data Collection

* Soil parameters can be entered manually
* Weather data is fetched automatically
* Data is securely stored

### 4. AI Analysis

* Backend processes collected data
* Machine learning models generate recommendations

### 5. Personalized Recommendations

* Crop suggestions provided
* Includes explanations and suitability scores

### 6. Continuous Updates

* Weather and soil data refreshed regularly
* Recommendations adapt dynamically

### 7. Dashboard & Insights

* Analytics and visualizations
* Seasonal comparisons and reporting

## 🏗️ Technical Flow

* **Frontend:** Next.js + TypeScript
* **Backend:** Node.js serverless functions
* **Database:** Firebase Authentication and Firestore
* **APIs:** RESTful endpoints
* **Security:** Data encryption (in transit and at rest)

## ❓ FAQ

**Q: Is my farm data private?**
Yes, all data is encrypted and secure.

**Q: How often are recommendations updated?**
Automatically based on new data.

**Q: Can I export my data?**
Yes, via the dashboard.

---

# 👥 About Page

## 🎯 Purpose

Provide users with insight into PiliSeed’s mission, vision, and team to build trust and credibility.

## 🧩 UI Elements

* Project background and story
* Mission and vision statements
* Team profiles
* Contact information
* Partners and supporters
* Call-to-action

## 🔄 User Flow

1. User navigates to About page
2. Reads mission and background
3. Explores team section
4. Contacts or engages with the platform

## ✍️ Content Guidelines

* Use authentic storytelling
* Highlight real-world impact
* Keep team bios concise

## ♿ Accessibility

* Alt text for images
* Readable layout
* Accessible forms

---

# 📝 Sign Up Page

## 🎯 Purpose

Enable new users to create accounts securely and efficiently.

## 🧩 UI Elements

* Name, Email, Password fields
* Signup button (disabled until valid)
* Login link
* Password strength indicator
* Terms and Privacy checkbox
* Error messages and loading indicator

## 🔄 User Flow

1. User enters required details
2. Real-time validation occurs
3. User accepts terms
4. Clicks Sign Up
5. Redirected to dashboard on success

## ⚠️ Validation Rules

* Name: 2–80 characters
* Email: Valid and unique
* Password: Minimum 8 characters
* Terms: Must be accepted

## ❗ Error Handling

* Inline validation messages
* Server error banner
* Focus on first invalid field

## ♿ Accessibility

* ARIA labels and screen reader support
* Logical tab navigation

## 🔒 Security

* HTTPS encryption
* No password storage in frontend
* Email verification required

---

# 🧭 Navigation & Routing

* Persistent navigation bar across all pages
* Active page highlighting
* Mobile-friendly menu
* Fast client-side routing

---

# ♿ Accessibility & Responsiveness

* Keyboard-navigable interface
* High color contrast
* Responsive layouts for all devices
* ARIA roles and labels

---

# ⚠️ Error Handling & Feedback

* Inline form validation
* Toast notifications for actions
* Clear error pages (e.g., 404)

---

# 🚀 Final Notes

* Clean and consistent structure
* Developer-friendly documentation
* Ready for GitHub or project submission
* Easily extendable as the platform evolves
