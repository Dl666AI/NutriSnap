import React, { useState, useEffect, useRef } from 'react';
import { Screen, Theme, User, GoogleCredentialResponse } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import BottomNav from './BottomNav';

// ------------------------------------------------------------------
// CONFIGURATION
// ------------------------------------------------------------------
// IMPORTANT: To make Google Login work, you must create a Project in 
// Google Cloud Console, setup OAuth Consent Screen, create a Credential 
// (Client ID), and paste it below.
// ------------------------------------------------------------------
const GOOGLE_CLIENT_ID = '19113468273-pbbkm1s0evobrt5m1phtm7n31rjfbq3e.apps.googleusercontent.com'; 
// Example: '1234567890-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com'
// ------------------------------------------------------------------

interface ProfileScreenProps {
  onNavigate: (screen: Screen) => void;
  user?: User | null;
  onLogout: () => void;
  onLogin: (user: User) => void;
  onFabClick: () => void;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ 
    onNavigate, 
    user, 
    onLogout,
    onLogin,
    onFabClick
}) => {
  const { theme, setTheme } = useTheme();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  
  // Ref for the Google button container
  const googleButtonRef = useRef<HTMLDivElement>(null);
  
  const days = Array.from({ length: 14 }, (_, i) => i + 1);

  const toggleSettings = () => setIsSettingsOpen(!isSettingsOpen);

  // Helper: Parse JWT Token safely
  const parseJwt = (token: string) => {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      console.error("Failed to parse JWT", e);
      return null;
    }
  };

  // Handle the Google Login Response
  const handleGoogleResponse = (response: GoogleCredentialResponse) => {
      if (response.credential) {
        const payload = parseJwt(response.credential);
        
        if (payload) {
          const newUser: User = {
            id: payload.sub, // 'sub' is the unique Google User ID
            name: payload.name || 'User',
            email: payload.email,
            photoUrl: payload.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(payload.name)}&background=9cab8c&color=fff`
          };
          onLogin(newUser);
          setLoginError(null);
        } else {
          setLoginError("Failed to decode user information from Google.");
        }
      }
  };

  // Initialize Google Sign-In
  useEffect(() => {
    // Skip if logged in or if key is missing (handled by UI)
    if (user || GOOGLE_CLIENT_ID === 'PLACEHOLDER') return;

    let intervalId: ReturnType<typeof setInterval>;

    const initializeGSI = () => {
        if (window.google && googleButtonRef.current) {
            try {
                // Initialize the client
                window.google.accounts.id.initialize({
                    client_id: GOOGLE_CLIENT_ID,
                    callback: handleGoogleResponse,
                    auto_select: false
                });

                // Render the button
                window.google.accounts.id.renderButton(
                    googleButtonRef.current,
                    { 
                        theme: theme === 'dark' ? 'filled_black' : 'outline', 
                        size: 'large', 
                        type: 'standard',
                        shape: 'pill',
                        width: '100%',
                        logo_alignment: 'left'
                    }
                );
            } catch (err) {
                console.error("GSI Error:", err);
                setLoginError("Error initializing Google Sign-In.");
            }
            return true;
        }
        return false;
    };

    // Attempt to initialize immediately
    if (!initializeGSI()) {
        // If script hasn't loaded yet, retry every 100ms for a few seconds
        intervalId = setInterval(() => {
            if (initializeGSI()) {
                clearInterval(intervalId);
            }
        }, 100);
    }

    return () => {
        if (intervalId) clearInterval(intervalId);
    };
  }, [user, theme, onLogin]);

  // Logged-out Login View
  if (!user) {
    return (
      <div className="relative flex h-full min-h-screen w-full flex-col max-w-md mx-auto bg-background-light dark:bg-background-dark pb-32 transition-colors duration-300">
        <header className="flex items-center justify-end px-6 pt-8 pb-4">
          <button 
            onClick={toggleSettings}
            className="p-3 rounded-full bg-surface-light dark:bg-surface-dark text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 transition-colors"
          >
            <span className="material-symbols-outlined">settings</span>
          </button>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center px-8 text-center animate-enter -mt-10">
          {/* Logo Brand */}
          <div className="group relative mb-8 flex items-center justify-center">
            <div className="absolute inset-0 rounded-[2.5rem] bg-primary/20 blur-xl"></div>
            <div className="relative flex items-center justify-center size-24 bg-white dark:bg-surface-dark rounded-[1.8rem] shadow-soft border border-neutral-100 dark:border-neutral-800">
                <span 
                className="material-symbols-outlined text-primary text-[52px]" 
                style={{ fontVariationSettings: "'FILL' 1" }}
                >
                nutrition
                </span>
            </div>
            <div className="absolute -top-1 -right-1 size-8 bg-accent rounded-full flex items-center justify-center shadow-md animate-bounce">
                <span className="material-symbols-outlined text-white text-sm font-bold">eco</span>
            </div>
          </div>

          <h1 className="text-3xl font-extrabold text-neutral-900 dark:text-white mb-2 tracking-tight">NutriSnap</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mb-12 max-w-[260px] text-sm leading-relaxed">
            Your personal AI nutrition assistant. Track calories, macros, and goals with a single photo.
          </p>

          <div className="w-full space-y-4 flex flex-col items-center max-w-[320px]">
            
            {/* Real Google Button Container */}
            <div className="w-full min-h-[44px]">
                {GOOGLE_CLIENT_ID === 'PLACEHOLDER' ? (
                     <div className="p-4 bg-surface-light dark:bg-surface-dark border border-neutral-200 dark:border-neutral-700 rounded-2xl text-left shadow-sm">
                        <div className="flex items-center gap-2 mb-2 text-amber-600 dark:text-amber-400">
                            <span className="material-symbols-outlined text-xl">warning</span>
                            <span className="text-sm font-bold">Setup Required</span>
                        </div>
                        <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                            To enable real Google Login, please open <code>components/ProfileScreen.tsx</code> and replace <code>PLACEHOLDER</code> with your actual <strong>Google Client ID</strong>.
                        </p>
                     </div>
                ) : (
                    <div ref={googleButtonRef} className="w-full flex justify-center"></div>
                )}
            </div>

            {/* Apple Login Visual Placeholder */}
            <button 
                onClick={() => alert("Apple Sign-In requires developer configuration.")}
                className="w-full h-[44px] bg-black text-white rounded-full flex items-center justify-center gap-3 font-medium hover:bg-neutral-800 transition-colors"
            >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                    <path d="M17.05 20.28c-.98.95-2.05 1.78-3.14 1.78-1.09 0-1.45-.67-2.73-.67-1.27 0-1.7.64-2.7.67-1.02.03-2.07-.86-3.13-1.87C3.2 18.06 1.34 14.15 1.34 10.61c0-3.53 2.18-5.39 4.31-5.39 1.12 0 2.05.67 2.76.67.71 0 1.83-.73 3.12-.73 1.36 0 2.55.51 3.32 1.48-3.12 1.76-2.61 5.91.5 7.15-.71 1.71-1.63 3.42-2.3 4.49zM12.03 4.54c-.11-1.89 1.48-3.53 3.2-3.53.11 1.94-1.61 3.65-3.2 3.53z"></path>
                </svg>
                <span className="text-sm">Sign in with Apple</span>
            </button>
            
            {loginError && (
                <p className="text-xs text-red-500 mt-2 bg-red-50 dark:bg-red-900/10 p-2 rounded-lg">{loginError}</p>
            )}
          </div>

          <p className="mt-8 text-[11px] text-neutral-400 max-w-[280px]">
            By continuing, you agree to NutriSnap's <span className="underline cursor-pointer">Terms of Service</span> and <span className="underline cursor-pointer">Privacy Policy</span>.
          </p>
        </main>

        {isSettingsOpen && <SettingsSheet theme={theme} setTheme={setTheme} onClose={toggleSettings} onLogout={onLogout} isLoggedIn={false} />}
        
        <BottomNav currentScreen="PROFILE" onNavigate={onNavigate} onCameraClick={onFabClick} />
      </div>
    );
  }

  // Logged-in Profile View
  return (
    <div className="relative flex h-full min-h-screen w-full flex-col max-w-md mx-auto bg-background-light dark:bg-background-dark pb-32 transition-colors duration-300">
      {/* Header Section */}
      <header className="flex items-center justify-between px-6 pt-8 pb-4 bg-background-light dark:bg-background-dark sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <div className="relative group cursor-pointer">
            <div className="size-14 rounded-full overflow-hidden border-2 border-white dark:border-background-dark shadow-sm ring-2 ring-primary/20 bg-neutral-100">
              <img 
                src={user.photoUrl} 
                alt="User Profile" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute bottom-0 right-0 size-4 bg-primary rounded-full border-2 border-white dark:border-background-dark"></div>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Logged in as</span>
            <h1 className="text-xl font-bold text-neutral-900 dark:text-white leading-tight">{user.name}</h1>
          </div>
        </div>
        <button 
          onClick={toggleSettings}
          className="p-3 rounded-full bg-surface-light dark:bg-surface-dark text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
        >
          <span className="material-symbols-outlined text-[24px]">settings</span>
        </button>
      </header>

      {/* Consistency Calendar Section */}
      <section className="px-6 py-2 animate-enter" style={{animationDelay: '0.1s'}}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-neutral-900 dark:text-white text-lg font-bold">Consistency</h2>
          <button className="text-primary font-semibold text-sm flex items-center gap-1 hover:text-primary-dark">
            October
            <span className="material-symbols-outlined text-sm">expand_more</span>
          </button>
        </div>
        <div className="bg-surface-light dark:bg-surface-dark rounded-3xl p-5 shadow-card">
          <div className="grid grid-cols-7 mb-2">
            {['S','M','T','W','T','F','S'].map((d, i) => (
              <div key={i} className="text-center text-xs font-semibold text-neutral-400 py-2">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-y-2">
            <div className="aspect-square"></div>
            <div className="aspect-square"></div>
            <div className="aspect-square"></div>
            <button className="aspect-square flex items-center justify-center rounded-full text-neutral-700 dark:text-neutral-300 text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-700">1</button>
            <button className="aspect-square flex items-center justify-center rounded-full text-neutral-700 dark:text-neutral-300 text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-700">2</button>
            <button className="aspect-square flex flex-col items-center justify-center rounded-full text-neutral-700 dark:text-neutral-300 text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-700">
              3 <span className="block w-1 h-1 bg-neutral-300 rounded-full mt-0.5"></span>
            </button>
            <button className="aspect-square flex items-center justify-center rounded-full bg-primary/20 dark:bg-primary/30 text-primary-dark dark:text-white text-sm font-bold">4</button>
            <button className="aspect-square flex flex-col items-center justify-center rounded-full bg-primary text-white text-sm font-bold shadow-soft relative">
              5
            </button>
            <button className="aspect-square flex items-center justify-center rounded-full bg-primary/20 dark:bg-primary/30 text-primary-dark dark:text-white text-sm font-bold">6</button>
            <button className="aspect-square flex items-center justify-center rounded-full bg-primary/20 dark:bg-primary/30 text-primary-dark dark:text-white text-sm font-bold">7</button>
            {days.slice(7).map(d => (
               <button key={d} className="aspect-square flex items-center justify-center rounded-full text-neutral-700 dark:text-neutral-300 text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-700">{d}</button>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-center gap-6">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary"></span>
              <span className="text-xs text-neutral-500 font-medium">Logged</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full border border-neutral-300"></span>
              <span className="text-xs text-neutral-500 font-medium">Skipped</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Dashboard */}
      <section className="px-6 py-4 animate-enter" style={{animationDelay: '0.2s'}}>
        <h2 className="text-neutral-900 dark:text-white text-lg font-bold mb-4">My Stats</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white dark:bg-surface-dark p-5 rounded-3xl shadow-card flex flex-col justify-between h-40 border border-neutral-100 dark:border-neutral-800">
            <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400">
              <span className="material-symbols-outlined text-lg">monitor_weight</span>
              <span className="text-sm font-medium">Weight</span>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-neutral-900 dark:text-white">68.5 <span className="text-base font-semibold text-neutral-500">kg</span></div>
              <div className="flex items-center gap-1 mt-1">
                <span className="bg-primary/10 text-primary-dark text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                   <span className="material-symbols-outlined text-xs">trending_down</span> 1.2kg
                </span>
              </div>
            </div>
          </div>
          <div className="bg-accent/20 dark:bg-accent/10 p-5 rounded-3xl shadow-sm flex flex-col justify-between h-40 border border-accent/30">
            <div className="flex items-center justify-between text-neutral-700 dark:text-neutral-300">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-lg filled">local_fire_department</span>
                <span className="text-sm font-bold">Streak</span>
              </div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-neutral-900 dark:text-white">12 <span className="text-base font-semibold">Days</span></div>
            </div>
          </div>
          <div className="col-span-2 bg-white dark:bg-surface-dark p-5 rounded-3xl shadow-card border border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400 mb-1">
                <span className="material-symbols-outlined text-lg">restaurant</span>
                <span className="text-sm font-medium">Avg. Intake</span>
              </div>
              <div className="text-2xl font-extrabold text-neutral-900 dark:text-white">1,950 <span className="text-base font-semibold text-neutral-500">kcal</span></div>
            </div>
            <div className="relative size-16 flex items-center justify-center">
              <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                <path className="text-neutral-100 dark:text-neutral-700" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3"></path>
                <path className="text-primary" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="75, 100" strokeLinecap="round" strokeWidth="3"></path>
              </svg>
              <span className="absolute text-xs font-bold text-primary">75%</span>
            </div>
          </div>
        </div>
      </section>

      {/* Settings Bottom Sheet Integration */}
      {isSettingsOpen && <SettingsSheet theme={theme} setTheme={setTheme} onClose={toggleSettings} onLogout={onLogout} isLoggedIn={true} />}

      <BottomNav 
        currentScreen="PROFILE" 
        onNavigate={onNavigate} 
        onCameraClick={onFabClick} 
      />
    </div>
  );
};

// Reusable Settings Sheet Component
interface SettingsSheetProps {
  theme: Theme;
  setTheme: (t: Theme) => void;
  onClose: () => void;
  onLogout: () => void;
  isLoggedIn: boolean;
}

const SettingsSheet: React.FC<SettingsSheetProps> = ({ theme, setTheme, onClose, onLogout, isLoggedIn }) => (
  <div className="fixed inset-0 z-[100] flex flex-col justify-end">
    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
    <div className="relative bg-white dark:bg-background-dark rounded-t-3xl p-6 shadow-2xl animate-enter border-t border-neutral-100 dark:border-neutral-800 max-w-md mx-auto w-full">
      <div className="flex items-center justify-between mb-6">
         <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Settings</h2>
         <button onClick={onClose} className="p-2 -mr-2 text-neutral-500">
            <span className="material-symbols-outlined">close</span>
         </button>
      </div>
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-3">Appearance</h3>
          <div className="bg-surface-light dark:bg-surface-dark rounded-2xl p-2 space-y-1">
            {['system', 'light', 'dark'].map((t) => (
              <button 
                key={t}
                onClick={() => setTheme(t as Theme)}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors ${theme === t ? 'bg-white dark:bg-neutral-800 shadow-sm' : 'hover:bg-white/50 dark:hover:bg-neutral-800/50'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`size-8 rounded-full flex items-center justify-center ${theme === t ? 'bg-primary text-white' : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400'}`}>
                     <span className="material-symbols-outlined text-lg">
                        {t === 'system' ? 'settings_brightness' : t === 'light' ? 'light_mode' : 'dark_mode'}
                     </span>
                  </div>
                  <span className="font-medium text-neutral-900 dark:text-white capitalize">{t === 'system' ? 'Automatic (System)' : `${t} Mode`}</span>
                </div>
                {theme === t && <span className="material-symbols-outlined text-primary">check_circle</span>}
              </button>
            ))}
          </div>
        </div>
        
        {isLoggedIn && (
          <div className="pt-2">
            <button 
              onClick={() => { onLogout(); onClose(); }}
              className="w-full flex items-center gap-3 p-4 rounded-2xl text-red-500 bg-red-50 dark:bg-red-900/10 font-bold hover:bg-red-100 transition-colors"
            >
              <span className="material-symbols-outlined">logout</span>
              Sign Out
            </button>
          </div>
        )}

        <div className="pt-2 text-center">
           <p className="text-xs text-neutral-400">NutriSnap v1.0.3</p>
        </div>
      </div>
    </div>
  </div>
);

export default ProfileScreen;