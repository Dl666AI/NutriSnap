import { Meal } from '../types';

// This simulates the latency of a real network request
const SIMULATED_DELAY = 100;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const getStorageKey = (userId: string | null) => {
  return userId ? `nutrisnap_meals_${userId}` : 'nutrisnap_meals_guest';
};

/**
 * MealService (Repository Pattern)
 * 
 * Currently implementation: LocalStorage
 * Future implementation: fetch('/api/meals')
 * 
 * By returning Promises, the rest of the app treats this as an async API.
 * To migrate to Postgres later, you only need to change the implementation
 * of these functions to use `fetch`.
 */
export const MealService = {
  
  async getAll(userId: string | null): Promise<Meal[]> {
    await delay(SIMULATED_DELAY); // Simulate network
    const key = getStorageKey(userId);
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : [];
  },

  async add(userId: string | null, meal: Meal): Promise<Meal> {
    await delay(SIMULATED_DELAY);
    const key = getStorageKey(userId);
    const current = await this.getAll(userId);
    
    const updated = [meal, ...current];
    localStorage.setItem(key, JSON.stringify(updated));
    return meal;
  },

  async update(userId: string | null, meal: Meal): Promise<Meal> {
    await delay(SIMULATED_DELAY);
    const key = getStorageKey(userId);
    const current = await this.getAll(userId);
    
    const updated = current.map(m => m.id === meal.id ? meal : m);
    localStorage.setItem(key, JSON.stringify(updated));
    return meal;
  },

  async delete(userId: string | null, id: string): Promise<void> {
    await delay(SIMULATED_DELAY);
    const key = getStorageKey(userId);
    const current = await this.getAll(userId);
    
    const updated = current.filter(m => m.id !== id);
    localStorage.setItem(key, JSON.stringify(updated));
  }
};