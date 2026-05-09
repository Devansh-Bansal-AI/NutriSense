import { Recommendation, ScanResult } from './food';
import { HealthGoal, MealWindow, ActivityLevel, BudgetLevel } from './profile';

export interface AnalyzeRequest {
  foodName: string;
  userId?: string;
}

export type AnalyzeResponse = ScanResult;

export interface RecommendRequest {
  goal: HealthGoal;
  mealWindow: MealWindow;
  activityLevel: ActivityLevel;
  budget: BudgetLevel;
  count?: number;
  userId?: string;
}

export interface RecommendResponse {
  recommendations: Recommendation[];
  context: {
    goalId: string;
    mealWindow: string;
    budget: string;
    activityLevel: string;
    recentFoodIds: string[];
    hour: number;
    timestamp: number;
    mealLabel: string;
    mealIcon: string;
    goalLabel: string;
    goalIcon: string;
  };
  meta: {
    totalCandidates: number;
    generatedAt: string;
    engineVersion: string;
  };
}

export interface MealLogEntry {
  id: string;
  foodId: string;
  foodName: string;
  emoji: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  mealWindow: string;
  timestamp: string;
  date: string;
}

export interface Insight {
  icon: string;
  title: string;
  text: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

export interface HabitDay {
  date: string;
  dayLabel: string;
  dateLabel: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  meals: number;
  target: number;
  adherence: number;
  logged: boolean;
}

export interface HistoryResponse {
  entries: MealLogEntry[];
  summary: {
    totals: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      fiber: number;
      meals: number;
    };
    target: number;
    remaining: number;
    percentComplete: number;
    status: 'over' | 'close' | 'onTrack';
  };
  insights: Insight[];
  habitData: HabitDay[];
}
