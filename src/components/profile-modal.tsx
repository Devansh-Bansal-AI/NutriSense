"use client";

import React, { useState } from 'react';
import { useProfile, UserProfile } from '@/context/profile-context';
import { HealthGoal, ActivityLevel, BudgetLevel } from '@/types/profile';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

const DIETARY_OPTIONS = ['Vegetarian', 'Vegan', 'Gluten-free', 'Keto', 'Paleo', 'Pescatarian'];

export function ProfileModal() {
  const { profile, isSetupRequired, saveProfile } = useProfile();
  const [isOpen, setIsOpen] = useState(isSetupRequired);

  // Form State
  const [goal, setGoal] = useState<HealthGoal>(profile?.goal || 'weightLoss');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(profile?.activityLevel || 'light');
  const [budget, setBudget] = useState<BudgetLevel>(profile?.budget || 'medium');
  const [calorieTarget, setCalorieTarget] = useState<number>(profile?.calorieTarget || 2000);
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>(profile?.dietaryRestrictions || []);

  // Update local state if setup status changes
  React.useEffect(() => {
    if (isSetupRequired) setIsOpen(true);
  }, [isSetupRequired]);

  if (!isOpen) return null;

  const toggleRestriction = (restriction: string) => {
    setDietaryRestrictions(prev => 
      prev.includes(restriction)
        ? prev.filter(r => r !== restriction)
        : [...prev, restriction]
    );
  };

  const handleSave = () => {
    saveProfile({
      goal,
      activityLevel,
      budget,
      calorieTarget,
      dietaryRestrictions,
    });
    setIsOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border border-white/10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <span className="text-xl">⚙️</span> Profile Settings
          </h2>
          {!isSetupRequired && (
            <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          <div className="space-y-2">
            <label className="text-sm font-semibold flex items-center gap-2 text-indigo-300">
              <span>🎯</span> Health Goal
            </label>
            <Select value={goal} onValueChange={(v) => setGoal(v as HealthGoal)}>
              <SelectTrigger className="bg-background/50 border-white/10"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="weightLoss">⚖️ Weight Loss</SelectItem>
                <SelectItem value="muscleGain">💪 Muscle Gain</SelectItem>
                <SelectItem value="generalHealth">🥗 General Health</SelectItem>
                <SelectItem value="energyBoost">⚡ Energy Boost</SelectItem>
                <SelectItem value="heartHealth">❤️ Heart Health</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold flex items-center gap-2 text-indigo-300">
              <span>🏃</span> Activity Level
            </label>
            <Select value={activityLevel} onValueChange={(v) => setActivityLevel(v as ActivityLevel)}>
              <SelectTrigger className="bg-background/50 border-white/10"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="sedentary">🛋️ Sedentary</SelectItem>
                <SelectItem value="light">🚶 Lightly Active</SelectItem>
                <SelectItem value="moderate">🏃 Moderately Active</SelectItem>
                <SelectItem value="intense">🏋️ Very Active</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold flex items-center gap-2 text-indigo-300">
              <span>💰</span> Budget Level
            </label>
            <Select value={budget} onValueChange={(v) => setBudget(v as BudgetLevel)}>
              <SelectTrigger className="bg-background/50 border-white/10"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="low">🪙 Budget Friendly</SelectItem>
                <SelectItem value="medium">💰 Moderate</SelectItem>
                <SelectItem value="high">💎 Premium</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold flex items-center gap-2 text-indigo-300">
              <span>🔋</span> Daily Calorie Target
            </label>
            <Input 
              type="number" 
              value={calorieTarget} 
              onChange={(e) => setCalorieTarget(Number(e.target.value))}
              className="bg-background/50 border-white/10"
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-semibold flex items-center gap-2 text-indigo-300">
              <span>🚫</span> Dietary Restrictions
            </label>
            <div className="flex flex-wrap gap-2">
              {DIETARY_OPTIONS.map(option => (
                <button
                  key={option}
                  onClick={() => toggleRestriction(option)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                    dietaryRestrictions.includes(option)
                      ? 'bg-primary border-primary text-primary-foreground shadow-[0_0_15px_rgba(139,92,246,0.3)]'
                      : 'bg-transparent border-white/10 text-muted-foreground hover:border-white/20 hover:text-foreground'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 pt-2">
          <Button 
            onClick={handleSave} 
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-0 py-6 text-lg shadow-[0_0_20px_rgba(139,92,246,0.4)]"
          >
            <span>💾</span> Save Profile
          </Button>
        </div>
      </div>
    </div>
  );
}
