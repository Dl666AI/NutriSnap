import React from 'react';

interface ResultScreenProps {
  image?: string | null;
  onSave: () => void;
  onRetake: () => void;
}

const ResultScreen: React.FC<ResultScreenProps> = ({ image, onSave, onRetake }) => {
  // Default image if none provided
  const displayImage = image || "https://lh3.googleusercontent.com/aida-public/AB6AXuA21mYjeHMQz9Sa7DWhLu5bC6UXz4FnagJ6N3rf4dXP4f8F0uFuRBia46piAvUyBR6k8os2C5aIJucWUQGo0Rchjnuz7GDEYuDLItggtkDKZEiCPQpiK74FMEHQHni8CYld83cETO8bMzJ7JyGJgSQOf-0CJli604jWVNysQJglI2GhbcK6dEzkPtyeoLz--JgGiq1wCAQv-jZIcLcWRMF0c63i-OUAw-KmgxT-EME7VCzhKbU-LU0J4c_hN6wxFJBAiW5zBOytvlUn";

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-text-dark antialiased overflow-x-hidden min-h-screen flex flex-col transition-colors duration-300">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md">
        <div className="flex items-center p-4 justify-between max-w-md mx-auto w-full">
          <button 
            onClick={onSave} // Using save to close mostly for UX flow
            className="flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-text-dark dark:text-white"
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
          <h2 className="text-text-dark dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">Result</h2>
          <button 
            onClick={onRetake}
            className="flex h-10 px-3 items-center justify-center rounded-full text-primary hover:bg-primary/10 transition-colors"
          >
            <span className="text-sm font-bold">Retake</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col max-w-md mx-auto w-full px-5 pb-24 animate-enter">
        {/* Hero Image Section */}
        <div className="mt-2 mb-6">
          <div className="w-full aspect-[4/3] bg-neutral-100 rounded-2xl overflow-hidden shadow-soft relative group">
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" 
              style={{backgroundImage: `url("${displayImage}")`}}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none"></div>
          </div>
        </div>

        {/* Result Headline & Calories */}
        <div className="text-center space-y-1 mb-8">
          <h1 className="text-2xl font-bold text-text-dark dark:text-white tracking-tight">Avocado Toast</h1>
          <div className="flex items-baseline justify-center gap-1 text-primary">
            <span className="text-6xl font-extrabold tracking-tighter">340</span>
            <span className="text-xl font-medium text-text-muted dark:text-neutral-400">kcal</span>
          </div>
          
          <div className="flex justify-center mt-4">
            <div className="size-16 rounded-full bg-accent/30 flex items-center justify-center relative overflow-hidden">
              <span className="material-symbols-outlined text-4xl text-yellow-700/60 rotate-[-10deg]">bakery_dining</span>
            </div>
          </div>
        </div>

        {/* Nutrient Breakdown Cards */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {/* Carbs */}
          <div className="bg-accent rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-card transform hover:-translate-y-1 transition-transform duration-300">
            <span className="text-xs font-bold uppercase tracking-wider text-yellow-900/60 mb-1">Carbs</span>
            <span className="text-2xl font-bold text-yellow-900">45<span className="text-sm font-medium ml-0.5">g</span></span>
            <div className="w-full h-1 bg-yellow-900/10 rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-yellow-900/40 w-[60%] rounded-full"></div>
            </div>
          </div>
          
          {/* Protein */}
          <div className="bg-accent rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-card transform hover:-translate-y-1 transition-transform duration-300 delay-75">
            <span className="text-xs font-bold uppercase tracking-wider text-yellow-900/60 mb-1">Protein</span>
            <span className="text-2xl font-bold text-yellow-900">12<span className="text-sm font-medium ml-0.5">g</span></span>
            <div className="w-full h-1 bg-yellow-900/10 rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-yellow-900/40 w-[30%] rounded-full"></div>
            </div>
          </div>
          
          {/* Fat */}
          <div className="bg-accent rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-card transform hover:-translate-y-1 transition-transform duration-300 delay-150">
            <span className="text-xs font-bold uppercase tracking-wider text-yellow-900/60 mb-1">Fat</span>
            <span className="text-2xl font-bold text-yellow-900">18<span className="text-sm font-medium ml-0.5">g</span></span>
            <div className="w-full h-1 bg-yellow-900/10 rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-yellow-900/40 w-[45%] rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Confidence Filler */}
        <div className="flex items-center gap-3 px-1 mb-8 opacity-80">
          <span className="text-sm font-medium text-text-muted dark:text-neutral-400">Analysis Confidence</span>
          <div className="h-px bg-neutral-200 flex-1 dark:bg-neutral-700"></div>
          <div className="flex items-center gap-1 text-primary text-sm font-bold">
            <span className="material-symbols-outlined text-lg filled">check_circle</span>
            98%
          </div>
        </div>
      </main>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-background-light via-background-light to-transparent dark:from-background-dark dark:via-background-dark pt-10">
        <div className="max-w-md mx-auto w-full flex flex-col gap-3">
          <button 
            onClick={onSave}
            className="w-full bg-primary hover:bg-[#8b9a7c] active:scale-[0.98] transition-all text-white font-bold text-lg h-14 rounded-xl shadow-lg shadow-primary/30 flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">add_circle</span>
            Save to Log
          </button>
          <button className="w-full text-text-muted hover:text-text-dark dark:text-neutral-400 dark:hover:text-white text-sm font-medium py-2 transition-colors">
            Not right? <span className="underline decoration-primary/50 underline-offset-2">Edit details</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultScreen;