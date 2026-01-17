import React, { useRef } from 'react';
import { Screen } from '../types';

interface CameraScreenProps {
  onCapture: (imageSrc?: string) => void;
  onCancel: () => void;
}

const CameraScreen: React.FC<CameraScreenProps> = ({ onCapture, onCancel }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGalleryClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onCapture(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleShutterClick = () => {
      // Simulate taking a photo by passing undefined (or a mock hardcoded image in ResultScreen if none provided)
      // In a real app with camera access, we'd capture the video stream canvas here.
      // For this demo, we'll pass a specific mock image to represent a "newly taken" photo 
      // if we aren't uploading one.
      const mockCapturedImage = "https://lh3.googleusercontent.com/aida-public/AB6AXuA21mYjeHMQz9Sa7DWhLu5bC6UXz4FnagJ6N3rf4dXP4f8F0uFuRBia46piAvUyBR6k8os2C5aIJucWUQGo0Rchjnuz7GDEYuDLItggtkDKZEiCPQpiK74FMEHQHni8CYld83cETO8bMzJ7JyGJgSQOf-0CJli604jWVNysQJglI2GhbcK6dEzkPtyeoLz--JgGiq1wCAQv-jZIcLcWRMF0c63i-OUAw-KmgxT-EME7VCzhKbU-LU0J4c_hN6wxFJBAiW5zBOytvlUn";
      onCapture(mockCapturedImage);
  }

  return (
    <div className="bg-background-light dark:bg-background-dark font-display h-screen w-full overflow-hidden relative">
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        accept="image/*" 
        className="hidden" 
        onChange={handleFileChange}
      />

      {/* Viewfinder Layer (Simulated Camera Feed) */}
      <div className="absolute inset-0 z-0 bg-neutral-900">
        <img 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuA2nC1e4lcsI6Qfltcx-BdEfpwWyfXbXmTr1npBBYibzwqEoWpf1kR0ngvfhgeke-NpFhHGeaq-1pGO92t-BPt64JXtbXW51QjsgTf9GL-D7UQAYDfL-J4vwd1cMbWXMnGnyk20NC5VImTkR6ElzBkwovYds-CpbPxqBpO8EoCRUa9e5d0judcadirGLG0P5NiQjgIaqmECefdnH0PPoQ6UiC5ID3ODFNJbxfeV4BWfMmEcZOnsur7SxMsHyIvXx1T4DQ06qCWKPh1c" 
          alt="Camera Feed" 
          className="w-full h-full object-cover opacity-90"
        />
        {/* Vignette Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-transparent via-transparent to-black/30"></div>
      </div>

      {/* Top AppBar Overlay */}
      <div className="absolute top-0 left-0 w-full z-20 pt-8 pb-4 px-6 flex justify-between items-start">
        <button className="flex items-center justify-center size-10 rounded-full bg-black/20 backdrop-blur-md text-white hover:bg-black/30 transition-colors border border-white/10">
          <span className="material-symbols-outlined text-xl">flash_on</span>
        </button>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/20 backdrop-blur-md border border-white/10">
          <div className="size-2 rounded-full bg-accent animate-pulse"></div>
          <span className="text-white text-xs font-semibold tracking-wide uppercase">AI Active</span>
        </div>

        <button 
          onClick={onCancel}
          className="flex items-center justify-center size-10 rounded-full bg-black/20 backdrop-blur-md text-white hover:bg-black/30 transition-colors border border-white/10"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>
      </div>

      {/* Center Focus UI */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none">
        {/* Focus Reticle Square */}
        <div className="relative size-72 flex items-center justify-center">
          {/* Semi-transparent frame mask effect */}
          <div className="absolute inset-0 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)] rounded-[2rem]"></div>
          
          {/* The Reticle Border */}
          <div className="absolute inset-0 rounded-[2rem] border-[3px] border-primary/60 shadow-glow"></div>
          
          {/* Corner Accents */}
          <div className="absolute top-0 left-0 -mt-[2px] -ml-[2px] w-8 h-8 border-t-[4px] border-l-[4px] border-accent rounded-tl-[2rem]"></div>
          <div className="absolute top-0 right-0 -mt-[2px] -mr-[2px] w-8 h-8 border-t-[4px] border-r-[4px] border-accent rounded-tr-[2rem]"></div>
          <div className="absolute bottom-0 left-0 -mb-[2px] -ml-[2px] w-8 h-8 border-b-[4px] border-l-[4px] border-accent rounded-bl-[2rem]"></div>
          <div className="absolute bottom-0 right-0 -mb-[2px] -mr-[2px] w-8 h-8 border-b-[4px] border-r-[4px] border-accent rounded-br-[2rem]"></div>
          
          {/* Scanning Line */}
          <div className="absolute w-[90%] h-[2px] bg-accent/80 shadow-[0_0_10px_rgba(248,221,164,0.6)] rounded-full animate-scan"></div>
        </div>
        
        {/* Instructional Text */}
        <div className="mt-8 bg-black/40 backdrop-blur-md px-5 py-2.5 rounded-xl border border-white/10">
          <h3 className="text-white text-sm font-semibold tracking-wide text-center">Align food within the frame</h3>
        </div>
      </div>

      {/* Bottom Control Panel */}
      <div className="absolute bottom-0 left-0 w-full z-30">
        <div className="w-full rounded-t-[2.5rem] pt-8 pb-8 px-8 flex flex-col items-center shadow-soft bg-white/85 dark:bg-background-dark/85 backdrop-blur-xl border-t border-white/50 dark:border-white/10">
          {/* Controls Row */}
          <div className="flex items-center justify-between w-full max-w-sm mb-4">
            {/* Gallery Button */}
            <button 
                onClick={handleGalleryClick}
                className="relative group flex items-center justify-center size-14 transition-transform active:scale-95"
            >
              <div className="absolute inset-0 bg-neutral-100 dark:bg-neutral-800 rounded-xl rotate-3 group-hover:rotate-6 transition-transform"></div>
              <div className="relative size-14 rounded-xl overflow-hidden border-2 border-white dark:border-neutral-700 shadow-sm">
                <img 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBQg_L5bOwXN6Vm6TQjX5pbjRi8QS92Vqztj5OfKRxusaZ9gaRrlQviNsnNk-0ezp-VasF5amzuOmddFAmCCI3C_KhGCPSYIq1cEwYMMeho4iOzcQGQsU3qgWDPoy_iAdSxs5rMQyMF94hnRwDE0L-yHzuYY3kgg3Du5pB1Tp6MBSz6wEfgw9bNoOM5jq_dVlPVdxTIdWT0omGTFvcgjieA42SQ0cGmO4AC2lH5BegWbcc-jidWgvyaQR12BeFsvl8hno7pBlmN9oTt" 
                  alt="Gallery" 
                  className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                />
              </div>
            </button>

            {/* Shutter Button */}
            <button 
              onClick={handleShutterClick}
              className="group relative flex items-center justify-center size-24 rounded-full transition-transform active:scale-95"
            >
              <div className="absolute inset-0 rounded-full border-[5px] border-primary/30 group-hover:border-primary/50 transition-colors"></div>
              <div className="size-20 bg-primary rounded-full shadow-lg shadow-primary/40 flex items-center justify-center group-hover:bg-primary-dark transition-colors relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-20 h-20 bg-white/20 rounded-full blur-xl"></div>
                <span className="material-symbols-outlined text-white text-4xl opacity-90">photo_camera</span>
              </div>
            </button>

            {/* Tips Button */}
            <button className="flex items-center justify-center size-14 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-primary/20 hover:text-primary transition-colors active:scale-95">
              <span className="material-symbols-outlined text-2xl">tips_and_updates</span>
            </button>
          </div>
          
          <p className="text-neutral-500 dark:text-neutral-400 text-sm font-medium tracking-wide">Snap a photo of your meal</p>
        </div>
      </div>
    </div>
  );
};

export default CameraScreen;