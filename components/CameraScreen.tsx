import React, { useRef, useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface CameraScreenProps {
  onCapture: (imageSrc?: string) => void;
  onCancel: () => void;
  onManualEntry: () => void;
  autoLaunchGallery?: boolean;
}

const CameraScreen: React.FC<CameraScreenProps> = ({ onCapture, onCancel, onManualEntry, autoLaunchGallery = false }) => {
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function startCamera() {
      try {
        const constraints = {
          video: {
            facingMode: 'environment'
          }
        };
        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error("Camera access denied or error:", err);
        setError(t('camera_error'));
      }
    }

    startCamera();

    // Auto-launch gallery if requested
    if (autoLaunchGallery) {
        // Small timeout to ensure DOM is ready and it feels natural
        setTimeout(() => {
            fileInputRef.current?.click();
        }, 500);
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        // Match canvas dimensions to video feed intrinsic resolution
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Draw current frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert to data URL
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        onCapture(dataUrl);
      }
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark font-display h-screen w-full overflow-hidden relative">
      <input 
        type="file" 
        ref={fileInputRef} 
        accept="image/*" 
        className="hidden" 
        onChange={handleFileChange}
      />
      
      {/* Hidden canvas for capturing */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Camera Feed */}
      <div className="absolute inset-0 z-0 bg-neutral-900">
        {error ? (
          <div className="flex flex-col items-center justify-center h-full text-white p-8 text-center">
            <span className="material-symbols-outlined text-6xl mb-4 text-red-400">no_photography</span>
            <p className="font-bold text-lg">{error}</p>
            <button 
              onClick={onManualEntry}
              className="mt-6 bg-white/10 hover:bg-white/20 px-6 py-3 rounded-xl border border-white/20 transition-colors"
            >
              {t('use_manual_entry')}
            </button>
          </div>
        ) : (
          <video 
            ref={videoRef}
            autoPlay 
            playsInline 
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-transparent via-transparent to-black/30"></div>
      </div>

      {/* Top Controls */}
      <div className="absolute top-0 left-0 w-full z-20 pt-8 pb-4 px-6 flex justify-between items-start">
        <button className="flex items-center justify-center size-10 rounded-full bg-black/20 backdrop-blur-md text-white hover:bg-black/30 transition-colors border border-white/10">
          <span className="material-symbols-outlined text-xl">flash_on</span>
        </button>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/20 backdrop-blur-md border border-white/10">
          <div className="size-2 rounded-full bg-accent animate-pulse"></div>
          <span className="text-white text-xs font-semibold tracking-wide uppercase">{t('ai_vision_active')}</span>
        </div>

        <button 
          onClick={onCancel}
          className="flex items-center justify-center size-10 rounded-full bg-black/20 backdrop-blur-md text-white hover:bg-black/30 transition-colors border border-white/10"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>
      </div>

      {/* Viewfinder Overlay */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none">
        <div className="relative size-72 flex items-center justify-center">
          <div className="absolute inset-0 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)] rounded-[2.5rem]"></div>
          <div className="absolute inset-0 rounded-[2.5rem] border-[3px] border-primary/60 shadow-glow"></div>
          
          {/* Corner accents */}
          <div className="absolute top-0 left-0 -mt-[2px] -ml-[2px] w-8 h-8 border-t-[4px] border-l-[4px] border-accent rounded-tl-[2rem]"></div>
          <div className="absolute top-0 right-0 -mt-[2px] -mr-[2px] w-8 h-8 border-t-[4px] border-r-[4px] border-accent rounded-tr-[2rem]"></div>
          <div className="absolute bottom-0 left-0 -mb-[2px] -ml-[2px] w-8 h-8 border-b-[4px] border-l-[4px] border-accent rounded-bl-[2rem]"></div>
          <div className="absolute bottom-0 right-0 -mb-[2px] -mr-[2px] w-8 h-8 border-b-[4px] border-r-[4px] border-accent rounded-br-[2rem]"></div>
          
          {/* Scanning line animation */}
          {!error && (
            <div className="absolute w-[90%] h-[2px] bg-accent/80 shadow-[0_0_10px_rgba(248,221,164,0.6)] rounded-full animate-scan"></div>
          )}
        </div>
        <div className="mt-8 bg-black/40 backdrop-blur-md px-5 py-2.5 rounded-xl border border-white/10">
          <h3 className="text-white text-sm font-semibold tracking-wide text-center">{t('center_meal')}</h3>
        </div>
      </div>

      {/* Bottom Controls Bar */}
      <div className="absolute bottom-0 left-0 w-full z-30">
        <div className="w-full rounded-t-[2.5rem] pt-8 pb-8 px-8 flex flex-col items-center shadow-soft bg-white/85 dark:bg-background-dark/85 backdrop-blur-xl border-t border-white/50 dark:border-white/10">
          <div className="flex items-center justify-between w-full max-w-sm mb-4">
            {/* Gallery Picker */}
            <button 
                onClick={handleGalleryClick}
                className="relative group flex items-center justify-center size-14 transition-transform active:scale-95"
            >
              <div className="absolute inset-0 bg-neutral-100 dark:bg-neutral-800 rounded-xl rotate-3 group-hover:rotate-6 transition-transform"></div>
              <div className="relative size-14 rounded-xl overflow-hidden border-2 border-white dark:border-neutral-700 shadow-sm">
                <img 
                  src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=200&h=200" 
                  alt="Gallery" 
                  className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                />
              </div>
            </button>

            {/* Shutter Button */}
            <button 
              onClick={handleShutterClick}
              disabled={!!error}
              className="group relative flex items-center justify-center size-24 rounded-full transition-transform active:scale-95 disabled:opacity-50 disabled:active:scale-100"
            >
              <div className="absolute inset-0 rounded-full border-[5px] border-primary/30 group-hover:border-primary/50 transition-colors"></div>
              <div className="size-20 bg-primary rounded-full shadow-lg shadow-primary/40 flex items-center justify-center group-hover:bg-primary-dark transition-colors relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-20 h-20 bg-white/20 rounded-full blur-xl"></div>
                <span className="material-symbols-outlined text-white text-4xl opacity-90">photo_camera</span>
              </div>
            </button>

            {/* Manual Entry Button */}
            <button 
              onClick={onManualEntry}
              className="flex items-center justify-center size-14 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-primary/20 hover:text-primary transition-colors active:scale-95"
            >
              <span className="material-symbols-outlined text-2xl">edit_note</span>
            </button>
          </div>
          
          <p className="text-neutral-500 dark:text-neutral-400 text-sm font-medium tracking-wide">{t('take_photo_hint')}</p>
        </div>
      </div>
    </div>
  );
};

export default CameraScreen;