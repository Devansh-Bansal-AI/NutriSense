/**
 * NutriSense AI — Main Application Controller
 * Orchestrates navigation, view rendering, profile management, and service initialization.
 */

import { APP_CONFIG } from '../config/app-config.js';
import { NAV_ITEMS } from './utils/constants.js';
import { storage, showToast, getGreeting } from './utils/helpers.js';
import { firebaseService } from './services/firebase-service.js';
import engine from './engine/decision-engine.js';

// Components (lazy-loaded)
import { renderDashboard } from './components/dashboard.js';
import { renderMealRecommender } from './components/meal-recommender.js';
import { renderFoodScanner } from './components/food-scanner.js';
import { renderNearbyPlaces } from './components/nearby-places.js';
import { renderHabitTracker } from './components/habit-tracker.js';

class NutriSenseApp {
  constructor() {
    this.currentView = 'dashboard';
    this.isProfileOpen = false;
    this.views = {
      dashboard: renderDashboard,
      recommend: renderMealRecommender,
      scanner: renderFoodScanner,
      nearby: renderNearbyPlaces,
      habits: renderHabitTracker
    };
  }

  /**
   * Initialize the application.
   */
  async init() {
    console.log(`[NutriSense AI] v${APP_CONFIG.app.version} initializing...`);

    // Initialize Firebase
    await firebaseService.initialize();
    const fbStatus = firebaseService.getStatus();
    console.log(`[Storage] ${fbStatus.provider} (${fbStatus.icon})`);

    // Render shell
    this.renderAppShell();

    // Navigate to default view
    this.navigateTo('dashboard');

    // Bind global events
    this.bindGlobalEvents();

    // Show welcome toast
    setTimeout(() => {
      showToast(`${getGreeting()} Welcome to NutriSense AI!`, 'info', 3000);
    }, 500);

    console.log('[NutriSense AI] Ready ✅');
  }

  /**
   * Render the application shell (sidebar + main area).
   */
  renderAppShell() {
    const app = document.getElementById('app');
    if (!app) return;

    const profile = engine.getProfile();
    const goalConfig = APP_CONFIG.engine.goals[profile.goal];
    const fbStatus = firebaseService.getStatus();

    app.innerHTML = `
      <!-- Sidebar Navigation -->
      <aside class="sidebar" id="sidebar" role="navigation" aria-label="Main navigation">
        <div class="sidebar-brand">
          <div class="brand-logo">
            <span class="logo-icon">🧠</span>
            <div class="logo-text">
              <span class="logo-title">NutriSense</span>
              <span class="logo-subtitle">AI</span>
            </div>
          </div>
        </div>

        <nav class="sidebar-nav">
          ${NAV_ITEMS.map(item => `
            <button class="nav-item ${item.id === this.currentView ? 'active' : ''}" 
                    data-view="${item.id}" 
                    id="nav-${item.id}"
                    aria-label="${item.label}"
                    title="${item.label} (${item.shortcut})">
              <span class="nav-icon">${item.icon}</span>
              <span class="nav-label">${item.label}</span>
            </button>
          `).join('')}
        </nav>

        <div class="sidebar-footer">
          <button class="nav-item profile-trigger" id="profileTrigger" aria-label="Profile settings">
            <span class="nav-icon">⚙️</span>
            <span class="nav-label">Settings</span>
          </button>
          <div class="sync-status" title="${fbStatus.provider}">
            ${fbStatus.icon} <span class="sync-label">${fbStatus.provider}</span>
          </div>
        </div>
      </aside>

      <!-- Main Content Area -->
      <main class="main-content" id="mainContent" role="main">
        <div class="content-container" id="contentContainer">
          <!-- Views rendered here -->
        </div>
      </main>

      <!-- Mobile Nav Toggle -->
      <button class="mobile-nav-toggle" id="mobileNavToggle" aria-label="Toggle navigation">
        <span></span><span></span><span></span>
      </button>

      <!-- Profile Settings Panel -->
      <div class="profile-overlay" id="profileOverlay"></div>
      <div class="profile-panel" id="profilePanel">
        <div class="profile-panel-header">
          <h2>⚙️ Profile Settings</h2>
          <button class="btn-close" id="profileClose" aria-label="Close settings">&times;</button>
        </div>
        <div class="profile-panel-body">
          ${this.renderProfileForm(profile)}
        </div>
      </div>
    `;
  }

