/**
 * NutriSense AI — Scoring Pipeline
 * Weighted multi-factor scoring system that combines all dimension scores
 * into a final recommendation ranking.
 */

import { APP_CONFIG } from '../../config/app-config.js';
import { FOOD_KEYWORDS } from '../../data/food-database.js';
import {
  calculateNutritionScore,
  calculateGoalAlignment,
  calculateTimeRelevance,
  calculateBudgetFit,
  calculateVarietyScore,
  calculateActivityMatch,
  generateExplanation
} from './nutrition-rules.js';

/**
 * Score a single food item against user context.
 * Returns normalized composite score + dimensional breakdown.
 */
export function scoreFood(food, context) {
  const { goalId, mealWindow, budget, activityLevel, recentFoodIds } = context;

  // Calculate each dimension
  const scores = {
    nutritionScore: calculateNutritionScore(food),
    goalAlignment:  calculateGoalAlignment(food, goalId),
    timeRelevance:  calculateTimeRelevance(food, mealWindow),
    budgetFit:      calculateBudgetFit(food, budget),
    varietyBonus:   calculateVarietyScore(food, recentFoodIds),
    activityMatch:  calculateActivityMatch(food, activityLevel)
  };

  // Weighted composite
  const weights = APP_CONFIG.engine.weights;
  let compositeScore = 0;
  for (const [key, weight] of Object.entries(weights)) {
    compositeScore += (scores[key] || 0) * weight;
  }

  // Generate explanation
  const explanation = generateExplanation(food, scores, context);

  return {
    food,
    scores,
    compositeScore: Math.round(compositeScore),
    explanation,
    confidence: calculateConfidence(scores)
  };
}

/**
 * Calculate confidence level — how "sure" the engine is about this recommendation.
 * High confidence = most dimension scores agree.
 */
function calculateConfidence(scores) {
  const values = Object.values(scores);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / values.length;
  const stddev = Math.sqrt(variance);

  // Lower stddev = higher confidence (scores are consistent)
  if (stddev < 10) return { level: 'high',   label: 'High Confidence',   icon: '🟢' };
  if (stddev < 20) return { level: 'medium', label: 'Good Match',        icon: '🟡' };
  return { level: 'low', label: 'Consider Alternatives', icon: '🟠' };
}

/**
 * Rank all foods and return top N recommendations.
 */
export function rankFoods(foods, context, topN = 5) {
  const scored = foods.map(food => scoreFood(food, context));

  // Sort by composite score descending
  scored.sort((a, b) => b.compositeScore - a.compositeScore);

  // Return top N with rank
  return scored.slice(0, topN).map((item, index) => ({
    ...item,
    rank: index + 1
  }));
}

/**
 * Quick health assessment for the food scanner.
 * Returns an assessment object for any food name/keyword.
 */
export function assessFoodHealth(foodName) {
  const normalized = foodName.toLowerCase().trim();

  // Try to find in database (FOOD_KEYWORDS imported at top)
  for (const [keyword, assessment] of Object.entries(FOOD_KEYWORDS)) {
    if (normalized.includes(keyword) || keyword.includes(normalized)) {
      return {
        found: true,
        keyword,
        ...assessment
      };
    }
  }

  return {
    found: false,
    keyword: normalized,
    score: null,
    summary: 'Food not found in our database. Try a more common food name.',
    suggestion: 'We\'re constantly expanding our database. Try searching for the main ingredient.'
  };
}
