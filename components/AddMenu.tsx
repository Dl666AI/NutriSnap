import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface AddMenuProps {
  onClose: () => void;
  onSelectOption: (option: 'CAMERA' | 'GALLERY' | 'MANUAL') => void;
}

const AddMenu: React.FC<AddMenuProps> = ({ onClose, onSelectOption }) => {
  const { t } = useLanguage();
  
  return (
    <div className="fixed inset-0 z-[100] flex flex-col justify-end font-display">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-[enter_0.3s_ease-out]" 
        onClick={onClose}
      ></div>

      {/* Menu Content */}
      <div className="relative bg-surface-light dark:bg-surface-dark rounded-t-[2.5rem] p-6 pb-12 shadow-2xl animate-[float-up_0.4s_cubic-bezier(0.16,1,0.3,1)] border-t border-white/20 dark:border-neutral-700 max-w-md mx-auto w-full">
        
        {/* Handle Bar */}
        <div className="w-full flex justify-center mb-6">
          <div className="w-12 h-1.5 bg-neutral-300 dark:bg-neutral-600 rounded-full"></div>
        </div>

        <div className="mb-8 px-2">
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">{t('log_meal')}</h2>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm">{t('choose_method')}</p>
        </div>

        <div className="grid gap-4">
            {/* Camera Option */}
            <button 
                onClick={() => onSelectOption('CAMERA')}
                className="group flex items-center gap-5 p-4 rounded-3xl bg-white dark:bg-neutral-800 shadow-sm border border-neutral-100 dark:border-neutral-700 hover:border-primary/50 transition-all active:scale-[0.98]"
            >
                <div className="size-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-3xl">photo_camera</span>
                </div>
                <div className="flex flex-col items-start">
                    <span className="text-lg font-bold text-neutral-900 dark:text-white group-hover:text-primary transition-colors">{t('scan_meal')}</span>
                    <span className="text-sm text-neutral-500 dark:text-neutral-400">{t('scan_hint')}</span>
                </div>
                <span className="material-symbols-outlined ml-auto text-neutral-300 group-hover:text-primary transition-colors">chevron_right</span>
            </button>

            {/* Gallery Option */}
            <button 
                onClick={() => onSelectOption('GALLERY')}
                className="group flex items-center gap-5 p-4 rounded-3xl bg-white dark:bg-neutral-800 shadow-sm border border-neutral-100 dark:border-neutral-700 hover:border-accent/50 transition-all active:scale-[0.98]"
            >
                <div className="size-14 rounded-2xl bg-accent/20 text-accent-cream dark:text-accent flex items-center justify-center group-hover:bg-accent group-hover:text-neutral-900 transition-colors">
                    <span className="material-symbols-outlined text-3xl">image</span>
                </div>
                <div className="flex flex-col items-start">
                    <span className="text-lg font-bold text-neutral-900 dark:text-white group-hover:text-accent transition-colors">{t('upload_photo')}</span>
                    <span className="text-sm text-neutral-500 dark:text-neutral-400">{t('upload_hint')}</span>
                </div>
                <span className="material-symbols-outlined ml-auto text-neutral-300 group-hover:text-accent transition-colors">chevron_right</span>
            </button>

            {/* Manual Option */}
            <button 
                onClick={() => onSelectOption('MANUAL')}
                className="group flex items-center gap-5 p-4 rounded-3xl bg-white dark:bg-neutral-800 shadow-sm border border-neutral-100 dark:border-neutral-700 hover:border-neutral-400 transition-all active:scale-[0.98]"
            >
                <div className="size-14 rounded-2xl bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 flex items-center justify-center group-hover:bg-neutral-800 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-neutral-900 transition-colors">
                    <span className="material-symbols-outlined text-3xl">edit_note</span>
                </div>
                <div className="flex flex-col items-start">
                    <span className="text-lg font-bold text-neutral-900 dark:text-white">{t('manual_entry')}</span>
                    <span className="text-sm text-neutral-500 dark:text-neutral-400">{t('manual_hint')}</span>
                </div>
                <span className="material-symbols-outlined ml-auto text-neutral-300">chevron_right</span>
            </button>
        </div>
      </div>
    </div>
  );
};

export default AddMenu;