  /**
   * Render the profile settings form.
   */
  renderProfileForm(profile) {
    const goals = APP_CONFIG.engine.goals;
    const activities = APP_CONFIG.engine.activityLevels;
    const budgets = APP_CONFIG.engine.budgetLevels;

    return `
      <form id="profileForm" class="profile-form">
        <div class="form-group">
          <label class="form-label" for="profileGoal">🎯 Health Goal</label>
          <select id="profileGoal" class="form-control">
            ${Object.entries(goals).map(([id, g]) =>
              `<option value="${id}" ${id === profile.goal ? 'selected' : ''}>${g.icon} ${g.label}</option>`
            ).join('')}
          </select>
        </div>

        <div class="form-group">
          <label class="form-label" for="profileActivity">🏃 Activity Level</label>
          <select id="profileActivity" class="form-control">
            ${Object.entries(activities).map(([id, a]) =>
              `<option value="${id}" ${id === profile.activityLevel ? 'selected' : ''}>${a.icon} ${a.label}</option>`
            ).join('')}
          </select>
        </div>

        <div class="form-group">
          <label class="form-label" for="profileBudget">💰 Budget Level</label>
          <select id="profileBudget" class="form-control">
            ${Object.entries(budgets).map(([id, b]) =>
              `<option value="${id}" ${id === profile.budget ? 'selected' : ''}>${b.icon} ${b.label}</option>`
            ).join('')}
          </select>
        </div>

        <div class="form-group">
          <label class="form-label" for="profileCalories">🔋 Daily Calorie Target</label>
          <input type="number" id="profileCalories" class="form-control" 
                 value="${profile.dailyCalories}" min="1000" max="5000" step="50" />
        </div>

        <div class="form-group">
          <label class="form-label">🚫 Dietary Restrictions</label>
          <div class="checkbox-group">
            ${['vegetarian', 'vegan', 'gluten-free', 'keto'].map(r => `
              <label class="checkbox-label">
                <input type="checkbox" name="dietary" value="${r}" 
                       ${(profile.dietaryRestrictions || []).includes(r) ? 'checked' : ''} />
                <span>${r.charAt(0).toUpperCase() + r.slice(1)}</span>
              </label>
            `).join('')}
          </div>
        </div>

        <button type="submit" class="btn btn-primary btn-lg btn-full">💾 Save Profile</button>
      </form>
    `;
  }

  /**
   * Navigate to a view.
   */
  navigateTo(viewId) {
    if (!this.views[viewId]) return;

    this.currentView = viewId;

    // Update nav states
    document.querySelectorAll('.nav-item[data-view]').forEach(item => {
      item.classList.toggle('active', item.dataset.view === viewId);
    });

    // Render view
    const container = document.getElementById('contentContainer');
    if (container) {
      container.classList.add('view-transition');
      setTimeout(() => {
        this.views[viewId](container);
        container.classList.remove('view-transition');
        container.scrollTop = 0;
      }, 150);
    }

    // Close mobile nav
    document.getElementById('sidebar')?.classList.remove('open');
    document.getElementById('mobileNavToggle')?.classList.remove('active');
  }

  /**
   * Bind global event listeners.
   */
  bindGlobalEvents() {
    // Navigation
    document.querySelectorAll('.nav-item[data-view]').forEach(item => {
      item.addEventListener('click', () => {
        this.navigateTo(item.dataset.view);
      });
    });

    // Mobile toggle
    document.getElementById('mobileNavToggle')?.addEventListener('click', () => {
      document.getElementById('sidebar')?.classList.toggle('open');
      document.getElementById('mobileNavToggle')?.classList.toggle('active');
    });

    // Profile panel
    document.getElementById('profileTrigger')?.addEventListener('click', () => {
      this.toggleProfile(true);
    });
    document.getElementById('profileClose')?.addEventListener('click', () => {
      this.toggleProfile(false);
    });
    document.getElementById('profileOverlay')?.addEventListener('click', () => {
      this.toggleProfile(false);
    });

    // Profile form submission
    document.getElementById('profileForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveProfile();
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') return;

      const shortcuts = { d: 'dashboard', m: 'recommend', s: 'scanner', n: 'nearby', h: 'habits' };
      const key = e.key.toLowerCase();
      if (shortcuts[key]) {
        e.preventDefault();
        this.navigateTo(shortcuts[key]);
      }
      if (key === 'escape') {
        this.toggleProfile(false);
      }
    });
  }

  /**
   * Toggle profile panel.
   */
  toggleProfile(open) {
    this.isProfileOpen = open;
    document.getElementById('profilePanel')?.classList.toggle('open', open);
    document.getElementById('profileOverlay')?.classList.toggle('open', open);
  }

  /**
   * Save profile from form.
   */
  saveProfile() {
    const goal = document.getElementById('profileGoal')?.value;
    const activityLevel = document.getElementById('profileActivity')?.value;
    const budget = document.getElementById('profileBudget')?.value;
    const dailyCalories = parseInt(document.getElementById('profileCalories')?.value) || 2000;

    // Validate
    if (dailyCalories < 1000 || dailyCalories > 5000) {
      showToast('Calorie target must be between 1000-5000', 'error');
      return;
    }

    const dietaryRestrictions = Array.from(
      document.querySelectorAll('input[name="dietary"]:checked')
    ).map(cb => cb.value);

    const profile = { goal, activityLevel, budget, dailyCalories, dietaryRestrictions };
    engine.saveProfile(profile);
    firebaseService.saveProfile(profile);

    showToast('Profile saved successfully! ✅', 'success');
    this.toggleProfile(false);

    // Refresh current view
    this.navigateTo(this.currentView);
  }
}

// ── Bootstrap ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const app = new NutriSenseApp();
  app.init();
});
