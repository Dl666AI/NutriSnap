import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { Meal } from '../types';
import { MealService } from '../services/MealService';

interface DailyTotals {
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  sugar: number;
}

interface DataContextType {
  meals: Meal[];
  isLoading: boolean;
  addMeal: (meal: Meal) => Promise<void>;
  updateMeal: (meal: Meal) => Promise<void>;
  removeMeal: (id: string) => Promise<void>;
  totals: DailyTotals;
  targets: DailyTotals;
  getTodayString: () => string;
}

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

interface DataProviderProps {
  children: React.ReactNode;
  userId: string | null;
  targetCalories?: number;
  customTargets?: {
    protein?: number;
    carbs?: number;
    sugar?: number;
  };
}

export const DataProvider: React.FC<DataProviderProps> = ({ children, userId, targetCalories, customTargets }) => {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initial Load from Service
  useEffect(() => {
    let active = true;
    const loadData = async () => {
      setIsLoading(true);
      try {
        const data = await MealService.getAll(userId);
        if (active) setMeals(data);
      } catch (e) {
        console.error("Failed to load meals", e);
      } finally {
        if (active) setIsLoading(false);
      }
    };
    
    loadData();
    return () => { active = false; };
  }, [userId]);

  const addMeal = async (meal: Meal) => {
    // Optimistic Update (update UI immediately)
    setMeals(prev => [meal, ...prev]);
    
    try {
      // Sync with "Backend"
      await MealService.add(userId, meal);
    } catch (e) {
      console.error("Failed to save meal", e);
      // Rollback on error
      setMeals(prev => prev.filter(m => m.id !== meal.id));
    }
  };

  const updateMeal = async (updatedMeal: Meal) => {
    // Optimistic Update
    setMeals(prev => prev.map(meal => (meal.id === updatedMeal.id ? updatedMeal : meal)));
    
    try {
      await MealService.update(userId, updatedMeal);
    } catch (e) {
      console.error("Failed to update meal", e);
      // Revert needs a reload or more complex rollback logic, usually fine to just warn user
    }
  };

  const removeMeal = async (id: string) => {
    const backup = meals;
    // Optimistic Update
    setMeals(prev => prev.filter(m => m.id !== id));
    
    try {
      await MealService.delete(userId, id);
    } catch (e) {
      console.error("Failed to delete meal", e);
      // Rollback
      setMeals(backup);
    }
  };

  // Calculate Dynamic Targets
  const targets = useMemo(() => {
    const cals = targetCalories || DEFAULT_CALORIES;
    return {
      calories: cals,
      protein: customTargets?.protein || Math.round((cals * 0.30) / 4),
      carbs: customTargets?.carbs || Math.round((cals * 0.45) / 4),
      fat: Math.round((cals * 0.25) / 9),
      sugar: customTargets?.sugar || 50,
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
      isLoading, 
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