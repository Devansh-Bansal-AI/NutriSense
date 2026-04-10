/**
 * NutriSense AI — Utility Helpers
 * Pure utility functions used across the application.
 */

/**
 * Determines the current meal window based on hour of day.
 */
export function getCurrentMealWindow(hour = new Date().getHours()) {
  if (hour >= 6 && hour < 10)  return 'breakfast';
  if (hour >= 10 && hour < 12) return 'morningSnack';
  if (hour >= 12 && hour < 14) return 'lunch';
  if (hour >= 14 && hour < 17) return 'afternoonSnack';
  if (hour >= 17 && hour < 21) return 'dinner';
  return 'lateNight';
}

/**
 * Maps a meal window to the food database meal tag.
 */
export function mealWindowToTag(window) {
  const map = {
    breakfast: 'breakfast',
    morningSnack: 'snack',
    lunch: 'lunch',
    afternoonSnack: 'snack',
    dinner: 'dinner',
    lateNight: 'snack'
  };
  return map[window] || 'lunch';
}

/**
 * Clamp a number between min and max.
 */
export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/**
 * Linearly interpolate between two values.
 */
export function lerp(a, b, t) {
  return a + (b - a) * clamp(t, 0, 1);
}

/**
 * Format a number to N decimal places.
 */
export function round(value, decimals = 1) {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * Generate a unique ID.
 */
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

/**
 * Get greeting based on time of day.
 */
export function getGreeting(hour = new Date().getHours()) {
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  if (hour < 21) return 'Good Evening';
  return 'Good Night';
}

/**
 * Format date to readable string.
 */
export function formatDate(date) {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

/**
 * Format time to readable string.
 */
export function formatTime(date) {
  const d = new Date(date);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

/**
 * Debounce function calls.
 */
export function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Animate a counter from start to end value.
 */
export function animateCounter(element, start, end, duration = 800, suffix = '') {
  const startTime = performance.now();
  const diff = end - start;

  function update(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
    const current = Math.round(start + diff * eased);
    element.textContent = current + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}

/**
 * Create a DOM element with optional attributes and children.
 */
export function createElement(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  
  for (const [key, value] of Object.entries(attrs)) {
    if (key === 'className') el.className = value;
    else if (key === 'innerHTML') el.innerHTML = value;
    else if (key === 'textContent') el.textContent = value;
    else if (key.startsWith('on')) el.addEventListener(key.slice(2).toLowerCase(), value);
    else if (key === 'dataset') Object.assign(el.dataset, value);
    else if (key === 'style' && typeof value === 'object') Object.assign(el.style, value);
    else el.setAttribute(key, value);
  }

  for (const child of children) {
    if (typeof child === 'string') el.appendChild(document.createTextNode(child));
    else if (child instanceof Node) el.appendChild(child);
  }

  return el;
}

/**
 * Show a toast notification.
 */
export function showToast(message, type = 'info', duration = 3000) {
  const existing = document.querySelector('.toast-notification');
  if (existing) existing.remove();

  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
  const toast = createElement('div', {
    className: `toast-notification toast-${type}`,
    innerHTML: `<span class="toast-icon">${icons[type] || 'ℹ️'}</span><span class="toast-message">${message}</span>`
  });

  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('toast-visible'));

  setTimeout(() => {
    toast.classList.remove('toast-visible');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/**
 * Local storage wrapper with JSON serialization.
 */
export const storage = {
  get(key, fallback = null) {
    try {
      const data = localStorage.getItem(`nutrisense_${key}`);
      return data ? JSON.parse(data) : fallback;
    } catch {
      return fallback;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(`nutrisense_${key}`, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },

  remove(key) {
    localStorage.removeItem(`nutrisense_${key}`);
  }
};

/**
 * Get health score label and color from numeric score.
 */
export function getHealthLabel(score) {
  if (score >= 85) return { label: 'Excellent', color: '#22c55e', emoji: '🌟', grade: 'A' };
  if (score >= 70) return { label: 'Good',      color: '#84cc16', emoji: '✅', grade: 'B' };
  if (score >= 50) return { label: 'Moderate',   color: '#eab308', emoji: '⚠️', grade: 'C' };
  if (score >= 30) return { label: 'Poor',       color: '#f97316', emoji: '🔶', grade: 'D' };
  return { label: 'Unhealthy', color: '#ef4444', emoji: '🔴', grade: 'F' };
}

/**
 * Calculate BMR using Mifflin-St Jeor equation.
 */
export function calculateBMR(weight, height, age, gender) {
  if (gender === 'female') {
    return 10 * weight + 6.25 * height - 5 * age - 161;
  }
  return 10 * weight + 6.25 * height - 5 * age + 5;
}

/**
 * Calculate TDEE from BMR and activity level.
 */
export function calculateTDEE(bmr, activityMultiplier) {
  return Math.round(bmr * activityMultiplier);
}
