/**
 * NutriSense AI — Food Scanner Component
 * "Is this food healthy?" text-based food analysis tool.
 */

import engine from '../engine/decision-engine.js';
import { APP_CONFIG } from '../../config/app-config.js';
import { getHealthLabel, showToast } from '../utils/helpers.js';

let scanRequestId = 0;

export function renderFoodScanner(container) {
  container.innerHTML = `
    <div class="scanner" id="scannerView">
      <section class="scanner-header">
        <h1 class="page-title">🔍 Food Health Scanner</h1>
        <p class="page-subtitle">Type any food to get an instant health assessment with personalized recommendations.</p>
      </section>

      <section class="scanner-input-section">
        <div class="scanner-input-wrapper">
          <span class="scanner-input-icon">🔍</span>
          <input 
            type="text" 
            id="foodScanInput" 
            class="scanner-input"
            placeholder="Type a food name (e.g., pizza, salmon, avocado...)"
            autocomplete="off"
            maxlength="100"
            aria-label="Food name to scan"
          />
          <button class="btn btn-primary scanner-btn" id="scanBtn">Analyze</button>
        </div>
        <div class="scanner-suggestions">
          <span class="suggestion-label">Try:</span>
          <button class="suggestion-chip" data-food="pizza">🍕 Pizza</button>
          <button class="suggestion-chip" data-food="salmon">🐟 Salmon</button>
          <button class="suggestion-chip" data-food="avocado">🥑 Avocado</button>
          <button class="suggestion-chip" data-food="soda">🥤 Soda</button>
          <button class="suggestion-chip" data-food="oatmeal">🥣 Oatmeal</button>
          <button class="suggestion-chip" data-food="burger">🍔 Burger</button>
          <button class="suggestion-chip" data-food="tofu">🧆 Tofu</button>
          <button class="suggestion-chip" data-food="chocolate">🍫 Chocolate</button>
        </div>
      </section>

      <section class="scanner-results" id="scanResults">
        <div class="scan-placeholder">
          <div class="scan-placeholder-icon">🧪</div>
          <h3>Ready to Analyze</h3>
          <p>Enter a food name above or click a suggestion to see its health assessment.</p>
        </div>
      </section>

      <!-- Scan History -->
      <section class="scanner-history" id="scanHistory">
      </section>
    </div>
  `;

  const scanHistory = [];

  // Bind events
  const input = document.getElementById('foodScanInput');
  const scanBtn = document.getElementById('scanBtn');

  const performScan = async () => {
    const foodName = input?.value?.trim();
    if (!foodName) return;
    await scanFood(foodName, scanHistory);
  };

  scanBtn?.addEventListener('click', performScan);
  input?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') performScan();
  });

  // Suggestion chips
  document.querySelectorAll('.suggestion-chip').forEach(chip => {
    chip.addEventListener('click', async () => {
      const food = chip.dataset.food;
      if (input) input.value = food;
      await scanFood(food, scanHistory);
    });
  });

  // Focus input
  setTimeout(() => input?.focus(), 300);
}

