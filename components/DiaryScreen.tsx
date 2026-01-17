import React from 'react';
import { Screen } from '../types';
import BottomNav from './BottomNav';

interface DiaryScreenProps {
  onNavigate: (screen: Screen) => void;
}

const DiaryScreen: React.FC<DiaryScreenProps> = ({ onNavigate }) => {
  return (
    <div className="relative flex h-full min-h-screen w-full flex-col max-w-md mx-auto bg-background-light dark:bg-background-dark pb-32 transition-colors duration-300">
      {/* Header */}
      <header className="flex flex-col px-6 pt-8 pb-4 sticky top-0 z-20 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white">Food Diary</h1>
          <button className="flex items-center gap-1 text-primary font-bold text-sm bg-primary/10 px-3 py-1.5 rounded-full">
             <span className="material-symbols-outlined text-lg">calendar_month</span>
             Oct 12
          </button>
        </div>
        
        {/* Date Strips */}
        <div className="flex justify-between items-center bg-surface-light dark:bg-surface-dark p-2 rounded-2xl">
           <button className="p-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200">
             <span className="material-symbols-outlined">chevron_left</span>
           </button>
           <div className="flex-1 text-center">
             <span className="text-sm font-bold text-neutral-700 dark:text-neutral-200">Today</span>
           </div>
           <button className="p-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200">
             <span className="material-symbols-outlined">chevron_right</span>
           </button>
        </div>
      </header>

      {/* Summary Banner */}
      <div className="px-6 mb-6">
        <div className="bg-neutral-900 dark:bg-white rounded-3xl p-5 text-white dark:text-neutral-900 shadow-soft">
          <div className="flex justify-between items-end mb-4">
             <div>
               <p className="text-xs font-medium opacity-70 uppercase tracking-wider mb-1">Total Calories</p>
               <div className="text-3xl font-extrabold">1,450</div>
             </div>
             <div className="text-right">
               <p className="text-xs font-medium opacity-70 mb-1">Remaining</p>
               <div className="text-xl font-bold text-primary">550</div>
             </div>
          </div>
          <div className="w-full bg-white/20 dark:bg-black/10 rounded-full h-2">
            <div className="bg-primary h-2 rounded-full" style={{width: '72%'}}></div>
          </div>
        </div>
      </div>

      {/* Meals List */}
      <main className="flex flex-col px-6 gap-6 animate-enter">
        {/* Breakfast */}
        <section>
          <div className="flex items-center justify-between mb-3">
             <h3 className="text-lg font-bold text-neutral-800 dark:text-white flex items-center gap-2">
               Breakfast
               <span className="text-xs font-normal text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-md">350 kcal</span>
             </h3>
             <button className="text-primary hover:bg-primary/10 p-1 rounded-full transition-colors">
               <span className="material-symbols-outlined">add</span>
             </button>
          </div>
          <div className="flex flex-col gap-3">
             <div className="flex items-center p-3 bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-neutral-100 dark:border-neutral-800">
                <div className="size-12 rounded-lg bg-neutral-100 bg-cover bg-center" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCL-m-VY6XKvcYscM3D_-IXKQGx2jx8em2yXnwD33SSpy05NZQcl82Oy6_AHB54sXd8n9-PKhSyLxcJ_waWBjgaE-3y_l9z5w6eWrRLCZM47Zesrhspi0Gmf0uhQ1PzWEmGvbuKKRsPidzh69W1uyMJk28tI_FMdNV2-XXGgafoSKDkXOYvXTQKhqSr9Ay98r-KpqYVsAK6xN1AKmH1KBjXtX7yfuTAE9XkvppdBChoh4C9E4tEj_NrLjqyJaGvKqpamEyArLm80FPX")'}}></div>
                <div className="ml-3 flex-1">
                  <div className="font-bold text-neutral-800 dark:text-neutral-100 text-sm">Avocado Toast</div>
                  <div className="text-xs text-neutral-500">2 slices, 1 avocado</div>
                </div>
                <div className="font-bold text-neutral-700 dark:text-neutral-300">350</div>
             </div>
          </div>
        </section>

        {/* Lunch */}
        <section>
          <div className="flex items-center justify-between mb-3">
             <h3 className="text-lg font-bold text-neutral-800 dark:text-white flex items-center gap-2">
               Lunch
               <span className="text-xs font-normal text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-md">620 kcal</span>
             </h3>
             <button className="text-primary hover:bg-primary/10 p-1 rounded-full transition-colors">
               <span className="material-symbols-outlined">add</span>
             </button>
          </div>
           <div className="flex flex-col gap-3">
             <div className="flex items-center p-3 bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-neutral-100 dark:border-neutral-800">
                <div className="size-12 rounded-lg bg-neutral-100 bg-cover bg-center" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBL6S-dLF_MhW5_YkEPdhS5HbKzncJDt85F7PuvgZKNxJDCVCghetLdo7JBkNF1hgFz3st5lyfMM9oLgsFTpB5ZRL4LAxKY4UiCPpoj0GBRaqCzH1CP6Xl-yUY5kwHetiNYyypDNZasmp_tSObUzi5rFJl2DQy87KJT8GxikqOCOZuyVQ93mPx0L9b5caml2eaIBvSszvKaau2VhhCpHtTO_XOEHniOrB_PHIdjL7OrhwpS0VCNqfbQxorMQtheh5mOWBe6NpRfHLVI")'}}></div>
                <div className="ml-3 flex-1">
                  <div className="font-bold text-neutral-800 dark:text-neutral-100 text-sm">Chicken Salad</div>
                  <div className="text-xs text-neutral-500">Grilled breast, mixed greens</div>
                </div>
                <div className="font-bold text-neutral-700 dark:text-neutral-300">420</div>
             </div>
             <div className="flex items-center p-3 bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-neutral-100 dark:border-neutral-800">
                <div className="size-12 rounded-lg bg-accent/20 flex items-center justify-center text-accent-cream text-2xl">🍎</div>
                <div className="ml-3 flex-1">
                  <div className="font-bold text-neutral-800 dark:text-neutral-100 text-sm">Apple</div>
                  <div className="text-xs text-neutral-500">Medium size</div>
                </div>
                <div className="font-bold text-neutral-700 dark:text-neutral-300">95</div>
             </div>
             <div className="flex items-center p-3 bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-neutral-100 dark:border-neutral-800">
                <div className="size-12 rounded-lg bg-orange-100 flex items-center justify-center text-orange-400 text-2xl">🥤</div>
                <div className="ml-3 flex-1">
                  <div className="font-bold text-neutral-800 dark:text-neutral-100 text-sm">Iced Tea</div>
                  <div className="text-xs text-neutral-500">Unsweetened</div>
                </div>
                <div className="font-bold text-neutral-700 dark:text-neutral-300">5</div>
             </div>
          </div>
        </section>

        {/* Dinner */}
        <section className="opacity-50">
          <div className="flex items-center justify-between mb-3">
             <h3 className="text-lg font-bold text-neutral-800 dark:text-white flex items-center gap-2">
               Dinner
               <span className="text-xs font-normal text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-md">0 kcal</span>
             </h3>
             <button className="text-primary hover:bg-primary/10 p-1 rounded-full transition-colors">
               <span className="material-symbols-outlined">add</span>
             </button>
          </div>
          <div className="border-2 border-dashed border-neutral-200 dark:border-neutral-700 rounded-xl p-6 flex flex-col items-center justify-center text-center">
            <span className="material-symbols-outlined text-neutral-300 text-3xl mb-2">dinner_dining</span>
            <p className="text-sm text-neutral-400">No dinner logged yet</p>
          </div>
        </section>
      </main>

      <BottomNav 
        currentScreen="DIARY" 
        onNavigate={onNavigate} 
        onCameraClick={() => onNavigate('CAMERA')} 
      />
    </div>
  );
};

export default DiaryScreen;