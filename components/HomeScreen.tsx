import React from 'react';
import { Screen } from '../types';
import BottomNav from './BottomNav';

interface HomeScreenProps {
  onNavigate: (screen: Screen) => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate }) => {
  return (
    <div className="relative flex h-full min-h-screen w-full flex-col max-w-md mx-auto bg-background-light dark:bg-background-dark pb-32 transition-colors duration-300">
      {/* Header */}
      <header className="flex items-center justify-between px-6 pt-6 pb-2">
        <div className="flex items-center gap-3">
          <div 
            className="bg-center bg-no-repeat bg-cover rounded-full size-12 ring-2 ring-primary/20" 
            style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBwHz6iLXVJKiq6liBVgiJUIOoqNEa4lUyT3TZYuXC4u0zqgoGMBvwIVJ1MZe_l5LuJJXhbS3PLRXZSszMeVeykfGUT1KUC4cge1jwwx8dwZvxDCqrCnYg-qosb4SliKmXs6qFxqTGQEPS-7xOS8WqN7twtLfRE5OgCj8uPbNDWn5rouydbsmQJOMQnHrxOBSpTv3-ZfMaGrf5p2OAUSUpv0zGdU29UulA9Uh240whR-YxcqUo_lq0v0Op16k3V5gN1rDzpqjgqYxvB")'}}
          ></div>
          <div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">Monday, 12 Oct</p>
            <h2 className="text-xl font-bold leading-tight dark:text-white">Hello, Alex</h2>
          </div>
        </div>
        <button className="flex items-center justify-center size-10 rounded-full bg-surface-light dark:bg-surface-dark text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 transition-colors">
          <span className="material-symbols-outlined text-[24px]">notifications</span>
        </button>
      </header>

      {/* Main Scrollable Content */}
      <main className="flex flex-col px-6 animate-enter">
        {/* Hero Ring Chart */}
        <div className="flex flex-col items-center justify-center py-8">
          <div className="relative flex items-center justify-center size-64">
            {/* The Ring Chart Track & Progress */}
            <div className="absolute inset-0 rounded-full shadow-soft bg-white dark:bg-surface-dark"></div>
            {/* The Actual Conic Gradient */}
            <div 
              className="absolute inset-0 rounded-full transition-all duration-1000"
              style={{
                background: 'conic-gradient(#9cab8c 0% 65%, #F8DDA4 65% 100%)',
                transform: 'rotate(-117deg)'
              }}
            ></div>
            {/* Inner Circle (Hole) */}
            <div className="absolute inset-4 rounded-full bg-background-light dark:bg-background-dark flex flex-col items-center justify-center z-10">
              <span className="material-symbols-outlined text-primary mb-1 text-4xl filled">local_fire_department</span>
              <h1 className="text-5xl font-extrabold tracking-tight text-neutral-800 dark:text-white">1,250</h1>
              <p className="text-sm font-medium text-neutral-400 uppercase tracking-wider mt-1">Kcal Left</p>
              
              <div className="mt-4 flex items-center gap-2 bg-surface-light dark:bg-surface-dark px-3 py-1.5 rounded-full">
                <div className="size-2 rounded-full bg-primary"></div>
                <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-300">Target: 2,000</span>
              </div>
            </div>
          </div>
          
          {/* Legend */}
          <div className="flex justify-center gap-8 mt-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary"></div>
              <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Consumed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#F8DDA4]"></div>
              <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Remaining</span>
            </div>
          </div>
        </div>

        {/* Macros Cards */}
        <div className="mt-2">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2 dark:text-white">
            Today's Macros
            <span className="material-symbols-outlined text-primary text-sm">info</span>
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {/* Protein */}
            <div className="flex flex-col bg-surface-light dark:bg-surface-dark p-4 rounded-2xl shadow-sm border border-transparent dark:border-neutral-800 hover:border-primary/20 transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">Protein</span>
                <span className="material-symbols-outlined text-primary text-lg">egg_alt</span>
              </div>
              <div className="w-full bg-white dark:bg-black rounded-full h-1.5 mb-2">
                <div className="bg-primary h-1.5 rounded-full" style={{width: '75%'}}></div>
              </div>
              <p className="text-xs text-neutral-500 font-medium">80g left</p>
            </div>
            
            {/* Carbs */}
            <div className="flex flex-col bg-surface-light dark:bg-surface-dark p-4 rounded-2xl shadow-sm border border-transparent dark:border-neutral-800 hover:border-primary/20 transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">Carbs</span>
                <span className="material-symbols-outlined text-[#e0b057] text-lg">bakery_dining</span>
              </div>
              <div className="w-full bg-white dark:bg-black rounded-full h-1.5 mb-2">
                <div className="bg-[#F8DDA4] h-1.5 rounded-full" style={{width: '45%'}}></div>
              </div>
              <p className="text-xs text-neutral-500 font-medium">120g left</p>
            </div>
            
            {/* Fat */}
            <div className="flex flex-col bg-surface-light dark:bg-surface-dark p-4 rounded-2xl shadow-sm border border-transparent dark:border-neutral-800 hover:border-primary/20 transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">Fat</span>
                <span className="material-symbols-outlined text-red-400 text-lg">water_drop</span>
              </div>
              <div className="w-full bg-white dark:bg-black rounded-full h-1.5 mb-2">
                <div className="bg-red-300 h-1.5 rounded-full" style={{width: '30%'}}></div>
              </div>
              <p className="text-xs text-neutral-500 font-medium">40g left</p>
            </div>
          </div>
        </div>

        {/* Recent Meals */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold dark:text-white">Today's Meals</h3>
            <button className="text-primary text-sm font-semibold hover:underline">View All</button>
          </div>
          <div className="flex flex-col gap-4">
            {/* Meal Card 1 */}
            <div className="flex items-center p-3 pr-4 bg-white dark:bg-surface-dark rounded-xl shadow-soft border border-neutral-100 dark:border-neutral-800 transition-transform active:scale-[0.99]">
              <div 
                className="size-16 shrink-0 rounded-lg bg-cover bg-center overflow-hidden" 
                style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCL-m-VY6XKvcYscM3D_-IXKQGx2jx8em2yXnwD33SSpy05NZQcl82Oy6_AHB54sXd8n9-PKhSyLxcJ_waWBjgaE-3y_l9z5w6eWrRLCZM47Zesrhspi0Gmf0uhQ1PzWEmGvbuKKRsPidzh69W1uyMJk28tI_FMdNV2-XXGgafoSKDkXOYvXTQKhqSr9Ay98r-KpqYVsAK6xN1AKmH1KBjXtX7yfuTAE9XkvppdBChoh4C9E4tEj_NrLjqyJaGvKqpamEyArLm80FPX")'}}
              ></div>
              <div className="ml-4 flex-1">
                <h4 className="font-bold text-neutral-800 dark:text-neutral-100">Avocado Toast</h4>
                <p className="text-xs text-neutral-500 mt-1">Breakfast • 8:30 AM</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-primary text-lg">350</p>
                <p className="text-[10px] uppercase font-bold text-neutral-400">kcal</p>
              </div>
            </div>

            {/* Meal Card 2 */}
            <div className="flex items-center p-3 pr-4 bg-white dark:bg-surface-dark rounded-xl shadow-soft border border-neutral-100 dark:border-neutral-800 transition-transform active:scale-[0.99]">
              <div 
                className="size-16 shrink-0 rounded-lg bg-cover bg-center overflow-hidden" 
                style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBL6S-dLF_MhW5_YkEPdhS5HbKzncJDt85F7PuvgZKNxJDCVCghetLdo7JBkNF1hgFz3st5lyfMM9oLgsFTpB5ZRL4LAxKY4UiCPpoj0GBRaqCzH1CP6Xl-yUY5kwHetiNYyypDNZasmp_tSObUzi5rFJl2DQy87KJT8GxikqOCOZuyVQ93mPx0L9b5caml2eaIBvSszvKaau2VhhCpHtTO_XOEHniOrB_PHIdjL7OrhwpS0VCNqfbQxorMQtheh5mOWBe6NpRfHLVI")'}}
              ></div>
              <div className="ml-4 flex-1">
                <h4 className="font-bold text-neutral-800 dark:text-neutral-100">Chicken Salad</h4>
                <p className="text-xs text-neutral-500 mt-1">Lunch • 1:15 PM</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-primary text-lg">420</p>
                <p className="text-[10px] uppercase font-bold text-neutral-400">kcal</p>
              </div>
            </div>

            {/* Empty State / Placeholder */}
            <div className="flex items-center justify-center p-6 border-2 border-dashed border-neutral-200 dark:border-neutral-700 rounded-xl">
              <p className="text-sm text-neutral-400 font-medium">Log your dinner to complete the day</p>
            </div>
          </div>
        </div>
      </main>

      <BottomNav 
        currentScreen="HOME" 
        onNavigate={onNavigate} 
        onCameraClick={() => onNavigate('CAMERA')} 
      />
    </div>
  );
};

export default HomeScreen;