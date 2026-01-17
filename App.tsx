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

const AppContent: React.FC = () => {
  const { getTodayString } = useData();
  const [currentScreen, setCurrentScreen] = useState<Screen>('SPLASH');
  const [previousTab, setPreviousTab] = useState<Screen>('HOME');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  
  // Track which date we are adding a meal for
  const [targetDate, setTargetDate] = useState<string>(getTodayString());
  
  // Persistent User State
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nutrisnap_user');
      return saved ? JSON.parse(saved) : null;
    }
    return null;
  });

  // Simplified Login Handler (Simulates Google Auth)
  const handleLogin = (email: string) => {
    // Extract name from email (e.g. "john.doe@gmail.com" -> "John Doe")
    const namePart = email.split('@')[0];
    const formattedName = namePart
      .split(/[._]/)
      .map(s => s.charAt(0).toUpperCase() + s.slice(1))
      .join(' ');

    const newUser: User = {
      id: Date.now().toString(), // Generate a fake ID
      name: formattedName || "NutriSnap User",
      email: email,
      // Generate a nice avatar based on the name
      photoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(formattedName)}&background=9cab8c&color=fff&size=128`
    };
    
    setUser(newUser);
    localStorage.setItem('nutrisnap_user', JSON.stringify(newUser));
  };

  // Wrapper for navigation to track "tab" screens vs "flow" screens
  const navigateTo = (screen: Screen) => {
    // If standard navigation to camera (e.g. from Home FAB), default to Today
    if (screen === 'CAMERA') {
        setTargetDate(getTodayString());
    }

    // If navigating to a main tab, remember it
    if (['HOME', 'DIARY', 'INSIGHTS', 'PROFILE'].includes(screen)) {
      setPreviousTab(screen);
    }
    setCurrentScreen(screen);
  };

  // Specific handler for adding from Diary (preserves selected date)
  const handleAddMealFromDiary = (date: string) => {
      setTargetDate(date);
      setCurrentScreen('CAMERA');
      setPreviousTab('DIARY');
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

  const logoutUser = () => {
    setUser(null);
    localStorage.removeItem('nutrisnap_user');
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'SPLASH':
        return <SplashScreen onComplete={() => navigateTo('HOME')} />;
      case 'HOME':
        return <HomeScreen onNavigate={navigateTo} user={user} onEdit={handleEditMeal} />;
      case 'DIARY':
        return <DiaryScreen onNavigate={navigateTo} onEdit={handleEditMeal} onAddMeal={handleAddMealFromDiary} />;
      case 'INSIGHTS':
        return <InsightsScreen onNavigate={navigateTo} />;
      case 'CAMERA':
        return <CameraScreen onCapture={handleCapture} onCancel={() => setCurrentScreen(previousTab)} onManualEntry={() => { setEditingMeal(null); setCurrentScreen('MANUAL_ENTRY'); }} />;
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
            onLogout={logoutUser}
            onLogin={handleLogin}
          />
        );
      default:
        return <HomeScreen onNavigate={navigateTo} user={user} onEdit={handleEditMeal} />;
    }
  };

  return (
    <div className="font-display">
      {renderScreen()}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </ThemeProvider>
  );
};

export default App;