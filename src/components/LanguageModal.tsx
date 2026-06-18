import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

interface LanguageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const languages = [
  { id: 'ar', name: 'العربية', flag: '🇸🇦' },
  { id: 'he', name: 'עברית', flag: '🇮🇱' },
  { id: 'ko', name: '한국어', flag: '🇰🇷' },
  { id: 'fa', name: 'فارسی', flag: '🇮🇷' },
  { id: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
  { id: 'ms', name: 'Bahasa Melayu', flag: '🇲🇾' },
  { id: 'pt', name: 'Português', flag: '🇵🇹' },
  { id: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { id: 'it', name: 'Italiano', flag: '🇮🇹' },
  { id: 'ur', name: 'اردو', flag: '🇵🇰' },
  { id: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { id: 'zh', name: '中文', flag: '🇨🇳' },
  { id: 'ja', name: '日本語', flag: '🇯🇵' },
  { id: 'id', name: 'Bahasa Indonesia', flag: '🇮🇩' },
  { id: 'tl', name: 'Filipino', flag: '🇵🇭' },
  { id: 'pt-br', name: 'Português (Brasil)', flag: '🇧🇷' },
  { id: 'fr', name: 'Français', flag: '🇫🇷' },
  { id: 'es', name: 'Español', flag: '🇪🇸' },
  { id: 'ru', name: 'Русский', flag: '🇷🇺' },
  { id: 'en', name: 'English', flag: '🇬🇧' },
];

export function LanguageModal({ isOpen, onClose }: LanguageModalProps) {
  const { language, setLanguage } = useAppStore();

  const handleSelect = (lang: string) => {
    setLanguage(lang);
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 bg-[#0A0A0F]/90 backdrop-blur-[40px] border-t border-white/10 rounded-t-[2.5rem] p-6 z-[70] max-h-[85vh] overflow-hidden flex flex-col"
          >
            <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-6" />
            
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-display font-semibold">Language</h2>
              <button onClick={onClose} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pb-8 custom-scrollbar">
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {languages.map((lang) => {
                  const isActive = language === lang.name;
                  return (
                    <button
                      key={lang.id}
                      onClick={() => handleSelect(lang.name)}
                      className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all ${
                        isActive 
                          ? 'bg-brand/20 border-brand text-white shadow-[0_0_15px_rgba(99,102,241,0.3)]' 
                          : 'bg-glass-100 border-white/5 text-white/60 hover:bg-glass-200 hover:text-white'
                      }`}
                    >
                      <span className="text-2xl mb-2">{lang.flag}</span>
                      <span className="text-xs font-medium text-center">{lang.name}</span>
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
