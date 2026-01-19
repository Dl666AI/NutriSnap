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
  
  // Only start active if NOT auto-launching gallery
  const [isCameraActive, setIsCameraActive] = useState(!autoLaunchGallery);
  
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let currentStream: MediaStream | null = null;
    let isActive = true;

    async function startCamera() {
      try {
        const constraints = {
          video: {
            facingMode: 'environment'
          }
        };
        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        
        // Check if unmounted or deactivated during load
        if (!isActive) {
            mediaStream.getTracks().forEach(track => track.stop());
            return;
        }

        currentStream = mediaStream;
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        setError(null);
      } catch (err) {
        console.error("Camera access denied or error:", err);
        if (isActive) setError(t('camera_error'));
      }
    }

    if (isCameraActive) {
        startCamera();
    } else {
        // Stop stream if deactivated
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    }

    // Cleanup function
    return () => {
      isActive = false;
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isCameraActive]); // Only re-run if activation state changes

  // Auto-launch gallery if requested
  useEffect(() => {
    if (autoLaunchGallery) {
        // Small timeout to ensure DOM is ready and it feels natural
        setTimeout(() => {
            fileInputRef.current?.click();
        }, 500);
    }
  }, [autoLaunchGallery]);

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
    // If camera is inactive (e.g. paused from gallery mode), tap starts it
    if (!isCameraActive) {
        setIsCameraActive(true);
        return;
    }

    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        // OPTIMIZATION: Scale down image to avoid LocalStorage Quota Exceeded errors
        const MAX_DIMENSION = 800;
        let width = video.videoWidth;
        let height = video.videoHeight;

        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
            const ratio = width / height;
            if (width > height) {
                width = MAX_DIMENSION;
                height = width / ratio;
            } else {
                height = MAX_DIMENSION;
                width = height * ratio;
            }
        }

        canvas.width = width;
        canvas.height = height;
        
        // Draw current frame to canvas
        context.drawImage(video, 0, 0, width, height);
        
        // Convert to data URL with slightly reduced quality
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
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
          <div className="flex flex-col items-center justify-center h-full text-white p-8 text-center animate-enter">
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
          <>
            <video 
                ref={videoRef}
                autoPlay 
                playsInline 
                className={`w-full h-full object-cover transition-opacity duration-500 ${isCameraActive ? 'opacity-100' : 'opacity-0'}`}
            />
            
            {/* Standby Mode UI */}
            {!isCameraActive && (
                <div className="absolute inset-0 flex items-center justify-center z-10 animate-enter">
                    <button 
                        onClick={() => setIsCameraActive(true)}
                        className="flex flex-col items-center gap-3 p-6 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all group active:scale-95"
                    >
                        <div className="size-16 rounded-full bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform shadow-glow">
                            <span className="material-symbols-outlined text-3xl text-white">videocam</span>
                        </div>
                        <span className="font-bold text-white text-lg tracking-wide">{t('start_camera')}</span>
                    </button>
                </div>
            )}
          </>
        )}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-transparent via-transparent to-black/30 pointer-events-none"></div>
      </div>

      {/* Top Controls */}
      <div className="absolute top-0 left-0 w-full z-20 pt-8 pb-4 px-6 flex justify-between items-start">
        <button 
            className={`flex items-center justify-center size-10 rounded-full bg-black/20 backdrop-blur-md text-white hover:bg-black/30 transition-colors border border-white/10 ${!isCameraActive ? 'opacity-50' : ''}`}
            disabled={!isCameraActive}
        >
          <span className="material-symbols-outlined text-xl">flash_on</span>
        </button>

        {isCameraActive && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/20 backdrop-blur-md border border-white/10 animate-[float-up_0.3s_ease-out]">
            <div className="size-2 rounded-full bg-accent animate-pulse"></div>
            <span className="text-white text-xs font-semibold tracking-wide uppercase">{t('ai_vision_active')}</span>
            </div>
        )}

        <button 
          onClick={onCancel}
          className="flex items-center justify-center size-10 rounded-full bg-black/20 backdrop-blur-md text-white hover:bg-black/30 transition-colors border border-white/10"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>
      </div>

      {/* Viewfinder Overlay - Only show when active */}
      {isCameraActive && !error && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none animate-[breath_4s_ease-in-out_infinite]">
            <div className="relative size-72 flex items-center justify-center">
            <div className="absolute inset-0 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)] rounded-[2.5rem]"></div>
            <div className="absolute inset-0 rounded-[2.5rem] border-[3px] border-primary/60 shadow-glow"></div>
            
            {/* Corner accents */}
            <div className="absolute top-0 left-0 -mt-[2px] -ml-[2px] w-8 h-8 border-t-[4px] border-l-[4px] border-accent rounded-tl-[2rem]"></div>
            <div className="absolute top-0 right-0 -mt-[2px] -mr-[2px] w-8 h-8 border-t-[4px] border-r-[4px] border-accent rounded-tr-[2rem]"></div>
            <div className="absolute bottom-0 left-0 -mb-[2px] -ml-[2px] w-8 h-8 border-b-[4px] border-l-[4px] border-accent rounded-bl-[2rem]"></div>
            <div className="absolute bottom-0 right-0 -mb-[2px] -mr-[2px] w-8 h-8 border-b-[4px] border-r-[4px] border-accent rounded-br-[2rem]"></div>
            
            {/* Scanning line animation */}
            <div className="absolute w-[90%] h-[2px] bg-accent/80 shadow-[0_0_10px_rgba(248,221,164,0.6)] rounded-full animate-scan"></div>
            </div>
            <div className="mt-8 bg-black/40 backdrop-blur-md px-5 py-2.5 rounded-xl border border-white/10">
            <h3 className="text-white text-sm font-semibold tracking-wide text-center">{t('center_meal')}</h3>
            </div>
        </div>
      )}

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
              <div className={`absolute inset-0 rounded-full border-[5px] transition-colors ${isCameraActive ? 'border-primary/30 group-hover:border-primary/50' : 'border-neutral-400/30'}`}></div>
              <div className={`size-20 rounded-full shadow-lg flex items-center justify-center transition-colors relative overflow-hidden ${isCameraActive ? 'bg-primary shadow-primary/40 group-hover:bg-primary-dark' : 'bg-neutral-400 shadow-neutral-400/40 group-hover:bg-neutral-500'}`}>
                {isCameraActive && <div className="absolute -top-10 -right-10 w-20 h-20 bg-white/20 rounded-full blur-xl"></div>}
                <span className="material-symbols-outlined text-white text-4xl opacity-90">
                    {isCameraActive ? 'photo_camera' : 'videocam'}
                </span>
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
          
          <p className="text-neutral-500 dark:text-neutral-400 text-sm font-medium tracking-wide">
              {isCameraActive ? t('take_photo_hint') : t('start_camera')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CameraScreen;