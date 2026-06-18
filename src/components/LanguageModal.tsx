import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { t } from '../lib/i18n';

interface LanguageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const languages = [
  { id: 'en', name: 'English', flag: '🇬🇧' },
  { id: 'bn', name: 'বাংলা', flag: '🇧🇩' },
  { id: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { id: 'ar', name: 'العربية', flag: '🇸🇦' },
  { id: 'es', name: 'Español', flag: '🇪🇸' },
  { id: 'ru', name: 'Русский', flag: '🇷🇺' },
  { id: 'fr', name: 'Français', flag: '🇫🇷' },
  { id: 'zh', name: '中文', flag: '🇨🇳' },
  { id: 'pt', name: 'Português', flag: '🇵🇹' },
  { id: 'ja', name: '日本語', flag: '🇯🇵' },
  { id: 'ko', name: '한국어', flag: '🇰🇷' },
  { id: 'id', name: 'Bahasa', flag: '🇮🇩' },
];

export function LanguageModal({ isOpen, onClose }: LanguageModalProps) {
  const { language, setLanguage } = useAppStore();

  const handleSelect = (langId: string) => {
    setLanguage(langId);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-[10px] z-[60]"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-2 right-2 bg-gradient-to-b from-[#121218]/80 to-[#050505]/90 backdrop-blur-[50px] @supports(backdrop-filter:blur(50px)){backdrop-saturate-150} border-[0.5px] border-white/10 rounded-[28px] rounded-bl-[16px] rounded-br-[16px] p-4 z-[70] max-h-[85vh] overflow-hidden flex flex-col mb-2 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_-10px_40px_rgba(0,0,0,0.5)]"
          >
            <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-3" />
            
            <div className="flex justify-between items-center mb-3 px-1">
              <h2 className="text-[17px] font-medium tracking-wide">{t(language, 'language')}</h2>
              <button onClick={onClose} className="p-1.5 bg-white/5 rounded-full hover:bg-white/10 transition border border-white/5">
                <X className="w-4 h-4 text-white/70" strokeWidth={1.5} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pb-2 custom-scrollbar px-1">
              <div className="grid grid-cols-4 gap-2">
                {languages.map((lang) => {
                  const isActive = language === lang.id;
                  return (
                    <button
                      key={lang.id}
                      onClick={() => handleSelect(lang.id)}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border transition-all active:scale-95 aspect-square ${
                        isActive 
                          ? 'bg-brand/10 border-brand-light/40 text-white shadow-[0_0_15px_rgba(96,165,250,0.15)] ring-1 ring-brand-light/50' 
                          : 'bg-white/5 border-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <span className="text-xl mb-1.5 drop-shadow-md leading-none">{lang.flag}</span>
                      <span className="text-[10px] sm:text-[11px] font-medium text-center tracking-wide leading-tight">{lang.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
