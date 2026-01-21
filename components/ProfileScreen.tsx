import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Screen, Theme, User, GoogleCredentialResponse, Goal } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { useData } from '../contexts/DataContext';
import { useLanguage, Language } from '../contexts/LanguageContext';
import BottomNav from './BottomNav';
import AuthSimulation from './AuthSimulation';

// ------------------------------------------------------------------
// CONFIGURATION
// ------------------------------------------------------------------
const GOOGLE_CLIENT_ID: string = '19113468273-omuu31bfih6t05tvq0i7rts2quldsckh.apps.googleusercontent.com';
// ------------------------------------------------------------------

interface ProfileScreenProps {
    onNavigate: (screen: Screen) => void;
    user?: User | null;
    onLogout: () => void;
    onLogin: (user: User) => void;
    onUpdateUser: (user: User) => void;
    onFabClick: () => void;
}

// Helper to calculate age from DOB
const calculateAge = (dob?: string): number => {
    if (!dob) return 0;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
};

const SettingsSheet = ({ theme, setTheme, language, setLanguage, onClose, onLogout, isLoggedIn }: any) => {
    const { t } = useLanguage();

    // DB Debug State
    const [dbStatus, setDbStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [dbMessage, setDbMessage] = useState('');

    const testConnection = async () => {
        setDbStatus('loading');
        setDbMessage('Attempting to connect...');
        try {
            const res = await fetch('/api/debug/connection');

            // Check content type to see if we got JSON or HTML (404 fallback)
            const contentType = res.headers.get("content-type");

            if (contentType && contentType.indexOf("application/json") !== -1) {
                const data = await res.json();
                if (res.ok) {
                    setDbStatus('success');
                    setDbMessage(`Success! Connected to ${data.config_used.host} (v${data.server_ip})`);
                } else {
                    setDbStatus('error');
                    const detail = data.detail !== 'No details' ? ` - ${data.detail}` : '';
                    setDbMessage(`Error ${data.code}: ${data.message}${detail}`);
                }
            } else {
                // If we got text/html, it means the Proxy failed to connect to the backend 
                // and Vite served index.html instead, OR in production the api route is crashing
                setDbStatus('error');
                setDbMessage(`Backend Offline. (Local: run 'node server/index.js'. Prod: Check logs)`);
            }
        } catch (e: any) {
            setDbStatus('error');
            setDbMessage(`Network Error: ${e.message || 'Connection Refused'}. Is the server running?`);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex flex-col justify-end font-display">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
            <div className="relative bg-surface-light dark:bg-surface-dark rounded-t-[2.5rem] p-6 pb-10 w-full max-w-3xl mx-auto animate-[float-up_0.3s_ease-out] shadow-2xl border-t border-white/20 dark:border-neutral-700 max-h-[85vh] overflow-y-auto">
                <div className="w-12 h-1.5 bg-neutral-300 dark:bg-neutral-600 rounded-full mx-auto mb-6"></div>
                <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-6 px-2">{t('settings')}</h2>

                <div className="space-y-4">
                    {/* Theme Toggle */}
                    <div className="flex items-center justify-between p-4 bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-100 dark:border-neutral-700">
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                                <span className="material-symbols-outlined">palette</span>
                            </div>
                            <span className="font-bold text-neutral-800 dark:text-white">{t('appearance')}</span>
                        </div>
                        <div className="flex bg-neutral-100 dark:bg-neutral-900 rounded-lg p-1">
                            {(['light', 'system', 'dark'] as Theme[]).map((m) => (
                                <button
                                    key={m}
                                    onClick={() => setTheme(m)}
                                    className={`px-3 py-1.5 rounded-md text-xs font-bold capitalize transition-all ${theme === m ? 'bg-white dark:bg-neutral-700 shadow-sm text-neutral-900 dark:text-white' : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'}`}
                                >
                                    {m}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Language Toggle */}
                    <div className="flex items-center justify-between p-4 bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-100 dark:border-neutral-700">
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                                <span className="material-symbols-outlined">language</span>
                            </div>
                            <span className="font-bold text-neutral-800 dark:text-white">{t('language')}</span>
                        </div>
                        <div className="flex bg-neutral-100 dark:bg-neutral-900 rounded-lg p-1">
                            <button
                                onClick={() => setLanguage('en')}
                                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${language === 'en' ? 'bg-white dark:bg-neutral-700 shadow-sm text-neutral-900 dark:text-white' : 'text-neutral-500'}`}
                            >
                                English
                            </button>
                            <button
                                onClick={() => setLanguage('zh')}
                                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${language === 'zh' ? 'bg-white dark:bg-neutral-700 shadow-sm text-neutral-900 dark:text-white' : 'text-neutral-500'}`}
                            >
                                中文
                            </button>
                        </div>
                    </div>

                    {/* Database Debug Tool */}
                    <div className="p-4 bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-100 dark:border-neutral-700">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="size-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                                <span className="material-symbols-outlined">dns</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-neutral-800 dark:text-white">System Diagnostics</span>
                                <span className="text-xs text-neutral-500">Check connection to cloud database</span>
                            </div>
                        </div>

                        <div className="bg-neutral-50 dark:bg-neutral-900 rounded-xl p-3 mb-3">
                            {dbStatus === 'idle' && <p className="text-xs text-neutral-500">Ready to test connection.</p>}
                            {dbStatus === 'loading' && (
                                <div className="flex items-center gap-2">
                                    <div className="size-3 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                    <p className="text-xs text-neutral-500">Connecting...</p>
                                </div>
                            )}
                            {dbStatus === 'success' && (
                                <p className="text-xs text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">check_circle</span>
                                    {dbMessage}
                                </p>
                            )}
                            {dbStatus === 'error' && (
                                <p className="text-xs text-red-600 dark:text-red-400 font-medium break-all">
                                    {dbMessage}
                                </p>
                            )}
                        </div>

                        <button
                            onClick={testConnection}
                            disabled={dbStatus === 'loading'}
                            className="w-full py-2 bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-200 rounded-lg text-xs font-bold transition-colors"
                        >
                            Test Database Connection
                        </button>
                    </div>

                    {isLoggedIn && (
                        <button
                            onClick={onLogout}
                            className="w-full p-4 mt-4 flex items-center justify-center gap-2 text-red-500 font-bold bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-2xl transition-colors"
                        >
                            <span className="material-symbols-outlined">logout</span>
                            {t('sign_out')}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

// Business Logic for Nutrition Calculation
const calculateTargets = (weight: number, height: number, age: number, gender: 'male' | 'female', goal: Goal) => {
    if (!weight || !height || !age) return null;

    // Mifflin-St Jeor Equation
    let bmr = (10 * weight) + (6.25 * height) - (5 * age);
    if (gender === 'male') {
        bmr += 5;
    } else {
        bmr -= 161;
    }

    // Baseline Activity Multiplier (Sedentary/Light Mix 1.25)
    let tdee = bmr * 1.25;

    // Adjust based on Goal
    switch (goal) {
        case 'LOSS_WEIGHT':
            tdee -= 500; // Deficit
            break;
        case 'GAIN_WEIGHT':
            tdee += 500; // Surplus
            break;
        case 'GAIN_MUSCLE':
            tdee += 250; // Slight Surplus
            break;
    }

    // Safety bounds
    tdee = Math.max(1200, tdee);

    // Calculate Macros
    // Protein ~30%, Carbs ~45%, Fat ~25%
    const dailyCalories = Math.round(tdee);
    const dailyProtein = Math.round((dailyCalories * 0.30) / 4);
    const dailyCarbs = Math.round((dailyCalories * 0.45) / 4);
    const dailySugar = Math.round((dailyCalories * 0.10) / 4); // Keep sugar low

    return { dailyCalories, dailyProtein, dailyCarbs, dailySugar };
};

const EditProfileModal = ({ user, onClose, onSave }: { user: User, onClose: () => void, onSave: (u: User) => void }) => {
    const { t } = useLanguage();

    // Initial State
    const [weight, setWeight] = useState<number | string>(user.weight || '');
    const [height, setHeight] = useState<number | string>(user.height || '');
    const [dateOfBirth, setDateOfBirth] = useState<string>(user.dateOfBirth || '');
    const [gender, setGender] = useState<'male' | 'female'>(user.gender || 'male');
    const [goal, setGoal] = useState<Goal>(user.goal || 'LOSS_WEIGHT');

    const [calories, setCalories] = useState<number | string>(user.dailyCalories || 2000);
    const [protein, setProtein] = useState<number | string>(user.dailyProtein || Math.round(2000 * 0.3 / 4));
    const [carbs, setCarbs] = useState<number | string>(user.dailyCarbs || Math.round(2000 * 0.45 / 4));
    const [sugar, setSugar] = useState<number | string>(user.dailySugar || 50);

    const handleAutoCalculate = () => {
        const w = Number(weight);
        const h = Number(height);
        const age = calculateAge(dateOfBirth);

        if (w && h && age > 0) {
            const result = calculateTargets(w, h, age, gender, goal);
            if (result) {
                setCalories(result.dailyCalories);
                setProtein(result.dailyProtein);
                setCarbs(result.dailyCarbs);
                setSugar(result.dailySugar);
            }
        } else {
            alert("Please enter a valid weight, height, and date of birth.");
        }
    };

    const handleSave = () => {
        onSave({
            ...user,
            weight: Number(weight),
            height: Number(height),
            dateOfBirth,
            gender,
            goal,
            dailyCalories: Number(calories),
            dailyProtein: Number(protein),
            dailyCarbs: Number(carbs),
            dailySugar: Number(sugar)
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 font-display">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
            <div className="relative bg-white dark:bg-surface-dark w-full max-w-sm rounded-[2rem] p-6 shadow-2xl animate-enter max-h-[90vh] overflow-y-auto no-scrollbar">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-neutral-900 dark:text-white">{t('edit')} {t('my_stats')}</h3>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800">
                        <span className="material-symbols-outlined text-neutral-500">close</span>
                    </button>
                </div>

                <div className="space-y-5">
                    {/* Gender Selection */}
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">{t('gender') || 'GENDER'}</label>
                        <div className="flex gap-2">
                            <button onClick={() => setGender('male')} className={`flex-1 h-10 rounded-xl text-sm font-bold border transition-colors ${gender === 'male' ? 'bg-primary text-white border-primary' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 border-transparent hover:bg-neutral-200 dark:hover:bg-neutral-700'}`}>
                                {t('male')}
                            </button>
                            <button onClick={() => setGender('female')} className={`flex-1 h-10 rounded-xl text-sm font-bold border transition-colors ${gender === 'female' ? 'bg-primary text-white border-primary' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 border-transparent hover:bg-neutral-200 dark:hover:bg-neutral-700'}`}>
                                {t('female')}
                            </button>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">{t('weight')} (kg)</label>
                            <input type="number" value={weight} onChange={e => setWeight(e.target.value)} className="w-full h-12 px-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 border-none font-bold text-neutral-900 dark:text-white text-center focus:ring-2 focus:ring-primary/50" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">{t('height')} (cm)</label>
                            <input type="number" value={height} onChange={e => setHeight(e.target.value)} className="w-full h-12 px-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 border-none font-bold text-neutral-900 dark:text-white text-center focus:ring-2 focus:ring-primary/50" />
                        </div>
                    </div>

                    {/* Date of Birth Input */}
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Date of Birth</label>
                        <input
                            type="date"
                            value={dateOfBirth}
                            onChange={e => setDateOfBirth(e.target.value)}
                            className="w-full h-12 px-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 border-none font-bold text-neutral-900 dark:text-white text-center focus:ring-2 focus:ring-primary/50"
                        />
                    </div>

                    {/* Goal Selection */}
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">{t('current_goal')}</label>
                        <div className="grid grid-cols-1 gap-2">
                            <button onClick={() => setGoal('LOSS_WEIGHT')} className={`px-4 py-3 rounded-xl text-sm font-bold border flex items-center gap-3 transition-colors ${goal === 'LOSS_WEIGHT' ? 'bg-primary/10 border-primary text-primary-dark dark:text-primary' : 'bg-neutral-100 dark:bg-neutral-800 border-transparent text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'}`}>
                                <span className="material-symbols-outlined text-lg">monitor_weight</span>
                                {t('goal_lose')}
                            </button>
                            <button onClick={() => setGoal('GAIN_MUSCLE')} className={`px-4 py-3 rounded-xl text-sm font-bold border flex items-center gap-3 transition-colors ${goal === 'GAIN_MUSCLE' ? 'bg-primary/10 border-primary text-primary-dark dark:text-primary' : 'bg-neutral-100 dark:bg-neutral-800 border-transparent text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'}`}>
                                <span className="material-symbols-outlined text-lg">fitness_center</span>
                                {t('goal_muscle')}
                            </button>
                            <button onClick={() => setGoal('GAIN_WEIGHT')} className={`px-4 py-3 rounded-xl text-sm font-bold border flex items-center gap-3 transition-colors ${goal === 'GAIN_WEIGHT' ? 'bg-primary/10 border-primary text-primary-dark dark:text-primary' : 'bg-neutral-100 dark:bg-neutral-800 border-transparent text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'}`}>
                                <span className="material-symbols-outlined text-lg">trending_up</span>
                                {t('goal_gain')}
                            </button>
                        </div>
                    </div>

                    <div className="h-px bg-neutral-100 dark:bg-neutral-700 w-full my-2"></div>

                    {/* Targets & Auto-Calc */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">{t('daily_targets')}</label>
                            <button
                                onClick={handleAutoCalculate}
                                className="text-[10px] font-bold bg-accent text-neutral-900 px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-accent/80 transition-colors shadow-sm active:scale-95"
                            >
                                <span className="material-symbols-outlined text-sm filled">auto_awesome</span>
                                {t('recalculate')}
                            </button>
                        </div>

                        <div className="space-y-1">
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-xs font-bold">CAL</span>
                                <input type="number" value={calories} onChange={e => setCalories(e.target.value)} className="w-full h-12 pl-12 pr-4 rounded-xl bg-neutral-100 dark:bg-neutral-800 border-none font-bold text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary/50" />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-xs font-bold">PRO</span>
                                <input type="number" value={protein} onChange={e => setProtein(e.target.value)} className="w-full h-12 pl-12 pr-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 border-none font-bold text-neutral-900 dark:text-white text-center focus:ring-2 focus:ring-primary/50" />
                            </div>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-xs font-bold">CARB</span>
                                <input type="number" value={carbs} onChange={e => setCarbs(e.target.value)} className="w-full h-12 pl-12 pr-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 border-none font-bold text-neutral-900 dark:text-white text-center focus:ring-2 focus:ring-primary/50" />
                            </div>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-xs font-bold">SUG</span>
                                <input type="number" value={sugar} onChange={e => setSugar(e.target.value)} className="w-full h-12 pl-12 pr-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 border-none font-bold text-neutral-900 dark:text-white text-center focus:ring-2 focus:ring-primary/50" />
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleSave}
                        className="w-full h-14 mt-2 bg-primary text-white font-bold rounded-2xl hover:bg-primary-dark transition-colors flex items-center justify-center gap-2 shadow-float active:scale-[0.98]"
                    >
                        <span className="material-symbols-outlined">save</span>
                        {t('save_changes')}
                    </button>
                </div>
            </div>
        </div>
    );
};

const ProfileScreen: React.FC<ProfileScreenProps> = ({
    onNavigate,
    user,
    onLogout,
    onLogin,
    onUpdateUser,
    onFabClick
}) => {
    const { theme, setTheme } = useTheme();
    const { language, setLanguage, t } = useLanguage();
    const { meals } = useData();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
    const [loginError, setLoginError] = useState<string | null>(null);
    const [debugOrigin, setDebugOrigin] = useState<string>('');

    // Dev Mode State
    const [showDevAuth, setShowDevAuth] = useState(false);

    // Ref for the Google button container
    const googleButtonRef = useRef<HTMLDivElement>(null);

    // Calendar State
    const [calendarDate, setCalendarDate] = useState(new Date());
    const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);

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
            name: t('guest'),
            email: '',
            photoUrl: '',
            dailyCalories: 2000,
            weight: 70,
            height: 175,
            dateOfBirth: '1999-01-01', // Default DOB for guest (approx 25 yrs old)
            gender: 'male',
            goal: 'LOSS_WEIGHT'
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

    // Calendar Logic
    const calendarData = useMemo(() => {
        // 1. Aggregate calories per date "YYYY-MM-DD"
        const totals: Record<string, number> = {};
        meals.forEach(m => {
            if (!totals[m.date]) totals[m.date] = 0;
            totals[m.date] += m.calories;
        });
        return totals;
    }, [meals]);

    const changeCalendarMonth = (increment: number) => {
        const newDate = new Date(calendarDate);
        newDate.setMonth(newDate.getMonth() + increment);
        setCalendarDate(newDate);
    };

    const changeYear = (increment: number, e: React.MouseEvent) => {
        e.stopPropagation();
        const newDate = new Date(calendarDate);
        newDate.setFullYear(newDate.getFullYear() + increment);
        setCalendarDate(newDate);
    };

    const selectMonth = (monthIndex: number) => {
        const newDate = new Date(calendarDate);
        newDate.setMonth(monthIndex);
        setCalendarDate(newDate);
        setIsMonthPickerOpen(false);
    };

    const getMonthName = (index: number) => {
        const d = new Date(2024, index, 1);
        return d.toLocaleString(language === 'zh' ? 'zh-CN' : 'en-US', { month: 'short' });
    };

    const renderCalendar = () => {
        const year = calendarDate.getFullYear();
        const month = calendarDate.getMonth();

        // First day of the month (0-6)
        const firstDay = new Date(year, month, 1).getDay();
        // Total days in month
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const daysArray = [];

        // Add empty padding
        for (let i = 0; i < firstDay; i++) {
            daysArray.push(<div key={`empty-${i}`} className="aspect-square"></div>);
        }

        const target = user?.dailyCalories || 2000;

        // Add actual days
        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const total = calendarData[dateStr];
            const hasData = total !== undefined && total > 0;

            let bgClass = "hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300";
            let statusIcon = null;

            // Within limit (Green)
            if (hasData && total <= target) {
                bgClass = "bg-primary text-white shadow-soft font-bold";
            }
            // Over limit (Orange)
            else if (hasData && total > target) {
                bgClass = "bg-orange-400 text-white shadow-soft font-bold";
            }

            daysArray.push(
                <div key={d} className={`aspect-square rounded-full flex flex-col items-center justify-center text-sm transition-all relative ${bgClass}`}>
                    {d}
                    {hasData && (
                        <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-current opacity-60"></div>
                    )}
                </div>
            );
        }

        return daysArray;
    };

    // Logged-out Login View
    if (!user) {
        return (
            <div className="relative flex h-full min-h-screen w-full flex-col max-w-3xl mx-auto bg-background-light dark:bg-background-dark pb-32 transition-colors duration-300">
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
                                        <span className="text-sm font-bold">{t('setup_required')}</span>
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
                            <span className="text-sm">{t('continue_guest')}</span>
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
                        {t('agree')} <span className="underline cursor-pointer">{t('terms')}</span> {t('and')} <span className="underline cursor-pointer">{t('privacy')}</span>.
                    </p>
                </main>

                {isSettingsOpen && <SettingsSheet theme={theme} setTheme={setTheme} language={language} setLanguage={setLanguage} onClose={toggleSettings} onLogout={onLogout} isLoggedIn={false} />}

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
        <div className="relative flex h-full min-h-screen w-full flex-col max-w-3xl mx-auto bg-background-light dark:bg-background-dark pb-32 transition-colors duration-300">
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
                        <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">{t('logged_in_as')}</span>
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
            <section className="px-6 py-4 animate-enter" style={{ animationDelay: '0.1s' }}>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-neutral-900 dark:text-white text-lg font-bold">{t('my_stats')}</h2>
                    <button
                        onClick={toggleEditProfile}
                        className="text-primary font-semibold text-sm flex items-center gap-1 hover:text-primary-dark transition-colors"
                    >
                        <span className="material-symbols-outlined text-sm">edit</span>
                        {t('edit')}
                    </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div
                        onClick={toggleEditProfile}
                        className="bg-white dark:bg-surface-dark p-5 rounded-3xl shadow-card flex flex-col justify-between h-40 border border-neutral-100 dark:border-neutral-800 active:scale-[0.98] transition-transform cursor-pointer"
                    >
                        <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400">
                            <span className="material-symbols-outlined text-lg">monitor_weight</span>
                            <span className="text-sm font-medium">{t('weight')}</span>
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
                            <span className="text-sm font-medium">{t('height')}</span>
                        </div>
                        <div>
                            <div className="text-2xl font-extrabold text-neutral-900 dark:text-white">
                                {user.height ? user.height : '--'} <span className="text-base font-semibold text-neutral-500">cm</span>
                            </div>
                            {user.dateOfBirth ? (
                                <p className="text-xs text-neutral-400 mt-2 font-medium">{t('age')}: {calculateAge(user.dateOfBirth)}</p>
                            ) : (
                                <p className="text-xs text-neutral-400 mt-2 font-medium">{t('age')}: --</p>
                            )}
                        </div>
                    </div>

                    <div
                        onClick={toggleEditProfile}
                        className="col-span-2 bg-accent/20 dark:bg-accent/10 p-5 rounded-3xl shadow-sm border border-accent/30 flex flex-col gap-3 active:scale-[0.99] transition-transform cursor-pointer"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300">
                                <span className="material-symbols-outlined text-lg filled">local_fire_department</span>
                                <span className="text-sm font-bold">{t('daily_targets')}</span>
                            </div>
                            <div className="size-8 rounded-full bg-accent/30 flex items-center justify-center">
                                <span className="material-symbols-outlined text-accent-cream dark:text-accent text-sm">flag</span>
                            </div>
                        </div>

                        <div className="flex justify-between items-end">
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold text-neutral-500 mb-0.5">{t('total_calories')}</span>
                                <div className="text-xl font-extrabold text-neutral-900 dark:text-white">
                                    {user.dailyCalories ? user.dailyCalories : '2000'} <span className="text-sm font-semibold text-neutral-600 dark:text-neutral-400">kcal</span>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="flex flex-col items-end">
                                    <span className="text-xs font-semibold text-neutral-500 mb-0.5">{t('protein')}</span>
                                    <div className="text-lg font-bold text-neutral-800 dark:text-white">
                                        {user.dailyProtein || Math.round((user.dailyCalories || 2000) * 0.30 / 4)}g
                                    </div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-xs font-semibold text-neutral-500 mb-0.5">{t('carbs')}</span>
                                    <div className="text-lg font-bold text-neutral-800 dark:text-white">
                                        {user.dailyCarbs || Math.round((user.dailyCalories || 2000) * 0.45 / 4)}g
                                    </div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-xs font-semibold text-neutral-500 mb-0.5">{t('sugar')}</span>
                                    <div className="text-lg font-bold text-neutral-800 dark:text-white">
                                        {user.dailySugar || Math.round((user.dailyCalories || 2000) * 0.10 / 4)}g
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Consistency Calendar Section */}
            <section className="px-6 py-2 animate-enter" style={{ animationDelay: '0.2s' }}>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-neutral-900 dark:text-white text-lg font-bold">{t('consistency')}</h2>
                </div>
                <div className="bg-surface-light dark:bg-surface-dark rounded-3xl p-5 shadow-card relative z-10">
                    {/* Calendar Header with Dropdown */}
                    <div className="relative">
                        <div className="flex items-center justify-between mb-4">
                            <button onClick={() => changeCalendarMonth(-1)} className="p-1.5 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-full transition-colors">
                                <span className="material-symbols-outlined text-neutral-500 dark:text-neutral-400">chevron_left</span>
                            </button>

                            <button
                                onClick={() => setIsMonthPickerOpen(!isMonthPickerOpen)}
                                className="flex items-center gap-2 font-bold text-neutral-800 dark:text-white text-sm hover:bg-neutral-200 dark:hover:bg-neutral-700 px-3 py-1.5 rounded-xl transition-colors"
                            >
                                <span>{calendarDate.toLocaleString(language === 'zh' ? 'zh-CN' : 'default', { month: 'long', year: 'numeric' })}</span>
                                <span className={`material-symbols-outlined text-lg transition-transform duration-300 ${isMonthPickerOpen ? 'rotate-180' : ''}`}>arrow_drop_down</span>
                            </button>

                            <button onClick={() => changeCalendarMonth(1)} className="p-1.5 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-full transition-colors">
                                <span className="material-symbols-outlined text-neutral-500 dark:text-neutral-400">chevron_right</span>
                            </button>
                        </div>

                        {/* Month/Year Picker Dropdown */}
                        {isMonthPickerOpen && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setIsMonthPickerOpen(false)}></div>
                                <div className="absolute top-12 left-1/2 -translate-x-1/2 w-64 bg-white dark:bg-neutral-800 rounded-2xl shadow-float border border-neutral-100 dark:border-neutral-700 p-4 z-20 animate-enter origin-top">
                                    <div className="flex items-center justify-between mb-4 px-2">
                                        <button onClick={(e) => changeYear(-1, e)} className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-full text-neutral-600 dark:text-neutral-300">
                                            <span className="material-symbols-outlined text-sm">chevron_left</span>
                                        </button>
                                        <span className="font-bold text-neutral-900 dark:text-white">{calendarDate.getFullYear()}</span>
                                        <button onClick={(e) => changeYear(1, e)} className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-full text-neutral-600 dark:text-neutral-300">
                                            <span className="material-symbols-outlined text-sm">chevron_right</span>
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        {Array.from({ length: 12 }).map((_, i) => (
                                            <button
                                                key={i}
                                                onClick={() => selectMonth(i)}
                                                className={`py-2 rounded-lg text-xs font-bold transition-colors ${calendarDate.getMonth() === i
                                                        ? 'bg-primary text-white shadow-md'
                                                        : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                                                    }`}
                                            >
                                                {getMonthName(i)}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Days Header */}
                    <div className="grid grid-cols-7 mb-2">
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                            <div key={i} className="text-center text-xs font-semibold text-neutral-400 py-2">{d}</div>
                        ))}
                    </div>

                    {/* Days Grid */}
                    <div className="grid grid-cols-7 gap-y-2 gap-x-1">
                        {renderCalendar()}
                    </div>

                    {/* Legend */}
                    <div className="flex justify-center gap-4 mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                        <div className="flex items-center gap-1.5">
                            <div className="size-2.5 rounded-full bg-primary"></div>
                            <span className="text-[10px] text-neutral-500 font-medium">On Target</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="size-2.5 rounded-full bg-orange-400"></div>
                            <span className="text-[10px] text-neutral-500 font-medium">Over Limit</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Settings Modal */}
            {isSettingsOpen && (
                <SettingsSheet
                    theme={theme}
                    setTheme={setTheme}
                    language={language}
                    setLanguage={setLanguage}
                    onClose={toggleSettings}
                    onLogout={onLogout}
                    isLoggedIn={true}
                />
            )}

            {/* Edit Profile Modal */}
            {isEditProfileOpen && (
                <EditProfileModal user={user} onClose={toggleEditProfile} onSave={onUpdateUser} />
            )}

            <BottomNav currentScreen="PROFILE" onNavigate={onNavigate} onCameraClick={onFabClick} />
        </div>
    );
};

export default ProfileScreen;