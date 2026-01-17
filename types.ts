
export type Screen = 'SPLASH' | 'HOME' | 'CAMERA' | 'RESULT' | 'PROFILE' | 'DIARY' | 'INSIGHTS' | 'MANUAL_ENTRY';
export type Theme = 'light' | 'dark' | 'system';

export interface User {
  id: string;
  name: string;
  email: string;
  photoUrl: string;
}

export interface Meal {
  id: string;
  name: string;
  time: string;
  date: string; // YYYY-MM-DD
  calories: number;
  protein?: number;
  sugar?: number;
  fat?: number;
  carbs?: number;
  imageUrl?: string;
  type: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
}

export interface Macro {
  name: string;
  current: number; // amount left or consumed depending on context
  total: number;
  unit: string;
  color: string;
  icon: string;
}

declare global {
  interface Window {
    google: any;
  }
}