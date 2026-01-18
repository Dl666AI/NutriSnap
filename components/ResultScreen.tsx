import React, { useEffect, useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Meal } from '../types';
import { analyzeFoodImage, FoodAnalysisResult } from '../services/GeminiService';

interface ResultScreenProps {
  image?: string | null;
  onSave: () => void;
  onRetake: () => void;
  onManualEntry: () => void;
  targetDate?: string;
}

const ResultScreen: React.FC<ResultScreenProps> = ({ image, onSave, onRetake, onManualEntry, targetDate }) => {
  const { addMeal, getTodayString } = useData();
  const { t } = useLanguage();
  const [analysis, setAnalysis] = useState<FoodAnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    // Safety timeout: Ensure we never spin forever in the UI
    const safetyTimer = setTimeout(() => {
      if (active && loading) {
        console.error("UI Safety Timeout Triggered");
        setError(t('camera_error'));
        setLoading(false);
      }
    }, 30000); // 30 seconds absolute max

    const analyze = async () => {
      if (!image) {
        setLoading(false);
        setError("No image provided");
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Call the service (which has its own internal timeouts now)
        const result = await analyzeFoodImage(image);
        
        if (active) {
          // If confidence is too low (e.g. not food), treat as error/fallback
          // Threshold set to 40 to be permissive
          if (result.confidence < 40) {
             console.warn("Low confidence result:", result);
             throw new Error("Could not identify food in image");
          }
          setAnalysis(result);
          setLoading(false);
        }
      } catch (err) {
        console.error("Analysis failed", err);
        if (active) {
          setError(t('camera_error'));
          setLoading(false);
        }
      }
    };

    analyze();

    return () => { 
      active = false; 
      clearTimeout(safetyTimer);
    };
  }, [image, t]);

  const handleSave = () => {
    if (!analysis) return;

    const newMeal: Meal = {
      id: Date.now().toString(),
      name: analysis.name,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: targetDate || getTodayString(),
      calories: analysis.calories,
      protein: analysis.protein,
      carbs: analysis.carbs,
      fat: analysis.fat,
      sugar: analysis.sugar,
      imageUrl: image || undefined,
      type: 'Snack' // Default type
    };

    addMeal(newMeal);
    onSave();
  };

  // Default image fallback
  const displayImage = image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=200&h=200";

  if (error) {
    return (
      <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col items-center justify-center p-6 text-center animate-enter">
        <div className="size-24 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-6 shadow-sm">
            <span className="material-symbols-outlined text-red-500 text-5xl">warning</span>
        </div>
        <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">{t('ai_error')}</h2>
        <p className="text-neutral-500 dark:text-neutral-400 mb-8 max-w-xs text-sm leading-relaxed">
           The AI couldn't reliably identify the food. This can happen with blurry images or non-food items.
        </p>
        
        <button 
          onClick={onManualEntry}
          className="w-full max-w-xs h-14 bg-primary text-white font-bold rounded-2xl shadow-float hover:bg-primary-dark transition-all active:scale-[0.98] flex items-center justify-center gap-2 mb-3"
        >
          <span className="material-symbols-outlined">edit_note</span>
          {t('manual_entry')}
        </button>
        
        <button 
          onClick={onRetake}
          className="w-full max-w-xs h-14 bg-white dark:bg-surface-dark border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 font-bold rounded-2xl hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all active:scale-[0.98]"
        >
          {t('retake')}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-text-dark antialiased overflow-x-hidden min-h-screen flex flex-col transition-colors duration-300">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md">
        <div className="flex items-center p-4 justify-between max-w-3xl mx-auto w-full">
          <button 
            onClick={onSave} 
            className="flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-text-dark dark:text-white"
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
          <h2 className="text-text-dark dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">{t('result')}</h2>
          <button 
            onClick={onRetake}
            className="flex h-10 px-3 items-center justify-center rounded-full text-primary hover:bg-primary/10 transition-colors"
          >
            <span className="text-sm font-bold">{t('retake')}</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col max-w-3xl mx-auto w-full px-5 pb-32 animate-enter">
        {/* Hero Image Section */}
        <div className="mt-2 mb-6">
          <div className="w-full aspect-[4/3] bg-neutral-100 dark:bg-neutral-800 rounded-2xl overflow-hidden shadow-soft relative group">
            <div 
              className="absolute inset-0 bg-cover bg-center" 
              style={{backgroundImage: `url("${displayImage}")`}}
            ></div>
            {loading && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-md flex flex-col items-center justify-center text-white">
                    <div className="size-12 border-4 border-white/30 border-t-white rounded-full animate-spin mb-4"></div>
                    <p className="font-semibold animate-pulse tracking-wide">{t('analyzing')}</p>
                </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none"></div>
          </div>
        </div>

        {/* Loading Skeleton or Result */}
        {loading ? (
           <div className="space-y-6 animate-pulse opacity-50">
              <div className="flex flex-col items-center gap-2">
                 <div className="h-8 w-48 bg-neutral-200 dark:bg-neutral-800 rounded-full"></div>
                 <div className="h-16 w-32 bg-neutral-200 dark:bg-neutral-800 rounded-2xl"></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                 <div className="h-24 bg-neutral-200 dark:bg-neutral-800 rounded-2xl"></div>
                 <div className="h-24 bg-neutral-200 dark:bg-neutral-800 rounded-2xl"></div>
                 <div className="h-24 bg-neutral-200 dark:bg-neutral-800 rounded-2xl"></div>
              </div>
           </div>
        ) : analysis ? (
            <>
                {/* Result Headline & Calories */}
                <div className="text-center space-y-1 mb-8 animate-enter">
                <h1 className="text-2xl font-bold text-text-dark dark:text-white tracking-tight">{analysis.name}</h1>
                <div className="flex items-baseline justify-center gap-1 text-primary">
                    <span className="text-6xl font-extrabold tracking-tighter">{analysis.calories}</span>
                    <span className="text-xl font-medium text-text-muted dark:text-neutral-400">kcal</span>
                </div>
                
                <div className="flex justify-center mt-4">
                    <div className="size-16 rounded-full bg-accent/30 flex items-center justify-center relative overflow-hidden">
                    <span className="material-symbols-outlined text-4xl text-yellow-700/60 rotate-[-10deg]">restaurant</span>
                    </div>
                </div>
                </div>

                {/* Nutrient Breakdown Cards */}
                <div className="grid grid-cols-2 gap-3 mb-8">
                  <div className="bg-white dark:bg-surface-dark p-4 rounded-2xl flex flex-col items-center justify-center border border-neutral-100 dark:border-neutral-800 shadow-sm">
                    <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">{t('protein')}</span>
                    <span className="text-xl font-bold text-neutral-900 dark:text-white">{analysis.protein}g</span>
                  </div>
                  <div className="bg-white dark:bg-surface-dark p-4 rounded-2xl flex flex-col items-center justify-center border border-neutral-100 dark:border-neutral-800 shadow-sm">
                    <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">{t('carbs')}</span>
                    <span className="text-xl font-bold text-neutral-900 dark:text-white">{analysis.carbs}g</span>
                  </div>
                  <div className="bg-white dark:bg-surface-dark p-4 rounded-2xl flex flex-col items-center justify-center border border-neutral-100 dark:border-neutral-800 shadow-sm">
                    <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">{t('fat')}</span>
                    <span className="text-xl font-bold text-neutral-900 dark:text-white">{analysis.fat}g</span>
                  </div>
                  <div className="bg-white dark:bg-surface-dark p-4 rounded-2xl flex flex-col items-center justify-center border border-neutral-100 dark:border-neutral-800 shadow-sm">
                    <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">{t('sugar')}</span>
                    <span className="text-xl font-bold text-neutral-900 dark:text-white">{analysis.sugar}g</span>
                  </div>
                </div>

                {/* Save Button */}
                <button 
                  onClick={handleSave}
                  className="w-full h-14 bg-primary text-white font-bold rounded-2xl shadow-float hover:bg-primary-dark transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined">add_circle</span>
                  {t('add_to_diary')}
                </button>
                
                {/* Fallback link if data looks wrong */}
                <button 
                  onClick={onManualEntry}
                  className="w-full mt-4 h-12 text-neutral-500 font-medium text-sm flex items-center justify-center gap-2 hover:text-neutral-800 dark:hover:text-neutral-200"
                >
                  {t('edit')} / {t('manual_entry')}
                </button>
            </>
        ) : null}
      </main>
    </div>
  );
};

export default ResultScreen;
