
import React, { useState, useEffect } from 'react';
import { Screen, User, Meal } from './types';
import { ThemeProvider } from './contexts/ThemeContext';
import { DataProvider, useData } from './contexts/DataContext';
import { LanguageProvider } from './contexts/LanguageContext';
import SplashScreen from './components/SplashScreen';
import HomeScreen from './components/HomeScreen';
import CameraScreen from './components/CameraScreen';
import ResultScreen from './components/ResultScreen';
import ProfileScreen from './components/ProfileScreen';
import DiaryScreen from './components/DiaryScreen';
import InsightsScreen from './components/InsightsScreen';
import ManualEntryScreen from './components/ManualEntryScreen';
import AddMenu from './components/AddMenu';
import { UserService } from './services/UserService';

// Props for the internal app content (now that User state is lifted)
interface AppContentProps {
  user: User | null;
  onLogin: (user: User) => void;
  onLogout: () => void;
  onUpdateUser: (updatedUser: User) => void;
}

const AppContent: React.FC<AppContentProps> = ({ user, onLogin, onLogout, onUpdateUser }) => {
  const { getTodayString } = useData();
  const [currentScreen, setCurrentScreen] = useState<Screen>('SPLASH');
  const [previousTab, setPreviousTab] = useState<Screen>('HOME');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);

  // Track which date we are adding a meal for
  const [targetDate, setTargetDate] = useState<string>(getTodayString());
  // Track specific meal type if adding from Diary (e.g. Lunch)
  const [targetMealType, setTargetMealType] = useState<Meal['type'] | undefined>(undefined);

  // UI State for Add Menu
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [shouldLaunchGallery, setShouldLaunchGallery] = useState(false);

  // Wrapper for navigation to track "tab" screens vs "flow" screens
  const navigateTo = (screen: Screen) => {
    // If requesting ADD_MENU, don't change screen, just open overlay
    if (screen === 'ADD_MENU') {
      setIsAddMenuOpen(true);
      // Default target date to today if opened from general nav
      if (currentScreen !== 'DIARY') {
        setTargetDate(getTodayString());
        setTargetMealType(undefined);
      }
      return;
    }

    // If navigating to a main tab, remember it
    if (['HOME', 'DIARY', 'INSIGHTS', 'PROFILE'].includes(screen)) {
      setPreviousTab(screen);
    }
    setCurrentScreen(screen);
  };

  // Shortcut handler for the FAB (Center Camera Button)
  const handleFabClick = () => {
    setEditingMeal(null);
    setTargetDate(getTodayString()); // Always target today
    setTargetMealType(undefined);    // No specific section implied
    setShouldLaunchGallery(false);   // Always open camera directly

    // Ensure we can go back to where we came from
    if (['HOME', 'DIARY', 'INSIGHTS', 'PROFILE'].includes(currentScreen)) {
      setPreviousTab(currentScreen);
    }

    setCurrentScreen('CAMERA');
  };

  // Handler for adding from Diary (preserves selected date and type)
  const handleAddMealFromDiary = (date: string, type?: Meal['type']) => {
    setTargetDate(date);
    setTargetMealType(type);
    setIsAddMenuOpen(true);
    setPreviousTab('DIARY');
  };

  const handleMenuSelect = (option: 'CAMERA' | 'GALLERY' | 'MANUAL') => {
    setIsAddMenuOpen(false);

    if (option === 'CAMERA') {
      setShouldLaunchGallery(false);
      setCurrentScreen('CAMERA');
    } else if (option === 'GALLERY') {
      setShouldLaunchGallery(true);
      setCurrentScreen('CAMERA');
    } else if (option === 'MANUAL') {
      setEditingMeal(null);
      setCurrentScreen('MANUAL_ENTRY');
    }
  };

  const handleCapture = (imageSrc?: string) => {
    if (imageSrc) {
      setCapturedImage(imageSrc);
    }
    setCurrentScreen('RESULT');
  };

  const handleEditMeal = (meal: Meal) => {
    setEditingMeal(meal);
    setCurrentScreen('MANUAL_ENTRY');
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'SPLASH':
        return <SplashScreen onComplete={() => navigateTo('HOME')} />;
      case 'HOME':
        return (
          <HomeScreen
            onNavigate={navigateTo}
            user={user}
            onEdit={handleEditMeal}
            onFabClick={handleFabClick}
          />
        );
      case 'DIARY':
        return (
          <DiaryScreen
            onNavigate={navigateTo}
            onEdit={handleEditMeal}
            onAddMeal={handleAddMealFromDiary}
            onFabClick={handleFabClick}
          />
        );
      case 'INSIGHTS':
        return (
          <InsightsScreen
            onNavigate={navigateTo}
            user={user}
            onFabClick={handleFabClick}
          />
        );
      case 'CAMERA':
        return (
          <CameraScreen
            onCapture={handleCapture}
            onCancel={() => setCurrentScreen(previousTab)}
            onManualEntry={() => { setEditingMeal(null); setCurrentScreen('MANUAL_ENTRY'); }}
            autoLaunchGallery={shouldLaunchGallery}
          />
        );
      case 'MANUAL_ENTRY':
        return (
          <ManualEntryScreen
            mealToEdit={editingMeal}
            targetDate={targetDate}
            initialType={targetMealType}
            onSave={() => { setEditingMeal(null); setCurrentScreen(previousTab); }}
            onCancel={() => { setEditingMeal(null); setCurrentScreen(previousTab); }}
          />
        );
      case 'RESULT':
        return (
          <ResultScreen
            image={capturedImage}
            targetDate={targetDate}
            initialType={targetMealType}
            onSave={() => setCurrentScreen(previousTab)}
            onRetake={() => setCurrentScreen('CAMERA')}
            onManualEntry={() => { setEditingMeal(null); setCurrentScreen('MANUAL_ENTRY'); }}
          />
        );
      case 'PROFILE':
        return (
          <ProfileScreen
            onNavigate={navigateTo}
            user={user}
            onLogout={onLogout}
            onLogin={onLogin}
            onUpdateUser={onUpdateUser}
            onFabClick={handleFabClick}
          />
        );
      default:
        return (
          <HomeScreen
            onNavigate={navigateTo}
            user={user}
            onEdit={handleEditMeal}
            onFabClick={handleFabClick}
          />
        );
    }
  };

  return (
    <div className="font-display">
      {renderScreen()}
      {isAddMenuOpen && (
        <AddMenu
          onClose={() => setIsAddMenuOpen(false)}
          onSelectOption={handleMenuSelect}
        />
      )}
    </div>
  );
};

