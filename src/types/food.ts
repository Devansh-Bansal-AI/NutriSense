export interface NutritionData {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium?: number;
}

export interface MacroBreakdown {
  protein: { grams: number; percent: number; color: string };
  carbs: { grams: number; percent: number; color: string };
  fat: { grams: number; percent: number; color: string };
}

export interface FoodItem extends NutritionData {
  id: string;
  name: string;
  category: string;
  emoji: string;
  tags: string[];
  meals: string[];
  budget: 'low' | 'medium' | 'high';
  prepTime: number;
  healthScore: number;
  benefits: string[];
}

export interface HealthLabel {
  label: string;
  color: string;
  emoji: string;
  grade: string;
}

export interface ScoreBreakdown {
  nutritionScore: number;
  goalAlignment: number;
  timeRelevance: number;
  budgetFit: number;
  varietyBonus: number;
  activityMatch: number;
}

export interface Confidence {
  level: 'high' | 'medium' | 'low';
  label: string;
  icon: string;
}

export interface Recommendation {
  food: FoodItem;
  scores: ScoreBreakdown;
  compositeScore: number;
  explanation: string[];
  confidence: Confidence;
  rank: number;
  healthLabel: HealthLabel;
  calorieContext: {
    perMealBudget: number;
    percentage: number;
    status: 'within' | 'over';
  };
  macroBreakdown: MacroBreakdown;
}

export interface ScanResult {
  found: boolean;
  name: string;
  keyword: string;
  score: number | null;
  category: string;
  summary: string;
  suggestion: string;
  healthLabel: HealthLabel;
  details?: FoodItem;
  source?: string;
  aiGenerated?: boolean;
  timestamp: string;
}
