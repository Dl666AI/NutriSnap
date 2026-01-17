import React from 'react';
import { Screen, Meal } from '../types';
import { useData } from '../contexts/DataContext';
import BottomNav from './BottomNav';

interface DiaryScreenProps {
  onNavigate: (screen: Screen) => void;
  onEdit: (meal: Meal) => void;
}

const DiaryScreen: React.FC<DiaryScreenProps> = ({ onNavigate, onEdit }) => {
  const { meals, totals, targets, removeMeal } = useData();

  const caloriesLeft = Math.max(0, targets.calories - totals.calories);
  const progressPercent = Math.min(100, Math.round((totals.calories / targets.calories) * 100));

  // Group meals by type
  const breakfastMeals = meals.filter(m => m.type === 'Breakfast');
  const lunchMeals = meals.filter(m => m.type === 'Lunch');
  const dinnerMeals = meals.filter(m => m.type === 'Dinner');
  const snackMeals = meals.filter(m => m.type === 'Snack');

  const getSectionCalories = (sectionMeals: Meal[]) => sectionMeals.reduce((acc, m) => acc + m.calories, 0);

  const renderMealSection = (title: string, sectionMeals: Meal[]) => {
    const sectionCals = getSectionCalories(sectionMeals);
    
    if (sectionMeals.length === 0) {
      return (
        <section className="opacity-50">
          <div className="flex items-center justify-between mb-3">
             <h3 className="text-lg font-bold text-neutral-800 dark:text-white flex items-center gap-2">
               {title}
               <span className="text-xs font-normal text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-md">0 kcal</span>
             </h3>
             <button onClick={() => onNavigate('CAMERA')} className="text-primary hover:bg-primary/10 p-1 rounded-full transition-colors">
               <span className="material-symbols-outlined">add</span>
             </button>
          </div>
          <div className="border-2 border-dashed border-neutral-200 dark:border-neutral-700 rounded-xl p-4 flex flex-col items-center justify-center text-center">
            <p className="text-xs text-neutral-400">No {title.toLowerCase()} logged yet</p>
          </div>
        </section>
      );
    }

    return (
      <section>
        <div className="flex items-center justify-between mb-3">
           <h3 className="text-lg font-bold text-neutral-800 dark:text-white flex items-center gap-2">
             {title}
             <span className="text-xs font-normal text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-md">{sectionCals} kcal</span>
           </h3>
           <button onClick={() => onNavigate('CAMERA')} className="text-primary hover:bg-primary/10 p-1 rounded-full transition-colors">
             <span className="material-symbols-outlined">add</span>
           </button>
        </div>
        <div className="flex flex-col gap-3">
          {sectionMeals.map(meal => (
            <div key={meal.id} className="relative group">
              <div 
                onClick={() => onEdit(meal)}
                className="flex items-center p-3 bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-neutral-100 dark:border-neutral-800 cursor-pointer hover:border-primary/30 transition-colors"
              >
                  {meal.imageUrl ? (
                    <div className="size-12 rounded-lg bg-neutral-100 bg-cover bg-center shrink-0" style={{backgroundImage: `url("${meal.imageUrl}")`}}></div>
                  ) : (
                    <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-primary text-xl">description</span>
                    </div>
                  )}
                  <div className="ml-3 flex-1 min-w-0">
                    <div className="font-bold text-neutral-800 dark:text-neutral-100 text-sm truncate">{meal.name}</div>
                    <div className="text-xs text-neutral-500">{meal.time}</div>
                  </div>
                  <div className="font-bold text-neutral-700 dark:text-neutral-300 ml-2">{meal.calories}</div>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); removeMeal(meal.id); }}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:scale-110 z-10"
              >
                <span className="material-symbols-outlined text-xs">close</span>
              </button>
            </div>
          ))}
        </div>
      </section>
    );
  };

  return (
    <div className="relative flex h-full min-h-screen w-full flex-col max-w-md mx-auto bg-background-light dark:bg-background-dark pb-32 transition-colors duration-300">
      <header className="flex flex-col px-6 pt-8 pb-4 sticky top-0 z-20 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white">Food Diary</h1>
          <button className="flex items-center gap-1 text-primary font-bold text-sm bg-primary/10 px-3 py-1.5 rounded-full">
             <span className="material-symbols-outlined text-lg">calendar_month</span>
             Today
          </button>
        </div>
        
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

      <div className="px-6 mb-6">
        <div className="bg-neutral-900 dark:bg-white rounded-3xl p-5 text-white dark:text-neutral-900 shadow-soft">
          <div className="flex justify-between items-end mb-4">
             <div>
               <p className="text-xs font-medium opacity-70 uppercase tracking-wider mb-1">Total Calories</p>
               <div className="text-3xl font-extrabold">{totals.calories}</div>
             </div>
             <div className="text-right">
               <p className="text-xs font-medium opacity-70 mb-1">Remaining</p>
               <div className="text-xl font-bold text-primary">{caloriesLeft}</div>
             </div>
          </div>
          <div className="w-full bg-white/20 dark:bg-black/10 rounded-full h-2">
            <div className="bg-primary h-2 rounded-full transition-all duration-700" style={{width: `${progressPercent}%`}}></div>
          </div>
        </div>
      </div>

      <main className="flex flex-col px-6 gap-8 animate-enter">
        {renderMealSection('Breakfast', breakfastMeals)}
        {renderMealSection('Lunch', lunchMeals)}
        {renderMealSection('Dinner', dinnerMeals)}
        {renderMealSection('Snack', snackMeals)}
        
        <div className="h-4"></div>
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