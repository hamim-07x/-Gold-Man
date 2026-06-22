import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Pickaxe, Timer, Sparkles, Activity, Zap, Server, Trophy, ChevronRight, X, ArrowUpCircle, Share2, Users, Shield, RefreshCw, Check, Dribbble } from 'lucide-react';
import { FaTelegramPlane, FaTwitter, FaYoutube, FaGlobe } from 'react-icons/fa';
import { useAppStore } from '../store/useAppStore';
import { DailyStreakComponent } from './DailyStreakComponent';
import { playClickSound, playSuccessSound } from '../lib/audio';
import { cn } from '../lib/utils';
import confetti from 'canvas-confetti';

export function DashboardView() {
  const { currentUser, startMining, claimMining, updateBalance, systemConfig } = useAppStore();
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
  const vipLevel = Math.min(15, Math.floor(xp / LEVEL_THRESHOLD));
  const currentLevelXp = xp % LEVEL_THRESHOLD;
  const progressPercent = vipLevel === 15 ? 100 : (currentLevelXp / LEVEL_THRESHOLD) * 100;
  const bonusMultiplier = 1 + (vipLevel * 0.05);

  // Task State
  const [activeTab, setActiveTab] = useState<'social' | 'referral' | 'levelup'>('social');
  
  const globalTasks = systemConfig.tasks || [];
  
  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'telegram': return FaTelegramPlane;
      case 'twitter': return FaTwitter;
      case 'youtube': return FaYoutube;
      case 'website': return FaGlobe;
      default: return Sparkles;
    }
  };

  const [tasks, setTasks] = useState({
    social: globalTasks.map(t => ({
      id: t.id,
      title: t.title,
      reward: t.reward,
      completed: false,
      icon: getTaskIcon(t.type),
      link: t.link
    })),
    referral: [
      { id: 'r1', title: 'Invite 1 Friend', reward: 2000, completed: false, icon: Users, condition: (currentUser?.referralsCount || 0) >= 1 },
      { id: 'r2', title: 'Invite 5 Friends', reward: 10000, completed: false, icon: Users, condition: (currentUser?.referralsCount || 0) >= 5 },
    ],
    levelup: [
      { id: 'l1', title: 'Reach VIP 2', reward: 1000, completed: false, icon: Shield, condition: vipLevel >= 2 },
      { id: 'l2', title: 'Reach VIP 5', reward: 5000, completed: false, icon: Shield, condition: vipLevel >= 5 },
    ]
  });

  useEffect(() => {
     setTasks(prev => {
        // Only override social tasks to not lose completed state on referral/levelup during render syncs
        const mappedGlobal = globalTasks.map(t => ({
           id: t.id,
           title: t.title,
           reward: t.reward,
           completed: false, // ideally pulled from currentUser.completedTasks
           icon: getTaskIcon(t.type),
           link: t.link
        }));
        return {
           ...prev,
           social: mappedGlobal
        };
     });
  }, [systemConfig.tasks]);
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
        if (currentUser) {
            import('../store/useAppStore').then(({ dbHelpers }) => {
                dbHelpers.updateUser(currentUser.id, { tasksCompleted: (currentUser.tasksCompleted || 0) + 1 });
            });
        }
        playSuccessSound();
        setCompletingTaskId(null);
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 }, colors: ['#0071e3', '#34c759'] });
    }, 1500);
  };

  return (
    <div className="flex flex-col gap-4 px-4 pt-safe-top pb-32 min-h-[100dvh]">
      
      {/* Mega Mining Football Node */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl border border-black/5 shadow-md overflow-hidden relative p-4 flex flex-col items-center justify-center gap-2 min-h-[160px]"
      >
         {/* Top Meta info */}
         <div className="w-full flex justify-between tracking-[0.1em] uppercase font-bold text-[9px] text-gray-500 relative z-10 mb-1">
             <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-full border border-black/5">
                 <Trophy className="w-3 h-3 text-brand" /> 
                 <span>Lvl {Math.min(15, Math.floor(xp / 1000))}</span>
             </div>
             <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-full border border-black/5">
                 <Zap className={cn("w-2.5 h-2.5", isMining ? "text-accent animate-pulse" : "text-gray-400")} />
                 <span className={cn(isMining ? "text-accent" : "text-gray-500")}>
                     {isMining ? `${bonusMultiplier.toFixed(2)}x` : "Hibernate"}
                 </span>
             </div>
         </div>

         {/* The Big Football Mine Button */}
         <div className="relative z-10 flex flex-col items-center">
            <button 
               onClick={() => {
                  if (canClaim) {
                     playClickSound(); 
                     claimMining(); 
                     confetti({ particleCount: 150, spread: 80, origin: { y: 0.5 }, colors: ['#34c759', '#30d158', '#ffffff'] });
                  } else if (!isMining) {
                     playSuccessSound(); 
                     startMining(); 
                     useAppStore.getState().showToast('Mining Match Started', 'success');
                  }
               }}
               disabled={isMining && !canClaim}
               className={cn(
                  "relative w-20 h-20 flex items-center justify-center transition-transform active:scale-95 disabled:active:scale-100",
                  !isMining ? "cursor-pointer" : canClaim ? "cursor-pointer" : "cursor-default group"
               )}
            >
               {/* Outer pulsing ring for claiming */}
               {canClaim && (
                 <div className="absolute inset-[-4px] bg-accent/20 rounded-full blur-sm bg-opacity-50 animate-pulse" />
               )}
               
               {/* Background spin effect */}
               {isMining && !canClaim && (
                 <motion.div 
                   animate={{ rotate: 360 }}
                   transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                   className="absolute inset-[-4px] rounded-full border border-dashed border-brand/40"
                 />
               )}
               
               {/* 3D Ball Wrapper */}
               <motion.div
                  animate={
                    isMining && !canClaim 
                      ? { rotate: [0, 360] } 
                      : canClaim 
                      ? { scale: [1, 1.05, 1], filter: ['drop-shadow(0 0 6px rgba(52,199,89,0.4))'] } 
                      : { rotate: 0 }
                  }
                  transition={{ 
                    duration: isMining && !canClaim ? 8 : 2, 
                    repeat: Infinity, 
                    ease: isMining && !canClaim ? "linear" : "easeInOut" 
                  }}
                  className={cn(
                     "w-full h-full rounded-full flex items-center justify-center border-[1.5px] relative z-10 shadow-sm overflow-hidden",
                     isMining && !canClaim ? "border-brand bg-white/90 shadow-[0_2px_10px_rgba(0,113,227,0.15)]" : 
                     canClaim ? "border-accent bg-accent/5 shadow-[0_2px_10px_rgba(52,199,89,0.2)]" : "border-gray-200 bg-gray-50"
                  )}
               >
                  <div className="absolute inset-x-1 top-1 h-1/2 bg-gradient-to-b from-white/80 to-transparent rounded-t-full pointer-events-none" />
                  
                  <Dribbble className={cn(
                     "w-10 h-10 stroke-[1.5]",
                     isMining && !canClaim ? "text-brand" : 
                     canClaim ? "text-accent" : "text-gray-400"
                  )} />
               </motion.div>
            </button>

            <div className="mt-2.5 flex flex-col items-center">
               <span className={cn(
                  "text-[9px] uppercase tracking-[0.2em] font-black mb-0.5",
                  canClaim ? "text-accent" : isMining ? "text-brand" : "text-gray-400"
               )}>
                  {canClaim ? "Claim" : isMining ? "Active" : "Ready"}
               </span>
               <div className="h-[18px] flex items-center justify-center">
                  {isMining && !canClaim ? (
                     <div className="text-sm font-mono font-black text-gray-900 tracking-widest drop-shadow-sm">
                        {formatTimeCompact(timeLeft)}
                     </div>
                  ) : canClaim ? (
                     <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                        Tap to collect
                     </div>
                  ) : (
                     <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                        Yield 0.60/hr
                     </div>
                  )}
               </div>
            </div>
         </div>
         
         <div className="absolute left-0 bottom-0 w-full h-1 bg-gray-100 overflow-hidden">
            {isMining && !canClaim && (
               <motion.div 
                 initial={false}
                 animate={{ width: `${progress}%` }}
                 transition={{ ease: "linear", duration: 1 }}
                 className="h-full bg-brand"
               />
            )}
         </div>
      </motion.div>

      {/* Daily Streak Module */}
      <DailyStreakComponent />

      {/* Official Tasks - Premium Compact Layout */}
      <div className="flex flex-col gap-3 mt-4 relative z-10">
         <div className="flex items-center justify-between px-2">
             <h3 className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold flex items-center gap-1.5">
                 <Shield className="w-3.5 h-3.5 text-brand" /> Network Tasks
             </h3>
         </div>

         {/* Mini Tabs */}
         <div className="flex bg-black/5 rounded-full p-1 border border-black/5 relative overflow-hidden">
             {['social', 'referral', 'levelup'].map((tab) => (
               <button 
                  key={tab}
                  onClick={() => { playClickSound(); setActiveTab(tab as any); }}
                  className={cn(
                     "flex-1 py-1.5 text-[10px] uppercase tracking-widest font-bold rounded-full transition-all relative z-10",
                     activeTab === tab ? "text-gray-900" : "text-gray-500 hover:text-gray-700"
                  )}
               >
                  {tab}
                  {activeTab === tab && (
                     <motion.div layoutId="minitab" className="absolute inset-0 bg-white shadow-sm rounded-full -z-10 border border-black/[0.04]" />
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
                           "p-2.5 rounded-2xl flex items-center justify-between group overflow-hidden relative border border-black/5 shadow-sm",
                           task.completed ? "bg-gray-50 border-transparent opacity-80" : "bg-white"
                        )}
                     >
                        {task.completed && <div className="absolute inset-0 bg-accent/5 blur-md pointer-events-none" />}
                        
                        <div className="flex items-center gap-2.5 z-10 w-full pr-2">
                           <div className={cn(
                              "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border",
                              task.completed ? "bg-accent/10 text-accent border-accent/20" : "bg-gray-50 text-gray-600 border-black/5"
                           )}>
                              {task.completed ? <Check className="w-4 h-4" strokeWidth={3} /> : <Icon className="w-4 h-4" />}
                           </div>
                           <div className="flex flex-col flex-1 min-w-0">
                              <span className={cn("text-[11px] font-bold tracking-wide leading-tight truncate", task.completed ? "text-gray-700" : "text-gray-900")}>{task.title}</span>
                              <span className={cn("text-[9px] font-mono tracking-[0.1em] mt-0.5", task.completed ? "text-accent/80 font-bold" : "text-brand font-semibold")}>
                                 +{task.reward} FIFA
                              </span>
                           </div>
                        </div>

                        <div className="z-10 cursor-pointer shrink-0 ml-auto">
                           {task.completed ? (
                              <div className="px-2.5 py-1 rounded-md bg-accent/5 text-[9px] text-accent font-bold uppercase tracking-widest">
                                 Done
                              </div>
                           ) : isCompleting ? (
                              <div className="w-6 h-6 rounded-md bg-brand/5 flex items-center justify-center">
                                 <RefreshCw className="w-3 h-3 text-brand animate-spin" />
                              </div>
                           ) : (
                              <button 
                                 disabled={disabled}
                                 onClick={() => {
                                     // @ts-ignore
                                     if(task.link) {
                                         // @ts-ignore
                                         window.open(task.link, '_blank');
                                         setTimeout(() => handleCompleteTask(activeTab, task.id, task.reward, !disabled), 2000);
                                     } else {
                                         handleCompleteTask(activeTab, task.id, task.reward, !disabled);
                                     }
                                 }}
                                 className={cn(
                                    "px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all shadow-sm",
                                    disabled ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white border text-gray-900 shadow-sm hover:bg-gray-50 active:scale-95"
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
            className="fixed inset-0 z-50 flex items-end justify-center sm:items-center px-4 pb-20 sm:pb-0 bg-black/20 backdrop-blur-md"
            onClick={() => setShowLevelModal(false)}
          >
             <motion.div 
                initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-sm rounded-3xl bg-white shadow-[0_20px_60px_rgba(0,0,0,0.1)] overflow-hidden relative p-5 border border-black/5"
             >
                <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-brand/5 blur-[50px] rounded-full pointer-events-none -mr-10 -mt-10" />
                <div className="flex justify-between items-start z-10 relative">
                   <div className="w-12 h-12 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center">
                      <Trophy className="w-6 h-6 text-brand drop-shadow-sm" />
                   </div>
                   <button onClick={() => setShowLevelModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-black/5 text-gray-500 hover:text-gray-900 transition-colors">
                      <X className="w-4 h-4" />
                   </button>
                </div>

                <div className="mt-4 relative z-10">
                   <h3 className="text-gray-900 text-xl font-bold tracking-tight">VIP {vipLevel}</h3>
                   <div className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold mt-0.5">{vipLevel === 15 ? 'MAX LEVEL' : 'Cosmic Miner'}</div>
                </div>

                <div className="mt-5 flex flex-col gap-2 relative z-10 w-full">
                   <div className="flex justify-between text-[10px] uppercase tracking-widest font-bold">
                       <span className="text-gray-400">Progress</span>
                       <span className="text-brand font-mono">{vipLevel === 15 ? 'MAX' : `${currentLevelXp} / ${LEVEL_THRESHOLD}`} <span className="text-[9px] text-gray-400 font-sans">XP</span></span>
                   </div>
                   <div className="w-full h-2 rounded-full bg-black/5 overflow-hidden relative">
                       <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${progressPercent}%` }}
                          transition={{ duration: 1, ease: 'easeOut' }}
                          className="absolute left-0 top-0 bottom-0 bg-brand rounded-full"
                       />
                   </div>
                   <div className="text-[9px] text-center text-gray-400 uppercase tracking-widest mt-1 font-bold">
                       {vipLevel === 15 ? 'Maximum level reached. Peak efficiency.' : `${LEVEL_THRESHOLD - currentLevelXp} XP to VIP ${vipLevel + 1}`}
                   </div>
                </div>

                <div className="mt-5 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 relative z-10 flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                      <ArrowUpCircle className="w-4 h-4 text-amber-500" />
                   </div>
                   <div>
                       <div className="text-[9px] text-amber-600 uppercase tracking-widest font-bold mb-0.5">Next Level Prize</div>
                       <div className="text-[11px] text-amber-600 font-bold tracking-wide">1.5x Mining Boost + 500 XP</div>
                   </div>
                </div>

                <button 
                  onClick={() => setShowLevelModal(false)}
                  className="w-full mt-5 py-3 rounded-xl bg-[#1d1d1f] hover:bg-black active:scale-95 transition-all text-white text-[10px] uppercase tracking-[0.2em] font-bold shadow-md"
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
