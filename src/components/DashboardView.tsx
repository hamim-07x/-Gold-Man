import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Pickaxe, Timer, Sparkles, Activity, Zap, Server, Trophy, ChevronRight, X, ArrowUpCircle, Share2, Users, Shield, RefreshCw, Check } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { DailyStreakComponent } from './DailyStreakComponent';
import { playClickSound, playSuccessSound } from '../lib/audio';
import { cn } from '../lib/utils';
import confetti from 'canvas-confetti';

export function DashboardView() {
  const { currentUser, startMining, claimMining, updateBalance } = useAppStore();
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [progress, setProgress] = useState(0);
  const [showLevelModal, setShowLevelModal] = useState(false);

  const MINING_DURATION = 6 * 60 * 60 * 1000;
  const LEVEL_THRESHOLD = 1000;

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

  const formatTimeCompact = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isMining = !!currentUser?.miningStartedAt;
  const canClaim = isMining && timeLeft === 0;

  const xp = currentUser?.xpBalance || 0;
  const currentLevel = Math.floor(xp / LEVEL_THRESHOLD) + 1;
  const currentLevelXp = xp % LEVEL_THRESHOLD;
  const remainingXp = LEVEL_THRESHOLD - currentLevelXp;

  // Task State
  const [activeTab, setActiveTab] = useState<'social' | 'referral' | 'levelup'>('social');
  const [tasks, setTasks] = useState({
    social: [
      { id: 's1', title: 'Join Telegram', reward: 500, completed: false, icon: Share2 },
      { id: 's2', title: 'Follow X', reward: 500, completed: false, icon: Share2 },
    ],
    referral: [
      { id: 'r1', title: 'Invite 1 Friend', reward: 2000, completed: false, icon: Users, condition: (currentUser?.referralsCount || 0) >= 1 },
      { id: 'r2', title: 'Invite 5 Friends', reward: 10000, completed: false, icon: Users, condition: (currentUser?.referralsCount || 0) >= 5 },
    ],
    levelup: [
      { id: 'l1', title: 'Reach Lvl 2', reward: 1000, completed: false, icon: Shield, condition: currentLevel >= 2 },
      { id: 'l2', title: 'Reach Lvl 5', reward: 5000, completed: false, icon: Shield, condition: currentLevel >= 5 },
    ]
  });
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);

  const handleCompleteTask = (category: string, id: string, reward: number, meetsCondition: boolean = true) => {
    if (!meetsCondition) return;
    const taskList = tasks[category as keyof typeof tasks];
    const task = taskList.find(t => t.id === id);
    if (!task || task.completed) return;

    playClickSound();
    setCompletingTaskId(id);
    
    setTimeout(() => {
        setTasks(prev => ({
          ...prev,
          [category]: prev[category as keyof typeof tasks].map(t => t.id === id ? { ...t, completed: true } : t)
        }));
        updateBalance(reward, 'earn', 'XP');
        playSuccessSound();
        setCompletingTaskId(null);
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 }, colors: ['#a78bfa', '#fbbf24'] });
    }, 1500);
  };

  return (
    <div className="flex flex-col gap-4 px-4 pt-20 pb-32 min-h-[100dvh]">
      
      {/* Unified Core Mining & Rank Header */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-[1.5rem] bg-black/40 backdrop-blur-2xl border border-white/[0.08] shadow-[0_15px_40px_rgba(0,0,0,0.5)] overflow-hidden relative p-4 flex flex-col gap-4"
      >
         <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-brand/20 blur-[80px] rounded-full pointer-events-none -mr-10 -mt-10 mix-blend-screen" />
         <div className="absolute bottom-0 left-0 w-[150px] h-[150px] bg-glow-pink/10 blur-[60px] rounded-full pointer-events-none -ml-10 -mb-10 mix-blend-screen" />

         {/* Top Stats Array */}
         <div className="flex items-center justify-between relative z-10 w-full">
            <div className="flex items-center gap-2" onClick={() => setShowLevelModal(true)}>
               <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand to-glow-pink p-0.5 shadow-[0_0_15px_rgba(236,72,153,0.3)]">
                  <div className="w-full h-full bg-black/50 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/10">
                     <Trophy className="w-5 h-5 text-brand-light drop-shadow-md" />
                  </div>
               </div>
               <div className="flex flex-col cursor-pointer hover:opacity-80 transition-opacity">
                  <span className="text-[10px] text-white/50 uppercase tracking-[0.2em] font-bold">Rank</span>
                  <span className="text-[14px] text-white font-bold tracking-tight">Lvl {currentLevel} <span className="text-[9px] text-brand-light ml-1 uppercase">Miner</span></span>
               </div>
            </div>

            <div className="flex flex-col items-end">
               <span className="text-[10px] text-white/50 uppercase tracking-[0.2em] font-bold">Speed</span>
               <div className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-md border border-white/[0.05] mt-0.5">
                  <Zap className={cn("w-3 h-3", isMining ? "text-amber-400" : "text-white/30")} />
                  <span className={cn("text-[11px] font-mono font-bold tracking-wider", isMining ? "text-amber-400" : "text-white/40")}>
                     {isMining ? "+4.2/h" : "0.0/h"}
                  </span>
               </div>
            </div>
         </div>

         {/* Progress Sync Bar */}
         <div className="relative z-10 mt-1 cursor-pointer" onClick={() => setShowLevelModal(true)}>
            <div className="flex justify-between text-[9px] uppercase tracking-widest font-bold mb-1.5 px-0.5">
                <span className="text-white/30">Level Progress</span>
                <span className="text-white/60">{currentLevelXp} / {LEVEL_THRESHOLD} <span className="text-white/20">XP</span></span>
            </div>
            <div className="w-full h-2 rounded-full bg-black/50 border border-white/[0.05] overflow-hidden relative shadow-inner shadow-black/50">
               <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(currentLevelXp / LEVEL_THRESHOLD) * 100}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-brand to-glow-pink rounded-full shadow-[0_0_10px_rgba(236,72,153,0.5)]"
               />
            </div>
         </div>

         {/* Mining Interaction Zone */}
         <div className="mt-3 p-3 rounded-[1rem] bg-white/[0.02] border border-white/[0.04] relative z-10">
             <div className="flex justify-between items-end px-1 mb-2">
                 <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold">Node Core</span>
                    <span className={cn(
                        "text-[12px] font-mono font-bold tracking-wider",
                        canClaim ? "text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.6)]" : 
                        isMining ? "text-brand-light drop-shadow-[0_0_8px_rgba(167,139,250,0.6)]" : "text-white/40"
                    )}>
                        {canClaim ? "REWARD READY" : isMining ? "ACTIVE" : "STANDBY"}
                    </span>
                 </div>
                 {isMining && !canClaim && (
                    <div className="text-[10px] font-mono font-bold text-white/60 bg-black/40 px-2 py-1 rounded-md border border-white/5 tracking-widest">
                        {formatTimeCompact(timeLeft)}
                    </div>
                 )}
             </div>

             <div className="w-full relative h-[42px]">
                 <AnimatePresence mode="wait">
                 {!isMining ? (
                    <motion.button 
                    key="engage"
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                    onClick={() => { playClickSound(); startMining(); }}
                    className="absolute inset-0 w-full rounded-xl text-[11px] text-white/90 font-bold tracking-[0.15em] flex items-center justify-center gap-2 bg-gradient-to-r from-brand/40 to-brand/20 hover:from-brand/50 transition-all shadow-[0_0_15px_rgba(139,92,246,0.2)] border border-brand-light/30 uppercase"
                    >
                    <Pickaxe className="w-3.5 h-3.5 text-brand-light" strokeWidth={2.5} /> Engage Core
                    </motion.button>
                 ) : canClaim ? (
                    <motion.button 
                    key="claim"
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                    onClick={() => { 
                        playClickSound(); 
                        claimMining(); 
                        confetti({ particleCount: 100, spread: 70, origin: { y: 0.7 }, colors: ['#8b5cf6', '#10b981'] });
                    }}
                    className="absolute inset-0 w-full rounded-xl text-black font-extrabold tracking-[0.2em] text-[11px] flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-400 to-emerald-500 shadow-[0_0_20px_rgba(52,211,153,0.4)] active:scale-95 transition-transform uppercase"
                    >
                    <Sparkles className="w-3.5 h-3.5" strokeWidth={2.5} /> Extract Yield
                    </motion.button>
                 ) : (
                    <div 
                    key="active"
                    className="absolute inset-0 w-full rounded-xl text-[11px] text-brand-light font-bold tracking-[0.15em] flex items-center justify-center border border-brand-light/10 bg-black/40 overflow-hidden"
                    >
                      {/* Live Progress Fill inside button background */}
                      <motion.div 
                         initial={false}
                         animate={{ width: `${progress}%` }}
                         transition={{ ease: "linear", duration: 1 }}
                         className="absolute left-0 top-0 bottom-0 bg-brand/20"
                      />
                      <motion.div className="absolute inset-0 bg-brand-light/5" animate={{ opacity: [0, 0.5, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }} />
                      <span className="relative z-10 flex items-center gap-2"><Timer className="w-3.5 h-3.5 animate-pulse opacity-80" strokeWidth={2.5} /> Mining in Progress</span>
                    </div>
                 )}
                 </AnimatePresence>
             </div>
         </div>
      </motion.div>

      {/* Daily Streak Module */}
      <DailyStreakComponent />

      {/* Official Tasks - Premium Compact Layout */}
      <div className="flex flex-col gap-3 mt-1 relative z-10">
         <div className="flex items-center justify-between px-1">
             <h3 className="text-[11px] uppercase tracking-[0.2em] text-white/40 font-bold flex items-center gap-2">
                 <Shield className="w-3.5 h-3.5 text-brand" /> Network Tasks
             </h3>
         </div>

         {/* Mini Tabs */}
         <div className="flex bg-black/40 backdrop-blur-xl rounded-full p-1 border border-white/[0.05] relative overflow-hidden">
             {['social', 'referral', 'levelup'].map((tab) => (
               <button 
                  key={tab}
                  onClick={() => { playClickSound(); setActiveTab(tab as any); }}
                  className={cn(
                     "flex-1 py-2 text-[9px] uppercase tracking-widest font-bold rounded-full transition-all relative z-10",
                     activeTab === tab ? "text-white" : "text-white/40 hover:text-white/60"
                  )}
               >
                  {tab}
                  {activeTab === tab && (
                     <motion.layoutId id="minitab" className="absolute inset-0 bg-white/10 rounded-full -z-10 border border-white/[0.08]" />
                  )}
               </button>
             ))}
         </div>

         {/* Compact Tasks List */}
         <div className="flex flex-col gap-2">
            <AnimatePresence mode="popLayout">
               {tasks[activeTab].map((task, i) => {
                  const Icon = task.icon;
                  // @ts-ignore
                  const disabled = task.condition !== undefined && !task.condition;
                  const isCompleting = completingTaskId === task.id;

                  return (
                     <motion.div 
                        key={task.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: i * 0.05 }}
                        className={cn(
                           "p-3 rounded-2xl bg-black/30 backdrop-blur-md border border-white/[0.04] flex items-center justify-between group overflow-hidden relative",
                           task.completed ? "bg-emerald-500/5 border-emerald-500/10" : ""
                        )}
                     >
                        {task.completed && <div className="absolute inset-0 bg-emerald-500/5 blur-xl pointer-events-none" />}
                        
                        <div className="flex items-center gap-3 z-10">
                           <div className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border",
                              task.completed ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-white/5 text-white/60 border-white/10"
                           )}>
                              {task.completed ? <Check className="w-4 h-4" strokeWidth={3} /> : <Icon className="w-3.5 h-3.5" />}
                           </div>
                           <div className="flex flex-col">
                              <span className={cn("text-[11px] font-bold tracking-wide", task.completed ? "text-white/80" : "text-white")}>{task.title}</span>
                              <span className={cn("text-[9px] font-mono tracking-widest mt-0.5", task.completed ? "text-emerald-400/80" : "text-glow-pink font-semibold")}>
                                 +{task.reward} FIFA
                              </span>
                           </div>
                        </div>

                        <div className="z-10 cursor-pointer">
                           {task.completed ? (
                              <div className="px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] text-emerald-400 font-bold uppercase tracking-widest">
                                 Done
                              </div>
                           ) : isCompleting ? (
                              <div className="w-8 h-8 rounded-full bg-brand-light/20 border border-brand-light/30 flex items-center justify-center">
                                 <RefreshCw className="w-3.5 h-3.5 text-brand-light animate-spin" />
                              </div>
                           ) : (
                              <button 
                                 disabled={disabled}
                                 onClick={() => handleCompleteTask(activeTab, task.id, task.reward, !disabled)}
                                 className={cn(
                                    "px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all border",
                                    disabled ? "bg-white/5 text-white/20 border-white/5 cursor-not-allowed" : "bg-white/10 text-white hover:bg-white/20 border-white/10 active:scale-95"
                                 )}
                              >
                                 Start
                              </button>
                           )}
                        </div>
                     </motion.div>
                  );
               })}
            </AnimatePresence>
         </div>
      </div>

      {/* Level Details Modal */}
      <AnimatePresence>
        {showLevelModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center sm:items-center px-4 pb-20 sm:pb-0 bg-black/80 backdrop-blur-md"
            onClick={() => setShowLevelModal(false)}
          >
             <motion.div 
                initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-sm rounded-[2rem] bg-gradient-to-br from-black to-black/90 border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden relative p-6"
             >
                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-brand-light/10 blur-[80px] rounded-full pointer-events-none -mr-20 -mt-20 mix-blend-screen" />
                <div className="flex justify-between items-start z-10 relative">
                   <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-brand/40 to-glow-pink/40 border border-white/10 flex items-center justify-center shadow-[0_0_20px_rgba(236,72,153,0.3)]">
                      <Trophy className="w-8 h-8 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
                   </div>
                   <button onClick={() => setShowLevelModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-colors">
                      <X className="w-4 h-4" />
                   </button>
                </div>

                <div className="mt-4 relative z-10">
                   <h3 className="text-white text-[24px] font-bold tracking-tight">Level {currentLevel}</h3>
                   <div className="text-[12px] text-white/50 uppercase tracking-[0.2em] font-bold mt-1">Cosmic Miner</div>
                </div>

                <div className="mt-6 flex flex-col gap-2 relative z-10 w-full">
                   <div className="flex justify-between text-[11px] uppercase tracking-widest font-bold">
                       <span className="text-white/40">Progress</span>
                       <span className="text-brand-light drop-shadow-[0_0_5px_rgba(167,139,250,0.5)]">{currentLevelXp} / {LEVEL_THRESHOLD} <span className="text-[9px] text-white/30">XP</span></span>
                   </div>
                   <div className="w-full h-3 rounded-full bg-white/5 border border-white/10 overflow-hidden relative">
                       <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${(currentLevelXp / LEVEL_THRESHOLD) * 100}%` }}
                          transition={{ duration: 1, ease: 'easeOut' }}
                          className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-brand to-glow-pink rounded-full shadow-[0_0_10px_rgba(236,72,153,0.6)]"
                       />
                   </div>
                   <div className="text-[11px] text-center text-white/40 uppercase tracking-widest mt-1 font-bold">
                       {remainingXp} XP to Level {currentLevel + 1}
                   </div>
                </div>

                <div className="mt-6 p-4 rounded-[1.25rem] bg-amber-500/10 border border-amber-500/20 relative z-10 flex items-center gap-4">
                   <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                      <ArrowUpCircle className="w-5 h-5 text-amber-400" />
                   </div>
                   <div>
                       <div className="text-[10px] text-amber-500/70 uppercase tracking-widest font-bold">Next Level Prize</div>
                       <div className="text-[14px] text-amber-400 font-bold tracking-wide">1.5x Mining Boost + 500 XP</div>
                   </div>
                </div>

                <button 
                  onClick={() => setShowLevelModal(false)}
                  className="w-full mt-6 py-4 rounded-[1.25rem] bg-white/5 hover:bg-white/10 active:scale-95 transition-all text-white text-[12px] uppercase tracking-[0.2em] font-bold border border-white/10"
                >
                  Continue Mining
                </button>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
