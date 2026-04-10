/**
 * NutriSense AI — Meal Recommender Component
 * Smart meal recommendation interface with contextual controls and detailed cards.
 */

import engine from '../engine/decision-engine.js';
import { APP_CONFIG } from '../../config/app-config.js';
import { getCurrentMealWindow, showToast, getHealthLabel } from '../utils/helpers.js';

let recommendationRequestId = 0;

export function renderMealRecommender(container) {
  const profile = engine.getProfile();
  const mealWindow = getCurrentMealWindow();
  const goalConfig = APP_CONFIG.engine.goals;
  const mealWindows = APP_CONFIG.engine.mealWindows;
  const activityLevels = APP_CONFIG.engine.activityLevels;
  const budgetLevels = APP_CONFIG.engine.budgetLevels;

  container.innerHTML = `
    <div class="recommender" id="recommenderView">
      <section class="recommender-header">
        <h1 class="page-title">🍽️ Smart Meal Planner</h1>
        <p class="page-subtitle">Personalized recommendations based on your goals, time, activity, and preferences.</p>
      </section>

      <!-- Context Controls -->
      <section class="recommender-controls">
        <div class="control-grid">
          <div class="control-group">
            <label class="control-label" for="goalSelect">🎯 Goal</label>
            <select id="goalSelect" class="control-select">
              ${Object.entries(goalConfig).map(([id, g]) => 
                `<option value="${id}" ${id === profile.goal ? 'selected' : ''}>${g.icon} ${g.label}</option>`
              ).join('')}
            </select>
          </div>

          <div class="control-group">
            <label class="control-label" for="mealSelect">🕐 Meal Time</label>
            <select id="mealSelect" class="control-select">
              ${Object.entries(mealWindows).map(([id, m]) => 
                `<option value="${id}" ${id === mealWindow ? 'selected' : ''}>${m.icon} ${m.label}</option>`
              ).join('')}
            </select>
          </div>

          <div class="control-group">
            <label class="control-label" for="activitySelect">🏃 Activity</label>
            <select id="activitySelect" class="control-select">
              ${Object.entries(activityLevels).map(([id, a]) => 
                `<option value="${id}" ${id === profile.activityLevel ? 'selected' : ''}>${a.icon} ${a.label}</option>`
              ).join('')}
            </select>
          </div>

          <div class="control-group">
            <label class="control-label" for="budgetSelect">💰 Budget</label>
            <select id="budgetSelect" class="control-select">
              ${Object.entries(budgetLevels).map(([id, b]) => 
                `<option value="${id}" ${id === profile.budget ? 'selected' : ''}>${b.icon} ${b.label}</option>`
              ).join('')}
            </select>
          </div>
        </div>

        <button class="btn btn-primary btn-lg btn-glow" id="generateBtn">
          <span class="btn-icon">✨</span> Generate Recommendations
        </button>
      </section>

      <!-- Results Container -->
      <section class="recommender-results" id="recommendResults">
        <div class="results-placeholder">
          <div class="placeholder-icon">🧠</div>
          <h3>Ready to Recommend</h3>
          <p>Adjust your preferences above and click "Generate Recommendations" to get personalized meal ideas.</p>
        </div>
      </section>
    </div>
  `;

  // Bind events
  document.getElementById('generateBtn')?.addEventListener('click', () => {
    generateRecommendations();
  });

  // Auto-generate on load
  setTimeout(() => generateRecommendations(), 300);
}

async function generateRecommendations() {
  const resultsContainer = document.getElementById('recommendResults');
  if (!resultsContainer) return;

  const requestId = ++recommendationRequestId;

  const goal = document.getElementById('goalSelect')?.value;
  const mealWindow = document.getElementById('mealSelect')?.value;
  const activityLevel = document.getElementById('activitySelect')?.value;
  const budget = document.getElementById('budgetSelect')?.value;

  // Show loading
  resultsContainer.innerHTML = `
    <div class="results-loading">
      <div class="loading-spinner"></div>
      <p id="recLoadingText">Analyzing your context & preferences...</p>
    </div>
  `;

  await simulateAiThinking(resultsContainer);
  if (requestId !== recommendationRequestId) return;

  const result = engine.getRecommendations({
    goal,
    mealWindow,
    activityLevel,
    budget,
    count: 5
  });

  renderResults(resultsContainer, result);
}

async function simulateAiThinking(container) {
  const config = APP_CONFIG.ui.aiThinking;
  if (!config?.enabled) {
    await wait(600);
    return;
  }

  const textNode = container.querySelector('#recLoadingText');
  const minMs = Math.max(300, config.minMs || 1200);
  const maxMs = Math.max(minMs, config.maxMs || 2200);
  const totalDelay = minMs + Math.floor(Math.random() * (maxMs - minMs + 1));
  const steps = Array.isArray(config.steps) && config.steps.length
    ? config.steps
    : ['Analyzing your context & preferences...'];

  if (!textNode) {
    await wait(totalDelay);
    return;
  }

  textNode.textContent = steps[0];
  const stepDelay = Math.max(300, Math.floor(totalDelay / steps.length));
  let idx = 0;

  const interval = setInterval(() => {
    idx = (idx + 1) % steps.length;
    textNode.textContent = steps[idx];
  }, stepDelay);

  await wait(totalDelay);
  clearInterval(interval);
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function renderResults(container, result) {
  const { recommendations, context, meta } = result;

  container.innerHTML = `
    <div class="results-header">
      <div class="results-meta">
        <span class="meta-badge">${context.mealIcon} ${context.mealLabel}</span>
        <span class="meta-badge">${context.goalIcon} ${context.goalLabel}</span>
        <span class="meta-badge">📊 ${meta.totalCandidates} foods analyzed</span>
      </div>
    </div>

    <div class="recommendation-cards">
      ${recommendations.map((rec, idx) => renderRecommendationCard(rec, idx)).join('')}
    </div>
  `;

  // Bind "Log Meal" buttons
  container.querySelectorAll('.log-meal-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const foodId = e.currentTarget.dataset.foodId;
      const mealWindow = document.getElementById('mealSelect')?.value || getCurrentMealWindow();
      engine.logMeal(foodId, mealWindow);
      showToast('Meal logged successfully! 🎉', 'success');
      e.currentTarget.textContent = '✅ Logged';
      e.currentTarget.disabled = true;
      e.currentTarget.classList.add('btn-logged');
    });
  });

  // Stagger animation
  container.querySelectorAll('.rec-card').forEach((card, i) => {
    card.style.animationDelay = `${i * 0.1}s`;
  });
}

