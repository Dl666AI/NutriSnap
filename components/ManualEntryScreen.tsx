import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Meal } from '../types';
import { analyzeFoodText } from '../services/GeminiService';

interface ManualEntryScreenProps {
  onSave: () => void;
  onCancel: () => void;
  mealToEdit?: Meal | null;
  targetDate?: string;
  initialType?: Meal['type'];
}

const ManualEntryScreen: React.FC<ManualEntryScreenProps> = ({ onSave, onCancel, mealToEdit, targetDate, initialType }) => {
  const { addMeal, updateMeal, getTodayString } = useData();
  const { t } = useLanguage();
  
  // Initialize state with mealToEdit values if available, otherwise default to initialType or Snack
  const [name, setName] = useState(mealToEdit?.name || '');
  const [calories, setCalories] = useState(mealToEdit?.calories.toString() || '');
  const [protein, setProtein] = useState(mealToEdit?.protein?.toString() || '');
  const [sugar, setSugar] = useState(mealToEdit?.sugar?.toString() || '');
  const [mealType, setMealType] = useState<Meal['type']>(mealToEdit?.type || initialType || 'Snack');

  // AI Autofill State
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Safety cleanup for loading state
  useEffect(() => {
    return () => setIsGenerating(false);
  }, []);

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

  const handleAutofill = async () => {
    if (!description.trim()) return;
    
    setIsGenerating(true);
    setAiError(null);

    try {
      // Analyze with service
      const result = await analyzeFoodText(description);
      
      // Check confidence (threshold 50 is reasonable given prompt instructions ask for 90 or 0)
      if (result && result.confidence > 50) {
        setName(result.name);
        setCalories(result.calories.toString());
        setProtein(result.protein.toString());
        setSugar(result.sugar.toString());
      } else {
        setAiError(t('ai_error'));
      }
    } catch (err) {
      console.error("Autofill failed", err);
      setAiError(t('ai_error'));
    } finally {
      setIsGenerating(false);
    }
  };

  const typeOptions: Meal['type'][] = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

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
            {mealToEdit ? t('edit') : t('manual_entry')}
          </h2>
          <div className="w-10"></div>
        </div>
      </header>

      <main className="flex-1 flex flex-col max-w-md mx-auto w-full px-6 py-6 animate-enter">
        <div className="space-y-6">
          {/* Meal Type Toggle */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {typeOptions.map((type) => (
              <button
                key={type}
                onClick={() => setMealType(type)}
                className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                  mealType === type 
                    ? 'bg-primary text-white shadow-soft' 
                    : 'bg-surface-light dark:bg-surface-dark text-neutral-500'
                }`}
              >
                {/* @ts-ignore */}
                {t(type.toLowerCase())}
              </button>
            ))}
          </div>

          {/* AI Description Section (Only show if not editing existing) */}
          {!mealToEdit && (
            <div className="bg-surface-light dark:bg-surface-dark p-4 rounded-2xl border border-transparent focus-within:border-primary/30 focus-within:bg-white dark:focus-within:bg-neutral-800 transition-all shadow-sm">
                <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">auto_awesome</span>
                        {t('describe_meal')}
                    </label>
                </div>
                <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={t('describe_hint')}
                    className="w-full bg-transparent border-none p-0 text-sm min-h-[60px] resize-none focus:ring-0 text-neutral-800 dark:text-white placeholder-neutral-400"
                />
                <div className="flex justify-between items-center mt-2">
                    {aiError && <span className="text-xs text-red-500 font-medium">{aiError}</span>}
                    <div className="flex-1"></div>
                    <button 
                        onClick={handleAutofill}
                        disabled={!description || isGenerating}
                        className="bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 disabled:opacity-50 hover:opacity-90 transition-opacity"
                    >
                        {isGenerating ? (
                             <>
                                <div className="size-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                {t('generating')}
                             </>
                        ) : (
                             <>
                                <span className="material-symbols-outlined text-sm">bolt</span>
                                {t('autofill_btn')}
                             </>
                        )}
                    </button>
                </div>
            </div>
          )}

          <div className="h-px bg-neutral-100 dark:bg-neutral-800 w-full"></div>

          {/* Name Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 ml-1">{t('meal_name')}</label>
            <input 
              type="text"
              placeholder={t('meal_placeholder')}
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
                  {t('total_calories')} (kcal)
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
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 ml-1">{t('protein')} (g)</label>
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
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 ml-1">{t('sugar')} (g)</label>
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
          {mealToEdit ? t('update_entry') : t('save_entry')}
        </button>
      </div>
    </div>
  );
};

export default ManualEntryScreen;