import React, { useState, useRef } from 'react';
import { Screen, Meal } from '../types';
import { useData } from '../contexts/DataContext';
import { useLanguage } from '../contexts/LanguageContext';
import BottomNav from './BottomNav';
import { 
  DndContext, 
  DragOverlay, 
  useDraggable, 
  useDroppable, 
  TouchSensor, 
  MouseSensor, 
  useSensor, 
  useSensors,
  DragStartEvent,
  DragEndEvent
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

interface DiaryScreenProps {
  onNavigate: (screen: Screen) => void;
  onEdit: (meal: Meal) => void;
  onAddMeal: (date: string, type?: Meal['type']) => void;
  onFabClick: () => void;
}

interface DraggableMealProps {
  meal: Meal;
  onClick: () => void;
  onDelete: () => void;
}

// --- Draggable & Swipeable Meal Component ---
const DraggableMeal: React.FC<DraggableMealProps> = ({ meal, onClick, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: meal.id,
    data: meal
  });

  // Swipe State
  const [offsetX, setOffsetX] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const isSwiping = useRef(false);

  // Drag Styles
  const style = {
    transform: CSS.Translate.toString(transform),
    zIndex: isDragging ? 999 : undefined,
    opacity: isDragging ? 0.0 : 1, // Hide the original when dragging (we show the overlay instead)
  };

  // --- Swipe Handlers ---
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    isSwiping.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null || isDragging) return;

    const currentX = e.touches[0].clientX;
    const diff = currentX - touchStartX.current;

    // Only allow left swipe
    if (diff < 0) {
      isSwiping.current = true;
      // Resistance effect: moving 1px feels like 0.8px
      setOffsetX(Math.max(diff, -150)); 
    }
  };

  const handleTouchEnd = () => {
    touchStartX.current = null;
    if (offsetX < -80) {
       // Threshold met - Trigger delete
       // Animate off screen first for visual feedback
       setOffsetX(-400); 
       setTimeout(() => {
           onDelete();
           setOffsetX(0); // Reset for next mount if component reused
       }, 300);
    } else {
       // Snap back
       setOffsetX(0);
    }
    setTimeout(() => { isSwiping.current = false; }, 100);
  };

  return (
    <div className="relative touch-pan-y" style={style}>
        {/* Red Delete Background Layer 
            - bottom-3 ensures it aligns with the card above the h-3 spacer
            - opacity logic ensures it's invisible when not swiping 
        */}
        <div className={`absolute inset-0 bottom-3 bg-red-500 rounded-xl flex items-center justify-end pr-6 transition-opacity duration-200 ${offsetX < -5 ? 'opacity-100' : 'opacity-0'}`}>
             <span className="material-symbols-outlined text-white text-2xl">delete</span>
        </div>

        {/* Foreground Card */}
        <div 
            ref={setNodeRef} 
            {...listeners} 
            {...attributes}
            // Swipe Events
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onClick={(e) => {
                // Prevent click if we were swiping
                if (!isSwiping.current) onClick();
            }}
            style={{ 
                transform: `translateX(${offsetX}px)`, 
                transition: isSwiping.current ? 'none' : 'transform 0.3s ease-out' 
            }}
            className={`relative z-10 flex items-center p-3 bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-neutral-100 dark:border-neutral-800 transition-shadow active:bg-neutral-50 dark:active:bg-neutral-800`}
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
        
        {/* Spacer for layout */}
        <div className="h-3"></div>
    </div>
  );
};

interface DroppableSectionProps {
  id: string;
  title: string;
  calories: number;
  children: React.ReactNode;
  onAdd: () => void;
  isDragActive: boolean;
}

// --- Droppable Section Component ---
const DroppableSection: React.FC<DroppableSectionProps> = ({ id, title, calories, children, onAdd, isDragActive }) => {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <section 
      ref={setNodeRef}
      className={`rounded-2xl transition-all duration-300 ${isOver ? 'bg-primary/10 ring-2 ring-primary p-2 -m-2' : ''} ${isDragActive && !isOver ? 'opacity-80' : ''}`}
    >
        <div className="flex items-center justify-between mb-3">
           <h3 className="text-lg font-bold text-neutral-800 dark:text-white flex items-center gap-2">
             {title}
             <span className="text-xs font-normal text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-md">{calories} kcal</span>
           </h3>
           <button onClick={onAdd} className="text-primary hover:bg-primary/10 p-1 rounded-full transition-colors">
             <span className="material-symbols-outlined">add</span>
           </button>
        </div>
        <div className="flex flex-col min-h-[60px]">
           {children}
           {React.Children.count(children) === 0 && (
             <div className="border-2 border-dashed border-neutral-200 dark:border-neutral-700 rounded-xl p-4 flex flex-col items-center justify-center text-center h-full mb-3">
               <p className="text-xs text-neutral-400">Empty Section</p>
             </div>
           )}
        </div>
    </section>
  );
};

