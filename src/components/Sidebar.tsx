import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore, dbHelpers } from '../store/useAppStore';
import { Languages, Info, Shield, BookOpen, MessageCircle, X, Settings, Hexagon } from 'lucide-react';
import { cn } from '../lib/utils';
import { LanguageModal } from './LanguageModal';
import { t } from '../lib/i18n';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { currentUser, language } = useAppStore();
  const [showLang, setShowLang] = useState(false);

  // Admin access via long press or clicking ID
  const [clickCount, setClickCount] = useState(0);

  const handleIdClick = () => {
    setClickCount(c => c + 1);
    if (clickCount >= 4) {
      window.dispatchEvent(new CustomEvent('open-admin-login'));
      setClickCount(0);
      onClose();
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 transition-all"
            />

            {/* Sidebar Content */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              className="fixed top-0 left-0 bottom-0 w-[82%] max-w-[300px] bg-white backdrop-blur-3xl @supports(backdrop-filter:blur(50px)){backdrop-saturate-200} border-r border-black/5 shadow-2xl z-50 flex flex-col pt-2"
            >
              <div className="absolute top-[-5%] left-[-10%] w-[200px] h-[200px] bg-brand/5 blur-[80px] rounded-full pointer-events-none" />
              
              {/* Header */}
              <div className="p-5 flex items-center justify-between z-10">
                <span className="font-display font-medium text-lg tracking-[0.2em] text-gray-900 flex items-center gap-2">
                   <Hexagon className="w-5 h-5 text-brand" /> GSCL
                </span>
                <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-900 rounded-full bg-gray-50 border border-black/5 active:scale-95 transition-all">
                  <X className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </div>

              {/* Profile Overview */}
              <div className="px-5 py-2 z-10">
                <div className="flex items-center gap-4 mb-5">
                  <div className="relative w-12 h-12 rounded-full p-[2px] shadow-sm shadow-brand/10 bg-white">
                    <div className="absolute inset-0 bg-gradient-to-tr from-brand to-brand/50 rounded-full" />
                    <div className="relative w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden border border-white">
                      {currentUser?.photoUrl ? (
                        <img src={currentUser.photoUrl} alt="avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-lg font-extrabold tracking-tight text-brand">{currentUser?.firstName?.[0] || 'U'}</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-[15px] tracking-wide flex items-center gap-1.5 text-gray-900">
                      {currentUser?.username?.toUpperCase() || currentUser?.firstName?.toUpperCase() || 'USER'}
                      <span className="w-3.5 h-3.5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[8px] font-extrabold">✓</span>
                    </h3>
                    <p 
                      onClick={handleIdClick}
                      className="text-gray-600 text-[10px] font-mono cursor-pointer tracking-wider font-bold uppercase mt-0.5 hover:text-gray-800 transition-colors"
                    >
                      ID: {currentUser?.id || '00000000'}
                    </p>
                  </div>
                </div>

                {/* Level Card */}
                <div className="p-4 flex flex-col gap-1.5 relative overflow-hidden rounded-[1.25rem] bg-gray-100 border border-black/10 shadow-sm">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-brand/10 blur-[30px] rounded-full pointer-events-none" />
                  <span className="text-gray-700 text-[10px] tracking-[0.2em] uppercase font-extrabold">
                    Current Level
                  </span>
                  <div className="text-[20px] font-mono font-bold tracking-tight text-gray-900 drop-shadow-sm">
                    Lvl 1 <span className="text-gray-600 text-[12px] font-sans tracking-widest ml-1 uppercase font-bold">Novice</span>
                  </div>
                </div>
              </div>

              <div className="h-[1px] bg-black/10 mx-5 my-4" />

              {/* Menu Items */}
              <div className="flex-1 px-3 py-2 flex flex-col gap-1 overflow-y-auto custom-scrollbar z-10">
                <MenuButton icon={Languages} label={t(language, 'language')} onClick={() => setShowLang(true)} color="text-brand" />
                <MenuButton icon={Info} label={t(language, 'company')} color="text-emerald-600" />
                <MenuButton icon={Shield} label={t(language, 'legal')} color="text-amber-600" />
                <MenuButton icon={BookOpen} label={t(language, 'tutorials')} color="text-indigo-600" />
              </div>

              {/* Footer */}
              <div className="p-5 pb-8 flex flex-col gap-3 z-10">
                <button className="w-full bg-brand/10 hover:bg-brand/20 border border-brand/20 flex items-center justify-center gap-3 py-3.5 px-4 rounded-[1rem] text-brand group transition-all active:scale-[0.98] shadow-sm">
                  <MessageCircle className="w-4 h-4 group-hover:scale-110 transition-transform" strokeWidth={2.5} />
                  <span className="font-extrabold text-[11px] tracking-widest uppercase text-brand">Support</span>
                </button>
                <button 
                  onClick={() => { window.dispatchEvent(new CustomEvent('open-admin-direct')); onClose(); }}
                  className="w-full bg-gray-100 hover:bg-gray-200 border border-black/10 flex items-center justify-center gap-3 py-3.5 px-4 rounded-[1rem] text-gray-700 group transition-all active:scale-[0.98] shadow-sm"
                >
                  <Settings className="w-4 h-4 group-hover:rotate-90 transition-transform duration-500 text-gray-700" strokeWidth={2.5} />
                  <span className="font-extrabold text-[11px] tracking-widest uppercase text-gray-800">Admin Panel</span>
                </button>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

      <LanguageModal isOpen={showLang} onClose={() => setShowLang(false)} />
    </>
  );
}

function MenuButton({ icon: Icon, label, onClick, color }: { icon: any, label: string, onClick?: () => void, color?: string }) {
  return (
    <button 
      onClick={onClick}
      className="flex items-center gap-3.5 px-4 py-3.5 w-full text-left font-bold text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-[1rem] transition-all active:scale-[0.98] group"
    >
      <div className={cn("w-8 h-8 rounded-full bg-gray-100 border border-black/10 flex items-center justify-center group-hover:bg-white transition-colors shadow-sm", color)}>
        <Icon className="w-4 h-4" strokeWidth={2.5} />
      </div>
      <span className="font-extrabold text-[11px] tracking-widest uppercase leading-tight group-hover:translate-x-1 transition-transform text-gray-800">{label}</span>
    </button>
  );
}
