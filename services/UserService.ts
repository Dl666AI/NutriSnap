
import { User } from '../types';

// Helper to ensure numeric fields are numbers (DB returns strings for numerics)
// Also handles potential case sensitivity issues or missing aliases
const parseUserResponse = (data: any): User => {
  // Helper to get value from either camelCase or snake_case key
  const getVal = (key: string, altKey: string) => {
    return data[key] !== undefined ? data[key] : data[altKey];
  };

  const parseNum = (val: any) => {
    if (val === null || val === undefined || val === '') return undefined;
    const num = Number(val);
    return isNaN(num) ? undefined : num;
  };

  return {
    ...data,
    // Explicitly map potentially ambiguous fields
    weight: parseNum(getVal('weight', 'weight')),
    height: parseNum(getVal('height', 'height')),
    dailyCalories: parseNum(getVal('dailyCalories', 'daily_calories')),
    dailyProtein: parseNum(getVal('dailyProtein', 'daily_protein')),
    dailyCarbs: parseNum(getVal('dailyCarbs', 'daily_carbs')),
    dailySugar: parseNum(getVal('dailySugar', 'daily_sugar')),
  };
};

export const UserService = {
  /**
   * Fetches the user's profile from the backend database.
   * Returns null if user not found or server is unreachable.
   */
  async getUser(userId: string): Promise<User | null> {
    try {
      console.log(`[UserService] Fetching user: ${userId}`);
      const response = await fetch(`/api/users/${userId}`);

      if (response.status === 404) {
        console.log('[UserService] User not found (404)');
        return null; // User not found in DB
      }

      if (!response.ok) {
        console.warn('Failed to fetch user from server:', await response.text());
        return null;
      }

      const data = await response.json();
      console.log('[UserService] Raw DB Data:', data);

      const parsed = parseUserResponse(data);
      console.log('[UserService] Parsed Data:', parsed);
      return parsed;
    } catch (e) {
      console.warn('User fetch error (running offline):', e);
      return null;
    }
  },

  /**
   * Syncs the user's profile with the backend database.
   * Uses "UPSERT" logic on the server.
   * Fails gracefully if server is unreachable.
   */
  async syncUser(user: User): Promise<User> {
    try {
      // console.log('[UserService] Syncing user:', user);
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      });

      if (!response.ok) {
        console.warn('Failed to sync user with server:', await response.text());
        return user; // Return local version on fail
      }

      const data = await response.json();
      return parseUserResponse(data);
    } catch (e) {
      console.warn('User sync error (running offline):', e);
      return user;
    }
  }
};
