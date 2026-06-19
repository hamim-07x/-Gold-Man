import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Pickaxe, Timer, Sparkles, Activity, Zap } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { MiningComponent } from './MiningComponent';
import { DailyStreakComponent } from './DailyStreakComponent';
import { t } from '../lib/i18n';
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';

export function DashboardView() {
  const { currentUser, language, startMining, claimMining } = useAppStore();
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [progress, setProgress] = useState(0);

  const MINING_DURATION = 6 * 60 * 60 * 1000;

  useEffect(() => {
    let interval: any;
    if (currentUser?.miningStartedAt) {
      interval = setInterval(() => {
        const elapsed = Date.now() - currentUser.miningStartedAt!;
        const remaining = Math.max(0, MINING_DURATION - elapsed);
        setTimeLeft(remaining);
        setProgress(Math.min(100, (elapsed / MINING_DURATION) * 100));
      }, 1000);
    } else {
      setTimeLeft(0);
      setProgress(0);
    }
    return () => clearInterval(interval);
  }, [currentUser?.miningStartedAt]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isMining = !!currentUser?.miningStartedAt;
  const canClaim = isMining && timeLeft === 0;

  // Mock data for the chart to show "mining performance trend"
  const chartData = [
    { value: 10 }, { value: 15 }, { value: 8 }, { value: 20 },
    { value: 18 }, { value: 25 }, { value: 22 }, { value: 30 },
    { value: 28 }, { value: 35 }, { value: 32 }, { value: 45 },
    { value: 40 }, { value: 55 }, { value: 50 }, { value: 70 },
  ];

  return (
    <div className="flex flex-col gap-4 px-4 pt-20 pb-32 min-h-[100dvh]">
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-[2rem] bg-black/40 backdrop-blur-2xl border border-white/[0.05] shadow-[0_10px_40px_rgba(0,0,0,0.5)] relative overflow-hidden flex flex-col items-center justify-center min-h-[340px]"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-glow-pink/10 blur-[80px] rounded-full pointer-events-none -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-brand/20 blur-[60px] rounded-full pointer-events-none -ml-24 -mb-24" />
        
        <h2 className="text-white/30 text-[10px] uppercase tracking-[0.3em] mb-6 flex items-center gap-2 z-10 font-bold">
          <Zap className="w-3.5 h-3.5 text-glow-pink" /> Engine Active
        </h2>

        <div className="relative z-10 w-full flex justify-center mb-6">
           <MiningComponent 
             progress={progress} 
             timeLeft={timeLeft} 
             isMining={isMining} 
             canClaim={canClaim} 
             formatTime={formatTime} 
           />
        </div>

        {/* Action Button */}
        <div className="w-full max-w-[240px] z-10">
          {!isMining ? (
            <button 
              onClick={startMining}
              className="w-full py-4 rounded-2xl text-[13px] text-white/90 font-bold tracking-wide flex items-center justify-center gap-2 relative overflow-hidden group bg-gradient-to-r from-brand/20 hover:from-glow-pink/30 to-brand/20 transition-all active:scale-95 shadow-[0_0_20px_rgba(139,92,246,0.3)] border border-white/10"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-glow-pink/0 via-glow-pink/20 to-glow-pink/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              <Pickaxe className="w-4 h-4 text-glow-pink" strokeWidth={2} /> 
              Engage Mining Node
            </button>
          ) : canClaim ? (
            <button 
              onClick={claimMining}
              className="w-full py-4 rounded-2xl text-black font-bold tracking-[0.1em] text-[13px] flex items-center justify-center gap-2 relative overflow-hidden bg-gradient-to-r from-brand-light via-white to-brand-light shadow-[0_0_25px_rgba(192,132,252,0.6)] active:scale-95 transition-transform uppercase"
            >
              <Sparkles className="w-4 h-4" strokeWidth={2} /> 
              CLAIM REWARD
            </button>
          ) : (
            <button 
              disabled
              className="w-full py-4 rounded-2xl text-[13px] text-white/30 font-bold tracking-wide flex items-center justify-center gap-2 border border-white/5 bg-black/40 shadow-inner shadow-black/50"
            >
              <Timer className="w-4 h-4 animate-pulse" strokeWidth={1.5} /> 
              Processing...
            </button>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-2 gap-3 mt-1">
        <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} transition={{delay: 0.1}} className="p-4 rounded-[1.5rem] bg-black/40 backdrop-blur-xl border border-white/[0.04] flex flex-col items-center justify-center relative overflow-hidden group hover:bg-white/5 transition-colors">
           <div className="absolute top-0 right-0 w-24 h-24 bg-brand-light/10 blur-[30px] rounded-full pointer-events-none group-hover:bg-brand-light/20 transition-colors" />
           <span className="text-[9px] text-white/40 font-semibold uppercase tracking-[0.2em] mb-1 drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">XP Yield</span>
           <span className="font-mono text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-light to-white drop-shadow-[0_0_10px_rgba(192,132,252,0.6)]">{currentUser?.xpBalance?.toFixed(0) || 0}</span>
        </motion.div>
        <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} transition={{delay: 0.2}} className="p-4 rounded-[1.5rem] bg-black/40 backdrop-blur-xl border border-white/[0.04] flex flex-col items-center justify-center relative overflow-hidden group hover:bg-white/5 transition-colors">
           <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent-light/10 blur-[30px] rounded-full pointer-events-none group-hover:bg-accent-light/20 transition-colors" />
           <span className="text-[9px] text-white/40 font-semibold uppercase tracking-[0.2em] mb-1 drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">Referrals</span>
           <span className="font-mono text-2xl font-bold text-accent-light drop-shadow-[0_0_10px_rgba(45,212,191,0.6)]">{currentUser?.referralsCount || 0}</span>
        </motion.div>
      </div>

      <DailyStreakComponent />

      <motion.div 
        initial={{opacity:0, y:10}} 
        animate={{opacity:1, y:0}} 
        transition={{delay: 0.3}} 
        className="p-5 rounded-[1.5rem] bg-black/40 backdrop-blur-xl border border-white/[0.04] relative overflow-hidden mt-1 flex flex-col gap-2"
      >
        <div className="absolute top-0 left-0 w-32 h-32 bg-glow-pink/10 blur-[50px] pointer-events-none" />
        
        <div className="flex items-center justify-between z-10 px-1">
          <h3 className="text-[10px] text-white/40 font-semibold uppercase tracking-[0.2em] flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-glow-pink" strokeWidth={2} />
            Hash Rate Trend
          </h3>
          <span className="text-[10px] text-glow-pink font-mono bg-glow-pink/5 px-2.5 py-1 rounded-full border border-glow-pink/20 font-bold shadow-[0_0_8px_rgba(236,72,153,0.3)]">
            {isMining ? '+4.2% /hr' : 'OFFLINE'}
          </span>
        </div>

        <div className="h-[80px] w-full -ml-2 -mb-2 mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-glow-pink)" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="var(--color-glow-pink)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="var(--color-glow-pink)" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorValue)" 
                isAnimationActive={true}
                activeDot={{ r: 4, fill: 'var(--color-glow-pink)', stroke: '#000', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}
