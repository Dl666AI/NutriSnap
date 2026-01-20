

export type Screen = 'SPLASH' | 'HOME' | 'CAMERA' | 'RESULT' | 'PROFILE' | 'DIARY' | 'INSIGHTS' | 'MANUAL_ENTRY' | 'ADD_MENU';
export type Theme = 'light' | 'dark' | 'system';
export type Goal = 'LOSS_WEIGHT' | 'GAIN_MUSCLE' | 'GAIN_WEIGHT';

export interface User {
  id: string;
  name: string;
  email: string;
  photoUrl?: string; // Optional: Matches database NULLABLE column
  // Physical Attributes
  height?: number; // cm
  weight?: number; // kg
  dateOfBirth?: string; // YYYY-MM-DD
  gender?: 'male' | 'female';
  goal?: Goal;
  
  // Nutrition Targets
  dailyCalories?: number;
  dailyProtein?: number;
  dailyCarbs?: number;
  dailySugar?: number;
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
  imageUrl?: string; // Optional: Matches database NULLABLE column
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

// Google Identity Services Types
export interface GoogleCredentialResponse {
  credential: string;
  select_by?: string;
  clientId?: string;
}

declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: { client_id: string; callback: (response: GoogleCredentialResponse) => void; auto_select?: boolean }) => void;
          renderButton: (parent: HTMLElement | null, options: { theme?: 'outline' | 'filled_blue' | 'filled_black'; size?: 'large' | 'medium' | 'small'; type?: 'standard' | 'icon'; shape?: 'rectangular' | 'pill' | 'circle' | 'square'; width?: string; logo_alignment?: 'left' | 'center' }) => void;
          prompt: () => void;
        };
      };
    };
  }
}