/**
 * NutriSense AI — Habit Tracker Component
 * Weekly habit visualization with streak tracking and trend analysis.
 */

import engine from '../engine/decision-engine.js';

export function renderHabitTracker(container) {
  const habitData = engine.getHabitData(7);
  const insights = engine.getInsights();
  const profile = engine.getProfile();
  const target = engine.getDailyCalorieTarget();

  const daysLogged = habitData.filter(d => d.logged).length;
  const streak = calculateStreak(habitData);
  const avgCal = daysLogged > 0
    ? Math.round(habitData.filter(d => d.logged).reduce((s, d) => s + d.calories, 0) / daysLogged)
    : 0;
  const avgProtein = daysLogged > 0
    ? Math.round(habitData.filter(d => d.logged).reduce((s, d) => s + d.protein, 0) / daysLogged)
    : 0;

  const maxCal = Math.max(target, ...habitData.map(d => d.calories)) * 1.1;

  container.innerHTML = `
    <div class="habits" id="habitsView">
      <section class="habits-header">
        <h1 class="page-title">📈 Habit Tracker</h1>
        <p class="page-subtitle">Track your nutrition consistency and build healthier eating patterns over time.</p>
      </section>

      <!-- Streak & Stats -->
      <section class="habits-stats">
        <div class="habit-stat-card stat-streak">
          <div class="habit-stat-icon">🔥</div>
          <div class="habit-stat-value">${streak}</div>
          <div class="habit-stat-label">Day Streak</div>
        </div>
        <div class="habit-stat-card stat-logged">
          <div class="habit-stat-icon">📝</div>
          <div class="habit-stat-value">${daysLogged}/7</div>
          <div class="habit-stat-label">Days Logged</div>
        </div>
        <div class="habit-stat-card stat-avg-cal">
          <div class="habit-stat-icon">🔋</div>
          <div class="habit-stat-value">${avgCal}</div>
          <div class="habit-stat-label">Avg Cal/Day</div>
        </div>
        <div class="habit-stat-card stat-avg-protein">
          <div class="habit-stat-icon">💪</div>
          <div class="habit-stat-value">${avgProtein}g</div>
          <div class="habit-stat-label">Avg Protein</div>
        </div>
      </section>

      <!-- Weekly Chart -->
      <section class="habits-chart-section">
        <h2 class="section-title">📊 Weekly Calorie Trend</h2>
        <div class="habits-chart">
          <div class="chart-target-line" style="bottom: ${(target / maxCal) * 100}%">
            <span class="target-label">Target: ${target} cal</span>
          </div>
          <div class="chart-bars">
            ${habitData.map(day => {
              const height = day.calories > 0 ? (day.calories / maxCal) * 100 : 0;
              const overTarget = day.calories > target;
              const barClass = !day.logged ? 'bar-empty' : overTarget ? 'bar-over' : 'bar-good';
              return `
                <div class="chart-bar-group">
                  <div class="chart-bar-wrapper">
                    <div class="chart-bar ${barClass}" style="height: ${height}%"
                         title="${day.calories} cal">
                      ${day.logged ? `<span class="bar-value">${day.calories}</span>` : ''}
                    </div>
                  </div>
                  <span class="chart-bar-label">${day.dayLabel}</span>
                  <span class="chart-bar-date">${day.dateLabel}</span>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </section>

      <!-- Daily Breakdown Grid -->
      <section class="habits-breakdown-section">
        <h2 class="section-title">📋 Daily Breakdown</h2>
        <div class="breakdown-grid">
          ${habitData.map(day => `
            <div class="breakdown-card ${day.logged ? 'logged' : 'not-logged'}">
              <div class="breakdown-day">
                <span class="breakdown-day-name">${day.dayLabel}</span>
                <span class="breakdown-day-date">${day.dateLabel}</span>
              </div>
              ${day.logged ? `
                <div class="breakdown-stats">
                  <div class="bk-stat"><span class="bk-val">${day.calories}</span><span class="bk-label">cal</span></div>
                  <div class="bk-stat"><span class="bk-val">${day.protein}g</span><span class="bk-label">protein</span></div>
                  <div class="bk-stat"><span class="bk-val">${day.carbs}g</span><span class="bk-label">carbs</span></div>
                  <div class="bk-stat"><span class="bk-val">${day.meals}</span><span class="bk-label">meals</span></div>
                </div>
                <div class="breakdown-adherence">
                  <div class="adherence-bar-track">
                    <div class="adherence-bar-fill ${day.adherence > 100 ? 'over' : 'good'}" 
                         style="width: ${Math.min(100, day.adherence)}%"></div>
                  </div>
                  <span class="adherence-pct">${day.adherence}%</span>
                </div>
              ` : `
                <div class="breakdown-empty">
                  <span>No data logged</span>
                </div>
              `}
            </div>
          `).join('')}
        </div>
      </section>

      <!-- Insights -->
      <section class="habits-insights-section">
        <h2 class="section-title">💡 Weekly Insights</h2>
        <div class="insights-grid">
          ${insights.map(insight => `
            <div class="insight-card insight-${insight.type}">
              <span class="insight-icon">${insight.icon}</span>
              <div class="insight-content">
                <strong>${insight.title}</strong>
                <p>${insight.text}</p>
              </div>
            </div>
          `).join('')}
          ${insights.length === 0 ? `
            <div class="insight-card insight-info">
              <span class="insight-icon">📝</span>
              <div class="insight-content">
                <strong>Start Tracking</strong>
                <p>Log meals from the Meal Planner to see weekly insights and trends.</p>
              </div>
            </div>
          ` : ''}
        </div>
      </section>

      <!-- Actions -->
      <section class="habits-actions">
        <button class="btn btn-secondary" id="clearHistoryBtn">🗑️ Clear All History</button>
      </section>
    </div>
  `;

  // Animate bars
  requestAnimationFrame(() => {
    document.querySelectorAll('.chart-bar').forEach((bar, i) => {
      const targetHeight = bar.style.height;
      bar.style.height = '0%';
      setTimeout(() => {
        bar.style.height = targetHeight;
      }, 100 + i * 80);
    });
  });

  // Clear history button  
  document.getElementById('clearHistoryBtn')?.addEventListener('click', () => {
    if (confirm('Clear all meal history? This cannot be undone.')) {
      engine.clearHistory();
      renderHabitTracker(container);
    }
  });
}

function calculateStreak(habitData) {
  let streak = 0;
  for (let i = habitData.length - 1; i >= 0; i--) {
    if (habitData[i].logged) streak++;
    else break;
  }
  return streak;
}
