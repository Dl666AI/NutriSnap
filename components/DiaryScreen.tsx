import React, { useState, useEffect } from 'react';
import { Screen, Meal } from '../types';
import { useData } from '../contexts/DataContext';
import BottomNav from './BottomNav';

interface DiaryScreenProps {
  onNavigate: (screen: Screen) => void;
  onEdit: (meal: Meal) => void;
  onAddMeal: (date: string) => void;
  onFabClick: () => void;
}

const DiaryScreen: React.FC<DiaryScreenProps> = ({ onNavigate, onEdit, onAddMeal, onFabClick }) => {
  const { meals, targets, removeMeal, getTodayString } = useData();
  
  // State for current selected date (Data View)
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  
  // State for Calendar Picker
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [pickerDate, setPickerDate] = useState<Date>(new Date()); // Tracks the month currently being viewed in picker

  // Formatting helpers
  const formatDateForComparison = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const selectedDateStr = formatDateForComparison(currentDate);
  const todayStr = getTodayString();
  const isToday = selectedDateStr === todayStr;

  // Filter meals for selected date
  const dayMeals = meals.filter(m => m.date === selectedDateStr);

  // Calculate totals for this specific day
  const dayTotals = dayMeals.reduce((acc, meal) => {
    acc.calories += (meal.calories || 0);
    return acc;
  }, { calories: 0 });

  const caloriesLeft = Math.max(0, targets.calories - dayTotals.calories);
  const progressPercent = Math.min(100, Math.round((dayTotals.calories / targets.calories) * 100));

  // Group meals by type
  const breakfastMeals = dayMeals.filter(m => m.type === 'Breakfast');
  const lunchMeals = dayMeals.filter(m => m.type === 'Lunch');
  const dinnerMeals = dayMeals.filter(m => m.type === 'Dinner');
  const snackMeals = dayMeals.filter(m => m.type === 'Snack');

  const getSectionCalories = (sectionMeals: Meal[]) => sectionMeals.reduce((acc, m) => acc + m.calories, 0);

  // --- Date Navigation Handlers ---

  const handlePrevDay = () => {
    const prev = new Date(currentDate);
    prev.setDate(prev.getDate() - 1);
    setCurrentDate(prev);
    setPickerDate(prev); // Sync picker view
  };

  const handleNextDay = () => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + 1);
    setCurrentDate(next);
    setPickerDate(next); // Sync picker view
  };

  const handleResetToday = () => {
    const now = new Date();
    setCurrentDate(now);
    setPickerDate(now);
    setIsCalendarOpen(false);
  };

  const handleDateSelect = (d: Date) => {
    setCurrentDate(d);
    setPickerDate(d);
    setIsCalendarOpen(false);
  };

  const formatDisplayDate = (d: Date) => {
    if (formatDateForComparison(d) === todayStr) return "Today";
    
    // Check if yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (formatDateForComparison(d) === formatDateForComparison(yesterday)) return "Yesterday";

    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  // --- Calendar Logic ---

  const changePickerMonth = (increment: number) => {
    const newDate = new Date(pickerDate);
    newDate.setMonth(newDate.getMonth() + increment);
    setPickerDate(newDate);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay(); // 0 = Sunday
    return { days, firstDay, year, month };
  };

  const { days: daysInMonth, firstDay, year: pickerYear, month: pickerMonth } = getDaysInMonth(pickerDate);

  // Helper to check if a specific date has data
  const hasDataForDate = (day: number) => {
    const checkStr = `${pickerYear}-${String(pickerMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return meals.some(m => m.date === checkStr);
  };

  // --- Renderers ---

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
             <button onClick={() => onAddMeal(selectedDateStr)} className="text-primary hover:bg-primary/10 p-1 rounded-full transition-colors">
                <span className="material-symbols-outlined">add</span>
             </button>
          </div>
          <div className="border-2 border-dashed border-neutral-200 dark:border-neutral-700 rounded-xl p-4 flex flex-col items-center justify-center text-center">
            <p className="text-xs text-neutral-400">No {title.toLowerCase()} logged</p>
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
           <button onClick={() => onAddMeal(selectedDateStr)} className="text-primary hover:bg-primary/10 p-1 rounded-full transition-colors">
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
      
      {/* --- Sticky Header with Date Navigation --- */}
      <header className="flex flex-col px-6 pt-8 pb-4 sticky top-0 z-30 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white">Food Diary</h1>
        </div>
        
        {/* Date Navigator Bar */}
        <div className="relative z-40">
            <div className="flex justify-between items-center bg-surface-light dark:bg-surface-dark p-2 rounded-2xl">
                <button 
                        onClick={handlePrevDay}
                        className="p-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
                >
                    <span className="material-symbols-outlined">chevron_left</span>
                </button>
                
                {/* Clickable Date Title */}
                <button 
                    onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                    className="flex-1 flex flex-col items-center justify-center hover:bg-neutral-100 dark:hover:bg-neutral-700/50 rounded-lg py-1 transition-colors"
                >
                    <span className="text-sm font-bold text-neutral-700 dark:text-neutral-200 flex items-center gap-1">
                        {formatDisplayDate(currentDate)}
                        <span className={`material-symbols-outlined text-lg transition-transform duration-300 ${isCalendarOpen ? 'rotate-180' : ''}`}>arrow_drop_down</span>
                    </span>
                </button>

                <button 
                        onClick={handleNextDay}
                        className="p-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
                >
                    <span className="material-symbols-outlined">chevron_right</span>
                </button>
            </div>

            {/* --- Calendar Popover --- */}
            {isCalendarOpen && (
                <>
                {/* Backdrop to close */}
                <div className="fixed inset-0 z-30" onClick={() => setIsCalendarOpen(false)}></div>
                
                <div className="absolute top-[110%] left-0 w-full bg-white dark:bg-surface-dark rounded-3xl shadow-float border border-neutral-100 dark:border-neutral-800 p-4 z-40 animate-enter origin-top">
                    {/* Month Nav */}
                    <div className="flex items-center justify-between mb-4">
                        <button onClick={() => changePickerMonth(-1)} className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full">
                            <span className="material-symbols-outlined text-neutral-500">chevron_left</span>
                        </button>
                        <span className="font-bold text-neutral-800 dark:text-white">
                            {pickerDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </span>
                        <button onClick={() => changePickerMonth(1)} className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full">
                            <span className="material-symbols-outlined text-neutral-500">chevron_right</span>
                        </button>
                    </div>

                    {/* Days Grid */}
                    <div className="grid grid-cols-7 mb-2">
                        {['S','M','T','W','T','F','S'].map(d => (
                            <div key={d} className="text-center text-xs font-medium text-neutral-400 py-1">{d}</div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 gap-y-1">
                        {/* Empty slots for start of month */}
                        {Array.from({ length: firstDay }).map((_, i) => (
                            <div key={`empty-${i}`} className="w-8 h-8"></div>
                        ))}

                        {/* Days */}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const day = i + 1;
                            // Check if this specific day cell matches the currently selected data date
                            const isSelected = 
                                currentDate.getDate() === day &&
                                currentDate.getMonth() === pickerMonth &&
                                currentDate.getFullYear() === pickerYear;
                            
                            const isTodayCell = 
                                new Date().getDate() === day &&
                                new Date().getMonth() === pickerMonth &&
                                new Date().getFullYear() === pickerYear;

                            const hasData = hasDataForDate(day);

                            return (
                                <div key={day} className="flex items-center justify-center">
                                    <button
                                        onClick={() => handleDateSelect(new Date(pickerYear, pickerMonth, day))}
                                        className={`
                                            w-9 h-9 rounded-full flex flex-col items-center justify-center relative transition-all
                                            ${isSelected 
                                                ? 'bg-primary text-white font-bold shadow-soft' 
                                                : isTodayCell
                                                    ? 'text-primary font-bold border border-primary/30'
                                                    : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                                            }
                                        `}
                                    >
                                        <span className="text-sm leading-none">{day}</span>
                                        {/* Dot Indicator for data */}
                                        {hasData && !isSelected && (
                                            <span className="absolute bottom-1 w-1 h-1 rounded-full bg-primary"></span>
                                        )}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
                </>
            )}
        </div>
      </header>

      {/* --- Daily Summary Card --- */}
      <div className="px-6 mb-6">
        <div className="bg-neutral-900 dark:bg-white rounded-3xl p-5 text-white dark:text-neutral-900 shadow-soft">
          <div className="flex justify-between items-end mb-4">
             <div>
               <p className="text-xs font-medium opacity-70 uppercase tracking-wider mb-1">Total Calories</p>
               <div className="text-3xl font-extrabold">{dayTotals.calories}</div>
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

      {/* --- Meal Sections --- */}
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
        onCameraClick={onFabClick} 
      />
    </div>
  );
};

export default DiaryScreen;