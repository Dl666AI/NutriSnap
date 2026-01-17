import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { Meal } from '../types';

interface ManualEntryScreenProps {
  onSave: () => void;
  onCancel: () => void;
  mealToEdit?: Meal | null;
  targetDate?: string;
}

const ManualEntryScreen: React.FC<ManualEntryScreenProps> = ({ onSave, onCancel, mealToEdit, targetDate }) => {
  const { addMeal, updateMeal, getTodayString } = useData();
  
  // Initialize state with mealToEdit values if available
  const [name, setName] = useState(mealToEdit?.name || '');
  const [calories, setCalories] = useState(mealToEdit?.calories.toString() || '');
  const [protein, setProtein] = useState(mealToEdit?.protein?.toString() || '');
  const [sugar, setSugar] = useState(mealToEdit?.sugar?.toString() || '');
  const [mealType, setMealType] = useState<Meal['type']>(mealToEdit?.type || 'Snack');

  const handleSave = () => {
    // Preserve existing data if editing, especially properties not in this form (like fat/carbs/image)
    const id = mealToEdit ? mealToEdit.id : Date.now().toString();
    const time = mealToEdit ? mealToEdit.time : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // If editing, use meal date. If new, use targetDate (if provided from Diary), otherwise Today
    const date = mealToEdit ? mealToEdit.date : (targetDate || getTodayString());
    
    const imageUrl = mealToEdit ? mealToEdit.imageUrl : undefined;
    const fat = mealToEdit?.fat;
    const carbs = mealToEdit?.carbs;

    const mealData: Meal = {
      id,
      name: name || (mealToEdit ? 'Unnamed Meal' : 'Manual Entry'),
      time,
      date,
      calories: parseInt(calories) || 0,
      protein: parseInt(protein) || 0,
      sugar: parseInt(sugar) || 0,
      type: mealType,
      imageUrl,
      fat,
      carbs
    };

    if (mealToEdit) {
      updateMeal(mealData);
    } else {
      addMeal(mealData);
    }
    onSave();
  };

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-text-dark antialiased overflow-x-hidden min-h-screen flex flex-col transition-colors duration-300">
      <header className="sticky top-0 z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md">
        <div className="flex items-center p-4 justify-between max-w-md mx-auto w-full">
          <button 
            onClick={onCancel}
            className="flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-text-dark dark:text-white"
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
          <h2 className="text-text-dark dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">
            {mealToEdit ? 'Edit Meal' : 'Log Manually'}
          </h2>
          <div className="w-10"></div>
        </div>
      </header>

      <main className="flex-1 flex flex-col max-w-md mx-auto w-full px-6 py-6 animate-enter">
        <div className="space-y-6">
          {/* Meal Type Toggle */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {(['Breakfast', 'Lunch', 'Dinner', 'Snack'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setMealType(type)}
                className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                  mealType === type 
                    ? 'bg-primary text-white shadow-soft' 
                    : 'bg-surface-light dark:bg-surface-dark text-neutral-500'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Name Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 ml-1">Meal Name</label>
            <input 
              type="text"
              placeholder="e.g. Greek Yogurt Bowl"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-14 px-4 rounded-2xl bg-surface-light dark:bg-surface-dark border-none focus:ring-2 focus:ring-primary/50 text-neutral-800 dark:text-white font-medium"
            />
          </div>

          {/* Numeric Inputs Grid */}
          <div className="grid grid-cols-1 gap-4">
             <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 ml-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm filled text-primary">local_fire_department</span>
                  Calories (kcal)
                </label>
                <input 
                  type="number"
                  inputMode="numeric"
                  placeholder="0"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  className="w-full h-14 px-4 rounded-2xl bg-surface-light dark:bg-surface-dark border-none focus:ring-2 focus:ring-primary/50 text-neutral-800 dark:text-white font-bold text-lg"
                />
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 ml-1">Protein (g)</label>
                  <input 
                    type="number"
                    inputMode="numeric"
                    placeholder="0"
                    value={protein}
                    onChange={(e) => setProtein(e.target.value)}
                    className="w-full h-14 px-4 rounded-2xl bg-surface-light dark:bg-surface-dark border-none focus:ring-2 focus:ring-primary/50 text-neutral-800 dark:text-white font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 ml-1">Sugar (g)</label>
                  <input 
                    type="number"
                    inputMode="numeric"
                    placeholder="0"
                    value={sugar}
                    onChange={(e) => setSugar(e.target.value)}
                    className="w-full h-14 px-4 rounded-2xl bg-surface-light dark:bg-surface-dark border-none focus:ring-2 focus:ring-primary/50 text-neutral-800 dark:text-white font-bold"
                  />
                </div>
             </div>
          </div>
        </div>
      </main>

      <div className="p-6 max-w-md mx-auto w-full">
        <button 
          onClick={handleSave}
          className="w-full h-14 bg-primary text-white font-bold rounded-2xl shadow-float active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined">{mealToEdit ? 'update' : 'save'}</span>
          {mealToEdit ? 'Update Entry' : 'Save Entry'}
        </button>
      </div>
    </div>
  );
};

export default ManualEntryScreen;