import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface AuthSimulationProps {
  provider: 'google' | 'apple';
  onSuccess: (user: User) => void;
  onCancel: () => void;
}

const AuthSimulation: React.FC<AuthSimulationProps> = ({ provider, onSuccess, onCancel }) => {
  const { t } = useLanguage();
  const [step, setStep] = useState<'PICKER' | 'LOADING' | 'SUCCESS'>('PICKER');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const mockUsers: Record<'google' | 'apple', User[]> = {
    google: [
      {
        id: 'g_1',
        name: 'Alex Rivera',
        email: 'alex.rivera@gmail.com',
        photoUrl: 'https://ui-avatars.com/api/?name=Alex+Rivera&background=4285F4&color=fff'
      },
      {
        id: 'g_2',
        name: 'Jordan Smith',
        email: 'jordan.s@gmail.com',
        photoUrl: 'https://ui-avatars.com/api/?name=Jordan+Smith&background=34A853&color=fff'
      }
    ],
    apple: [
      {
        id: 'a_1',
        name: 'Sarah Chen',
        email: 's.chen@icloud.com',
        photoUrl: 'https://ui-avatars.com/api/?name=Sarah+Chen&background=000&color=fff'
      }
    ]
  };

  const handleSelect = (user: User) => {
    setSelectedUser(user);
    setStep('LOADING');
  };

  useEffect(() => {
    if (step === 'LOADING') {
      const timer = setTimeout(() => {
        setStep('SUCCESS');
      }, 1500);
      return () => clearTimeout(timer);
    }
    if (step === 'SUCCESS' && selectedUser) {
      const timer = setTimeout(() => {
        onSuccess(selectedUser);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [step, selectedUser, onSuccess]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center font-display p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-enter" onClick={onCancel}></div>
      
      <div className="relative bg-white dark:bg-neutral-900 rounded-[2.5rem] w-full max-w-sm overflow-hidden shadow-2xl animate-[float-up_0.4s_ease-out_forwards]">
        {step === 'PICKER' && (
          <div className="p-8 flex flex-col items-center">
            {/* Logo */}
            <div className="size-16 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-6">
              {provider === 'google' ? (
                <svg className="size-8" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24s.92 7.54 2.56 10.78l7.97-6.19z"></path>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                </svg>
              ) : (
                <svg className="size-8 dark:fill-white" viewBox="0 0 24 24">
                  <path d="M17.05 20.28c-.98.95-2.05 1.78-3.14 1.78-1.09 0-1.45-.67-2.73-.67-1.27 0-1.7.64-2.7.67-1.02.03-2.07-.86-3.13-1.87C3.2 18.06 1.34 14.15 1.34 10.61c0-3.53 2.18-5.39 4.31-5.39 1.12 0 2.05.67 2.76.67.71 0 1.83-.73 3.12-.73 1.36 0 2.55.51 3.32 1.48-3.12 1.76-2.61 5.91.5 7.15-.71 1.71-1.63 3.42-2.3 4.49zM12.03 4.54c-.11-1.89 1.48-3.53 3.2-3.53.11 1.94-1.61 3.65-3.2 3.53z"></path>
                </svg>
              )}
            </div>

            <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-1">{t('choose_account')}</h3>
            <p className="text-sm text-neutral-500 mb-8">{t('continue_to')}</p>

            <div className="w-full space-y-3">
              {mockUsers[provider].map((u) => (
                <button
                  key={u.id}
                  onClick={() => handleSelect(u)}
                  className="w-full p-4 flex items-center gap-4 bg-surface-light dark:bg-neutral-800 rounded-2xl border border-transparent hover:border-primary/30 transition-all active:scale-[0.98]"
                >
                  <img src={u.photoUrl} alt="" className="size-10 rounded-full border border-neutral-200 dark:border-neutral-700" />
                  <div className="flex flex-col items-start">
                    <span className="font-bold text-neutral-800 dark:text-neutral-100 text-sm">{u.name}</span>
                    <span className="text-xs text-neutral-500">{u.email}</span>
                  </div>
                  <span className="material-symbols-outlined ml-auto text-neutral-300">chevron_right</span>
                </button>
              ))}

              <button className="w-full p-4 flex items-center gap-4 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors">
                <div className="size-10 rounded-full bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center">
                  <span className="material-symbols-outlined">person_add</span>
                </div>
                <span className="text-sm font-semibold">{t('use_another')}</span>
              </button>
            </div>

            <div className="mt-8 pt-6 border-t border-neutral-100 dark:border-neutral-800 w-full flex justify-center">
              <button onClick={onCancel} className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 text-sm font-bold py-2 px-4">
                {t('cancel')}
              </button>
            </div>
          </div>
        )}

        {step === 'LOADING' && (
          <div className="p-12 flex flex-col items-center justify-center min-h-[300px]">
            <div className="size-14 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-6"></div>
            <p className="font-bold text-neutral-800 dark:text-white">{t('signing_in')}</p>
          </div>
        )}

        {step === 'SUCCESS' && (
          <div className="p-12 flex flex-col items-center justify-center min-h-[300px] animate-enter">
            <div className="size-16 bg-primary rounded-full flex items-center justify-center mb-6 shadow-glow">
              <span className="material-symbols-outlined text-white text-3xl">check</span>
            </div>
            <p className="font-bold text-neutral-800 dark:text-white text-xl">{t('welcome_back')}</p>
            <p className="text-neutral-500 text-sm mt-1">{selectedUser?.name}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthSimulation;