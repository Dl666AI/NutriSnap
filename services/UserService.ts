
import { User } from '../types';

export const UserService = {
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
