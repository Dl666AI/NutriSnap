import React, { useState } from 'react';
import { Screen, Theme } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import BottomNav from './BottomNav';

interface ProfileScreenProps {
  onNavigate: (screen: Screen) => void;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ onNavigate }) => {
  const { theme, setTheme } = useTheme();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const days = Array.from({ length: 14 }, (_, i) => i + 1);

  const toggleSettings = () => setIsSettingsOpen(!isSettingsOpen);

  return (
    <div className="relative flex h-full min-h-screen w-full flex-col max-w-md mx-auto bg-background-light dark:bg-background-dark pb-32 transition-colors duration-300">
      {/* Header Section */}
      <header className="flex items-center justify-between px-6 pt-8 pb-4 bg-background-light dark:bg-background-dark sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <div className="relative group cursor-pointer">
            <div className="size-14 rounded-full overflow-hidden border-2 border-white dark:border-background-dark shadow-sm ring-2 ring-primary/20">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuC0gW9h4jpUlof1JdRQmDgb7NdLnGhgk8TTFIYbq37kOBmggLvhuBFpQWk4sIlZ9M8UofKAtbsz8UdJOLiu7yIi6mFtFodo7TRfEE917C75QBvjDOls1_vKaH-3oPafSKBOQHqhTvW2yfQFMiHJedECnO1Od6YlyN_kMLb4pBBQFi92EKXusPuvcFiXwrmWbMDWxYnuY72RR7n4m5t8-vzPmcbIpGqK6ZrMbu0KlU90MsT9YSJnMhuN0auf6bUpG7HTUJZXhf_jeblX" 
                alt="User Profile" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute bottom-0 right-0 size-4 bg-primary rounded-full border-2 border-white dark:border-background-dark"></div>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Welcome back,</span>
            <h1 className="text-xl font-bold text-neutral-900 dark:text-white leading-tight">Jessica</h1>
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
          {/* Days Header */}
          <div className="grid grid-cols-7 mb-2">
            {['S','M','T','W','T','F','S'].map((d, i) => (
              <div key={i} className="text-center text-xs font-semibold text-neutral-400 py-2">{d}</div>
            ))}
          </div>
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-y-2">
            <div className="aspect-square"></div>
            <div className="aspect-square"></div>
            <div className="aspect-square"></div>
            <button className="aspect-square flex items-center justify-center rounded-full text-neutral-700 dark:text-neutral-300 text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-700">1</button>
            <button className="aspect-square flex items-center justify-center rounded-full text-neutral-700 dark:text-neutral-300 text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-700">2</button>
            <button className="aspect-square flex flex-col items-center justify-center rounded-full text-neutral-700 dark:text-neutral-300 text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-700">
              3 <span className="block w-1 h-1 bg-neutral-300 rounded-full mt-0.5"></span>
            </button>
            {/* Logged Day */}
            <button className="aspect-square flex items-center justify-center rounded-full bg-primary/20 dark:bg-primary/30 text-primary-dark dark:text-white text-sm font-bold">4</button>
            
            {/* Today */}
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
          {/* Weight Card */}
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
                <span className="text-[10px] text-neutral-400 ml-1">vs last week</span>
              </div>
            </div>
          </div>
          
          {/* Streak Card */}
          <div className="bg-accent/20 dark:bg-accent/10 p-5 rounded-3xl shadow-sm flex flex-col justify-between h-40 border border-accent/30">
            <div className="flex items-center justify-between text-neutral-700 dark:text-neutral-300">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-lg filled">local_fire_department</span>
                <span className="text-sm font-bold">Streak</span>
              </div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-neutral-900 dark:text-white">12 <span className="text-base font-semibold">Days</span></div>
              <p className="text-xs font-medium text-neutral-600 dark:text-neutral-400 mt-2">You're on fire! Keep it up.</p>
            </div>
          </div>
          
          {/* Avg Intake Card */}
          <div className="col-span-2 bg-white dark:bg-surface-dark p-5 rounded-3xl shadow-card border border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400 mb-1">
                <span className="material-symbols-outlined text-lg">restaurant</span>
                <span className="text-sm font-medium">Avg. Intake</span>
              </div>
              <div className="text-2xl font-extrabold text-neutral-900 dark:text-white">1,950 <span className="text-base font-semibold text-neutral-500">kcal</span></div>
              <p className="text-xs text-neutral-400">Daily average this week</p>
            </div>
            {/* Circular Progress Mock */}
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

      {/* Menu List */}
      <section className="px-6 py-2 pb-8 animate-enter" style={{animationDelay: '0.3s'}}>
        <div className="bg-surface-light dark:bg-surface-dark rounded-3xl p-2 shadow-card">
          <button className="w-full flex items-center justify-between p-4 hover:bg-white dark:hover:bg-neutral-800 rounded-2xl transition-colors group">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center text-neutral-600 dark:text-neutral-300 group-hover:bg-primary/20 group-hover:text-primary-dark transition-colors">
                <span className="material-symbols-outlined">flag</span>
              </div>
              <span className="font-semibold text-neutral-700 dark:text-neutral-200">My Goals</span>
            </div>
            <span className="material-symbols-outlined text-neutral-400">chevron_right</span>
          </button>
          
          <div className="h-px bg-neutral-200 dark:bg-neutral-700 mx-4"></div>
          
          <button className="w-full flex items-center justify-between p-4 hover:bg-white dark:hover:bg-neutral-800 rounded-2xl transition-colors group">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center text-neutral-600 dark:text-neutral-300 group-hover:bg-primary/20 group-hover:text-primary-dark transition-colors">
                <span className="material-symbols-outlined">notifications</span>
              </div>
              <span className="font-semibold text-neutral-700 dark:text-neutral-200">Reminders</span>
            </div>
            <span className="material-symbols-outlined text-neutral-400">chevron_right</span>
          </button>
          
           <div className="h-px bg-neutral-200 dark:bg-neutral-700 mx-4"></div>

          <button className="w-full flex items-center justify-between p-4 hover:bg-white dark:hover:bg-neutral-800 rounded-2xl transition-colors group">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center text-neutral-600 dark:text-neutral-300 group-hover:bg-primary/20 group-hover:text-primary-dark transition-colors">
                <span className="material-symbols-outlined">download</span>
              </div>
              <span className="font-semibold text-neutral-700 dark:text-neutral-200">Export Data</span>
            </div>
            <span className="material-symbols-outlined text-neutral-400">chevron_right</span>
          </button>
        </div>
      </section>

      {/* Settings Bottom Sheet */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col justify-end">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={toggleSettings}
          ></div>
          
          {/* Sheet */}
          <div className="relative bg-white dark:bg-background-dark rounded-t-3xl p-6 shadow-2xl animate-enter border-t border-neutral-100 dark:border-neutral-800 max-w-md mx-auto w-full">
            <div className="flex items-center justify-between mb-6">
               <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Settings</h2>
               <button onClick={toggleSettings} className="p-2 -mr-2 text-neutral-500">
                  <span className="material-symbols-outlined">close</span>
               </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-3">Appearance</h3>
                <div className="bg-surface-light dark:bg-surface-dark rounded-2xl p-2 space-y-1">
                  
                  {/* System */}
                  <button 
                    onClick={() => setTheme('system')}
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors ${theme === 'system' ? 'bg-white dark:bg-neutral-800 shadow-sm' : 'hover:bg-white/50 dark:hover:bg-neutral-800/50'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`size-8 rounded-full flex items-center justify-center ${theme === 'system' ? 'bg-primary text-white' : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400'}`}>
                         <span className="material-symbols-outlined text-lg">settings_brightness</span>
                      </div>
                      <span className="font-medium text-neutral-900 dark:text-white">Automatic (System)</span>
                    </div>
                    {theme === 'system' && <span className="material-symbols-outlined text-primary">check_circle</span>}
                  </button>

                  {/* Light */}
                  <button 
                    onClick={() => setTheme('light')}
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors ${theme === 'light' ? 'bg-white dark:bg-neutral-800 shadow-sm' : 'hover:bg-white/50 dark:hover:bg-neutral-800/50'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`size-8 rounded-full flex items-center justify-center ${theme === 'light' ? 'bg-primary text-white' : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400'}`}>
                         <span className="material-symbols-outlined text-lg">light_mode</span>
                      </div>
                      <span className="font-medium text-neutral-900 dark:text-white">Light Mode</span>
                    </div>
                    {theme === 'light' && <span className="material-symbols-outlined text-primary">check_circle</span>}
                  </button>

                  {/* Dark */}
                  <button 
                    onClick={() => setTheme('dark')}
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors ${theme === 'dark' ? 'bg-white dark:bg-neutral-800 shadow-sm' : 'hover:bg-white/50 dark:hover:bg-neutral-800/50'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`size-8 rounded-full flex items-center justify-center ${theme === 'dark' ? 'bg-primary text-white' : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400'}`}>
                         <span className="material-symbols-outlined text-lg">dark_mode</span>
                      </div>
                      <span className="font-medium text-neutral-900 dark:text-white">Dark Mode</span>
                    </div>
                    {theme === 'dark' && <span className="material-symbols-outlined text-primary">check_circle</span>}
                  </button>

                </div>
              </div>
              
              <div className="pt-2 text-center">
                 <p className="text-xs text-neutral-400">NutriSnap v1.0.2</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <BottomNav 
        currentScreen="PROFILE" 
        onNavigate={onNavigate} 
        onCameraClick={() => onNavigate('CAMERA')} 
      />
    </div>
  );
};

export default ProfileScreen;