export const MEAL_TYPES = {
  BREAKFAST: 'breakfast',
  MORNING_SNACK: 'morningSnack',
  LUNCH: 'lunch',
  AFTERNOON_SNACK: 'afternoonSnack',
  DINNER: 'dinner',
  LATE_NIGHT: 'lateNight',
  SNACK: 'snack'
} as const;

export const NUTRIENT_DAILY_VALUES = {
  calories: 2000,
  protein: 50,
  carbs: 300,
  fat: 65,
  fiber: 25,
  sugar: 50,
  sodium: 2300
};

export const HEALTH_SCORE_LABELS = {
  excellent: { label: 'Excellent', color: '#22c55e', emoji: '🌟', grade: 'A' },
  good:      { label: 'Good',      color: '#84cc16', emoji: '✅', grade: 'B' },
  moderate:  { label: 'Moderate',  color: '#eab308', emoji: '⚠️', grade: 'C' },
  poor:      { label: 'Poor',      color: '#f97316', emoji: '🔶', grade: 'D' },
  unhealthy: { label: 'Unhealthy', color: '#ef4444', emoji: '🔴', grade: 'F' }
};

export const NAV_ITEMS = [
  { id: 'dashboard',   label: 'Dashboard',      icon: '📊', shortcut: 'D', href: '/' },
  { id: 'recommend',   label: 'Meal Planner',   icon: '🍽️', shortcut: 'M', href: '/planner' },
  { id: 'scanner',     label: 'Food Scanner',   icon: '🔍', shortcut: 'S', href: '/scanner' },
  { id: 'chat',        label: 'AI Chat',        icon: '💬', shortcut: 'C', href: '/chat' },
  { id: 'habits',      label: 'Habit Tracker',  icon: '📈', shortcut: 'H', href: '/tracker' }
];

export const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
