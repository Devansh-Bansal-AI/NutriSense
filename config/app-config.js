/**
 * NutriSense AI — Application Configuration
 * Centralized config for all modules. API keys should be set via environment.
 */

export const APP_CONFIG = {
  app: {
    name: 'NutriSense AI',
    version: '1.0.0',
    tagline: 'Your Intelligent Food & Health Companion',
    description: 'Context-aware meal recommendations powered by behavioral intelligence'
  },

  google: {
    maps: {
      apiKey: 'YOUR_GOOGLE_MAPS_API_KEY',
      defaultRadius: 2000, // meters
      defaultType: 'restaurant',
      healthyKeywords: ['salad', 'organic', 'vegan', 'healthy', 'smoothie', 'poke', 'acai']
    },
    firebase: {
      apiKey: 'YOUR_FIREBASE_API_KEY',
      authDomain: 'nutrisense-ai.firebaseapp.com',
      projectId: 'nutrisense-ai',
      storageBucket: 'nutrisense-ai.appspot.com',
      messagingSenderId: '000000000000',
      appId: '1:000000000000:web:0000000000000000000000'
    },
    gemini: {
      apiKey: 'YOUR_GEMINI_API_KEY',
      model: 'gemini-2.0-flash',
      enabled: true, // Keep enabled for Promptathon demos; placeholder key is auto-skipped
      timeoutMs: 5000
    }
  },

  engine: {
    weights: {
      nutritionScore: 0.30,
      goalAlignment: 0.25,
      timeRelevance: 0.15,
      budgetFit: 0.10,
      varietyBonus: 0.10,
      activityMatch: 0.10
    },
    mealWindows: {
      breakfast:       { start: 6,  end: 10, label: 'Breakfast',         icon: '🌅' },
      morningSnack:    { start: 10, end: 12, label: 'Morning Snack',     icon: '☀️' },
      lunch:           { start: 12, end: 14, label: 'Lunch',             icon: '🌤️' },
      afternoonSnack:  { start: 14, end: 17, label: 'Afternoon Snack',   icon: '⛅' },
      dinner:          { start: 17, end: 21, label: 'Dinner',            icon: '🌆' },
      lateNight:       { start: 21, end: 6,  label: 'Late Night Snack',  icon: '🌙' }
    },
    goals: {
      weightLoss:     { id: 'weightLoss',    label: 'Weight Loss',     icon: '⚖️',  calorieMultiplier: 0.80, proteinPriority: 0.7, carbPriority: 0.3, fatPriority: 0.4 },
      muscleGain:     { id: 'muscleGain',    label: 'Muscle Gain',     icon: '💪',  calorieMultiplier: 1.20, proteinPriority: 1.0, carbPriority: 0.8, fatPriority: 0.5 },
      generalHealth:  { id: 'generalHealth',  label: 'General Health',  icon: '❤️',  calorieMultiplier: 1.00, proteinPriority: 0.6, carbPriority: 0.6, fatPriority: 0.6 },
      energyBoost:    { id: 'energyBoost',   label: 'Energy Boost',    icon: '⚡',  calorieMultiplier: 1.05, proteinPriority: 0.5, carbPriority: 0.9, fatPriority: 0.4 },
      heartHealth:    { id: 'heartHealth',   label: 'Heart Health',    icon: '🫀',  calorieMultiplier: 0.95, proteinPriority: 0.6, carbPriority: 0.5, fatPriority: 0.3 }
    },
    budgetLevels: {
      low:    { id: 'low',    label: 'Budget-Friendly', maxPerMeal: 8,  icon: '💵' },
      medium: { id: 'medium', label: 'Moderate',        maxPerMeal: 15, icon: '💰' },
      high:   { id: 'high',   label: 'Premium',         maxPerMeal: 30, icon: '💎' }
    },
    activityLevels: {
      sedentary:  { id: 'sedentary',  label: 'Sedentary',       multiplier: 1.0,  icon: '🪑' },
      light:      { id: 'light',      label: 'Lightly Active',  multiplier: 1.15, icon: '🚶' },
      moderate:   { id: 'moderate',   label: 'Moderately Active', multiplier: 1.30, icon: '🏃' },
      intense:    { id: 'intense',    label: 'Very Active',     multiplier: 1.50, icon: '🏋️' }
    }
  },

  defaults: {
    dailyCalories: 2000,
    mealsPerDay: 3,
    budget: 'medium',
    goal: 'generalHealth',
    activityLevel: 'light',
    age: 30,
    weight: 70 // kg
  },

  ui: {
    maxRecommendations: 5,
    animationDuration: 300,
    toastDuration: 3000,
    historyLimit: 30,
    aiThinking: {
      enabled: true,
      minMs: 1200,
      maxMs: 2200,
      steps: [
        'Understanding your context...',
        'Scoring foods across nutrition and goals...',
        'Balancing timing, activity, and budget...',
        'Finalizing top recommendations...'
      ]
    }
  }
};
