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
            className="fixed inset-0 bg-black/20 backdrop-blur-[10px] z-[60]"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-2 right-2 bg-white/90 backdrop-blur-[50px] @supports(backdrop-filter:blur(50px)){backdrop-saturate-150} border border-black/5 rounded-[28px] rounded-bl-[16px] rounded-br-[16px] p-4 z-[70] max-h-[85vh] overflow-hidden flex flex-col mb-2 shadow-xl"
          >
            <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-3" />
            
            <div className="flex justify-between items-center mb-3 px-1">
              <h2 className="text-[17px] font-medium text-gray-900 tracking-wide">{t(language, 'language')}</h2>
              <button onClick={onClose} className="p-1.5 bg-gray-100 rounded-full hover:bg-gray-200 transition border border-black/5">
                <X className="w-4 h-4 text-gray-500" strokeWidth={1.5} />
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
                          ? 'bg-brand/5 border-brand/20 text-brand shadow-sm' 
                          : 'bg-gray-50 border-black/5 text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <span className="text-xl mb-1.5 drop-shadow-sm leading-none">{lang.flag}</span>
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