const DiaryScreen: React.FC<DiaryScreenProps> = ({ onNavigate, onEdit, onAddMeal, onFabClick }) => {
  const { meals, targets, removeMeal, updateMeal, getTodayString } = useData();
  const { t } = useLanguage();
  
  // State for current selected date (Data View)
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  
  // State for Calendar Picker
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [pickerDate, setPickerDate] = useState<Date>(new Date());
  
  // Drag State
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeMeal, setActiveMeal] = useState<Meal | null>(null);

  // DnD Sensors - Optimized for "Long Press" on touch
  const sensors = useSensors(
    useSensor(MouseSensor, {
        activationConstraint: {
            distance: 10,
        },
    }),
    useSensor(TouchSensor, {
        activationConstraint: {
            delay: 250, // 250ms hold to activate drag (Long press)
            tolerance: 5, // Strict tolerance: if user swipes > 5px before 250ms, drag is cancelled
        },
    })
  );

  // Formatting helpers
  const formatDateForComparison = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const selectedDateStr = formatDateForComparison(currentDate);
  const todayStr = getTodayString();

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
    setPickerDate(prev);
  };

  const handleNextDay = () => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + 1);
    setCurrentDate(next);
    setPickerDate(next);
  };

  const handleDateSelect = (d: Date) => {
    setCurrentDate(d);
    setPickerDate(d);
    setIsCalendarOpen(false);
  };

  const formatDisplayDate = (d: Date) => {
    if (formatDateForComparison(d) === todayStr) return t('today');
    
    // Check if yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (formatDateForComparison(d) === formatDateForComparison(yesterday)) return t('yesterday');

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

  const hasDataForDate = (day: number) => {
    const checkStr = `${pickerYear}-${String(pickerMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return meals.some(m => m.date === checkStr);
  };

  // --- DnD Handlers ---

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    setActiveMeal(event.active.data.current as Meal);
    if (navigator.vibrate) navigator.vibrate(50);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    setActiveId(null);
    setActiveMeal(null);

    if (!over) return;

    // Handle Category Move
    const validCategories = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
    const newType = over.id as Meal['type'];

    if (validCategories.includes(newType)) {
        const meal = active.data.current as Meal;
        if (meal && meal.type !== newType) {
            updateMeal({
                ...meal,
                type: newType
            });
            if (navigator.vibrate) navigator.vibrate(20);
        }
    }
  };

  const handleDelete = (id: string) => {
    removeMeal(id);
    if (navigator.vibrate) navigator.vibrate([50, 50]);
  };

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="relative flex h-full min-h-screen w-full flex-col max-w-md mx-auto bg-background-light dark:bg-background-dark pb-32 transition-colors duration-300">
        
        {/* --- Sticky Header with Date Navigation --- */}
        <header className="flex flex-col px-6 pt-8 pb-4 sticky top-0 z-30 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md">
            <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white">{t('food_diary')}</h1>
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
                    <div className="fixed inset-0 z-30" onClick={() => setIsCalendarOpen(false)}></div>
                    <div className="absolute top-[110%] left-0 w-full bg-white dark:bg-surface-dark rounded-3xl shadow-float border border-neutral-100 dark:border-neutral-800 p-4 z-40 animate-enter origin-top">
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
                        <div className="grid grid-cols-7 mb-2">
                            {['S','M','T','W','T','F','S'].map(d => (
                                <div key={d} className="text-center text-xs font-medium text-neutral-400 py-1">{d}</div>
                            ))}
                        </div>
                        <div className="grid grid-cols-7 gap-y-1">
                            {Array.from({ length: firstDay }).map((_, i) => (
                                <div key={`empty-${i}`} className="w-8 h-8"></div>
                            ))}
                            {Array.from({ length: daysInMonth }).map((_, i) => {
                                const day = i + 1;
                                const isSelected = currentDate.getDate() === day && currentDate.getMonth() === pickerMonth && currentDate.getFullYear() === pickerYear;
                                const isTodayCell = new Date().getDate() === day && new Date().getMonth() === pickerMonth && new Date().getFullYear() === pickerYear;
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
                <p className="text-xs font-medium opacity-70 uppercase tracking-wider mb-1">{t('total_calories')}</p>
                <div className="text-3xl font-extrabold">{dayTotals.calories}</div>
                </div>
                <div className="text-right">
                <p className="text-xs font-medium opacity-70 mb-1">{t('remaining')}</p>
                <div className="text-xl font-bold text-primary">{caloriesLeft}</div>
                </div>
            </div>
            <div className="w-full bg-white/20 dark:bg-black/10 rounded-full h-2">
                <div className="bg-primary h-2 rounded-full transition-all duration-700" style={{width: `${progressPercent}%`}}></div>
            </div>
            </div>
        </div>

        {/* --- Meal Sections (Droppable) --- */}
        <main className="flex flex-col px-6 gap-8 animate-enter pb-32">
            <DroppableSection 
                id="Breakfast" 
                title={t('breakfast')} 
                calories={getSectionCalories(breakfastMeals)} 
                onAdd={() => onAddMeal(selectedDateStr, 'Breakfast')}
                isDragActive={!!activeId}
            >
                {breakfastMeals.map(meal => (
                    <DraggableMeal 
                        key={meal.id} 
                        meal={meal} 
                        onClick={() => onEdit(meal)} 
                        onDelete={() => handleDelete(meal.id)}
                    />
                ))}
            </DroppableSection>

            <DroppableSection 
                id="Lunch" 
                title={t('lunch')} 
                calories={getSectionCalories(lunchMeals)} 
                onAdd={() => onAddMeal(selectedDateStr, 'Lunch')}
                isDragActive={!!activeId}
            >
                {lunchMeals.map(meal => (
                    <DraggableMeal 
                        key={meal.id} 
                        meal={meal} 
                        onClick={() => onEdit(meal)} 
                        onDelete={() => handleDelete(meal.id)}
                    />
                ))}
            </DroppableSection>

            <DroppableSection 
                id="Dinner" 
                title={t('dinner')} 
                calories={getSectionCalories(dinnerMeals)} 
                onAdd={() => onAddMeal(selectedDateStr, 'Dinner')}
                isDragActive={!!activeId}
            >
                {dinnerMeals.map(meal => (
                    <DraggableMeal 
                        key={meal.id} 
                        meal={meal} 
                        onClick={() => onEdit(meal)} 
                        onDelete={() => handleDelete(meal.id)}
                    />
                ))}
            </DroppableSection>

            <DroppableSection 
                id="Snack" 
                title={t('snack')} 
                calories={getSectionCalories(snackMeals)} 
                onAdd={() => onAddMeal(selectedDateStr, 'Snack')}
                isDragActive={!!activeId}
            >
                {snackMeals.map(meal => (
                    <DraggableMeal 
                        key={meal.id} 
                        meal={meal} 
                        onClick={() => onEdit(meal)} 
                        onDelete={() => handleDelete(meal.id)}
                    />
                ))}
            </DroppableSection>
        </main>

        <DragOverlay>
            {activeMeal ? (
                <div className="flex items-center p-3 bg-white dark:bg-surface-dark rounded-xl shadow-2xl border border-primary scale-105 opacity-90 w-[300px]">
                     {activeMeal.imageUrl ? (
                        <div className="size-12 rounded-lg bg-neutral-100 bg-cover bg-center shrink-0" style={{backgroundImage: `url("${activeMeal.imageUrl}")`}}></div>
                      ) : (
                        <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-primary text-xl">description</span>
                        </div>
                      )}
                    <div className="ml-3 flex-1 min-w-0">
                        <div className="font-bold text-neutral-800 dark:text-neutral-100 text-sm truncate">{activeMeal.name}</div>
                        <div className="text-xs text-neutral-500">{activeMeal.time}</div>
                    </div>
                </div>
            ) : null}
        </DragOverlay>

        <BottomNav 
            currentScreen="DIARY" 
            onNavigate={onNavigate} 
            onCameraClick={onFabClick} 
        />
        </div>
    </DndContext>
  );
};

export default DiaryScreen;