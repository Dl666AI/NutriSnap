import React, { createContext, useContext, useEffect, useState } from 'react';
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

const DEFAULT_TARGETS = {
  calories: 2000,
  carbs: 250,
  protein: 140,
  fat: 70,
  sugar: 50,
};

// Helper to get local YYYY-MM-DD
const getTodayString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Initial demo data
const DEMO_MEALS: Meal[] = [
  {
    id: '1',
    name: 'Avocado Toast',
    time: '8:30 AM',
    date: getTodayString(),
    calories: 350,
    protein: 8,
    sugar: 4,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCL-m-VY6XKvcYscM3D_-IXKQGx2jx8em2yXnwD33SSpy05NZQcl82Oy6_AHB54sXd8n9-PKhSyLxcJ_waWBjgaE-3y_l9z5w6eWrRLCZM47Zesrhspi0Gmf0uhQ1PzWEmGvbuKKRsPidzh69W1uyMJk28tI_FMdNV2-XXGgafoSKDkXOYvXTQKhqSr9Ay98r-KpqYVsAK6xN1AKmH1KBjXtX7yfuTAE9XkvppdBChoh4C9E4tEj_NrLjqyJaGvKqpamEyArLm80FPX',
    type: 'Breakfast'
  },
  {
    id: '2',
    name: 'Chicken Salad',
    time: '1:15 PM',
    date: getTodayString(),
    calories: 420,
    protein: 32,
    sugar: 6,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBL6S-dLF_MhW5_YkEPdhS5HbKzncJDt85F7PuvgZKNxJDCVCghetLdo7JBkNF1hgFz3st5lyfMM9oLgsFTpB5ZRL4LAxKY4UiCPpoj0GBRaqCzH1CP6Xl-yUY5kwHetiNYyypDNZasmp_tSObUzi5rFJl2DQy87KJT8GxikqOCOZuyVQ93mPx0L9b5caml2eaIBvSszvKaau2VhhCpHtTO_XOEHniOrB_PHIdjL7OrhwpS0VCNqfbQxorMQtheh5mOWBe6NpRfHLVI',
    type: 'Lunch'
  }
];

export const DataProvider: React.FC<{ children: React.ReactNode; userId: string | null }> = ({ children, userId }) => {
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
      targets: DEFAULT_TARGETS,
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