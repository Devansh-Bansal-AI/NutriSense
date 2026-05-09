import { FoodItem, ScoreBreakdown, MacroBreakdown, HealthLabel, ScanResult, Recommendation } from '@/types/food';
import { HealthGoal, ActivityLevel, BudgetLevel, MealWindow, UserProfile, DietaryRestriction } from '@/types/profile';
import { FOOD_DATABASE, FOOD_KEYWORDS } from '@/data/food-database';
import { getHealthLabel } from '@/lib/utils';
import { GeminiService } from './gemini';

export class NutritionEngine {
  
  static getDailyCalorieTarget(profile: UserProfile): number {
    const base = profile.dailyCalories;
    const multipliers: Record<HealthGoal, number> = {
      weightLoss: 0.8,
      muscleGain: 1.2,
      generalHealth: 1.0,
      energyBoost: 1.05,
      heartHealth: 0.95
    };
    return Math.round(base * (multipliers[profile.goal] || 1.0));
  }

  static getMacroBreakdown(food: FoodItem): MacroBreakdown {
    const proteinCal = food.protein * 4;
    const carbCal = food.carbs * 4;
    const fatCal = food.fat * 9;
    const total = proteinCal + carbCal + fatCal;

    return {
      protein: { grams: food.protein, percent: Math.round((proteinCal / total) * 100) || 0, color: '#818cf8' },
      carbs:   { grams: food.carbs,   percent: Math.round((carbCal / total) * 100) || 0,    color: '#34d399' },
      fat:     { grams: food.fat,     percent: Math.round((fatCal / total) * 100) || 0,      color: '#fbbf24' }
    };
  }

