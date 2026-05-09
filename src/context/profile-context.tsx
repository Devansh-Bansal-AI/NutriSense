"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { HealthGoal, ActivityLevel, BudgetLevel } from '@/types/profile';

export interface UserProfile {
  goal: HealthGoal;
  activityLevel: ActivityLevel;
  budget: BudgetLevel;
  calorieTarget: number;
  dietaryRestrictions: string[];
}

interface ProfileContextType {
  profile: UserProfile | null;
  isSetupRequired: boolean;
  saveProfile: (profile: UserProfile) => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isSetupRequired, setIsSetupRequired] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Only run on client
    const savedProfile = localStorage.getItem('nutrisense_profile');
    if (savedProfile) {
      try {
        setProfile(JSON.parse(savedProfile));
      } catch (e) {
        setIsSetupRequired(true);
      }
    } else {
      setIsSetupRequired(true);
    }
    setIsLoaded(true);
  }, []);

  const saveProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);
    setIsSetupRequired(false);
    localStorage.setItem('nutrisense_profile', JSON.stringify(newProfile));
  };

  if (!isLoaded) return null; // Prevent hydration mismatch

  return (
    <ProfileContext.Provider value={{ profile, isSetupRequired, saveProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}
