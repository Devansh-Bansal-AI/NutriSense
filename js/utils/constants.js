/**
 * NutriSense AI — Application Constants
 * Centralized constants for consistent usage across modules.
 */

export const MEAL_TYPES = {
  BREAKFAST: 'breakfast',
  MORNING_SNACK: 'morningSnack',
  LUNCH: 'lunch',
  AFTERNOON_SNACK: 'afternoonSnack',
  DINNER: 'dinner',
  LATE_NIGHT: 'lateNight',
  SNACK: 'snack'
};

export const NUTRIENT_DAILY_VALUES = {
  calories: 2000,
  protein: 50,    // grams
  carbs: 300,     // grams
  fat: 65,        // grams
  fiber: 25,      // grams
  sugar: 50,      // grams
  sodium: 2300    // mg
};

export const HEALTH_SCORE_LABELS = {
  excellent: { min: 85, label: 'Excellent', color: '#22c55e', emoji: '🌟' },
  good:      { min: 70, label: 'Good',      color: '#84cc16', emoji: '✅' },
  moderate:  { min: 50, label: 'Moderate',   color: '#eab308', emoji: '⚠️' },
  poor:      { min: 30, label: 'Poor',       color: '#f97316', emoji: '🔶' },
  unhealthy: { min: 0,  label: 'Unhealthy',  color: '#ef4444', emoji: '🔴' }
};

export const NAV_ITEMS = [
  { id: 'dashboard',   label: 'Dashboard',      icon: '📊', shortcut: 'D' },
  { id: 'recommend',   label: 'Meal Planner',    icon: '🍽️', shortcut: 'M' },
  { id: 'scanner',     label: 'Food Scanner',    icon: '🔍', shortcut: 'S' },
  { id: 'nearby',      label: 'Nearby Places',   icon: '📍', shortcut: 'N' },
  { id: 'habits',      label: 'Habit Tracker',   icon: '📈', shortcut: 'H' }
];

export const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
