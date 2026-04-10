/**
 * NutriSense AI — Decision Engine (Core Intelligence Layer)
 * Orchestrates the recommendation pipeline from input to output.
 * This is the "brain" of NutriSense AI.
 * 
 * PIPELINE:
 *   User Context → Filter → Score → Rank → Explain → Output
 */

import { APP_CONFIG } from '../../config/app-config.js';
import { FOOD_DATABASE, FOOD_KEYWORDS } from '../../data/food-database.js';
import { rankFoods } from './scoring.js';
import { calculateNutritionScore } from './nutrition-rules.js';
import { getCurrentMealWindow, mealWindowToTag, storage, getHealthLabel } from '../utils/helpers.js';

class DecisionEngine {
  constructor() {
    this.foodDatabase = [...FOOD_DATABASE];
    this.foodKeywords = FOOD_KEYWORDS;
    this.userProfile = this.loadProfile();
    this.recentChoices = storage.get('recentChoices', []);
    this.dailyLog = storage.get('dailyLog', []);
  }

  /**
   * Load user profile from storage or defaults.
   */
  loadProfile() {
    return storage.get('userProfile', {
      goal: APP_CONFIG.defaults.goal,
      activityLevel: APP_CONFIG.defaults.activityLevel,
      budget: APP_CONFIG.defaults.budget,
      dailyCalories: APP_CONFIG.defaults.dailyCalories,
      dietaryRestrictions: [],
      allergens: [],
      age: APP_CONFIG.defaults.age,
      weight: APP_CONFIG.defaults.weight
    });
  }

  /**
   * Save user profile.
   */
  saveProfile(profile) {
    this.userProfile = { ...this.userProfile, ...profile };
    storage.set('userProfile', this.userProfile);
    return this.userProfile;
  }

  /**
   * Get the current user profile.
   */
  getProfile() {
    return { ...this.userProfile };
  }

  /**
   * PRIMARY METHOD: Generate smart meal recommendations.
   * This is the main entry point for the recommendation engine.
   */
  getRecommendations(overrides = {}) {
    const hour = new Date().getHours();
    const mealWindow = overrides.mealWindow || getCurrentMealWindow(hour);
    const mealTag = mealWindowToTag(mealWindow);

    // Build context object
    const context = {
      goalId: overrides.goal || this.userProfile.goal,
      mealWindow,
      budget: overrides.budget || this.userProfile.budget,
      activityLevel: overrides.activityLevel || this.userProfile.activityLevel,
      recentFoodIds: this.recentChoices.slice(0, 10),
      hour,
      timestamp: Date.now()
    };

    // Step 1: Filter foods by meal window and dietary restrictions
    let candidates = this.filterCandidates(mealTag, context);

    // Step 2: If too few candidates after filtering, relax constraints
    if (candidates.length < 5) {
      candidates = this.foodDatabase.filter(food => {
        return this.checkDietaryRestrictions(food);
      });
    }

    // Step 3: Score, rank, and return top recommendations
    const topN = overrides.count || APP_CONFIG.ui.maxRecommendations;
    const recommendations = rankFoods(candidates, context, topN);

    // Step 4: Enrich with additional metadata
    return {
      recommendations: recommendations.map(rec => this.enrichRecommendation(rec, context)),
      context: {
        ...context,
        mealLabel: APP_CONFIG.engine.mealWindows[mealWindow]?.label || 'Meal',
        mealIcon: APP_CONFIG.engine.mealWindows[mealWindow]?.icon || '🍽️',
        goalLabel: APP_CONFIG.engine.goals[context.goalId]?.label || 'Health',
        goalIcon: APP_CONFIG.engine.goals[context.goalId]?.icon || '❤️'
      },
      meta: {
        totalCandidates: candidates.length,
        generatedAt: new Date().toISOString(),
        engineVersion: APP_CONFIG.app.version
      }
    };
  }

  /**
   * Filter food candidates by meal type and dietary restrictions.
   */
  filterCandidates(mealTag, context) {
    return this.foodDatabase.filter(food => {
      // Meal time filter
      if (!food.meals.includes(mealTag)) return false;

      // Dietary restrictions
      if (!this.checkDietaryRestrictions(food)) return false;

      return true;
    });
  }

