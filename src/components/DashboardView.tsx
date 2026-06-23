import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Trophy, X, ArrowUpCircle, Users, Shield, RefreshCw, Check, Zap } from 'lucide-react';
import { FaTelegramPlane, FaTwitter, FaYoutube, FaGlobe } from 'react-icons/fa';
import { useAppStore } from '../store/useAppStore';
import { DailyStreakComponent } from './DailyStreakComponent';
import { playClickSound, playSuccessSound } from '../lib/audio';
import { cn } from '../lib/utils';
import confetti from 'canvas-confetti';

export function DashboardView() {
  const { currentUser, systemConfig, updateBalance } = useAppStore();
  const [showLevelModal, setShowLevelModal] = useState(false);

  const LEVEL_THRESHOLD = 1000;
  
  const xp = currentUser?.xpBalance || 0;
  const vipLevel = Math.min(15, Math.floor(xp / LEVEL_THRESHOLD));
  const currentLevelXp = xp % LEVEL_THRESHOLD;
  const progressPercent = vipLevel === 15 ? 100 : (currentLevelXp / LEVEL_THRESHOLD) * 100;

  // Task State
  const [activeTab, setActiveTab] = useState<'social' | 'referral' | 'levelup'>('social');
  
  const globalTasks = systemConfig.tasks || [];
  
  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'telegram': return { Icon: FaTelegramPlane, colorClass: 'text-[#0088cc] bg-[#0088cc]/10 border-[#0088cc]/20' };
      case 'twitter': return { Icon: FaTwitter, colorClass: 'text-black bg-black/5 border-black/10' };
      case 'youtube': return { Icon: FaYoutube, colorClass: 'text-[#FF0000] bg-[#FF0000]/10 border-[#FF0000]/20' };
      case 'website': return { Icon: FaGlobe, colorClass: 'text-brand bg-brand/10 border-brand/20' };
      case 'facebook': return { Icon: FaGlobe, colorClass: 'text-[#1877F2] bg-[#1877F2]/10 border-[#1877F2]/20' };
      default: return { Icon: Sparkles, colorClass: 'text-brand bg-brand/10 border-brand/20' };
    }
  };

  const [tasks, setTasks] = useState({
    social: globalTasks.map(t => {
      const { Icon, colorClass } = getTaskIcon(t.type);
      return {
        id: t.id,
        title: t.title,
        reward: t.reward,
        completed: false,
        icon: Icon,
        colorClass,
        link: t.link
      };
    }),
    referral: [
      { id: 'r1', title: 'Invite 1 Friend', reward: 2000, completed: false, icon: Users, colorClass: 'text-brand bg-brand/10 border-brand/20', condition: (currentUser?.referralsCount || 0) >= 1 },
      { id: 'r2', title: 'Invite 5 Friends', reward: 10000, completed: false, icon: Users, colorClass: 'text-brand bg-brand/10 border-brand/20', condition: (currentUser?.referralsCount || 0) >= 5 },
    ],
    levelup: [
      { id: 'l1', title: 'Reach VIP 2', reward: 1000, completed: false, icon: Shield, colorClass: 'text-brand bg-brand/10 border-brand/20', condition: vipLevel >= 2 },
      { id: 'l2', title: 'Reach VIP 5', reward: 5000, completed: false, icon: Shield, colorClass: 'text-brand bg-brand/10 border-brand/20', condition: vipLevel >= 5 },
    ]
  });

  useEffect(() => {
     setTasks(prev => {
        const mappedGlobal = globalTasks.map(t => {
           const { Icon, colorClass } = getTaskIcon(t.type);
           return {
             id: t.id,
             title: t.title,
             reward: t.reward,
             completed: false, 
             icon: Icon,
             colorClass,
             link: t.link
           };
        });
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
    <div className="flex flex-col gap-5 px-4 pt-safe-top pb-32 min-h-[100dvh]">
      
      {/* Top Meta info */}
      <div className="w-full h-12 flex justify-between tracking-[0.1em] uppercase font-bold text-[9px] text-gray-500 relative z-10 items-center">
          <div onClick={() => setShowLevelModal(true)} className="cursor-pointer flex items-center gap-1.5 bg-white/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-black/5 shadow-sm active:scale-95 transition-all">
              <Trophy className="w-3 h-3 text-brand" /> 
              <span>Lvl {Math.min(15, Math.floor(xp / 1000))}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-black/5 shadow-sm">
              <Zap className="w-3 h-3 text-accent animate-pulse" />
              <span className="text-accent">Active Explorer</span>
          </div>
      </div>

      {/* Daily Streak Module */}
      <DailyStreakComponent />

      {/* Official Tasks - Premium Compact Layout */}
      <div className="flex flex-col gap-3 relative z-10">
         <div className="flex items-center justify-between px-2">
             <h3 className="text-[10px] uppercase tracking-[0.2em] text-gray-800 font-extrabold flex items-center gap-1.5">
                 <Shield className="w-3.5 h-3.5 text-brand" /> Network Tasks
             </h3>
         </div>

         {/* Mini Tabs */}
         <div className="flex bg-white/40 backdrop-blur-xl rounded-2xl p-1 border border-white/60 relative overflow-hidden shadow-sm">
             {['social', 'referral', 'levelup'].map((tab) => (
               <button 
                  key={tab}
                  onClick={() => { playClickSound(); setActiveTab(tab as any); }}
                  className={cn(
                     "flex-1 py-2 text-[11px] uppercase tracking-widest font-bold rounded-xl transition-all relative z-10",
                     activeTab === tab ? "text-gray-900 drop-shadow-sm" : "text-gray-600 hover:text-gray-800"
                  )}
               >
                  {tab}
                  {activeTab === tab && (
                     <motion.div layoutId="minitab" className="absolute inset-0 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.08)] rounded-xl -z-10 border border-white" />
                  )}
               </button>
             ))}
         </div>

         {/* Compact Tasks List */}
         <div className="flex flex-col gap-2.5">
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
                           "p-4 rounded-2xl flex items-center justify-between group overflow-hidden relative border shadow-[0_4px_20px_rgb(0,0,0,0.05)] backdrop-blur-xl transition-all",
                           task.completed ? "bg-white/40 border-transparent opacity-80" : "bg-white/70 border-white/90 hover:bg-white/90"
                        )}
                     >
                        {task.completed && <div className="absolute inset-0 bg-accent/5 blur-md pointer-events-none" />}
                        
                        <div className="flex items-center gap-3 z-10 w-full pr-2">
                           <div className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border",
                              task.completed ? "bg-accent/10 text-accent border-accent/20" : 
                              // @ts-ignore
                              (task.colorClass || "bg-gray-50 text-gray-600 border-black/5")
                           )}>
                              {task.completed ? <Check className="w-5 h-5" strokeWidth={3} /> : <Icon className="w-5 h-5" />}
                           </div>
                           <div className="flex flex-col flex-1 min-w-0">
                              <span className={cn("text-[12px] font-extrabold tracking-wide leading-tight truncate", task.completed ? "text-gray-700" : "text-gray-900")}>{task.title}</span>
                              <span className={cn("text-[10px] font-mono tracking-[0.1em] mt-0.5", task.completed ? "text-accent/80 font-bold" : "text-brand font-extrabold")}>
                                 +{task.reward} FIFA Coin
                              </span>
                           </div>
                        </div>

                        <div className="z-10 cursor-pointer shrink-0 ml-auto flex items-center">
                           {task.completed ? (
                              <div className="px-3 py-1.5 rounded-lg bg-accent/10 text-[10px] text-accent font-extrabold uppercase tracking-widest border border-accent/20">
                                 Done
                              </div>
                           ) : isCompleting ? (
                              <div className="w-8 h-8 rounded-xl bg-brand/5 flex items-center justify-center">
                                 <RefreshCw className="w-4 h-4 text-brand animate-spin" />
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
                                    "px-4 py-2 rounded-xl text-[10px] font-extrabold uppercase tracking-widest transition-all shadow-sm",
                                    disabled ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-black/5" : "bg-white border text-gray-900 shadow-md hover:bg-gray-50 active:scale-95 border-gray-200"
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
                   <button onClick={() => setShowLevelModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-black/5 text-gray-500 hover:text-gray-900 transition-colors cursor-pointer">
                      <X className="w-4 h-4" />
                   </button>
                </div>

                <div className="mt-4 relative z-10">
                   <h3 className="text-gray-900 text-xl font-extrabold tracking-tight">VIP {vipLevel}</h3>
                   <div className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-extrabold mt-0.5">{vipLevel === 15 ? 'MAX LEVEL' : 'Active User'}</div>
                </div>

                <div className="mt-5 flex flex-col gap-2 relative z-10 w-full">
                   <div className="flex justify-between text-[10px] uppercase tracking-widest font-extrabold">
                       <span className="text-gray-400">Progress</span>
                       <span className="text-brand font-mono">{vipLevel === 15 ? 'MAX' : `${currentLevelXp} / ${LEVEL_THRESHOLD}`} <span className="text-[9px] text-gray-400 font-sans">FIFA Coin</span></span>
                   </div>
                   <div className="w-full h-2 rounded-full bg-black/5 overflow-hidden relative">
                       <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${progressPercent}%` }}
                          transition={{ duration: 1, ease: 'easeOut' }}
                          className="absolute left-0 top-0 bottom-0 bg-brand rounded-full"
                       />
                   </div>
                   <div className="text-[9px] text-center text-gray-400 uppercase tracking-widest mt-1 font-extrabold">
                       {vipLevel === 15 ? 'Maximum level reached. Peak efficiency.' : `${LEVEL_THRESHOLD - currentLevelXp} FIFA Coin to VIP ${vipLevel + 1}`}
                   </div>
                </div>

                <button 
                  onClick={() => setShowLevelModal(false)}
                  className="w-full mt-4 py-3 rounded-xl bg-[#1d1d1f] hover:bg-black active:scale-95 transition-all text-white text-[11px] uppercase tracking-widest font-bold shadow-md cursor-pointer"
                >
                  Close
                </button>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

