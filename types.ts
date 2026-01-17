export type Screen = 'SPLASH' | 'HOME' | 'CAMERA' | 'RESULT' | 'PROFILE' | 'DIARY' | 'INSIGHTS';
export type Theme = 'light' | 'dark' | 'system';

export interface Meal {
  id: string;
  name: string;
  time: string;
  calories: number;
  imageUrl: string;
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
