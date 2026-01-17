import React, { useState, useEffect, useRef } from 'react';
import { Screen, Theme, User, GoogleCredentialResponse } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import BottomNav from './BottomNav';
import AuthSimulation from './AuthSimulation';

// ------------------------------------------------------------------
// CONFIGURATION
// ------------------------------------------------------------------
// IMPORTANT: To make Google Login work, you must create a Project in 
// Google Cloud Console, setup OAuth Consent Screen, create a Credential 
// (Client ID), and paste it below.
// ------------------------------------------------------------------
const GOOGLE_CLIENT_ID: string = '19113468273-pbbkm1s0evobrt5m1phtm7n31rjfbq3e.apps.googleusercontent.com'; 
// ------------------------------------------------------------------

interface ProfileScreenProps {
  onNavigate: (screen: Screen) => void;
  user?: User | null;
  onLogout: () => void;
  onLogin: (user: User) => void;
  onUpdateUser: (user: User) => void;
  onFabClick: () => void;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ 
    onNavigate, 
    user, 
    onLogout,
    onLogin,
    onUpdateUser,
    onFabClick
}) => {
  const { theme, setTheme } = useTheme();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [debugOrigin, setDebugOrigin] = useState<string>('');
  
  // Dev Mode State
  const [showDevAuth, setShowDevAuth] = useState(false);
  
  // Ref for the Google button container
  const googleButtonRef = useRef<HTMLDivElement>(null);
  
  const days = Array.from({ length: 14 }, (_, i) => i + 1);

  const toggleSettings = () => setIsSettingsOpen(!isSettingsOpen);
  const toggleEditProfile = () => setIsEditProfileOpen(!isEditProfileOpen);

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

  // Handle Guest Login
  const handleGuestLogin = () => {
      const guestUser: User = {
          id: 'guest_' + Date.now(),
          name: 'Guest',
          email: '',
          photoUrl: '', 
          dailyCalories: 2000,
          weight: 70,
          height: 175,
          age: 25
      };
      onLogin(guestUser);
  };

  // Initialize Google Sign-In
  useEffect(() => {
    // Capture current origin for debugging
    if (typeof window !== 'undefined') {
        const origin = window.location.origin;
        setDebugOrigin(origin);
    }

    // Skip if logged in or if key is missing (handled by UI)
    if (user || GOOGLE_CLIENT_ID === 'PLACEHOLDER') return;

    let intervalId: ReturnType<typeof setInterval>;

    const initializeGSI = () => {
        if (window.google && window.google.accounts && googleButtonRef.current) {
            try {
                // Initialize the client
                window.google.accounts.id.initialize({
                    client_id: GOOGLE_CLIENT_ID,
                    callback: handleGoogleResponse,
                    auto_select: false,
                    // cancel_on_tap_outside: true
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
                // Clear any previous error if rendering succeeded
                setLoginError(null);
            } catch (err) {
                console.error("GSI Error:", err);
                setLoginError("Error initializing Google Sign-In. Check console for details.");
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
                    <div className="w-full">
                        <div ref={googleButtonRef} className="w-full flex justify-center min-h-[40px]"></div>
                        {/* Helper text if button doesn't appear */}
                        <div className="h-4"></div> 
                    </div>
                )}
            </div>

            {/* Guest Login Option */}
            <button 
                onClick={handleGuestLogin}
                className="w-full h-[44px] bg-surface-light dark:bg-surface-dark border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white rounded-full flex items-center justify-center gap-2 font-bold hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
            >
                <span className="material-symbols-outlined text-xl">person</span>
                <span className="text-sm">Continue as Guest</span>
            </button>
            
            {loginError && (
                <div className="w-full p-3 bg-red-50 dark:bg-red-900/10 rounded-lg text-left">
                     <p className="text-xs text-red-600 dark:text-red-400 font-bold mb-1">Login Error</p>
                     <p className="text-xs text-red-500 dark:text-red-300">{loginError}</p>
                     <p className="text-[10px] text-neutral-400 mt-2 border-t border-red-100 dark:border-red-800/30 pt-1">
                        Developer Tip: Check that <strong>{debugOrigin}</strong> is added to "Authorized JavaScript origins" in Google Cloud Console.
                     </p>
                </div>
            )}
            
            {/* Dev Mode Bypass - Only typically needed in preview environments */}
            <button 
                onClick={() => setShowDevAuth(true)}
                className="mt-4 text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 underline decoration-dotted underline-offset-4"
            >
                Testing in Studio? Use Dev Mode
            </button>
          </div>

          <p className="mt-8 text-[11px] text-neutral-400 max-w-[280px]">
            By continuing, you agree to NutriSnap's <span className="underline cursor-pointer">Terms of Service</span> and <span className="underline cursor-pointer">Privacy Policy</span>.
          </p>
        </main>

        {isSettingsOpen && <SettingsSheet theme={theme} setTheme={setTheme} onClose={toggleSettings} onLogout={onLogout} isLoggedIn={false} />}
        
        {/* Render the simulation logic when dev mode is active */}
        {showDevAuth && (
            <AuthSimulation 
                provider='google'
                onSuccess={(u) => {
                    onLogin(u);
                    setShowDevAuth(false);
                }}
                onCancel={() => setShowDevAuth(false)}
            />
        )}
        
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
          <div className="relative group cursor-pointer" onClick={toggleEditProfile}>
            <div className="size-14 rounded-full overflow-hidden border-2 border-white dark:border-background-dark shadow-sm ring-2 ring-primary/20 bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
              {user.photoUrl ? (
                  <img 
                    src={user.photoUrl} 
                    alt="User Profile" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
              ) : (
                  <span className="material-symbols-outlined text-3xl text-neutral-400">person</span>
              )}
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

      {/* Stats Dashboard */}
      <section className="px-6 py-4 animate-enter" style={{animationDelay: '0.1s'}}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-neutral-900 dark:text-white text-lg font-bold">My Stats</h2>
          <button 
            onClick={toggleEditProfile}
            className="text-primary font-semibold text-sm flex items-center gap-1 hover:text-primary-dark transition-colors"
          >
            <span className="material-symbols-outlined text-sm">edit</span>
            Edit
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div 
            onClick={toggleEditProfile}
            className="bg-white dark:bg-surface-dark p-5 rounded-3xl shadow-card flex flex-col justify-between h-40 border border-neutral-100 dark:border-neutral-800 active:scale-[0.98] transition-transform cursor-pointer"
          >
            <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400">
              <span className="material-symbols-outlined text-lg">monitor_weight</span>
              <span className="text-sm font-medium">Weight</span>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-neutral-900 dark:text-white">
                {user.weight ? user.weight : '--'} <span className="text-base font-semibold text-neutral-500">kg</span>
              </div>
              <div className="flex items-center gap-1 mt-1">
                 {/* Placeholder trend data */}
                <span className="bg-primary/10 text-primary-dark text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                   <span className="material-symbols-outlined text-xs">trending_flat</span> 0.0kg
                </span>
              </div>
            </div>
          </div>
          
          <div 
            onClick={toggleEditProfile}
            className="bg-white dark:bg-surface-dark p-5 rounded-3xl shadow-card flex flex-col justify-between h-40 border border-neutral-100 dark:border-neutral-800 active:scale-[0.98] transition-transform cursor-pointer"
          >
            <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400">
              <span className="material-symbols-outlined text-lg">accessibility_new</span>
              <span className="text-sm font-medium">Height</span>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-neutral-900 dark:text-white">
                {user.height ? user.height : '--'} <span className="text-base font-semibold text-neutral-500">cm</span>
              </div>
              {user.age ? (
                  <p className="text-xs text-neutral-400 mt-2 font-medium">Age: {user.age} yrs</p>
              ) : (
                  <p className="text-xs text-neutral-400 mt-2 font-medium">Age: --</p>
              )}
            </div>
          </div>

          <div 
            onClick={toggleEditProfile}
            className="col-span-2 bg-accent/20 dark:bg-accent/10 p-5 rounded-3xl shadow-sm border border-accent/30 flex items-center justify-between active:scale-[0.99] transition-transform cursor-pointer"
          >
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300 mb-1">
                <span className="material-symbols-outlined text-lg filled">local_fire_department</span>
                <span className="text-sm font-bold">Daily Target</span>
              </div>
              <div className="text-2xl font-extrabold text-neutral-900 dark:text-white">
                {user.dailyCalories ? user.dailyCalories : '2000'} <span className="text-base font-semibold text-neutral-600 dark:text-neutral-400">kcal</span>
              </div>
            </div>
            <div className="size-12 rounded-full bg-accent/30 flex items-center justify-center">
                 <span className="material-symbols-outlined text-accent-cream dark:text-accent">flag</span>
            </div>
          </div>
        </div>
      </section>

      {/* Consistency Calendar Section */}
      <section className="px-6 py-2 animate-enter" style={{animationDelay: '0.2s'}}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-neutral-900 dark:text-white text-lg font-bold">Consistency</h2>
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
        </div>
      </section>

      {/* Settings Bottom Sheet Integration */}
      {isSettingsOpen && <SettingsSheet theme={theme} setTheme={setTheme} onClose={toggleSettings} onLogout={onLogout} isLoggedIn={true} />}

      {/* Edit Profile Sheet */}
      {isEditProfileOpen && (
          <EditProfileSheet 
            user={user} 
            onClose={toggleEditProfile} 
            onSave={(u) => { onUpdateUser(u); toggleEditProfile(); }} 
          />
      )}

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

// Edit Profile Component
interface EditProfileSheetProps {
    user: User;
    onClose: () => void;
    onSave: (updatedUser: User) => void;
}

const EditProfileSheet: React.FC<EditProfileSheetProps> = ({ user, onClose, onSave }) => {
    const [weight, setWeight] = useState(user.weight?.toString() || '');
    const [height, setHeight] = useState(user.height?.toString() || '');
    const [age, setAge] = useState(user.age?.toString() || '');
    const [calories, setCalories] = useState(user.dailyCalories?.toString() || '2000');

    const handleSave = () => {
        onSave({
            ...user,
            weight: weight ? parseFloat(weight) : undefined,
            height: height ? parseFloat(height) : undefined,
            age: age ? parseInt(age) : undefined,
            dailyCalories: calories ? parseInt(calories) : 2000
        });
    };

    return (
        <div className="fixed inset-0 z-[100] flex flex-col justify-end">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
            <div className="relative bg-white dark:bg-background-dark rounded-t-3xl p-6 shadow-2xl animate-enter border-t border-neutral-100 dark:border-neutral-800 max-w-md mx-auto w-full">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Edit Profile</h2>
                    <button onClick={onClose} className="p-2 -mr-2 text-neutral-500">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 ml-1">Weight (kg)</label>
                            <input 
                                type="number" 
                                value={weight}
                                onChange={e => setWeight(e.target.value)}
                                placeholder="e.g. 70"
                                className="w-full h-12 px-4 rounded-xl bg-surface-light dark:bg-surface-dark border-none focus:ring-2 focus:ring-primary/50 text-neutral-800 dark:text-white font-semibold"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 ml-1">Height (cm)</label>
                            <input 
                                type="number" 
                                value={height}
                                onChange={e => setHeight(e.target.value)}
                                placeholder="e.g. 175"
                                className="w-full h-12 px-4 rounded-xl bg-surface-light dark:bg-surface-dark border-none focus:ring-2 focus:ring-primary/50 text-neutral-800 dark:text-white font-semibold"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 ml-1">Age</label>
                            <input 
                                type="number" 
                                value={age}
                                onChange={e => setAge(e.target.value)}
                                placeholder="e.g. 25"
                                className="w-full h-12 px-4 rounded-xl bg-surface-light dark:bg-surface-dark border-none focus:ring-2 focus:ring-primary/50 text-neutral-800 dark:text-white font-semibold"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 ml-1">Calorie Target</label>
                            <input 
                                type="number" 
                                value={calories}
                                onChange={e => setCalories(e.target.value)}
                                placeholder="e.g. 2000"
                                className="w-full h-12 px-4 rounded-xl bg-surface-light dark:bg-surface-dark border-none focus:ring-2 focus:ring-primary/50 text-neutral-800 dark:text-white font-semibold"
                            />
                        </div>
                    </div>

                    <div className="p-4 bg-accent/10 rounded-xl border border-accent/20">
                        <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                            <span className="font-bold text-neutral-800 dark:text-neutral-200">Note:</span> Updating your calorie target will automatically recalculate your macro goals for Protein, Carbs, and Fat based on a standard balanced diet.
                        </p>
                    </div>

                    <div className="pt-2">
                        <button 
                            onClick={handleSave}
                            className="w-full h-14 bg-primary text-white font-bold rounded-2xl shadow-float hover:bg-primary-dark transition-all active:scale-[0.98]"
                        >
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProfileScreen;