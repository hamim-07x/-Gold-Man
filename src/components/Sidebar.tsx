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
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 transition-all"
            />

            {/* Sidebar Content */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              className="fixed top-0 left-0 bottom-0 w-[82%] max-w-[300px] bg-black/50 backdrop-blur-3xl @supports(backdrop-filter:blur(50px)){backdrop-saturate-200} border-r border-white/[0.05] shadow-[20px_0_40px_rgba(0,0,0,0.8)] z-50 flex flex-col pt-2"
            >
              <div className="absolute top-[-5%] left-[-10%] w-[200px] h-[200px] bg-brand/20 blur-[80px] rounded-full pointer-events-none" />
              
              {/* Header */}
              <div className="p-5 flex items-center justify-between z-10">
                <span className="font-display font-bold text-lg tracking-[0.2em] text-white/90 drop-shadow-[0_0_8px_rgba(255,255,255,0.4)] flex items-center gap-2">
                   <Hexagon className="w-5 h-5 text-accent-light" /> GSCL
                </span>
                <button onClick={onClose} className="p-1.5 text-white/40 hover:text-white rounded-full bg-white/5 border border-white/5 active:scale-95 transition-all">
                  <X className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </div>

              {/* Profile Overview */}
              <div className="px-5 py-2 z-10">
                <div className="flex items-center gap-3.5 mb-5">
                  <div className="relative w-12 h-12 rounded-full p-[2px] shadow-lg shadow-brand/30">
                    <div className="absolute inset-0 bg-gradient-to-tr from-brand via-glow-pink to-accent-light rounded-full animate-pulse" />
                    <div className="relative w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden border border-white/10">
                      {currentUser?.photoUrl ? (
                        <img src={currentUser.photoUrl} alt="avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-lg font-bold tracking-tight text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]">{currentUser?.firstName?.[0] || 'U'}</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-[15px] tracking-wide flex items-center gap-1.5 text-white/95">
                      {currentUser?.username?.toUpperCase() || currentUser?.firstName?.toUpperCase() || 'USER'}
                      <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[8px] font-bold shadow-[0_0_8px_rgba(16,185,129,0.5)]">✓</span>
                    </h3>
                    <p 
                      onClick={handleIdClick}
                      className="text-white/30 text-[10px] font-mono cursor-pointer tracking-wider uppercase mt-0.5 hover:text-white/50 transition-colors"
                    >
                      ID: {currentUser?.id || '00000000'}
                    </p>
                  </div>
                </div>

                {/* Level Card */}
                <div className="p-4 flex flex-col gap-1.5 relative overflow-hidden rounded-2xl bg-white/[0.03] border border-white/5 shadow-inner shadow-white/5">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-brand/20 blur-[40px] rounded-full pointer-events-none" />
                  <span className="text-white/40 text-[10px] tracking-[0.2em] uppercase font-semibold">
                    Current Level
                  </span>
                  <div className="text-[20px] font-mono font-medium tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-brand-light to-glow-pink">
                    Lvl 1 <span className="text-white/40 text-[12px] font-sans tracking-widest ml-1 uppercase">Novice</span>
                  </div>
                </div>
              </div>

              <div className="h-[1px] bg-white/[0.05] mx-5 my-4" />

              {/* Menu Items */}
              <div className="flex-1 px-3 py-2 flex flex-col gap-1 overflow-y-auto custom-scrollbar z-10">
                <MenuButton icon={Languages} label={t(language, 'language')} onClick={() => setShowLang(true)} color="text-accent-light" />
                <MenuButton icon={Info} label={t(language, 'company')} color="text-brand-light" />
                <MenuButton icon={Shield} label={t(language, 'legal')} color="text-glow-pink" />
                <MenuButton icon={BookOpen} label={t(language, 'tutorials')} color="text-amber-400" />
              </div>

              {/* Footer */}
              <div className="p-5 pb-8 flex flex-col gap-3 z-10">
                <button className="w-full bg-brand/10 hover:bg-brand/20 border border-brand/20 flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl text-brand-light group transition-all active:scale-[0.98] shadow-[0_0_15px_rgba(139,92,246,0.1)]">
                  <MessageCircle className="w-4 h-4 group-hover:scale-110 transition-transform" strokeWidth={1.5} />
                  <span className="font-semibold text-[13px] tracking-wide uppercase">{t(language, 'support')}</span>
                </button>
                <button 
                  onClick={() => { window.dispatchEvent(new CustomEvent('open-admin-direct')); onClose(); }}
                  className="w-full bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl text-white/50 group transition-all active:scale-[0.98]"
                >
                  <Settings className="w-4 h-4 group-hover:rotate-90 transition-transform duration-500" strokeWidth={1.5} />
                  <span className="font-semibold text-[13px] tracking-wide uppercase">Admin Panel</span>
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
      className="flex items-center gap-3.5 px-4 py-3.5 w-full text-left text-white/60 hover:text-white hover:bg-white/5 rounded-[1.2rem] transition-all active:scale-[0.98] group"
    >
      <div className={cn("w-8 h-8 rounded-full bg-white/5 border border-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors shadow-inner", color)}>
        <Icon className="w-4 h-4" strokeWidth={1.5} />
      </div>
      <span className="font-medium text-[13px] tracking-wide leading-tight group-hover:translate-x-1 transition-transform">{label}</span>
    </button>
  );
}
