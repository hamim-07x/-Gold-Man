import React from 'react';
import { motion } from 'motion/react';
import { Shield, Zap, TrendingUp } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export function DashboardView() {
  const { currentUser } = useAppStore();

  return (
    <div className="flex flex-col gap-6 px-6 pt-24 pb-32 min-h-screen">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 text-center relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand/10 blur-[60px] rounded-full pointer-events-none -mr-32 -mt-32" />
        <h1 className="text-3xl font-display font-medium mb-2">Welcome Back</h1>
        <p className="text-white/60 mb-6">Track your portfolio and daily earnings</p>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="glass-panel p-4 rounded-2xl flex flex-col items-center">
            <Zap className="w-6 h-6 text-yellow-400 mb-2" />
            <span className="text-sm text-white/50 mb-1">Energy limit</span>
            <span className="font-bold text-xl">100/100</span>
          </div>
          <div className="glass-panel p-4 rounded-2xl flex flex-col items-center">
            <TrendingUp className="w-6 h-6 text-green-400 mb-2" />
            <span className="text-sm text-white/50 mb-1">Total Earned</span>
            <span className="font-bold text-xl">${(currentUser?.referralsCount || 0) * 10}</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
