import React, { useState, useEffect } from 'react';
import { Screen, User, Meal } from './types';
import { ThemeProvider } from './contexts/ThemeContext';
import { DataProvider, useData } from './contexts/DataContext';
import SplashScreen from './components/SplashScreen';
import HomeScreen from './components/HomeScreen';
import CameraScreen from './components/CameraScreen';
import ResultScreen from './components/ResultScreen';
import ProfileScreen from './components/ProfileScreen';
import DiaryScreen from './components/DiaryScreen';
import InsightsScreen from './components/InsightsScreen';
import ManualEntryScreen from './components/ManualEntryScreen';
import AddMenu from './components/AddMenu';

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
      setShouldLaunchGallery(false);   // Always open camera directly
      
      // Ensure we can go back to where we came from
      if (['HOME', 'DIARY', 'INSIGHTS', 'PROFILE'].includes(currentScreen)) {
        setPreviousTab(currentScreen);
      }
      
      setCurrentScreen('CAMERA');
  };

  // Handler for adding from Diary (preserves selected date)
  const handleAddMealFromDiary = (date: string) => {
      setTargetDate(date);
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
                onSave={() => { setEditingMeal(null); setCurrentScreen(previousTab); }} 
                onCancel={() => { setEditingMeal(null); setCurrentScreen(previousTab); }} 
            />
        );
      case 'RESULT':
        return <ResultScreen image={capturedImage} targetDate={targetDate} onSave={() => setCurrentScreen(previousTab)} onRetake={() => setCurrentScreen('CAMERA')} />;
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

  const handleLogin = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem('nutrisnap_user', JSON.stringify(newUser));
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('nutrisnap_user', JSON.stringify(updatedUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('nutrisnap_user');
  };

  return (
    <ThemeProvider>
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
    </ThemeProvider>
  );
};

export default App;