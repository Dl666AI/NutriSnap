import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { Meal, Macro } from '../types';

interface DailyTotals {
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  sugar: number;
}

interface DataContextType {
  meals: Meal[];
  addMeal: (meal: Meal) => void;
  updateMeal: (meal: Meal) => void;
  removeMeal: (id: string) => void;
  totals: DailyTotals;
  targets: DailyTotals;
  getTodayString: () => string;
}

// --- Future Proofing: Storage Adapter ---
// To switch to a backend later, replace the implementation of 'load' and 'save' 
// with your API calls (e.g., fetch, axios, firebase).
const StorageAdapter = {
  getKey: (userId: string | null) => {
    return userId ? `nutrisnap_meals_${userId}` : 'nutrisnap_meals_guest';
  },

  load: (userId: string | null): Meal[] => {
    if (typeof window === 'undefined') return [];
    const key = StorageAdapter.getKey(userId);
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : DEMO_MEALS;
  },

  save: (userId: string | null, meals: Meal[]) => {
    if (typeof window === 'undefined') return;
    const key = StorageAdapter.getKey(userId);
    localStorage.setItem(key, JSON.stringify(meals));
  }
};

const DataContext = createContext<DataContextType | undefined>(undefined);

// Default Fallback
const DEFAULT_CALORIES = 2000;

// Helper to get local YYYY-MM-DD
const getTodayString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Initial demo data
const DEMO_MEALS: Meal[] = [];

interface DataProviderProps {
  children: React.ReactNode;
  userId: string | null;
  targetCalories?: number;
  customTargets?: {
    protein?: number;
    sugar?: number;
  };
}

export const DataProvider: React.FC<DataProviderProps> = ({ children, userId, targetCalories, customTargets }) => {
  // Initialize state by loading from storage based on userId
  const [meals, setMeals] = useState<Meal[]>(() => StorageAdapter.load(userId));

  // Whenever meals change, persist them using the adapter
  useEffect(() => {
    StorageAdapter.save(userId, meals);
  }, [meals, userId]);

  const addMeal = (meal: Meal) => {
    setMeals(prev => [meal, ...prev]);
  };

  const updateMeal = (updatedMeal: Meal) => {
    setMeals(prev => prev.map(meal => (meal.id === updatedMeal.id ? updatedMeal : meal)));
  };

  const removeMeal = (id: string) => {
    setMeals(prev => prev.filter(m => m.id !== id));
  };

  // Calculate Dynamic Targets based on calorie input
  const targets = useMemo(() => {
    const cals = targetCalories || DEFAULT_CALORIES;
    return {
      calories: cals,
      // Use custom targets if provided, otherwise fallback to standard splits
      // Standard Macro Split: 30% Protein, 45% Carbs, 25% Fat
      protein: customTargets?.protein || Math.round((cals * 0.30) / 4),
      carbs: Math.round((cals * 0.45) / 4),
      fat: Math.round((cals * 0.25) / 9),
      sugar: customTargets?.sugar || 50, // Standard constant recommended limit
    };
  }, [targetCalories, customTargets]);

  // Calculate totals ONLY for today
  const todayStr = getTodayString();
  const totals = meals
    .filter(meal => meal.date === todayStr)
    .reduce((acc, meal) => {
      acc.calories += (meal.calories || 0);
      
      if (meal.protein !== undefined) {
        acc.protein += meal.protein;
      } else {
        acc.protein += Math.round(((meal.calories || 0) * 0.25) / 4);
      }

      if (meal.sugar !== undefined) {
        acc.sugar += meal.sugar;
      }

      if (meal.fat !== undefined) {
        acc.fat += meal.fat;
      } else {
        acc.fat += Math.round(((meal.calories || 0) * 0.30) / 9);
      }

      if (meal.carbs !== undefined) {
        acc.carbs += meal.carbs;
      } else {
        acc.carbs += Math.round(((meal.calories || 0) * 0.45) / 4);
      }
      
      return acc;
    }, { calories: 0, carbs: 0, protein: 0, fat: 0, sugar: 0 });

  return (
    <DataContext.Provider value={{ 
      meals, 
      addMeal,
      updateMeal,
      removeMeal, 
      totals, 
      targets,
      getTodayString
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};