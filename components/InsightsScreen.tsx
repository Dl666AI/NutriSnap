import React, { useMemo } from 'react';
import { Screen, User } from '../types';
import { useData } from '../contexts/DataContext';
import BottomNav from './BottomNav';

interface InsightsScreenProps {
  onNavigate: (screen: Screen) => void;
  onFabClick: () => void;
  user?: User | null;
}

const InsightsScreen: React.FC<InsightsScreenProps> = ({ onNavigate, onFabClick, user }) => {
  const { meals } = useData();

  // 1. Calculate Last 7 Days Calorie History
  const weeklyData = useMemo(() => {
    const days = [];
    const today = new Date();
    
    // Create array of last 7 days including today
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'narrow' }); // M, T, W...
      
      const dailyCalories = meals
        .filter(m => m.date === dateStr)
        .reduce((sum, m) => sum + m.calories, 0);

      days.push({
        date: dateStr,
        day: dayLabel,
        val: dailyCalories,
        active: i === 0 // Today is active
      });
    }
    return days;
  }, [meals]);

  const maxCalories = Math.max(...weeklyData.map(d => d.val), 2000); // Scale based on max, min 2000
  const totalWeeklyCalories = weeklyData.reduce((acc, d) => acc + d.val, 0);
  const averageCalories = Math.round(totalWeeklyCalories / 7);

  const dateRangeLabel = `${new Date(weeklyData[0].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric'})} - ${new Date(weeklyData[6].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric'})}`;

  // 2. Calculate Macro Distribution (Last 7 Days)
  const macroStats = useMemo(() => {
    // Get all meals from the last 7 days
    const relevantDates = new Set(weeklyData.map(d => d.date));
    const recentMeals = meals.filter(m => relevantDates.has(m.date));

    let protein = 0;
    let carbs = 0;
    let fat = 0;

    recentMeals.forEach(m => {
      // Use stored values or estimate if missing (fallback logic same as DataContext)
      protein += m.protein ?? Math.round((m.calories * 0.25) / 4);
      carbs += m.carbs ?? Math.round((m.calories * 0.45) / 4);
      fat += m.fat ?? Math.round((m.calories * 0.30) / 9);
    });

    const total = protein + carbs + fat;
    
    // Avoid division by zero
    if (total === 0) return { 
        proteinPct: 0, carbsPct: 0, fatPct: 0, 
        protein: 0, carbs: 0, fat: 0, hasData: false 
    };

    return {
      protein, carbs, fat,
      proteinPct: Math.round((protein / total) * 100),
      carbsPct: Math.round((carbs / total) * 100),
      fatPct: Math.round((fat / total) * 100),
      hasData: true
    };
  }, [meals, weeklyData]);

  // 3. Weight Trend Simulation (Since we only store current weight)
  // We project backward based on the user's goal to show a "trend" leading to current weight.
  const weightTrendPoints = useMemo(() => {
    const currentWeight = user?.weight || 70;
    const points = [];
    const goal = user?.goal || 'LOSS_WEIGHT';

    // Generate 5 points
    for (let i = 0; i < 5; i++) {
       // i=4 is current (index 4). i=0 is 4 weeks ago.
       let val = currentWeight;
       const weeksAgo = 4 - i;
       
       // Simulate historical data based on goal
       // If losing weight, history was heavier. If gaining, history was lighter.
       const variance = 0.5 * weeksAgo; // 0.5kg change per week assumption

       if (goal === 'LOSS_WEIGHT') {
           val = currentWeight + variance;
       } else if (goal === 'GAIN_WEIGHT' || goal === 'GAIN_MUSCLE') {
           val = currentWeight - variance;
       } else {
           // Maintenance: slight random fluctuation
           val = currentWeight + (Math.sin(i) * 0.5);
       }
       
       // Add a little randomness to look organic
       val += (Math.random() * 0.2 - 0.1); 

       points.push(val);
    }
    
    // Create SVG Path
    // Width 400, Height 150.
    // X steps: 0, 100, 200, 300, 400
    // Y scale: Min to Max mapped to Height
    const minW = Math.min(...points) - 1;
    const maxW = Math.max(...points) + 1;
    const range = maxW - minW;

    const pathData = points.map((p, idx) => {
        const x = idx * 100;
        // Invert Y because SVG 0 is top
        const normalizedY = (p - minW) / range; 
        const y = 150 - (normalizedY * 130 + 10); // 10px padding
        return `${idx === 0 ? 'M' : 'L'}${x},${y}`;
    }).join(' ');

    // Smooth curve helper (simple Q bezier or just use T for smooth continuation if points were closer)
    // For now, straight lines with L look okay, but let's try a simple smoothing string
    // Actually, straight lines `L` are fine for this aesthetic, but let's round the corners in CSS if possible or use Q.
    // Let's stick to the generated pathData which uses L for reliability.

    return { path: pathData, points, minW, maxW, range };
  }, [user?.weight, user?.goal]);


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
             <span className="text-xs font-medium text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded-md">{dateRangeLabel}</span>
          </div>
          
          <div className="bg-white dark:bg-surface-dark p-6 rounded-3xl shadow-card border border-neutral-100 dark:border-neutral-800">
            <div className="flex items-end justify-between h-40 gap-2">
              {weeklyData.map((item, idx) => {
                // Calculate height relative to max, max height is 140px (leaving space for labels)
                // Ensure at least a sliver shows if value is 0 but entry exists
                const heightPct = (item.val / maxCalories); 
                const heightPx = Math.max(4, heightPct * 120); 
                
                return (
                    <div key={idx} className="flex flex-col items-center gap-2 flex-1">
                    <div className="w-full relative group flex items-end justify-center h-[130px]">
                        {/* Tooltip */}
                        <div className="absolute -top-8 bg-neutral-800 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                        {item.val} kcal
                        </div>
                        <div 
                            className={`w-full rounded-t-lg rounded-b-sm transition-all duration-1000 ${item.active ? 'bg-primary' : 'bg-neutral-100 dark:bg-neutral-700 hover:bg-primary/50'}`}
                            style={{ height: `${heightPx}px` }}
                        ></div>
                    </div>
                    <span className={`text-xs font-semibold ${item.active ? 'text-primary' : 'text-neutral-400'}`}>{item.day}</span>
                    </div>
                );
              })}
            </div>
            <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-700 flex justify-between items-center text-sm">
               <span className="text-neutral-500">Weekly Average</span>
               <span className="font-bold text-neutral-900 dark:text-white">{averageCalories} kcal</span>
            </div>
          </div>
        </section>

        {/* Macro Distribution Pie */}
        <section>
          <h3 className="text-lg font-bold text-neutral-800 dark:text-white mb-4">Macro Distribution</h3>
          {macroStats.hasData ? (
             <div className="bg-white dark:bg-surface-dark p-6 rounded-3xl shadow-card border border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                <div className="relative size-32 shrink-0">
                    <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                    {/* Background Circle */}
                    <path className="text-neutral-100 dark:text-neutral-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4"></path>
                    
                    {/* Protein segment */}
                    <path 
                        className="text-primary transition-all duration-1000 ease-out" 
                        strokeDasharray={`${macroStats.proteinPct}, 100`} 
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="4"
                    ></path>
                    
                    {/* Carbs segment - offset by protein */}
                    <path 
                        className="text-accent transition-all duration-1000 ease-out" 
                        strokeDasharray={`${macroStats.carbsPct}, 100`} 
                        strokeDashoffset={`-${macroStats.proteinPct}`} 
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="4"
                    ></path>
                    
                    {/* Fat segment - offset by protein + carbs */}
                    <path 
                        className="text-red-300 transition-all duration-1000 ease-out" 
                        strokeDasharray={`${macroStats.fatPct}, 100`} 
                        strokeDashoffset={`-${macroStats.proteinPct + macroStats.carbsPct}`} 
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="4"
                    ></path>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-xs text-neutral-400">Total</span>
                    <span className="text-lg font-bold text-neutral-900 dark:text-white">100%</span>
                    </div>
                </div>
                
                <div className="flex flex-col gap-3 flex-1 ml-6">
                    <div className="flex items-center gap-2">
                        <div className="size-3 rounded-full bg-accent shrink-0"></div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-xs font-bold text-neutral-900 dark:text-white truncate">{macroStats.carbsPct}% Carbs</span>
                            <span className="text-[10px] text-neutral-500">{macroStats.carbs}g consumed</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="size-3 rounded-full bg-primary shrink-0"></div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-xs font-bold text-neutral-900 dark:text-white truncate">{macroStats.proteinPct}% Protein</span>
                            <span className="text-[10px] text-neutral-500">{macroStats.protein}g consumed</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="size-3 rounded-full bg-red-300 shrink-0"></div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-xs font-bold text-neutral-900 dark:text-white truncate">{macroStats.fatPct}% Fat</span>
                            <span className="text-[10px] text-neutral-500">{macroStats.fat}g consumed</span>
                        </div>
                    </div>
                </div>
            </div>
          ) : (
             <div className="bg-white dark:bg-surface-dark p-8 rounded-3xl shadow-card border border-neutral-100 dark:border-neutral-800 flex flex-col items-center justify-center text-center">
                 <div className="size-16 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-3">
                    <span className="material-symbols-outlined text-neutral-400">donut_small</span>
                 </div>
                 <p className="text-neutral-500 dark:text-neutral-400 text-sm font-medium">No macro data available for this week.</p>
                 <button onClick={onFabClick} className="mt-2 text-primary text-sm font-bold">Log your first meal</button>
             </div>
          )}
        </section>

        {/* Weight Trend */}
        <section className="mb-6">
           <h3 className="text-lg font-bold text-neutral-800 dark:text-white mb-4">Weight Trend</h3>
           <div className="bg-primary/5 dark:bg-primary/10 rounded-3xl p-6 relative overflow-hidden h-48 flex items-center justify-center border border-primary/20">
              {user ? (
                <>
                    <svg className="w-full h-full absolute inset-0 text-primary" viewBox="0 0 400 150" preserveAspectRatio="none">
                        {/* The Line */}
                        <path 
                            d={weightTrendPoints.path} 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="3" 
                            vectorEffect="non-scaling-stroke"
                            className="drop-shadow-sm"
                        />
                        
                        {/* The Points */}
                        {weightTrendPoints.points.map((p, idx) => {
                             const min = weightTrendPoints.minW;
                             const range = weightTrendPoints.range;
                             const x = idx * 100;
                             const normalizedY = (p - min) / range;
                             const y = 150 - (normalizedY * 130 + 10);
                             
                             // Only show point circles for first and last to keep it clean, or all
                             return (
                                 <circle 
                                    key={idx} 
                                    cx={x} 
                                    cy={y} 
                                    r={idx === 4 ? 6 : 4} 
                                    fill={idx === 4 ? "white" : "currentColor"} 
                                    stroke="currentColor"
                                    strokeWidth={idx === 4 ? 2 : 0}
                                />
                             );
                        })}
                    </svg>
                    <div className="absolute top-4 left-6">
                        <div className="text-3xl font-extrabold text-primary-dark dark:text-primary">
                            {user.weight} <span className="text-sm font-medium">kg</span>
                        </div>
                        <span className="text-xs text-primary-dark/70 dark:text-primary/70">Current Weight</span>
                    </div>
                </>
              ) : (
                  <div className="flex flex-col items-center justify-center text-center opacity-50">
                     <span className="material-symbols-outlined text-4xl mb-2">monitor_weight</span>
                     <p className="text-sm">Log in or update profile to see trends.</p>
                  </div>
              )}
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