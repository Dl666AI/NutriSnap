
import { Meal } from '../types';

const STORAGE_KEY_PREFIX = 'nutrisnap_meals_';

/**
 * Helper to get meals from LocalStorage
 */
const getLocalMeals = (userId: string): Meal[] => {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + userId);
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    console.warn("Failed to read from local storage", e);
    return [];
  }
};

/**
 * Helper to save meals to LocalStorage
 */
const saveLocalMeals = (userId: string, meals: Meal[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + userId, JSON.stringify(meals));
  } catch (e) {
    console.warn("Failed to save to local storage (likely quota exceeded)", e);
  }
};

/**
 * MealService
 * 
 * Implementation: Hybrid (API with LocalStorage Fallback)
 * This ensures the app works even if the DB connection fails.
 */
export const MealService = {
  
  async getAll(userId: string | null): Promise<Meal[]> {
    if (!userId) return [];
    
    try {
      const response = await fetch(`/api/meals?userId=${encodeURIComponent(userId)}`);
      if (!response.ok) throw new Error(`Server returned ${response.status}`);
      const data = await response.json();
      
      // Update local cache on successful fetch
      saveLocalMeals(userId, data);
      return data;
    } catch (e) {
      console.warn("Meal fetch error (falling back to local storage):", e);
      return getLocalMeals(userId);
    }
  },

  async add(userId: string | null, meal: Meal): Promise<Meal> {
    if (!userId) return meal;

    // 1. Optimistic Local Save
    const current = getLocalMeals(userId);
    const updated = [meal, ...current];
    saveLocalMeals(userId, updated);

    // 2. Try Remote Save
    try {
      const response = await fetch('/api/meals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, meal })
      });
      
      if (!response.ok) throw new Error('Failed to save meal remotely');
      return await response.json();
    } catch (e) {
      console.warn("Backend save failed, data saved locally only.", e);
      // Return the original meal so the UI doesn't break
      return meal;
    }
  },

  async update(userId: string | null, meal: Meal): Promise<Meal> {
    if (!userId) return meal;

    // 1. Optimistic Local Update
    const current = getLocalMeals(userId);
    const updated = current.map(m => m.id === meal.id ? meal : m);
    saveLocalMeals(userId, updated);

    // 2. Try Remote Update
    try {
      await fetch(`/api/meals/${meal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, meal })
      });
    } catch (e) {
      console.warn("Backend update failed, data saved locally only.", e);
    }
    
    return meal;
  },

  async delete(userId: string | null, id: string): Promise<void> {
    if (!userId) return;

    // 1. Optimistic Local Delete
    const current = getLocalMeals(userId);
    const updated = current.filter(m => m.id !== id);
    saveLocalMeals(userId, updated);

    // 2. Try Remote Delete
    try {
      await fetch(`/api/meals/${id}?userId=${encodeURIComponent(userId)}`, {
        method: 'DELETE'
      });
    } catch (e) {
      console.warn("Backend delete failed, data deleted locally only.", e);
    }
  }
};
