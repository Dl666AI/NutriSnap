import React from 'react';
import { Screen, User } from '../types';
import { useData } from '../contexts/DataContext';
import BottomNav from './BottomNav';

interface HomeScreenProps {
  onNavigate: (screen: Screen) => void;
  user?: User | null;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate, user }) => {
  const { totals, targets, meals } = useData();

  const caloriesLeft = Math.max(0, targets.calories - totals.calories);
  const progressPercent = Math.min(100, Math.round((totals.calories / targets.calories) * 100));
  
  // Calculate specific macro progress
  const proteinLeft = Math.max(0, targets.protein - totals.protein);
  const carbsLeft = Math.max(0, targets.carbs - totals.carbs);
  const fatLeft = Math.max(0, targets.fat - totals.fat);

  const proteinProgress = Math.min(100, (totals.protein / targets.protein) * 100);
  const carbsProgress = Math.min(100, (totals.carbs / targets.carbs) * 100);
  const fatProgress = Math.min(100, (totals.fat / targets.fat) * 100);

  // Get recent meals (first 3)
  const recentMeals = meals.slice(0, 3);

  // Calculate degree for conic gradient (360 * percent / 100)
  // We want it to start from top, but CSS conic gradient starts from 0deg (top).
  // Actually, let's just map the percentage to the color stop.
  const gradientString = `conic-gradient(#9cab8c 0% ${progressPercent}%, #F8DDA4 ${progressPercent}% 100%)`;

  return (
    <div className="relative flex h-full min-h-screen w-full flex-col max-w-md mx-auto bg-background-light dark:bg-background-dark pb-32 transition-colors duration-300">
      {/* Header */}
      <header className="flex items-center justify-between px-6 pt-6 pb-2">
        <div className="flex items-center gap-3">
          <div 
            className="bg-center bg-no-repeat bg-cover rounded-full size-12 ring-2 ring-primary/20 bg-neutral-100 dark:bg-surface-dark flex items-center justify-center overflow-hidden" 
            style={user?.photoUrl ? {backgroundImage: `url("${user.photoUrl}")`} : {}}
          >
            {!user?.photoUrl && <span className="material-symbols-outlined text-neutral-400">person</span>}
          </div>
          <div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">Today</p>
            <h2 className="text-xl font-bold leading-tight dark:text-white">
                {user ? `Hello, ${user.name.split(' ')[0]}` : 'Welcome, Guest'}
            </h2>
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
                background: gradientString,
                transform: 'rotate(0deg)'
              }}
            ></div>
            {/* Inner Circle (Hole) */}
            <div className="absolute inset-4 rounded-full bg-background-light dark:bg-background-dark flex flex-col items-center justify-center z-10">
              <span className="material-symbols-outlined text-primary mb-1 text-4xl filled">local_fire_department</span>
              <h1 className="text-5xl font-extrabold tracking-tight text-neutral-800 dark:text-white">{caloriesLeft}</h1>
              <p className="text-sm font-medium text-neutral-400 uppercase tracking-wider mt-1">Kcal Left</p>
              
              <div className="mt-4 flex items-center gap-2 bg-surface-light dark:bg-surface-dark px-3 py-1.5 rounded-full">
                <div className="size-2 rounded-full bg-primary"></div>
                <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-300">Target: {targets.calories}</span>
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
              <div className="w-full bg-white dark:bg-black rounded-full h-1.5 mb-2 overflow-hidden">
                <div className="bg-primary h-1.5 rounded-full transition-all duration-1000" style={{width: `${proteinProgress}%`}}></div>
              </div>
              <p className="text-xs text-neutral-500 font-medium">{proteinLeft}g left</p>
            </div>
            
            {/* Carbs */}
            <div className="flex flex-col bg-surface-light dark:bg-surface-dark p-4 rounded-2xl shadow-sm border border-transparent dark:border-neutral-800 hover:border-primary/20 transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">Carbs</span>
                <span className="material-symbols-outlined text-[#e0b057] text-lg">bakery_dining</span>
              </div>
              <div className="w-full bg-white dark:bg-black rounded-full h-1.5 mb-2 overflow-hidden">
                <div className="bg-[#F8DDA4] h-1.5 rounded-full transition-all duration-1000" style={{width: `${carbsProgress}%`}}></div>
              </div>
              <p className="text-xs text-neutral-500 font-medium">{carbsLeft}g left</p>
            </div>
            
            {/* Fat */}
            <div className="flex flex-col bg-surface-light dark:bg-surface-dark p-4 rounded-2xl shadow-sm border border-transparent dark:border-neutral-800 hover:border-primary/20 transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">Fat</span>
                <span className="material-symbols-outlined text-red-400 text-lg">water_drop</span>
              </div>
              <div className="w-full bg-white dark:bg-black rounded-full h-1.5 mb-2 overflow-hidden">
                <div className="bg-red-300 h-1.5 rounded-full transition-all duration-1000" style={{width: `${fatProgress}%`}}></div>
              </div>
              <p className="text-xs text-neutral-500 font-medium">{fatLeft}g left</p>
            </div>
          </div>
        </div>

        {/* Recent Meals */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold dark:text-white">Recent Meals</h3>
            <button onClick={() => onNavigate('DIARY')} className="text-primary text-sm font-semibold hover:underline">View All</button>
          </div>
          <div className="flex flex-col gap-4">
            {recentMeals.length > 0 ? (
              recentMeals.map((meal) => (
                <div key={meal.id} className="flex items-center p-3 pr-4 bg-white dark:bg-surface-dark rounded-xl shadow-soft border border-neutral-100 dark:border-neutral-800 transition-transform active:scale-[0.99]">
                  <div 
                    className="size-16 shrink-0 rounded-lg bg-cover bg-center overflow-hidden" 
                    style={{backgroundImage: `url("${meal.imageUrl}")`}}
                  ></div>
                  <div className="ml-4 flex-1">
                    <h4 className="font-bold text-neutral-800 dark:text-neutral-100">{meal.name}</h4>
                    <p className="text-xs text-neutral-500 mt-1">{meal.type} • {meal.time}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary text-lg">{meal.calories}</p>
                    <p className="text-[10px] uppercase font-bold text-neutral-400">kcal</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center p-8 border-2 border-dashed border-neutral-200 dark:border-neutral-700 rounded-xl">
                 <p className="text-sm text-neutral-400 font-medium">No meals logged yet today.</p>
              </div>
            )}

            {/* Hint Card */}
            {caloriesLeft > 0 && (
              <div className="flex items-center justify-center p-6 border-2 border-dashed border-neutral-200 dark:border-neutral-700 rounded-xl cursor-pointer hover:bg-neutral-50 dark:hover:bg-white/5 transition-colors" onClick={() => onNavigate('CAMERA')}>
                <p className="text-sm text-neutral-400 font-medium">Tap to log your next meal</p>
              </div>
            )}
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