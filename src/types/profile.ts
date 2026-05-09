export type HealthGoal = 'weightLoss' | 'muscleGain' | 'generalHealth' | 'energyBoost' | 'heartHealth';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'intense';
export type BudgetLevel = 'low' | 'medium' | 'high';
export type DietaryRestriction = 'vegetarian' | 'vegan' | 'gluten-free' | 'keto' | string;
export type MealWindow = 'breakfast' | 'morningSnack' | 'lunch' | 'afternoonSnack' | 'dinner' | 'lateNight';

export interface UserProfile {
  goal: HealthGoal;
  activityLevel: ActivityLevel;
  budget: BudgetLevel;
  dailyCalories: number;
  dietaryRestrictions: DietaryRestriction[];
  allergens: string[];
  age: number;
  weight: number;
}
