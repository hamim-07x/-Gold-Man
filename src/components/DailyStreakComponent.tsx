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
      className="p-5 rounded-[1.5rem] bg-white/70 backdrop-blur-2xl border border-white/80 shadow-[0_4px_20px_rgb(0,0,0,0.03)] relative overflow-hidden mt-4 flex flex-col gap-4"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-[40px] pointer-events-none" />
      
      <div className="flex items-center justify-between z-10 px-2">
        <h3 className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] flex items-center gap-1.5">
          <Flame className="w-3.5 h-3.5 text-brand" />
          Daily Sequence
        </h3>
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] text-gray-400 uppercase tracking-widest shrink-0 font-bold">Current:</span>
          <span className="text-xs text-brand font-mono font-bold">{streak} Day{streak !== 1 ? 's' : ''}</span>
        </div>
      </div>

      <div className="flex items-center justify-between bg-white/50 border border-white p-2.5 rounded-[1.2rem] relative overflow-hidden group shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/5 to-amber-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
        <div className="flex items-center gap-2.5 z-10 w-full pr-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shrink-0">
            <Gift className="w-4 h-4 text-brand drop-shadow-sm" />
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-[9px] uppercase text-gray-500 tracking-[0.2em] font-bold mb-0.5 truncate">Next Reward</span>
            <span className="text-[11px] font-mono text-gray-900 font-bold">+{nextReward} FIFA Coin</span>
          </div>
        </div>

        <div className="z-10 cursor-pointer shrink-0 ml-auto">
          {canClaim ? (
            <button 
              onClick={handleClaim}
              disabled={isProcessing}
              className="px-4 py-2 bg-[#1d1d1f] text-white hover:bg-black text-[10px] uppercase tracking-widest font-bold rounded-lg active:scale-95 transition-all w-[80px] flex justify-center shrink-0 shadow-sm"
            >
              {isProcessing ? '...' : 'CLAIM'}
            </button>
          ) : (
            <div className="px-3 py-1.5 bg-accent/10 border border-accent/20 text-accent flex items-center gap-1 text-[9px] font-bold tracking-widest rounded-lg uppercase shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5" /> Checked In
            </div>
          )}
        </div>
      </div>

      {/* Mini Streak Nodes */}
      <div className="flex justify-between items-center px-1 mt-1 z-10">
        {[...Array(7)].map((_, i) => {
          const isCompleted = canClaim ? i < streak : i < streak;
          return (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center ${isCompleted ? 'bg-brand/10 border-brand/20 shadow-sm border' : 'bg-black/5 border border-black/5'}`}>
                {isCompleted ? (
                   <CheckCircle2 className="w-3 h-3 text-brand" strokeWidth={3} />
                ) : (
                   <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                )}
              </div>
              <span className={`text-[9px] tracking-widest font-mono font-bold ${isCompleted ? 'text-brand' : 'text-gray-400'}`}>
                D{i + 1}
              </span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
