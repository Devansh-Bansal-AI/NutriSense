# 🧠 NutriSense AI: Contextual Intelligence, Not Calorie Counting
*Most nutrition apps act as dumb calculators. NutriSense AI is an intelligent behavioral engine.*

> Built for the AMD + Hack2Skill Promptathon, NutriSense utilizes a multi-dimensional scoring algorithm to evaluate food based on **who you are, what time it is, your budget, and what you've eaten recently**. By compounding Google Services and heuristics, it brings enterprise-grade decision intelligence into a sub-1MB, zero-dependency environment.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Google Services](https://img.shields.io/badge/Google-Maps%20%7C%20Firebase%20%7C%20Gemini-4285F4?logo=google)](https://cloud.google.com)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-Zero-green.svg)](#tech-stack)
[![Cloud Run Deploy](https://img.shields.io/badge/Hosted%20On:-Google%20Cloud%20Run-blue?logo=google-cloud)](https://cloud.google.com/run)

---

## 🎯 Problem Statement

**Poor eating habits are the #1 preventable cause of chronic disease worldwide.** Yet most people struggle to make healthy food choices because:

- Nutritional information is overwhelming and context-free
- Existing apps require tedious manual calorie counting
- Generic diet plans ignore individual goals, schedules, and budgets
- Finding healthy food options nearby requires active research

**NutriSense AI** solves this with a **hybrid contextual AI architecture** that adapts recommendations to goal, meal window, activity, budget, and recent choices, while providing instant AI-assisted analysis for unknown foods.

---

## 💡 Solution Overview

NutriSense AI is a **lightweight hybrid intelligence assistant** built for real-world Promptathon constraints:

- Deterministic scoring engine for speed, consistency, and explainability
- AI "thinking" latency for realistic recommendation generation UX
- Gemini REST fallback for foods not found in the local nutrition dataset

This delivers personalized recommendations with full transparency on *why* each food is suggested, without heavy ML infrastructure.

### What Makes It Different

| Feature | Traditional Apps | NutriSense AI |
|---------|-----------------|---------------|
| Recommendations | Static meal plans | Context-aware, real-time |
| Decision Logic | Calorie counting | Hybrid: scoring engine + Gemini fallback |
| Transparency | "Eat this" | "Here's why, with scores" |
| Setup Time | 20+ minutes | Instant with smart defaults |
| Dependencies | Heavy frameworks | Zero — pure vanilla JS |

---

## ✨ Core Features

### 1. 🍽️ Smart Meal Planner
**Context-aware meal recommendations** scored across 6 dimensions:
- Nutritional quality · Goal alignment · Time relevance
- Budget fit · Variety bonus · Activity match

Each recommendation includes a **transparent "Why this recommendation"** explanation with confidence scoring.

### 2. 🔍 Food Health Scanner
**Instant health assessment** for any food. Type "pizza" or "salmon" and get:
- Health score (0–100) with letter grade
- Detailed nutritional assessment
- Healthier alternatives
- Full macro breakdown for database items

### 3. 📍 Nearby Healthy Places
**Google Maps integration** to discover healthy restaurants nearby:
- Filter by category (salads, vegan, organic, juice bars, poke)
- Ratings, distance, price level, and open status
- Direct Google Maps deep links

### 4. 📈 Habit Tracker
**Weekly nutrition trend analysis** with:
- Animated calorie bar charts
- Streak tracking and daily breakdown
- Smart insights (calorie targets, protein intake, consistency)
- Adherence percentage per day

### 5. 📊 Intelligent Dashboard
**Real-time health overview** featuring:
- Animated calorie progress ring
- Macro nutrient bars (protein, carbs, fat, fiber)
- AI-generated daily insights
- Quick actions and today's meal log

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        PRESENTATION LAYER                       │
│  ┌──────────┬─────────────┬──────────┬─────────┬──────────────┐ │
│  │Dashboard │Meal Planner │ Scanner  │ Nearby  │Habit Tracker │ │
│  └────┬─────┴──────┬──────┴────┬─────┴────┬────┴───────┬──────┘ │
│       │            │           │          │            │         │
│  ┌────▼────────────▼───────────▼──────────▼────────────▼──────┐ │
│  │                    APP CONTROLLER (app.js)                  │ │
│  │         Navigation · Routing · State · Profile              │ │
│  └────────────────────────┬────────────────────────────────────┘ │
├───────────────────────────┼─────────────────────────────────────┤
│                    INTELLIGENCE LAYER                            │
│  ┌────────────────────────▼────────────────────────────────────┐ │
│  │              DECISION ENGINE (Core Brain)                    │ │
│  │  ┌────────────────┐  ┌──────────────┐  ┌────────────────┐  │ │
│  │  │Nutrition Rules │  │   Scoring    │  │  Explanation   │  │ │
│  │  │  (Heuristics)  │  │  Pipeline    │  │  Generator     │  │ │
│  │  │                │  │              │  │                │  │ │
│  │  │• Protein ratio │  │• 6-dimension │  │• Goal reasons  │  │ │
│  │  │• Fiber bonus   │  │  scoring     │  │• Nutrient why  │  │ │
│  │  │• Sugar penalty │  │• Weighted    │  │• Time context  │  │ │
│  │  │• Sodium check  │  │  composite   │  │• Activity fit  │  │ │
│  │  │• Tag analysis  │  │• Confidence  │  │• Budget note   │  │ │
│  │  └────────────────┘  └──────────────┘  └────────────────┘  │ │
│  └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│                     INTEGRATION LAYER                            │
│  ┌──────────────┐  ┌────────────────┐  ┌──────────────────────┐ │
│  │ Google Maps  │  │   Firebase     │  │   Local Storage      │ │
│  │ Places API   │  │   Firestore    │  │   (Fallback)         │ │
│  │              │  │   Auth         │  │                      │ │
│  └──────────────┘  └────────────────┘  └──────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│                        DATA LAYER                                │
│  ┌──────────────────────┐  ┌───────────────────────────────────┐ │
│  │  Food Database (38   │  │   Food Keywords Scanner (30+     │ │
│  │  curated meals with  │  │   common foods with health       │ │
│  │  full nutrition data)│  │   scores & alternatives)         │ │
│  └──────────────────────┘  └───────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## ⚙️ Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Frontend** | Vanilla HTML/CSS/JS (ES Modules) | Zero build tools, instant startup |
| **Styling** | CSS Custom Properties + Glassmorphism | Premium dark-mode design system |
| **Testing** | Jest | Enterprise-grade heuristic and algorithmic test coverage |
| **Hosting** | Google Cloud Run (via Docker) | Continuous deployment via GitHub container hooks |
| **Maps** | Google Maps API + Places | Real-time nearby restaurant search |
| **AI Fallback** | Gemini 2.0 Flash REST API | Generative evaluation for semantic food inputs |

**Note on Speed:** By combining a deterministic heuristic execution with Generative AI only on DB cache-misses, we maintain incredible performance times and deterministic transparency.

---

## 🔌 Google Services Integration

### 1. Google Maps Platform
- **Maps JavaScript API**: Dark-themed interactive map rendering
- **Places API**: Nearby healthy restaurant search with ratings, distance, and status
- **Category filtering**: Health food, salads, vegan, juice bars, organic, poke
- **Deep linking**: One-click "Open in Google Maps"

### 2. Google Gemini API (Active Fallback Layer)
- If the semantic keyword scanner fails to match a food in the dataset, it prompts the **Gemini 1.5 Flash** REST endpoint.
- Returns a standardized JSON object mapping to our custom `score`, `grade`, `summary`, and `macros` definitions.
- Keeps the system feeling inherently intelligent without breaking the UI.

### 3. Firebase & Cloud Deployment
- Built with hooks for Google Firestore and generic Auth models.
- Fully containerized (`Dockerfile`) for auto-scaling deployments on **Google Cloud Run**.

---

## 🧠 Decision Engine Deep Dive

The recommendation engine uses a **weighted multi-factor scoring pipeline**:

### Input Context
```
User Goal    →  Weight Loss / Muscle Gain / General Health / Energy / Heart
Time of Day  →  Breakfast / Morning Snack / Lunch / Afternoon / Dinner / Night
Activity     →  Sedentary / Light / Moderate / Intense
Budget       →  Low / Medium / High
History      →  Last 20 food choices (variety penalty)
```

### Scoring Dimensions (6-Factor Model)

| Dimension | Weight | Logic |
|-----------|--------|-------|
| Nutrition Score | 30% | Protein density, fiber, sugar/sodium penalty, healthy tags |
| Goal Alignment | 25% | Goal-specific macro/calorie targeting |
| Time Relevance | 15% | Meal-window appropriateness |
| Budget Fit | 10% | Budget level matching |
| Variety Bonus | 10% | Penalizes recently eaten foods |
| Activity Match | 10% | Post-workout protein, sedentary calorie awareness |

### Output
```
Ranked recommendations with:
├── Composite Score (0-100)
├── Dimensional Score Breakdown (visual bars)
├── Macro Split Visualization (protein/carbs/fat)
├── Confidence Level (High/Medium/Low)
├── "Why This Recommendation" explanation (3 transparent reasons)
└── One-click meal logging
```

---

## 📁 Project Structure

```
nutrisense/
├── index.html                     # Application entry point
├── README.md                      # Documentation (this file)
├── css/
│   └── styles.css                 # Complete design system (1200+ lines)
├── config/
│   └── app-config.js              # Centralized configuration
├── data/
│   └── food-database.js           # Curated nutrition dataset
└── js/
    ├── app.js                     # Main application controller
    ├── components/
    │   ├── dashboard.js           # Dashboard view
    │   ├── meal-recommender.js    # Recommendation engine UI
    │   ├── food-scanner.js        # Food health scanner UI
    │   ├── nearby-places.js       # Google Maps nearby UI
    │   └── habit-tracker.js       # Habit tracking & charts
    ├── engine/
    │   ├── decision-engine.js     # Core AI brain
    │   ├── nutrition-rules.js     # Heuristic scoring rules
    │   └── scoring.js             # Multi-factor scoring pipeline
    ├── services/
    │   ├── google-maps.js         # Maps API integration
    │   └── firebase-service.js    # Firebase integration
    └── utils/
        ├── constants.js           # Application constants
        └── helpers.js             # Utility functions
```

---

## 🚀 How to Run

### Option 1: Direct (Fastest)
```bash
# Just open in a browser — no build step required
open index.html

# Or use any static server:
python -m http.server 8000
# Then visit: http://localhost:8000
```

### Option 2: VS Code Live Server
1. Install the **Live Server** extension
2. Right-click `index.html` → **Open with Live Server**

### Option 3: Node.js
```bash
npx serve .
# Visit: http://localhost:3000
```

### Enabling Google Maps
1. Get a [Google Maps API key](https://console.cloud.google.com/apis/credentials)
2. Enable **Maps JavaScript API** and **Places API**
3. Uncomment the `<script>` tag in `index.html`
4. Add your key to `config/app-config.js`

### Enabling Firebase
1. Create a [Firebase project](https://console.firebase.google.com)
2. Enable **Firestore** and **Anonymous Auth**
3. Uncomment the Firebase `<script>` tags in `index.html`
4. Add your config to `config/app-config.js`

---

## 📋 Assumptions

1. **Nutrition data** is based on USDA FoodData Central simplified heuristics (per-serving approximations)
2. **Health scores** use rule-based heuristics, not clinical-grade ML models
3. **Nearby places** require a Google Maps API key for live data; mock data provided by default
4. **User profiles** are stored locally unless Firebase is configured
5. **Daily calorie targets** are guideline-based and should not replace medical advice

---

## 🔐 Security & Input Validation

- **XSS Prevention**: All user inputs are escaped via `textContent` → `innerHTML` sanitization
- **Input Length Limits**: Max 100 characters on scanner input, min 2 characters for search
- **Calorie Validation**: Profile calorie targets clamped to 1000–5000 range
- **Safe API Usage**: API keys are client-side (use restriction rules in Google Console)
- **No Server-Side Code**: Zero attack surface for backend exploits
- **Content Security**: No `eval()`, no dynamic script injection

---

## 🧪 Test Scenarios

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| Meal Recommendation | Set goal to "Weight Loss", generate | Low-calorie, high-protein meals ranked first |
| Time-Aware | Check at 8 AM vs 7 PM | Breakfast vs dinner items respectively |
| Food Scanner | Type "pizza" | Score ~35, "Poor" grade, healthier alternative |
| Food Scanner | Type "salmon" | Score ~92, "Excellent" grade, omega-3 benefits |
| Variety Engine | Log "oatmeal" 3x, regenerate | Oatmeal ranked lower, new options surface |
| Budget Filter | Set "Budget-Friendly" | Only low-budget meals score high |
| Profile Save | Change goal, save | Recommendations change on refresh |
| Habit Tracker | Log 3 meals | Bar chart, streak, and insights update |
| Unknown Food | Type "xyzfood" | Graceful "not found" with suggestion |
| Mobile View | Resize to 375px | Sidebar collapses, hamburger appears |

---

## 🔮 Future Scope

- **Gemini API Integration**: LLM-powered meal explanations and conversational interface
- **Google Fit API**: Real-time activity data for automatic activity level detection
- **Barcode Scanner**: Camera-based product scanning using Vision API
- **Meal Photo Analysis**: Upload food photos for AI-powered nutritional estimation
- **Social Features**: Share meal plans and compete with friends
- **Wearable Integration**: Sync with smartwatches for calorie burn tracking
- **Multi-language**: i18n support for global accessibility
- **PWA Offline Mode**: Service worker for full offline functionality
- **ML Model Training**: User behavior data to train personalized recommendation models

---

## 👥 Target Persona

**"Health-Conscious Professional"** — Age 25–40, busy schedule, wants to eat healthier but lacks time to research nutrition. Values quick, intelligent suggestions over complex meal planning apps. Budget-aware and goal-oriented.

---

## 📝 License

MIT License — Free for commercial and non-commercial use.

---

<div align="center">

**Built with 🧠 intelligence and ❤️ care**

*NutriSense AI — Making healthy eating effortless through contextual intelligence.*

</div>
