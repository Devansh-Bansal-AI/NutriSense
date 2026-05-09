import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { HealthLabel } from "@/types/food"
import { MealWindow } from "@/types/profile"
import { HEALTH_SCORE_LABELS } from "./constants"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getCurrentMealWindow(hour = new Date().getHours()): MealWindow {
  if (hour >= 6 && hour < 10)  return 'breakfast';
  if (hour >= 10 && hour < 12) return 'morningSnack';
  if (hour >= 12 && hour < 14) return 'lunch';
  if (hour >= 14 && hour < 17) return 'afternoonSnack';
  if (hour >= 17 && hour < 21) return 'dinner';
  return 'lateNight';
}

export function getGreeting(hour = new Date().getHours()) {
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  if (hour < 21) return 'Good Evening';
  return 'Good Night';
}

export function formatDate(date: Date | string | number) {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export function formatTime(date: Date | string | number) {
  const d = new Date(date);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

export function getHealthLabel(score: number): HealthLabel {
  if (score >= 85) return HEALTH_SCORE_LABELS.excellent;
  if (score >= 70) return HEALTH_SCORE_LABELS.good;
  if (score >= 50) return HEALTH_SCORE_LABELS.moderate;
  if (score >= 30) return HEALTH_SCORE_LABELS.poor;
  return HEALTH_SCORE_LABELS.unhealthy;
}

export function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}
