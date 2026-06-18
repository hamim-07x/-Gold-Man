import React from 'react';
import { motion } from 'motion/react';
import { Shield, Zap, TrendingUp } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { t } from '../lib/i18n';

export function DashboardView() {
  const { currentUser, language } = useAppStore();

  return (
    <div className="flex flex-col gap-4 px-4 pt-20 pb-28 min-h-[100dvh]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 text-center relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-brand-light/20 blur-[50px] rounded-full pointer-events-none -mr-24 -mt-24" />
        <h1 className="text-xl font-medium mb-1 tracking-wide text-white/90">{t(language, 'welcome')}</h1>
        <p className="text-white/40 text-xs mb-6 tracking-wider uppercase">{t(language, 'portfolio')}</p>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="glass-panel p-4 rounded-2xl flex flex-col items-center">
            <Zap className="w-5 h-5 text-amber-400 mb-2" strokeWidth={1.5} />
            <span className="text-[10px] text-white/40 mb-1 uppercase tracking-widest">{t(language, 'energy')}</span>
            <span className="font-medium text-[17px] tracking-wide">100/100</span>
          </div>
          <div className="glass-panel p-4 rounded-2xl flex flex-col items-center">
            <TrendingUp className="w-5 h-5 text-emerald-400 mb-2" strokeWidth={1.5} />
            <span className="text-[10px] text-white/40 mb-1 uppercase tracking-widest">{t(language, 'total')}</span>
            <span className="font-medium text-[17px] text-emerald-400/90 tracking-wide">${(currentUser?.referralsCount || 0) * 10}</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