  /**
   * Check if food meets dietary restrictions.
   */
  checkDietaryRestrictions(food) {
    const restrictions = this.userProfile.dietaryRestrictions || [];
    
    for (const restriction of restrictions) {
      if (restriction === 'vegetarian' && !food.tags.includes('vegetarian') && !food.tags.includes('vegan')) {
        // Allow if it's not meat/seafood
        if (['protein', 'seafood'].includes(food.category) && 
            !food.tags.includes('vegetarian') && !food.tags.includes('vegan')) {
          return false;
        }
      }
      if (restriction === 'vegan' && !food.tags.includes('vegan')) return false;
      if (restriction === 'gluten-free' && !food.tags.includes('gluten-free')) return false;
      if (restriction === 'keto' && food.carbs > 20) return false;
    }

    return true;
  }

  /**
   * Enrich recommendation with additional display data.
   */
  enrichRecommendation(rec, context) {
    const healthLabel = getHealthLabel(rec.compositeScore);
    const calorieTarget = this.getDailyCalorieTarget();
    const mealsPerDay = APP_CONFIG.defaults.mealsPerDay;
    const perMealBudget = Math.round(calorieTarget / mealsPerDay);
    const caloriePct = Math.round((rec.food.calories / perMealBudget) * 100);

    return {
      ...rec,
      healthLabel,
      calorieContext: {
        perMealBudget,
        percentage: caloriePct,
        status: caloriePct <= 100 ? 'within' : 'over'
      },
      macroBreakdown: this.getMacroBreakdown(rec.food)
    };
  }

  /**
   * Get the daily calorie target based on goal.
   */
  getDailyCalorieTarget() {
    const base = this.userProfile.dailyCalories || APP_CONFIG.defaults.dailyCalories;
    const goalConfig = APP_CONFIG.engine.goals[this.userProfile.goal];
    const multiplier = goalConfig?.calorieMultiplier || 1.0;
    return Math.round(base * multiplier);
  }

  /**
   * Calculate macro percentage breakdown for visualization.
   */
  getMacroBreakdown(food) {
    const proteinCal = food.protein * 4;
    const carbCal = food.carbs * 4;
    const fatCal = food.fat * 9;
    const total = proteinCal + carbCal + fatCal;

    return {
      protein: { grams: food.protein, percent: Math.round((proteinCal / total) * 100), color: '#818cf8' },
      carbs:   { grams: food.carbs,   percent: Math.round((carbCal / total) * 100),    color: '#34d399' },
      fat:     { grams: food.fat,     percent: Math.round((fatCal / total) * 100),      color: '#fbbf24' }
    };
  }

