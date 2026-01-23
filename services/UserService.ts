
import { User } from '../types';

// Helper to ensure numeric fields are numbers (DB returns strings for numerics)
// Also handles potential case sensitivity issues or missing aliases
// CRITICAL FIX: Also treats empty strings as undefined (DB may have "" instead of NULL)
const parseUserResponse = (data: any): User => {
  // Helper to get value from either camelCase or snake_case key
  const getVal = (key: string, altKey: string) => {
    return data[key] !== undefined ? data[key] : data[altKey];
  };

  // Parse numeric values - treat empty strings as undefined
  const parseNum = (val: any): number | undefined => {
    if (val === null || val === undefined || val === '') return undefined;
    // Extra safety: if it's a string that's just whitespace, treat as undefined
    if (typeof val === 'string' && val.trim() === '') return undefined;
    const num = Number(val);
    return isNaN(num) || num <= 0 ? undefined : num;
  };

  // Parse string values - treat empty strings as undefined
  const parseStr = (val: any): string | undefined => {
    if (val === null || val === undefined) return undefined;
    if (typeof val === 'string' && val.trim() === '') return undefined;
    return val;
  };

  const parsed: User = {
    id: data.id,
    name: data.name || 'User',
    email: data.email || '',
    // Explicitly map potentially ambiguous fields with empty string handling
    photoUrl: parseStr(getVal('photoUrl', 'photo_url')),
    dateOfBirth: parseStr(getVal('dateOfBirth', 'date_of_birth')),
    gender: parseStr(getVal('gender', 'gender')) as 'male' | 'female' | undefined,
    goal: parseStr(getVal('goal', 'goal')) as User['goal'],
    weight: parseNum(getVal('weight', 'weight')),
    height: parseNum(getVal('height', 'height')),
    dailyCalories: parseNum(getVal('dailyCalories', 'daily_calories')),
    dailyProtein: parseNum(getVal('dailyProtein', 'daily_protein')),
    dailyCarbs: parseNum(getVal('dailyCarbs', 'daily_carbs')),
    dailySugar: parseNum(getVal('dailySugar', 'daily_sugar')),
  };

  console.log('[UserService] parseUserResponse - Input:', JSON.stringify(data, null, 2));
  console.log('[UserService] parseUserResponse - Output:', JSON.stringify(parsed, null, 2));

  return parsed;
};

export const UserService = {
  /**
   * Fetches the user's profile from the backend database.
   * Returns null if user not found or server is unreachable.
   */
  async getUser(userId: string): Promise<User | null> {
    try {
      console.log(`[UserService] Fetching user: ${userId}`);
      const url = `/api/users/${userId}`;
      console.log(`[UserService] GET request to: ${url}`);
      const response = await fetch(url);

      // CRITICAL CHECK: Did we get HTML back? (Common deployment issue)
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("text/html")) {
        console.error('[UserService] CRITICAL ERROR: Received HTML instead of JSON. Request likely routed to frontend index.html.');
        console.error('[UserService] This often means the API endpoint is 404ing at the proxy level.');
        return null; // Return null to prevent crashing the app with syntax error
      }

      if (response.status === 404) {
        console.log('[UserService] User not found (404)');
        return null; // User not found in DB
      }

      if (!response.ok) {
        console.warn('Failed to fetch user from server:', response.status, await response.text());
        return null;
      }

      const data = await response.json();
      console.log('[UserService] Raw DB Data:', JSON.stringify(data, null, 2));

      const parsed = parseUserResponse(data);
      console.log('[UserService] Parsed Data:', JSON.stringify(parsed, null, 2));
      return parsed;
    } catch (e) {
      console.error('[UserService] User fetch EXCEPTION:', e);
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
      console.log('[UserService] Syncing user (PAYLOAD):', JSON.stringify(user, null, 2));
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      });

      console.log(`[UserService] Sync response status: ${response.status}`);

      if (!response.ok) {
        console.warn('Failed to sync user with server:', response.status, await response.text());
        return user; // Return local version on fail
      }

      const data = await response.json();
      console.log('[UserService] Sync SUCCESS - Raw Response:', JSON.stringify(data, null, 2));
      return parseUserResponse(data);
    } catch (e) {
      console.error('[UserService] Sync EXCEPTION:', e);
      return user;
    }
  }
};
