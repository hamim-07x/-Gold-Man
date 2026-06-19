import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Flame, CheckCircle2, Gift } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { playClickSound } from '../lib/audio';

export function DailyStreakComponent() {
  const { currentUser, claimDailyLogin } = useAppStore();
  const [canClaim, setCanClaim] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const streak = currentUser?.dailyStreak || 0;
  const lastLogin = currentUser?.lastLoginAt || 0;

  useEffect(() => {
    const now = Date.now();
    const today = new Date(now).setHours(0, 0, 0, 0);
    const lastLoginDate = new Date(lastLogin).setHours(0, 0, 0, 0);
    
    // Check if can claim
    if (today !== lastLoginDate || lastLogin === 0) {
      setCanClaim(true);
    } else {
      setCanClaim(false);
    }
  }, [lastLogin]);

  const handleClaim = async () => {
    if (!canClaim || isProcessing) return;
    playClickSound();
    setIsProcessing(true);
    await claimDailyLogin();
    setIsProcessing(false);
  };

  const nextReward = Math.min(((streak + (canClaim ? 1 : 0)) * 10), 100);

  return (
    <motion.div 
      initial={{opacity:0, y:10}} 
      animate={{opacity:1, y:0}} 
      transition={{delay: 0.15}}
      className="p-5 rounded-[1.5rem] bg-black/40 backdrop-blur-xl border border-white/[0.04] relative overflow-hidden mt-1 flex flex-col gap-3"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-[50px] pointer-events-none" />
      
      <div className="flex items-center justify-between z-10 px-1">
        <h3 className="text-[10px] text-white/40 font-semibold uppercase tracking-[0.2em] flex items-center gap-1.5">
          <Flame className="w-3.5 h-3.5 text-amber-500" />
          Daily Auth Sequence
        </h3>
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-white/40 uppercase tracking-widest shrink-0">Current:</span>
          <span className="text-[12px] text-amber-400 font-mono font-bold">{streak} Day{streak !== 1 ? 's' : ''}</span>
        </div>
      </div>

      <div className="flex items-center justify-between bg-white/[0.02] border border-white/[0.05] p-3 rounded-2xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/5 to-amber-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shrink-0">
            <Gift className="w-4 h-4 text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase text-white/40 tracking-[0.2em]">Next Reward</span>
            <span className="text-[14px] font-mono text-white/90">+{nextReward} XP</span>
          </div>
        </div>

        {canClaim ? (
          <button 
            onClick={handleClaim}
            disabled={isProcessing}
            className="px-4 py-2.5 bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 text-black text-[11px] font-bold tracking-[0.15em] rounded-xl shadow-[0_0_15px_rgba(251,191,36,0.4)] active:scale-95 transition-all w-[100px] flex justify-center uppercase shrink-0"
          >
            {isProcessing ? '...' : 'CLAIM'}
          </button>
        ) : (
          <div className="px-4 py-2.5 bg-white/5 border border-white/5 text-emerald-400 flex items-center gap-1.5 text-[10px] font-bold tracking-[0.15em] rounded-xl uppercase shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5" /> Checked In
          </div>
        )}
      </div>

      {/* Mini Streak Nodes */}
      <div className="flex justify-between items-center px-1 mt-1">
        {[...Array(7)].map((_, i) => {
          const isCompleted = canClaim ? i < streak : i < streak;
          return (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isCompleted ? 'bg-brand/20 border-brand/40 shadow-[0_0_8px_rgba(37,99,235,0.4)] border' : 'bg-white/5 border border-white/10'}`}>
                {isCompleted ? (
                   <CheckCircle2 className="w-3.5 h-3.5 text-brand-light" strokeWidth={3} />
                ) : (
                   <div className="w-1 h-1 rounded-full bg-white/20" />
                )}
              </div>
              <span className={`text-[8px] tracking-widest font-mono ${isCompleted ? 'text-brand-light' : 'text-white/20'}`}>
                D{i + 1}
              </span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