  /**
   * Scan a food item and return health assessment.
   */
  scanFood(foodName) {
    const normalized = foodName.toLowerCase().trim();
    
    // Search in keywords database
    for (const [keyword, assessment] of Object.entries(this.foodKeywords)) {
      if (normalized.includes(keyword) || keyword.includes(normalized)) {
        const label = getHealthLabel(assessment.score);
        return {
          found: true,
          name: foodName,
          keyword,
          score: assessment.score,
          category: assessment.category,
          summary: assessment.summary,
          suggestion: assessment.suggestion,
          healthLabel: label,
          timestamp: new Date().toISOString()
        };
      }
    }

    // Search in food database
    const dbMatch = this.foodDatabase.find(f => 
      f.name.toLowerCase().includes(normalized) || 
      normalized.includes(f.name.toLowerCase().split(' ')[0])
    );

    if (dbMatch) {
      const score = calculateNutritionScore(dbMatch);
      const label = getHealthLabel(score);
      return {
        found: true,
        name: foodName,
        keyword: dbMatch.name,
        score: dbMatch.healthScore,
        category: dbMatch.category,
        summary: `${dbMatch.name}: ${dbMatch.calories} cal, ${dbMatch.protein}g protein, ${dbMatch.carbs}g carbs, ${dbMatch.fat}g fat.`,
        suggestion: dbMatch.benefits[0] || 'A nutritious choice.',
        healthLabel: label,
        details: dbMatch,
        timestamp: new Date().toISOString()
      };
    }

    return {
      found: false,
      name: foodName,
      score: null,
      summary: `"${foodName}" is not in our database yet. Try searching for the main ingredient (e.g., "chicken" instead of "chicken parmesan").`,
      suggestion: 'Our database covers 60+ common foods and meals.',
      healthLabel: { label: 'Unknown', color: '#6b7280', emoji: '❓', grade: '?' },
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Log a meal choice to daily history.
   */
  logMeal(foodId, mealWindow) {
    const food = this.foodDatabase.find(f => f.id === foodId);
    if (!food) return null;

    const entry = {
      id: Date.now().toString(36),
      foodId,
      foodName: food.name,
      emoji: food.emoji,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      fiber: food.fiber,
      mealWindow,
      timestamp: new Date().toISOString(),
      date: new Date().toDateString()
    };

    // Add to daily log
    this.dailyLog.push(entry);
    storage.set('dailyLog', this.dailyLog);

    // Update recent choices
    this.recentChoices.unshift(foodId);
    this.recentChoices = this.recentChoices.slice(0, 20);
    storage.set('recentChoices', this.recentChoices);

    return entry;
  }

  /**
   * Get today's nutrition summary.
   */
  getDailySummary() {
    const today = new Date().toDateString();
    const todayLogs = this.dailyLog.filter(l => l.date === today);

    const totals = todayLogs.reduce((acc, log) => {
      acc.calories += log.calories;
      acc.protein += log.protein;
      acc.carbs += log.carbs;
      acc.fat += log.fat;
      acc.fiber += log.fiber;
      acc.meals++;
      return acc;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, meals: 0 });

    const target = this.getDailyCalorieTarget();
    const remaining = Math.max(0, target - totals.calories);

    return {
      totals,
      target,
      remaining,
      percentComplete: Math.min(100, Math.round((totals.calories / target) * 100)),
      logs: todayLogs,
      status: totals.calories > target ? 'over' : totals.calories > target * 0.8 ? 'close' : 'onTrack'
    };
  }

  /**
   * Get habit data for the last N days.
   */
  getHabitData(days = 7) {
    const result = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toDateString();
      const dayLogs = this.dailyLog.filter(l => l.date === dateStr);

      const totals = dayLogs.reduce((acc, log) => {
        acc.calories += log.calories;
        acc.protein += log.protein;
        acc.carbs += log.carbs;
        acc.fat += log.fat;
        acc.fiber += log.fiber;
        acc.meals++;
        return acc;
      }, { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, meals: 0 });

      const target = this.getDailyCalorieTarget();

      result.push({
        date: dateStr,
        dayLabel: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dateLabel: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        ...totals,
        target,
        adherence: totals.meals > 0 ? Math.min(100, Math.round((totals.calories / target) * 100)) : 0,
        logged: totals.meals > 0
      });
    }

    return result;
  }

  /**
   * Get weekly insights — smart observations about eating patterns.
   */
  getInsights() {
    const habitData = this.getHabitData(7);
    const insights = [];

    const daysLogged = habitData.filter(d => d.logged).length;
    const avgCalories = daysLogged > 0 
      ? Math.round(habitData.filter(d => d.logged).reduce((s, d) => s + d.calories, 0) / daysLogged)
      : 0;
    const avgProtein = daysLogged > 0
      ? Math.round(habitData.filter(d => d.logged).reduce((s, d) => s + d.protein, 0) / daysLogged)
      : 0;

    if (daysLogged === 0) {
      insights.push({
        icon: '📝',
        title: 'Start Logging',
        text: 'Log your first meal to begin tracking your nutrition journey!',
        type: 'info'
      });
      return insights;
    }

    // Logging consistency
    if (daysLogged >= 5) {
      insights.push({ icon: '🔥', title: 'Great Consistency!', text: `You've logged meals for ${daysLogged} of the last 7 days. Keep it up!`, type: 'success' });
    } else if (daysLogged >= 3) {
      insights.push({ icon: '📊', title: 'Building Habits', text: `${daysLogged} days logged this week. Try to log every day for best insights.`, type: 'info' });
    }

    // Calorie analysis
    const target = this.getDailyCalorieTarget();
    if (avgCalories > 0) {
      const calDiff = avgCalories - target;
      if (Math.abs(calDiff) < target * 0.1) {
        insights.push({ icon: '✅', title: 'On Target', text: `Average ${avgCalories} cal/day — right on track with your ${target} cal goal!`, type: 'success' });
      } else if (calDiff > 0) {
        insights.push({ icon: '⚠️', title: 'Slight Surplus', text: `Averaging ${avgCalories} cal/day (${Math.abs(calDiff)} over target). Consider lighter options.`, type: 'warning' });
      } else {
        insights.push({ icon: '📉', title: 'Under Target', text: `Averaging ${avgCalories} cal/day. Make sure you're eating enough for your goals.`, type: 'info' });
      }
    }

    // Protein check
    if (avgProtein < 40 && this.userProfile.goal === 'muscleGain') {
      insights.push({ icon: '💪', title: 'More Protein Needed', text: `Average ${avgProtein}g protein/day. For muscle gain, aim for 1.6-2g per kg body weight.`, type: 'warning' });
    }

    return insights;
  }

  /**
   * Clear all logged data (for testing).
   */
  clearHistory() {
    this.dailyLog = [];
    this.recentChoices = [];
    storage.set('dailyLog', []);
    storage.set('recentChoices', []);
  }
}

// Singleton instance
export const engine = new DecisionEngine();
export default engine;
