import { z } from 'zod';

export const analyzeRequestSchema = z.object({
  foodName: z.string().min(2).max(100),
  userId: z.string().optional()
});

export const recommendRequestSchema = z.object({
  goal: z.enum(['weightLoss', 'muscleGain', 'generalHealth', 'energyBoost', 'heartHealth']),
  mealWindow: z.enum(['breakfast', 'morningSnack', 'lunch', 'afternoonSnack', 'dinner', 'lateNight']),
  activityLevel: z.enum(['sedentary', 'light', 'moderate', 'intense']),
  budget: z.enum(['low', 'medium', 'high']),
  count: z.number().min(1).max(10).optional(),
  userId: z.string().optional()
});

export const profileSchema = z.object({
  goal: z.enum(['weightLoss', 'muscleGain', 'generalHealth', 'energyBoost', 'heartHealth']),
  activityLevel: z.enum(['sedentary', 'light', 'moderate', 'intense']),
  budget: z.enum(['low', 'medium', 'high']),
  dailyCalories: z.number().min(1000).max(5000),
  dietaryRestrictions: z.array(z.string()),
  allergens: z.array(z.string()),
  age: z.number().min(1).max(120),
  weight: z.number().min(20).max(300)
});

export const chatRequestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string()
  })),
  userProfile: profileSchema.optional()
});
