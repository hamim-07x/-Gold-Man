import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore, dbHelpers } from '../store/useAppStore';
import { Languages, Info, Shield, BookOpen, MessageCircle, X, Wallet } from 'lucide-react';
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
              className="fixed inset-0 bg-black/40 backdrop-blur-[12px] z-50 transition-all"
            />

            {/* Sidebar Content */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              className="fixed top-0 left-0 bottom-0 w-[82%] max-w-[300px] bg-[#050505]/60 backdrop-blur-[50px] @supports(backdrop-filter:blur(50px)){backdrop-saturate-150} border-r border-white/[0.05] shadow-[inset_-1px_0_1px_rgba(255,255,255,0.05),20px_0_40px_rgba(0,0,0,0.5)] z-50 flex flex-col pt-2"
            >
              {/* Header */}
              <div className="p-5 flex items-center justify-between">
                <span className="font-display font-bold text-lg tracking-[0.2em] text-white/90">GSCL</span>
                <button onClick={onClose} className="p-1.5 text-white/40 hover:text-white rounded-full bg-white/5 border border-white/5 active:scale-95 transition-all">
                  <X className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </div>

              {/* Profile Overview */}
              <div className="px-5 py-2">
                <div className="flex items-center gap-3.5 mb-5">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-brand to-brand-light p-[1.5px] shadow-lg shadow-brand/20">
                    <div className="w-full h-full rounded-full bg-[#050505] flex items-center justify-center overflow-hidden">
                      {currentUser?.photoUrl ? (
                        <img src={currentUser.photoUrl} alt="avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-lg font-bold tracking-tight">{currentUser?.firstName?.[0] || 'U'}</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-[15px] tracking-wide flex items-center gap-1.5">
                      {currentUser?.username?.toUpperCase() || currentUser?.firstName?.toUpperCase() || 'USER'}
                      <span className="w-3.5 h-3.5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[8px] font-bold shadow-sm">✓</span>
                    </h3>
                    <p 
                      onClick={handleIdClick}
                      className="text-white/30 text-[10px] font-mono cursor-pointer tracking-wider uppercase mt-0.5"
                    >
                      ID: {currentUser?.id || '00000000'}
                    </p>
                  </div>
                </div>

                {/* Balance Card inside Sidebar */}
                <div className="glass-card p-4 flex flex-col gap-1.5 relative overflow-hidden ring-1 ring-white/5 border-none bg-white/5 hover:bg-white-[0.07] transition-all">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-brand/30 blur-[40px] rounded-full pointer-events-none" />
                  <span className="text-white/40 text-[11px] flex items-center gap-1.5 tracking-wider uppercase">
                    <Wallet className="w-3.5 h-3.5 text-brand-light" strokeWidth={1.5} /> {t(language, 'balance')}
                  </span>
                  <div className="text-[22px] font-medium tracking-tight">
                    {currentUser?.balance.toFixed(2)} <span className="text-brand-light text-sm font-semibold tracking-widest ml-0.5">USDT</span>
                  </div>
                </div>
              </div>

              <div className="h-[1px] bg-white-[0.03] mx-5 my-2" />

              {/* Menu Items */}
              <div className="flex-1 px-3 py-2 flex flex-col gap-1 overflow-y-auto custom-scrollbar">
                <MenuButton icon={Languages} label={t(language, 'language')} onClick={() => setShowLang(true)} />
                <MenuButton icon={Info} label={t(language, 'company')} />
                <MenuButton icon={Shield} label={t(language, 'legal')} />
                <MenuButton icon={BookOpen} label={t(language, 'tutorials')} />
              </div>

              {/* Footer */}
              <div className="p-5 pb-8">
                <button className="w-full glass-button flex items-center gap-3 py-3 px-4 rounded-xl text-white/70 hover:text-white group border-white/5 bg-brand/5 ring-1 ring-white/5 shadow-none active:bg-brand/10">
                  <MessageCircle className="w-4 h-4 text-brand-light group-hover:scale-110 transition-transform" strokeWidth={1.5} />
                  <span className="font-medium text-sm tracking-wide">{t(language, 'support')}</span>
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

function MenuButton({ icon: Icon, label, onClick }: { icon: any, label: string, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="flex items-center gap-3.5 px-3 py-3.5 w-full text-left text-white/60 hover:text-white hover:bg-white/5 rounded-xl transition-all active:scale-[0.98]"
    >
      <Icon className="w-4 h-4 text-white/40 shrink-0" strokeWidth={1.5} />
      <span className="font-medium text-[13px] tracking-wide leading-tight">{label}</span>
    </button>
  );
}
