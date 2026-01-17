import React, { useState } from 'react';
import { Screen } from './types';
import { ThemeProvider } from './contexts/ThemeContext';
import SplashScreen from './components/SplashScreen';
import HomeScreen from './components/HomeScreen';
import CameraScreen from './components/CameraScreen';
import ResultScreen from './components/ResultScreen';
import ProfileScreen from './components/ProfileScreen';
import DiaryScreen from './components/DiaryScreen';
import InsightsScreen from './components/InsightsScreen';

const AppContent: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('SPLASH');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const handleCapture = (imageSrc?: string) => {
    if (imageSrc) {
      setCapturedImage(imageSrc);
    }
    setCurrentScreen('RESULT');
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'SPLASH':
        return <SplashScreen onComplete={() => setCurrentScreen('HOME')} />;
      case 'HOME':
        return <HomeScreen onNavigate={setCurrentScreen} />;
      case 'DIARY':
        return <DiaryScreen onNavigate={setCurrentScreen} />;
      case 'INSIGHTS':
        return <InsightsScreen onNavigate={setCurrentScreen} />;
      case 'CAMERA':
        return <CameraScreen onCapture={handleCapture} onCancel={() => setCurrentScreen('HOME')} />;
      case 'RESULT':
        return <ResultScreen image={capturedImage} onSave={() => setCurrentScreen('HOME')} onRetake={() => setCurrentScreen('CAMERA')} />;
      case 'PROFILE':
        return <ProfileScreen onNavigate={setCurrentScreen} />;
      default:
        return <HomeScreen onNavigate={setCurrentScreen} />;
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
      <AppContent />
    </ThemeProvider>
  );
};

export default App;