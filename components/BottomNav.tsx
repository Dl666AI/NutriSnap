import React from 'react';
import { Screen } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface BottomNavProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
  onCameraClick: () => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentScreen, onNavigate, onCameraClick }) => {
  const { t } = useLanguage();

  const getIconClass = (screen: Screen) => {
    return currentScreen === screen 
      ? "text-primary dark:text-primary filled" 
      : "text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200";
  };

  const getLabelClass = (screen: Screen) => {
      return currentScreen === screen ? "text-primary" : "";
  }

  return (
    <div className="fixed bottom-0 left-0 w-full z-50">
      {/* FAB Container */}
      <div className="absolute bottom-[60px] left-1/2 -translate-x-1/2 flex justify-center z-50">
        <button 
          onClick={onCameraClick}
          className="group relative flex items-center justify-center size-16 rounded-full bg-primary shadow-float transition-transform active:scale-95"
        >
          <span className="material-symbols-outlined text-white text-3xl group-hover:rotate-12 transition-transform">photo_camera</span>
          <div className="absolute -inset-1 border border-primary/30 rounded-full animate-pulse"></div>
        </button>
      </div>

      {/* Bottom Navigation Bar */}
      <nav className="bg-white/90 dark:bg-background-dark/95 backdrop-blur-md border-t border-neutral-100 dark:border-neutral-800 pb-[env(safe-area-inset-bottom,20px)] pt-2 px-6 h-[80px]">
        <div className="flex items-center justify-between h-full max-w-3xl mx-auto">
          {/* Left Icons */}
          <div className="flex items-center gap-8 pl-2">
            <button 
              onClick={() => onNavigate('HOME')}
              className={`flex flex-col items-center gap-1 ${getIconClass('HOME')}`}
            >
              <span className={`material-symbols-outlined text-[26px] ${currentScreen === 'HOME' ? 'filled' : ''}`}>home</span>
              <span className={`text-[10px] font-medium ${getLabelClass('HOME')}`}>{t('nav_home')}</span>
            </button>
            <button 
              onClick={() => onNavigate('DIARY')}
              className={`flex flex-col items-center gap-1 ${getIconClass('DIARY')}`}
            >
              <span className={`material-symbols-outlined text-[26px] ${currentScreen === 'DIARY' ? 'filled' : ''}`}>book</span>
              <span className={`text-[10px] font-medium ${getLabelClass('DIARY')}`}>{t('nav_diary')}</span>
            </button>
          </div>

          {/* Spacer for FAB */}
          <div className="w-16"></div>

          {/* Right Icons */}
          <div className="flex items-center gap-8 pr-2">
            <button 
              onClick={() => onNavigate('INSIGHTS')}
              className={`flex flex-col items-center gap-1 ${getIconClass('INSIGHTS')}`}
            >
              <span className={`material-symbols-outlined text-[26px] ${currentScreen === 'INSIGHTS' ? 'filled' : ''}`}>bar_chart</span>
              <span className={`text-[10px] font-medium ${getLabelClass('INSIGHTS')}`}>{t('nav_insights')}</span>
            </button>
            <button 
               onClick={() => onNavigate('PROFILE')}
               className={`flex flex-col items-center gap-1 ${getIconClass('PROFILE')}`}
            >
              <span className={`material-symbols-outlined text-[26px] ${currentScreen === 'PROFILE' ? 'filled' : ''}`}>person</span>
              <span className={`text-[10px] font-medium ${getLabelClass('PROFILE')}`}>{t('nav_profile')}</span>
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default BottomNav;