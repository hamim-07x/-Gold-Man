import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from '../store/useAppStore';
import { Languages, Info, Shield, BookOpen, MessageCircle, AlertCircle, X, Wallet } from 'lucide-react';
import { cn } from '../lib/utils';
import { LanguageModal } from './LanguageModal';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { currentUser } = useAppStore();
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
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />

            {/* Sidebar Content */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-[85%] max-w-[320px] bg-[#0A0A0F]/90 backdrop-blur-[40px] border-r border-white/[0.05] z-50 flex flex-col"
            >
              {/* Header */}
              <div className="p-6 flex items-center justify-between">
                <span className="font-display font-bold text-xl tracking-widest text-white">GSCL</span>
                <button onClick={onClose} className="p-2 text-white/50 hover:text-white rounded-full bg-white/5">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Profile Overview */}
              <div className="px-6 py-2">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-brand to-brand-light p-[2px]">
                    <div className="w-full h-full rounded-full bg-app-dark flex items-center justify-center overflow-hidden">
                      {currentUser?.photoUrl ? (
                        <img src={currentUser.photoUrl} alt="avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xl font-bold">{currentUser?.firstName?.[0] || 'U'}</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      {currentUser?.username?.toUpperCase() || currentUser?.firstName?.toUpperCase() || 'USER'}
                      <span className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px]">✓</span>
                    </h3>
                    <p 
                      onClick={handleIdClick}
                      className="text-white/40 text-sm font-mono cursor-pointer"
                    >
                      ID: {currentUser?.id || '00000000'}
                    </p>
                  </div>
                </div>

                {/* Balance Card inside Sidebar */}
                <div className="glass-card p-4 rounded-2xl mb-8 flex flex-col gap-2 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-brand/20 blur-3xl rounded-full" />
                  <span className="text-white/50 text-sm flex items-center gap-2">
                    <div className="w-4 h-4 text-brand-light"><Wallet className="w-4 h-4"/></div> Balance
                  </span>
                  <div className="text-2xl font-display font-semibold">
                    {currentUser?.balance.toFixed(2)} <span className="text-brand-light text-lg">USDT</span>
                  </div>
                </div>
              </div>

              <div className="h-[1px] bg-white/5 mx-6" />

              {/* Menu Items */}
              <div className="flex-1 px-4 py-6 flex flex-col gap-2 overflow-y-auto">
                <MenuButton icon={Languages} label="Change Language" onClick={() => setShowLang(true)} />
                <MenuButton icon={Info} label="Company Info" />
                <MenuButton icon={Shield} label="Legal Compliance" />
                <MenuButton icon={BookOpen} label="Tutorials" />
              </div>

              {/* Footer */}
              <div className="p-6">
                <button className="w-full glass-button flex items-center gap-3 py-4 px-6 rounded-2xl text-white/80 hover:text-white group">
                  <MessageCircle className="w-5 h-5 text-brand-light group-hover:scale-110 transition-transform" />
                  <span className="font-medium">Support</span>
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
      className="flex items-center gap-4 px-4 py-4 w-full text-left text-white/70 hover:text-white hover:bg-white/5 rounded-xl transition-all"
    >
      <Icon className="w-5 h-5 text-white/50" />
      <span className="font-medium text-base">{label}</span>
    </button>
  );
}