const App: React.FC = () => {
  // Lifted User State
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nutrisnap_user');
      return saved ? JSON.parse(saved) : null;
    }
    return null;
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // CRITICAL FIX: Refresh user data from DB on app load
  // Problem: localStorage may have stale data (missing profile stats)
  // Solution: Fetch fresh data from DB and update localStorage on mount
  // ═══════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    const refreshUserFromDB = async () => {
      // Only refresh if we have a user ID from localStorage
      if (!user?.id) return;

      console.log('[App] STARTUP: Refreshing user data from DB for:', user.id);

      try {
        const dbUser = await UserService.getUser(user.id);

        if (dbUser) {
          console.log('[App] STARTUP: Got fresh user from DB:', JSON.stringify(dbUser, null, 2));

          // Merge: Keep localStorage values only if DB values are missing
          // This ensures DB is the source of truth
          const refreshedUser: User = {
            ...user,  // Start with localStorage data
            ...dbUser, // Override with DB data (DB is source of truth)
          };

          // Only update if there's a meaningful difference
          const dbHasMoreData =
            (dbUser.weight && !user.weight) ||
            (dbUser.height && !user.height) ||
            (dbUser.dailyCalories && !user.dailyCalories) ||
            (dbUser.goal && !user.goal);

          if (dbHasMoreData) {
            console.log('[App] STARTUP: DB has more data, updating local state');
            setUser(refreshedUser);
            localStorage.setItem('nutrisnap_user', JSON.stringify(refreshedUser));
          } else {
            console.log('[App] STARTUP: localStorage already up-to-date');
          }
        } else {
          console.log('[App] STARTUP: User not found in DB (new user)');
        }
      } catch (error) {
        console.error('[App] STARTUP ERROR: Failed to refresh user from DB:', error);
        // Don't crash - keep using localStorage data
      }
    };

    console.log('[App] MOUNTED. Triggering user refresh...');
    refreshUserFromDB();
  }, []); // Run once on mount

  const handleLogin = async (newUser: User) => {
    console.log('=== [App] LOGIN STARTED ===');
    console.log('[App] 1. New User from Login:', JSON.stringify(newUser, null, 2));

    // Try to fetch existing user data from database
    console.log('[App] 2. Fetching existing user from DB...');
    const existingUser = await UserService.getUser(newUser.id);
    console.log('[App] 3. Existing User from DB:', existingUser ? JSON.stringify(existingUser, null, 2) : 'NULL (user not found)');

    // Merge: DB data is the source of truth for stats; Google provides fresh profile info
    // CRITICAL: Only override with newUser properties that are DEFINED
    // Otherwise `{ ...existingUser, ...newUser }` would overwrite saved stats with `undefined`
    let mergedUser: User;
    if (existingUser) {
      // Start with DB data
      mergedUser = { ...existingUser };
      // Only override with defined values from Google login (name, email, photo)
      if (newUser.name !== undefined) mergedUser.name = newUser.name;
      if (newUser.email !== undefined) mergedUser.email = newUser.email;
      if (newUser.photoUrl !== undefined) mergedUser.photoUrl = newUser.photoUrl;
      // Keep all other stats from existingUser (weight, height, etc.)
    } else {
      // New user - use Google data as-is
      mergedUser = newUser;
    }

    console.log('[App] 4. Merged User (before sync):', JSON.stringify(mergedUser, null, 2));
    setUser(mergedUser);
    localStorage.setItem('nutrisnap_user', JSON.stringify(mergedUser));
    console.log('[App] 5. Set user state and localStorage with merged user');

    // Sync to DB (will create if new, update if existing)
    // CRITICAL FIX: Use the response from syncUser as the source of truth.
    // This ensures that if the initial getUser failed (e.g. cold start), we still get the data back from the UPSERT.
    console.log('[App] 6. Syncing to DB...');
    const syncedUser = await UserService.syncUser(mergedUser);

    console.log('[App] 7. Synced User from DB:', JSON.stringify(syncedUser, null, 2));
    setUser(syncedUser);
    localStorage.setItem('nutrisnap_user', JSON.stringify(syncedUser));
    console.log('[App] 8. FINAL: Set user state and localStorage with synced user');
    console.log('=== [App] LOGIN COMPLETE ===');
  };

  const handleUpdateUser = async (updatedUser: User) => {
    console.log('=== [App] UPDATE USER STARTED ===');
    console.log('[App] Updated User (before sync):', JSON.stringify(updatedUser, null, 2));

    // Sync to DB
    const syncedUser = await UserService.syncUser(updatedUser);
    console.log('[App] Synced User from DB:', JSON.stringify(syncedUser, null, 2));

    setUser(syncedUser);
    localStorage.setItem('nutrisnap_user', JSON.stringify(syncedUser));
    console.log('[App] UPDATE USER COMPLETE');
    console.log('===========================');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('nutrisnap_user');
  };

  return (
    <ThemeProvider>
      <LanguageProvider>
        {/* 
          Key Principle for Data Isolation:
          By passing `key={user?.id || 'guest'}` to the DataProvider, we force React 
          to completely destroy and recreate the provider when the user changes.
          This ensures:
          1. No stale state from the previous user leaks into the new session.
          2. The initialization logic in DataProvider runs fresh for the new user ID.
        */}
        <DataProvider
          userId={user?.id || null}
          targetCalories={user?.dailyCalories}
          customTargets={{
            protein: user?.dailyProtein,
            sugar: user?.dailySugar
          }}
          key={user?.id || 'guest'}
        >
          <AppContent
            user={user}
            onLogin={handleLogin}
            onLogout={handleLogout}
            onUpdateUser={handleUpdateUser}
          />
        </DataProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default App;
