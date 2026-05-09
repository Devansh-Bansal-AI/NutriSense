import { NextRequest, NextResponse } from 'next/server';
import { NutritionEngine } from '@/services/nutrition-engine';
import { recommendRequestSchema } from '@/lib/validators';
import { FirestoreService } from '@/services/firestore';
import { FOOD_DATABASE } from '@/data/food-database';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = recommendRequestSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({ error: result.error.format() }, { status: 400 });
    }

    const { goal, mealWindow, activityLevel, budget, count = 5, userId } = result.data;

    let targetCalories = 2000;
    let recentFoodIds: string[] = [];

    if (userId) {
      const profile = await FirestoreService.getProfile(userId);
      if (profile) {
        targetCalories = NutritionEngine.getDailyCalorieTarget(profile);
      }
      const history = await FirestoreService.getMealHistory(userId, 7);
      recentFoodIds = history.map(h => h.foodId);
    }

    const recommendations = await NutritionEngine.scoreAndRankFoods(
      FOOD_DATABASE,
      {
        goal,
        mealWindow,
        activityLevel,
        budget,
        recentFoodIds,
        goalLabel: goal, // In real app, map to readable label
        mealLabel: mealWindow,
        targetCalories
      },
      count
    );

    return NextResponse.json({
      recommendations,
      context: {
        goalId: goal,
        mealWindow,
        budget,
        activityLevel,
        recentFoodIds,
        hour: new Date().getHours(),
        timestamp: Date.now(),
        mealLabel: mealWindow,
        mealIcon: '🍽️',
        goalLabel: goal,
        goalIcon: '🎯'
      },
      meta: {
        totalCandidates: FOOD_DATABASE.length,
        generatedAt: new Date().toISOString(),
        engineVersion: '2.0.0'
      }
    });
  } catch (error) {
    console.error('Recommend API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
