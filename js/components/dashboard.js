/**
 * NutriSense AI — Dashboard Component
 * Main overview screen with daily summary, quick actions, and health metrics.
 */

import engine from '../engine/decision-engine.js';
import { getGreeting, getCurrentMealWindow, animateCounter } from '../utils/helpers.js';
import { APP_CONFIG } from '../../config/app-config.js';

export function renderDashboard(container) {
  const profile = engine.getProfile();
  const summary = engine.getDailySummary();
  const insights = engine.getInsights();
  const hour = new Date().getHours();
  const mealWindow = getCurrentMealWindow(hour);
  const mealConfig = APP_CONFIG.engine.mealWindows[mealWindow];
  const goalConfig = APP_CONFIG.engine.goals[profile.goal];

  container.innerHTML = `
    <div class="dashboard" id="dashboardView">
      <!-- Hero Section -->
      <section class="dash-hero" aria-label="Welcome">
        <div class="dash-hero-content">
          <h1 class="dash-greeting">${getGreeting(hour)} 👋</h1>
          <p class="dash-subtitle">
            ${mealConfig?.icon || '🍽️'} It's <strong>${mealConfig?.label || 'meal'}</strong> time · 
            ${goalConfig?.icon || '❤️'} <span class="goal-tag">${goalConfig?.label || 'Health'}</span> mode
          </p>
        </div>
        <div class="dash-hero-actions">
          <button class="btn btn-primary btn-glow" id="quickRecommendBtn">
            <span class="btn-icon">✨</span> Get Meal Ideas
          </button>
          <button class="btn btn-secondary" id="quickScanBtn">
            <span class="btn-icon">🔍</span> Scan Food
          </button>
        </div>
      </section>

      <!-- Daily Progress Ring -->
      <section class="dash-grid" aria-label="Daily Progress">
        <div class="dash-card dash-progress-card">
          <h3 class="dash-card-title">Today's Progress</h3>
          <div class="progress-ring-container">
            <svg class="progress-ring" viewBox="0 0 160 160">
              <circle class="progress-ring-bg" cx="80" cy="80" r="68" />
              <circle class="progress-ring-fill" cx="80" cy="80" r="68"
                stroke-dasharray="${2 * Math.PI * 68}"
                stroke-dashoffset="${2 * Math.PI * 68 * (1 - summary.percentComplete / 100)}"
                style="--progress-color: ${summary.percentComplete > 100 ? '#ef4444' : summary.percentComplete > 80 ? '#eab308' : '#22c55e'}"
              />
            </svg>
            <div class="progress-ring-label">
              <span class="progress-ring-value" data-target="${summary.totals.calories}">0</span>
              <span class="progress-ring-unit">/ ${summary.target} cal</span>
            </div>
          </div>
          <div class="progress-status ${summary.status}">
            ${summary.status === 'over' ? '⚠️ Over target' : summary.status === 'close' ? '🔥 Almost there!' : '✅ On track'}
            <span class="progress-remaining">${summary.remaining} cal remaining</span>
          </div>
        </div>

        <!-- Macros Breakdown -->
        <div class="dash-card dash-macros-card">
          <h3 class="dash-card-title">Macronutrients</h3>
          <div class="macro-bars">
            <div class="macro-row">
              <span class="macro-label">🟣 Protein</span>
              <div class="macro-bar-track">
                <div class="macro-bar-fill protein-bar" style="width: ${Math.min(100, (summary.totals.protein / 50) * 100)}%"></div>
              </div>
              <span class="macro-value" data-target="${summary.totals.protein}">0</span><span class="macro-unit">g</span>
            </div>
            <div class="macro-row">
              <span class="macro-label">🟢 Carbs</span>
              <div class="macro-bar-track">
                <div class="macro-bar-fill carbs-bar" style="width: ${Math.min(100, (summary.totals.carbs / 300) * 100)}%"></div>
              </div>
              <span class="macro-value" data-target="${summary.totals.carbs}">0</span><span class="macro-unit">g</span>
            </div>
            <div class="macro-row">
              <span class="macro-label">🟡 Fat</span>
              <div class="macro-bar-track">
                <div class="macro-bar-fill fat-bar" style="width: ${Math.min(100, (summary.totals.fat / 65) * 100)}%"></div>
              </div>
              <span class="macro-value" data-target="${summary.totals.fat}">0</span><span class="macro-unit">g</span>
            </div>
            <div class="macro-row">
              <span class="macro-label">🟤 Fiber</span>
              <div class="macro-bar-track">
                <div class="macro-bar-fill fiber-bar" style="width: ${Math.min(100, (summary.totals.fiber / 25) * 100)}%"></div>
              </div>
              <span class="macro-value" data-target="${summary.totals.fiber}">0</span><span class="macro-unit">g</span>
            </div>
          </div>
        </div>

        <!-- Stats Cards -->
        <div class="dash-card dash-stat-card">
          <div class="stat-icon">🍽️</div>
          <div class="stat-info">
            <span class="stat-value" data-target="${summary.totals.meals}">0</span>
            <span class="stat-label">Meals Today</span>
          </div>
        </div>

        <div class="dash-card dash-stat-card">
          <div class="stat-icon">${goalConfig?.icon || '❤️'}</div>
          <div class="stat-info">
            <span class="stat-value">${goalConfig?.label || 'Health'}</span>
            <span class="stat-label">Active Goal</span>
          </div>
        </div>
      </section>

      <!-- Insights Section -->
      <section class="dash-section" aria-label="Insights">
        <h2 class="section-title">💡 Smart Insights</h2>
        <div class="insights-grid">
          ${insights.length > 0 ? insights.map(insight => `
            <div class="insight-card insight-${insight.type}">
              <span class="insight-icon">${insight.icon}</span>
              <div class="insight-content">
                <strong>${insight.title}</strong>
                <p>${insight.text}</p>
              </div>
            </div>
          `).join('') : `
            <div class="insight-card insight-info">
              <span class="insight-icon">📝</span>
              <div class="insight-content">
                <strong>Start Your Journey</strong>
                <p>Log your first meal to unlock personalized insights and recommendations!</p>
              </div>
            </div>
          `}
        </div>
      </section>

      <!-- Recent Meals -->
      ${summary.logs.length > 0 ? `
        <section class="dash-section" aria-label="Today's Meals">
          <h2 class="section-title">📋 Today's Meals</h2>
          <div class="meal-log-list">
            ${summary.logs.map(log => `
              <div class="meal-log-item">
                <span class="meal-log-emoji">${log.emoji}</span>
                <div class="meal-log-info">
                  <span class="meal-log-name">${log.foodName}</span>
                  <span class="meal-log-time">${new Date(log.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <span class="meal-log-cal">${log.calories} cal</span>
              </div>
            `).join('')}
          </div>
        </section>
      ` : ''}
    </div>
  `;

  // Animate counters
  requestAnimationFrame(() => {
    document.querySelectorAll('[data-target]').forEach(el => {
      const target = parseInt(el.dataset.target) || 0;
      animateCounter(el, 0, target, 900);
    });
  });

  // Bind quick actions
  document.getElementById('quickRecommendBtn')?.addEventListener('click', () => {
    document.querySelector('[data-view="recommend"]')?.click();
  });
  document.getElementById('quickScanBtn')?.addEventListener('click', () => {
    document.querySelector('[data-view="scanner"]')?.click();
  });
}