async function scanFood(foodName, history) {
  const resultsContainer = document.getElementById('scanResults');
  if (!resultsContainer) return;

  const requestId = ++scanRequestId;

  // Validate input
  if (foodName.length < 2) {
    resultsContainer.innerHTML = `
      <div class="scan-error">
        <span>⚠️</span> Please enter at least 2 characters.
      </div>
    `;
    return;
  }

  // Sanitize input (basic XSS prevention)
  const sanitized = foodName.replace(/[<>\"'&]/g, '');

  // Show loading
  resultsContainer.innerHTML = `
    <div class="scan-loading">
      <div class="loading-spinner"></div>
      <p id="scanLoadingText">Searching nutrition data for "${sanitized}"...</p>
    </div>
  `;

  await wait(450);
  if (requestId !== scanRequestId) return;

  let result = engine.scanFood(sanitized);

  if (!result.found) {
    const loadingText = resultsContainer.querySelector('#scanLoadingText');
    if (loadingText) loadingText.textContent = `Not in local database. Asking Gemini about "${sanitized}"...`;
    result = await getGeminiFallbackAnalysis(sanitized, result);
  }

  if (requestId !== scanRequestId) return;
  renderScanResult(resultsContainer, result);

  // Add to history
  if (result.found) {
    history.unshift(result);
    renderScanHistory(history.slice(0, 5));
  }
}

function renderScanResult(container, result) {
  const { found, name, score, summary, suggestion, healthLabel } = result;

  if (!found) {
    container.innerHTML = `
      <div class="scan-result scan-not-found animate-in">
        <div class="scan-result-header">
          <span class="scan-emoji">❓</span>
          <h3>${escapeHtml(name)}</h3>
        </div>
        <p class="scan-summary">${summary}</p>
        <p class="scan-suggestion">${suggestion}</p>
      </div>
    `;
    return;
  }

  const scoreArc = Math.PI * 2 * (score / 100);
  const circumference = Math.PI * 2 * 45;

  container.innerHTML = `
    <div class="scan-result scan-found animate-in">
      <div class="scan-result-header">
        <div class="scan-score-ring">
          <svg viewBox="0 0 100 100" class="score-svg">
            <circle cx="50" cy="50" r="45" class="score-ring-bg" />
            <circle cx="50" cy="50" r="45" class="score-ring-fill" 
              stroke="${healthLabel.color}"
              stroke-dasharray="${circumference}"
              stroke-dashoffset="${circumference * (1 - score / 100)}"
            />
          </svg>
          <div class="score-center">
            <span class="score-num">${score}</span>
            <span class="score-max">/100</span>
          </div>
        </div>
        <div class="scan-info">
          <h2 class="scan-food-name">${escapeHtml(name)}</h2>
          <span class="health-badge" style="background: ${healthLabel.color}20; color: ${healthLabel.color}; border: 1px solid ${healthLabel.color}40">
            ${healthLabel.emoji} ${healthLabel.label} (Grade ${healthLabel.grade})
          </span>
          ${result.aiGenerated ? '<span class="health-badge" style="margin-top: 0.5rem; background: rgba(59,130,246,0.15); color: #60a5fa; border: 1px solid rgba(59,130,246,0.35)">🤖 Gemini Fallback Analysis</span>' : ''}
        </div>
      </div>

      <div class="scan-details">
        <div class="scan-detail-card">
          <span class="detail-icon">📋</span>
          <div>
            <strong>Assessment</strong>
            <p>${summary}</p>
          </div>
        </div>
        <div class="scan-detail-card scan-suggestion-card">
          <span class="detail-icon">💡</span>
          <div>
            <strong>Healthier Alternative</strong>
            <p>${suggestion}</p>
          </div>
        </div>
      </div>

      ${result.details ? renderDetailedNutrition(result.details) : ''}
    </div>
  `;
}

function renderDetailedNutrition(food) {
  return `
    <div class="scan-nutrition-detail">
      <h4>Detailed Nutrition</h4>
      <div class="nutrition-grid">
        <div class="nutrition-item"><span class="nut-label">Calories</span><span class="nut-value">${food.calories}</span></div>
        <div class="nutrition-item"><span class="nut-label">Protein</span><span class="nut-value">${food.protein}g</span></div>
        <div class="nutrition-item"><span class="nut-label">Carbs</span><span class="nut-value">${food.carbs}g</span></div>
        <div class="nutrition-item"><span class="nut-label">Fat</span><span class="nut-value">${food.fat}g</span></div>
        <div class="nutrition-item"><span class="nut-label">Fiber</span><span class="nut-value">${food.fiber}g</span></div>
        <div class="nutrition-item"><span class="nut-label">Sugar</span><span class="nut-value">${food.sugar}g</span></div>
      </div>
      <div class="nutrition-benefits">
        ${food.benefits?.map(b => `<span class="benefit-tag">✨ ${b}</span>`).join('') || ''}
      </div>
    </div>
  `;
}

function renderScanHistory(history) {
  const container = document.getElementById('scanHistory');
  if (!container || history.length === 0) return;

  container.innerHTML = `
    <h3 class="section-title">📜 Recent Scans</h3>
    <div class="history-chips">
      ${history.map(item => `
        <div class="history-chip" style="border-color: ${item.healthLabel.color}40">
          <span>${item.healthLabel.emoji}</span>
          <span class="history-name">${escapeHtml(item.name)}</span>
          <span class="history-score" style="color: ${item.healthLabel.color}">${item.score}</span>
        </div>
      `).join('')}
    </div>
  `;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

async function getGeminiFallbackAnalysis(foodName, baseResult) {
  const gemini = APP_CONFIG.google?.gemini;

  if (!isGeminiConfigured(gemini)) {
    return {
      ...baseResult,
      suggestion: 'Gemini fallback is available. Add a valid Gemini API key in config/app-config.js to enable live AI analysis for unknown foods.'
    };
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(gemini.model)}:generateContent?key=${encodeURIComponent(gemini.apiKey)}`;
  const prompt = [
    'You are a nutrition assistant.',
    `Analyze the food item: ${foodName}`,
    'Return ONLY strict JSON with keys: score, category, summary, suggestion.',
    'Rules: score is integer 0-100, summary max 30 words, suggestion max 20 words.'
  ].join('\n');

  try {
    const controller = new AbortController();
    const timeoutMs = Math.max(1000, gemini.timeoutMs || 5000);
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ]
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Gemini request failed (${response.status})`);
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.map(p => p.text).join('\n') || '';
    const parsed = extractGeminiJson(text);

    if (!parsed) {
      throw new Error('Invalid Gemini JSON response');
    }

    const score = normalizeScore(parsed.score);
    return {
      found: true,
      name: foodName,
      keyword: foodName,
      score,
      category: String(parsed.category || 'mixed'),
      summary: String(parsed.summary || `AI analysis generated for ${foodName}.`),
      suggestion: String(parsed.suggestion || 'Prefer whole-food options where possible.'),
      healthLabel: getHealthLabel(score),
      source: 'gemini',
      aiGenerated: true,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.warn('Gemini fallback failed:', error);
    showToast('Gemini fallback unavailable. Showing local guidance.', 'warning', 2500);
    return {
      ...baseResult,
      suggestion: 'Gemini fallback was unavailable right now. Try again in a moment or use a more specific ingredient name.'
    };
  }
}

function isGeminiConfigured(gemini) {
  if (!gemini?.enabled) return false;
  if (!gemini.apiKey || typeof gemini.apiKey !== 'string') return false;
  if (gemini.apiKey.startsWith('YOUR_')) return false;
  return true;
}

function extractGeminiJson(text) {
  if (!text || typeof text !== 'string') return null;

  const stripped = text.replace(/```json|```/gi, '').trim();
  try {
    return JSON.parse(stripped);
  } catch {
    const match = stripped.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}

function normalizeScore(value) {
  const num = Number(value);
  if (Number.isNaN(num)) return 55;
  return Math.max(0, Math.min(100, Math.round(num)));
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