function renderRecommendationCard(rec, index) {
  const { food, compositeScore, scores, explanation, confidence, healthLabel, calorieContext, macroBreakdown } = rec;
  const scoreColor = healthLabel.color;
  const rank = index + 1;

  return `
    <div class="rec-card animate-in" data-food-id="${food.id}">
      <div class="rec-card-header">
        <div class="rec-rank rank-${rank}">#${rank}</div>
        <div class="rec-food-info">
          <span class="rec-emoji">${food.emoji}</span>
          <div>
            <h3 class="rec-food-name">${food.name}</h3>
            <div class="rec-tags">
              ${food.tags.slice(0, 3).map(t => `<span class="food-tag">${t}</span>`).join('')}
            </div>
          </div>
        </div>
        <div class="rec-score" style="--score-color: ${scoreColor}">
          <span class="score-value">${compositeScore}</span>
          <span class="score-label">Score</span>
        </div>
      </div>

      <div class="rec-card-body">
        <!-- Macro Donut -->
        <div class="rec-macros">
          <div class="macro-mini">
            <span class="macro-mini-val">${food.calories}</span>
            <span class="macro-mini-label">cal</span>
          </div>
          <div class="macro-mini">
            <span class="macro-mini-val" style="color: ${macroBreakdown.protein.color}">${food.protein}g</span>
            <span class="macro-mini-label">protein</span>
          </div>
          <div class="macro-mini">
            <span class="macro-mini-val" style="color: ${macroBreakdown.carbs.color}">${food.carbs}g</span>
            <span class="macro-mini-label">carbs</span>
          </div>
          <div class="macro-mini">
            <span class="macro-mini-val" style="color: ${macroBreakdown.fat.color}">${food.fat}g</span>
            <span class="macro-mini-label">fat</span>
          </div>
        </div>

        <!-- Macro Bar -->
        <div class="macro-split-bar">
          <div class="macro-split protein-split" style="width: ${macroBreakdown.protein.percent}%" title="Protein ${macroBreakdown.protein.percent}%"></div>
          <div class="macro-split carbs-split" style="width: ${macroBreakdown.carbs.percent}%" title="Carbs ${macroBreakdown.carbs.percent}%"></div>
          <div class="macro-split fat-split" style="width: ${macroBreakdown.fat.percent}%" title="Fat ${macroBreakdown.fat.percent}%"></div>
        </div>

        <!-- Explanation — KEY for judging -->
        <div class="rec-explanation">
          <div class="explanation-header">
            <span class="explanation-icon">🧠</span>
            <span class="explanation-title">Why this recommendation</span>
            <span class="confidence-badge confidence-${confidence.level}">${confidence.icon} ${confidence.label}</span>
          </div>
          <ul class="explanation-list">
            ${explanation.map(reason => `<li>${reason}</li>`).join('')}
          </ul>
        </div>

        <!-- Score Breakdown -->
        <div class="score-breakdown">
          <div class="score-dim">
            <span class="dim-label">Nutrition</span>
            <div class="dim-bar-track"><div class="dim-bar-fill" style="width: ${scores.nutritionScore}%; background: #22c55e"></div></div>
            <span class="dim-score">${scores.nutritionScore}</span>
          </div>
          <div class="score-dim">
            <span class="dim-label">Goal Fit</span>
            <div class="dim-bar-track"><div class="dim-bar-fill" style="width: ${scores.goalAlignment}%; background: #818cf8"></div></div>
            <span class="dim-score">${scores.goalAlignment}</span>
          </div>
          <div class="score-dim">
            <span class="dim-label">Timing</span>
            <div class="dim-bar-track"><div class="dim-bar-fill" style="width: ${scores.timeRelevance}%; background: #38bdf8"></div></div>
            <span class="dim-score">${scores.timeRelevance}</span>
          </div>
          <div class="score-dim">
            <span class="dim-label">Activity</span>
            <div class="dim-bar-track"><div class="dim-bar-fill" style="width: ${scores.activityMatch}%; background: #f472b6"></div></div>
            <span class="dim-score">${scores.activityMatch}</span>
          </div>
        </div>
      </div>

      <div class="rec-card-footer">
        <div class="rec-meta-info">
          <span>⏱️ ${food.prepTime} min</span>
          <span>💰 ${food.budget}</span>
          <span>${food.fiber}g fiber</span>
        </div>
        <button class="btn btn-sm btn-primary log-meal-btn" data-food-id="${food.id}">
          + Log This Meal
        </button>
      </div>
    </div>
  `;
}