  static checkDietaryRestrictions(food: FoodItem, restrictions: DietaryRestriction[]): boolean {
    if (!restrictions || restrictions.length === 0) return true;
    
    for (const restriction of restrictions) {
      if (restriction === 'vegetarian' && !food.tags.includes('vegetarian') && !food.tags.includes('vegan')) {
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

  static calculateNutritionScore(food: FoodItem): number {
    let score = 50;
    
    const proteinRatio = (food.protein * 4) / Math.max(food.calories, 1);
    if (proteinRatio > 0.3) score += 15;
    else if (proteinRatio > 0.2) score += 10;
    else if (proteinRatio > 0.1) score += 5;

    if (food.fiber >= 10) score += 12;
    else if (food.fiber >= 5) score += 8;
    else if (food.fiber >= 3) score += 4;

    const sugarCalRatio = (food.sugar * 4) / Math.max(food.calories, 1);
    if (sugarCalRatio > 0.4) score -= 15;
    else if (sugarCalRatio > 0.25) score -= 8;
    else if (sugarCalRatio < 0.1) score += 5;

    if (food.sodium) {
      if (food.sodium > 800) score -= 12;
      else if (food.sodium > 600) score -= 6;
      else if (food.sodium < 200) score += 5;
    }

    if (food.calories < 200) score += 5;
    else if (food.calories > 500) score -= 5;

    const fatCalRatio = (food.fat * 9) / Math.max(food.calories, 1);
    if (fatCalRatio > 0.5) score -= 8;
    else if (fatCalRatio < 0.3) score += 3;

    const healthyTags = ['high-fiber', 'omega-3', 'antioxidant', 'probiotic', 'whole-grain', 'heart-healthy', 'superfood'];
    const tagBonus = food.tags.filter(t => healthyTags.includes(t)).length * 3;
    score += Math.min(tagBonus, 12);

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  static calculateGoalAlignment(food: FoodItem, goalId: HealthGoal): number {
    let score = 50;

    if (goalId === 'weightLoss') {
      if (food.calories < 300) score += 15;
      else if (food.calories < 400) score += 5;
      else if (food.calories > 500) score -= 15;

      if (food.protein > 25) score += 15;
      if (food.fiber > 8) score += 10;
      if (food.fat > 20) score -= 10;
      if (food.tags.includes('low-calorie')) score += 8;
    }

    if (goalId === 'muscleGain') {
      if (food.protein > 30) score += 20;
      else if (food.protein > 20) score += 12;
      else score -= 10;

      if (food.carbs > 40) score += 8;
      if (food.calories > 400) score += 5;
      if (food.tags.includes('muscle-building')) score += 10;
    }

    if (goalId === 'heartHealth') {
      if (food.sodium && food.sodium < 300) score += 12;
      if (food.fiber > 8) score += 12;
      if (food.tags.includes('omega-3')) score += 15;
      if (food.tags.includes('heart-healthy')) score += 10;
    }

    if (goalId === 'energyBoost') {
      if (food.carbs > 40) score += 15;
      if (food.sugar < 15) score += 5;
      if (food.fiber > 5) score += 8;
    }

    if (goalId === 'generalHealth') {
      const proteinCal = food.protein * 4;
      const total = food.calories || 1;
      const proteinPct = proteinCal / total;
      if (proteinPct > 0.2 && proteinPct < 0.35) score += 10;
      if (food.fiber > 5) score += 5;
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  static calculateTimeRelevance(food: FoodItem, mealWindow: MealWindow): number {
    const mealTag = {
      breakfast: 'breakfast',
      morningSnack: 'snack',
      lunch: 'lunch',
      afternoonSnack: 'snack',
      dinner: 'dinner',
      lateNight: 'snack'
    }[mealWindow] || 'lunch';

    if (food.meals.includes(mealTag)) return 95;

    const adjacentMap: Record<string, string[]> = {
      breakfast: ['snack'],
      snack: ['breakfast', 'lunch', 'dinner'],
      lunch: ['dinner', 'snack'],
      dinner: ['lunch']
    };

    const adjacent = adjacentMap[mealTag] || [];
    if (food.meals.some(m => adjacent.includes(m))) return 60;

    if (mealWindow === 'lateNight' && food.calories > 400) return 20;
    if (mealWindow === 'lateNight') return 40;

    return 30;
  }

  static calculateBudgetFit(food: FoodItem, budgetLevel: BudgetLevel): number {
    if (food.budget === budgetLevel) return 95;

    const budgetOrder = ['low', 'medium', 'high'];
    const foodIdx = budgetOrder.indexOf(food.budget);
    const userIdx = budgetOrder.indexOf(budgetLevel);

    if (foodIdx <= userIdx) return 85;
    if (foodIdx === userIdx + 1) return 40;
    return 15;
  }

  static calculateVarietyScore(food: FoodItem, recentFoodIds: string[]): number {
    if (recentFoodIds.length === 0) return 75;

    const lastEaten = recentFoodIds.indexOf(food.id);
    if (lastEaten === -1) return 95;
    if (lastEaten < 3) return 15;
    if (lastEaten < 7) return 40;
    return 65;
  }

  static calculateActivityMatch(food: FoodItem, activityLevel: ActivityLevel): number {
    let score = 50;

    if (activityLevel === 'intense') {
      if (food.protein > 25) score += 20;
      if (food.carbs > 35) score += 15;
    }

    if (activityLevel === 'sedentary') {
      if (food.calories < 350) score += 15;
      if (food.calories > 450) score -= 15;
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  static async scoreAndRankFoods(
    foods: FoodItem[],
    context: {
      goal: HealthGoal;
      mealWindow: MealWindow;
      activityLevel: ActivityLevel;
      budget: BudgetLevel;
      recentFoodIds: string[];
      goalLabel: string;
      mealLabel: string;
      targetCalories: number;
    },
    topN: number = 5
  ): Promise<Recommendation[]> {
    const weights = {
      nutritionScore: 0.30,
      goalAlignment: 0.25,
      timeRelevance: 0.15,
      budgetFit: 0.10,
      varietyBonus: 0.10,
      activityMatch: 0.10
    };

    const scored = foods.map(food => {
      const scores: ScoreBreakdown = {
        nutritionScore: this.calculateNutritionScore(food),
        goalAlignment: this.calculateGoalAlignment(food, context.goal),
        timeRelevance: this.calculateTimeRelevance(food, context.mealWindow),
        budgetFit: this.calculateBudgetFit(food, context.budget),
        varietyBonus: this.calculateVarietyScore(food, context.recentFoodIds),
        activityMatch: this.calculateActivityMatch(food, context.activityLevel)
      };

      let compositeScore = 0;
      compositeScore += scores.nutritionScore * weights.nutritionScore;
      compositeScore += scores.goalAlignment * weights.goalAlignment;
      compositeScore += scores.timeRelevance * weights.timeRelevance;
      compositeScore += scores.budgetFit * weights.budgetFit;
      compositeScore += scores.varietyBonus * weights.varietyBonus;
      compositeScore += scores.activityMatch * weights.activityMatch;
      compositeScore = Math.round(compositeScore);

      const stddev = Math.sqrt(Object.values(scores).reduce((sum, v) => sum + Math.pow(v - compositeScore, 2), 0) / 6);
      const confidence = stddev < 10 ? { level: 'high' as const, label: 'High Confidence', icon: '🟢' } :
                         stddev < 20 ? { level: 'medium' as const, label: 'Good Match', icon: '🟡' } :
                         { level: 'low' as const, label: 'Consider Alternatives', icon: '🟠' };

      const perMealBudget = Math.round(context.targetCalories / 3);
      const caloriePct = Math.round((food.calories / perMealBudget) * 100);

      return {
        food,
        scores,
        compositeScore,
        explanation: [] as string[], // Filled later via Gemini
        confidence,
        rank: 0,
        healthLabel: getHealthLabel(compositeScore),
        calorieContext: {
          perMealBudget,
          percentage: caloriePct,
          status: caloriePct <= 100 ? 'within' as const : 'over' as const
        },
        macroBreakdown: this.getMacroBreakdown(food)
      };
    });

    scored.sort((a, b) => b.compositeScore - a.compositeScore);
    const top = scored.slice(0, topN).map((item, index) => ({ ...item, rank: index + 1 }));

    // Enrich top results with Gemini explanations
    await Promise.all(top.map(async (item) => {
      item.explanation = await GeminiService.explainRecommendation(
        item.food,
        item.scores,
        {
          goalLabel: context.goalLabel,
          mealLabel: context.mealLabel,
          activityLevel: context.activityLevel,
          compositeScore: item.compositeScore
        }
      );
    }));

    return top;
  }

  static async analyzeFood(foodName: string): Promise<ScanResult> {
    const normalized = foodName.toLowerCase().trim();

    // 1. Check Keywords
    for (const [keyword, assessment] of Object.entries(FOOD_KEYWORDS as Record<string, any>)) {
      if (normalized.includes(keyword) || keyword.includes(normalized)) {
        return {
          found: true,
          name: foodName,
          keyword,
          score: assessment.score,
          category: assessment.category,
          summary: assessment.summary,
          suggestion: assessment.suggestion,
          healthLabel: getHealthLabel(assessment.score),
          timestamp: new Date().toISOString()
        };
      }
    }

    // 2. Check Database
    const dbMatch = FOOD_DATABASE.find(f => 
      f.name.toLowerCase().includes(normalized) || 
      normalized.includes(f.name.toLowerCase().split(' ')[0])
    );

    if (dbMatch) {
      const score = this.calculateNutritionScore(dbMatch);
      return {
        found: true,
        name: foodName,
        keyword: dbMatch.name,
        score: dbMatch.healthScore,
        category: dbMatch.category,
        summary: `${dbMatch.name}: ${dbMatch.calories} cal, ${dbMatch.protein}g protein, ${dbMatch.carbs}g carbs, ${dbMatch.fat}g fat.`,
        suggestion: dbMatch.benefits[0] || 'A nutritious choice.',
        healthLabel: getHealthLabel(score),
        details: dbMatch,
        timestamp: new Date().toISOString()
      };
    }

    // 3. Fallback to Gemini AI
    try {
      const aiResult = await GeminiService.analyzeFood(foodName);
      const score = Math.max(0, Math.min(100, Math.round(Number(aiResult.score) || 50)));
      return {
        found: true,
        name: foodName,
        keyword: foodName,
        score,
        category: aiResult.category || 'mixed',
        summary: aiResult.summary || 'AI assessment generated.',
        suggestion: aiResult.suggestion || 'Prefer whole-food options where possible.',
        healthLabel: getHealthLabel(score),
        aiGenerated: true,
        timestamp: new Date().toISOString()
      };
    } catch (err) {
      console.warn('AI analysis fallback failed:', err);
      return {
        found: false,
        name: foodName,
        keyword: normalized,
        score: null,
        category: 'unknown',
        summary: `"${foodName}" is not in our database yet.`,
        suggestion: 'Try searching for the main ingredient (e.g., "chicken" instead of "chicken parmesan").',
        healthLabel: { label: 'Unknown', color: '#6b7280', emoji: '❓', grade: '?' },
        timestamp: new Date().toISOString()
      };
    }
  }
}
