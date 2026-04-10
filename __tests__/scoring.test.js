/**
 * Jest Unit Tests for Decision Engine Core
 * Covers scoring pipeline edge cases and context evaluation.
 */

import { scoreFood, rankFoods, assessFoodHealth } from '../js/engine/scoring.js';
import { APP_CONFIG } from '../config/app-config.js';

describe('Decision Engine - Scoring Pipeline', () => {
  const mockContext = {
    goalId: 'weight_loss',
    mealWindow: 'lunch',
    budget: 'medium',
    activityLevel: 'moderate',
    recentFoodIds: []
  };

  const mockFood = {
    id: 'test_chicken_salad',
    name: 'Grilled Chicken Salad',
    metrics: { protein: 35, carbs: 12, fat: 15, fiber: 8, calories: 320, sugar: 4, sodium: 450 },
    tags: ['high-protein', 'low-carb', 'vegetables'],
    mealTypes: ['lunch', 'dinner'],
    costLevel: 'medium'
  };

  test('scoreFood calculates composite score successfully', () => {
    const result = scoreFood(mockFood, mockContext);
    
    expect(result).toHaveProperty('compositeScore');
    expect(result).toHaveProperty('scores');
    expect(result).toHaveProperty('explanation');
    expect(result.compositeScore).toBeGreaterThan(0);
    expect(result.compositeScore).toBeLessThanOrEqual(100);
  });

  test('scoreFood respects variety penalties', () => {
    const contextWithHistory = { ...mockContext, recentFoodIds: ['test_chicken_salad'] };
    
    const freshResult = scoreFood(mockFood, mockContext);
    const penalizedResult = scoreFood(mockFood, contextWithHistory);
    
    expect(penalizedResult.scores.varietyBonus).toBeLessThan(freshResult.scores.varietyBonus);
  });

  test('rankFoods correctly sorts an array of foods', () => {
    const junkFood = {
      ...mockFood, 
      id: 'junk',
      metrics: { protein: 2, carbs: 60, fat: 35, fiber: 1, calories: 800, sugar: 45, sodium: 1200 },
      tags: ['processed']
    };

    const ranked = rankFoods([junkFood, mockFood], mockContext, 5);
    
    expect(ranked[0].food.id).toBe('test_chicken_salad');
    expect(ranked[1].food.id).toBe('junk');
    expect(ranked[0].compositeScore).toBeGreaterThan(ranked[1].compositeScore);
  });
});

describe('Food Scanner - Heuristics', () => {
  test('assessFoodHealth identifies known healthy foods', () => {
    const result = assessFoodHealth('salmon');
    expect(result.found).toBe(true);
    expect(result.score).toBeGreaterThan(80);
  });

  test('assessFoodHealth flags unknown foods', () => {
    const result = assessFoodHealth('unknown_alien_food');
    expect(result.found).toBe(false);
  });
});
