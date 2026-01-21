
import { User } from '../types';

export const UserService = {
  /**
   * Fetches the user's profile from the backend database.
   * Returns null if user not found or server is unreachable.
   */
  async getUser(userId: string): Promise<User | null> {
    try {
      const response = await fetch(`/api/users/${userId}`);

      if (response.status === 404) {
        return null; // User not found in DB
      }

      if (!response.ok) {
        console.warn('Failed to fetch user from server:', await response.text());
        return null;
      }

      return await response.json();
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
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      });

      if (!response.ok) {
        console.warn('Failed to sync user with server:', await response.text());
        return user; // Return local version on fail
      }

      return await response.json();
    } catch (e) {
      console.warn('User sync error (running offline):', e);
      return user;
    }
  }
};
