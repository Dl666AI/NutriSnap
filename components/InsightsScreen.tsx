import React from 'react';
import { Screen } from '../types';
import BottomNav from './BottomNav';

interface InsightsScreenProps {
  onNavigate: (screen: Screen) => void;
  onFabClick: () => void;
}

const InsightsScreen: React.FC<InsightsScreenProps> = ({ onNavigate, onFabClick }) => {
  return (
    <div className="relative flex h-full min-h-screen w-full flex-col max-w-md mx-auto bg-background-light dark:bg-background-dark pb-32 transition-colors duration-300">
      {/* Header */}
      <header className="flex flex-col px-6 pt-8 pb-4 sticky top-0 z-20 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md">
        <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white">Insights</h1>
      </header>

      <main className="flex flex-col px-6 gap-8 animate-enter">
        {/* Weekly Calories Chart */}
        <section>
          <div className="flex items-center justify-between mb-4">
             <h3 className="text-lg font-bold text-neutral-800 dark:text-white">Calories this week</h3>
             <span className="text-xs font-medium text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded-md">Oct 6 - 12</span>
          </div>
          
          <div className="bg-white dark:bg-surface-dark p-6 rounded-3xl shadow-card border border-neutral-100 dark:border-neutral-800">
            <div className="flex items-end justify-between h-40 gap-2">
              {[
                { day: 'M', val: 60, active: false },
                { day: 'T', val: 85, active: false },
                { day: 'W', val: 45, active: false },
                { day: 'T', val: 90, active: false },
                { day: 'F', val: 75, active: false },
                { day: 'S', val: 100, active: false },
                { day: 'S', val: 50, active: true },
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col items-center gap-2 flex-1">
                  <div className="w-full relative group">
                     {/* Tooltip */}
                     <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-neutral-800 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                       {Math.round(item.val * 20 + 200)} kcal
                     </div>
                     <div 
                        className={`w-full rounded-t-lg rounded-b-sm transition-all duration-500 ${item.active ? 'bg-primary' : 'bg-neutral-100 dark:bg-neutral-700 hover:bg-primary/50'}`}
                        style={{ height: `${item.val * 1.5}px` }}
                     ></div>
                  </div>
                  <span className={`text-xs font-semibold ${item.active ? 'text-primary' : 'text-neutral-400'}`}>{item.day}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-700 flex justify-between items-center text-sm">
               <span className="text-neutral-500">Weekly Average</span>
               <span className="font-bold text-neutral-900 dark:text-white">1,850 kcal</span>
            </div>
          </div>
        </section>

        {/* Macro Distribution Pie */}
        <section>
          <h3 className="text-lg font-bold text-neutral-800 dark:text-white mb-4">Macro Distribution</h3>
          <div className="bg-white dark:bg-surface-dark p-6 rounded-3xl shadow-card border border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
             <div className="relative size-32">
                <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                  {/* Background Circle */}
                  <path className="text-neutral-100 dark:text-neutral-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4"></path>
                  {/* Protein segment (30%) */}
                  <path className="text-primary" strokeDasharray="30, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4"></path>
                  {/* Carbs segment (50%) - needs offset. 30 offset. */}
                  <path className="text-accent" strokeDasharray="50, 100" strokeDashoffset="-30" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4"></path>
                  {/* Fat segment (20%) - needs offset. 80 offset. */}
                  <path className="text-red-300" strokeDasharray="20, 100" strokeDashoffset="-80" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4"></path>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-xs text-neutral-400">Total</span>
                  <span className="text-lg font-bold text-neutral-900 dark:text-white">100%</span>
                </div>
             </div>
             
             <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                   <div className="size-3 rounded-full bg-accent"></div>
                   <div className="flex flex-col">
                      <span className="text-xs font-bold text-neutral-900 dark:text-white">50% Carbs</span>
                      <span className="text-[10px] text-neutral-500">125g consumed</span>
                   </div>
                </div>
                <div className="flex items-center gap-2">
                   <div className="size-3 rounded-full bg-primary"></div>
                   <div className="flex flex-col">
                      <span className="text-xs font-bold text-neutral-900 dark:text-white">30% Protein</span>
                      <span className="text-[10px] text-neutral-500">75g consumed</span>
                   </div>
                </div>
                <div className="flex items-center gap-2">
                   <div className="size-3 rounded-full bg-red-300"></div>
                   <div className="flex flex-col">
                      <span className="text-xs font-bold text-neutral-900 dark:text-white">20% Fat</span>
                      <span className="text-[10px] text-neutral-500">22g consumed</span>
                   </div>
                </div>
             </div>
          </div>
        </section>

        {/* Weight Trend */}
        <section className="mb-6">
           <h3 className="text-lg font-bold text-neutral-800 dark:text-white mb-4">Weight Trend</h3>
           <div className="bg-primary/5 dark:bg-primary/10 rounded-3xl p-6 relative overflow-hidden h-48 flex items-center justify-center border border-primary/20">
              <svg className="w-full h-full absolute inset-0 text-primary" preserveAspectRatio="none">
                 <path d="M0,150 Q50,140 100,100 T200,80 T300,120 T400,60" fill="none" stroke="currentColor" strokeWidth="3" vectorEffect="non-scaling-stroke"/>
                 <circle cx="100" cy="100" r="4" fill="currentColor" />
                 <circle cx="200" cy="80" r="4" fill="currentColor" />
                 <circle cx="300" cy="120" r="4" fill="currentColor" />
                 <circle cx="400" cy="60" r="6" fill="white" stroke="currentColor" strokeWidth="2" />
              </svg>
              <div className="absolute top-4 left-6">
                <div className="text-3xl font-extrabold text-primary-dark dark:text-primary">68.5 <span className="text-sm font-medium">kg</span></div>
                <span className="text-xs text-primary-dark/70 dark:text-primary/70">Current Weight</span>
              </div>
           </div>
        </section>
      </main>

      <BottomNav 
        currentScreen="INSIGHTS" 
        onNavigate={onNavigate} 
        onCameraClick={onFabClick} 
      />
    </div>
  );
};

export default InsightsScreen;