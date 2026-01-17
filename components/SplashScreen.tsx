import React, { useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const { t } = useLanguage();

  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 3500); // 3.5 seconds splash
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="relative flex h-screen w-full flex-col items-center justify-between overflow-hidden bg-gradient-to-b from-primary via-primary to-accent-cream dark:from-background-dark dark:via-[#252b22] dark:to-primary/30 text-white shadow-2xl">
      {/* Subtle Pattern Overlay */}
      <div className="absolute inset-0 z-0 opacity-20 bg-splash-pattern mix-blend-overlay pointer-events-none"></div>
      
      {/* Ambient Light Orb */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/10 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Main Content Area */}
      <div className="relative z-10 flex flex-grow flex-col items-center justify-center w-full px-6">
        {/* Logo Container */}
        <div className="group relative mb-8 flex items-center justify-center p-8 animate-breath">
          {/* Outer glow ring */}
          <div className="absolute inset-0 rounded-[2.5rem] bg-white/10 blur-xl transition-all duration-700 group-hover:bg-white/20"></div>
          
          {/* Icon Background */}
          <div className="relative flex items-center justify-center w-36 h-36 bg-white/20 backdrop-blur-md border border-white/30 rounded-[2rem] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)]">
            <span 
              className="material-symbols-outlined text-white text-[84px] drop-shadow-sm" 
              style={{ fontVariationSettings: "'FILL' 1, 'wght' 600, 'GRAD' 0, 'opsz' 48" }}
            >
              nutrition
            </span>
          </div>
          
          {/* Decorative Leaf */}
          <div 
            className="absolute -top-2 -right-2 w-10 h-10 bg-accent-cream rounded-full flex items-center justify-center shadow-lg animate-bounce" 
            style={{ animationDuration: '3s' }}
          >
            <span className="material-symbols-outlined text-primary text-xl font-bold">eco</span>
          </div>
        </div>

        {/* Brand Typography */}
        <div className="text-center animate-enter flex flex-col items-center">
          <h1 className="text-5xl font-extrabold tracking-tight text-white drop-shadow-md mb-2">
            {t('app_name')}
          </h1>
          <p className="text-white/90 text-lg font-medium tracking-wide bg-primary-dark/10 px-4 py-1 rounded-full border border-white/10 backdrop-blur-sm">
            {t('splash_subtitle')}
          </p>
        </div>
      </div>

      {/* Footer / Loader Area */}
      <div className="relative z-10 pb-12 w-full flex flex-col items-center justify-end h-24">
        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
        <p className="mt-4 text-[10px] font-semibold tracking-widest uppercase text-white/40">
           {t('version')} 1.1
        </p>
      </div>
    </div>
  );
};

export default SplashScreen;