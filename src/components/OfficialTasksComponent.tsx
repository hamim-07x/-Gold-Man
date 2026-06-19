import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, ChevronRight, Check, Users, Shield, Share2, RefreshCw } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { playClickSound, playSuccessSound } from '../lib/audio';
import { cn } from '../lib/utils';
import confetti from 'canvas-confetti';

export function OfficialTasksComponent() {
  const { updateBalance, currentUser } = useAppStore();
  const [activeTab, setActiveTab] = useState<'social' | 'referral' | 'levelup'>('social');
  
  const [tasks, setTasks] = useState({
    social: [
      { id: 's1', title: 'Join Telegram Channel', reward: 500, completed: false, icon: Share2 },
      { id: 's2', title: 'Follow on X (Twitter)', reward: 500, completed: false, icon: Share2 },
      { id: 's3', title: 'Subscribe to YouTube', reward: 1000, completed: false, icon: Share2 },
    ],
    referral: [
      { id: 'r1', title: 'Invite 1 Friend', reward: 2000, completed: false, icon: Users, condition: (currentUser?.referralsCount || 0) >= 1 },
      { id: 'r2', title: 'Invite 5 Friends', reward: 10000, completed: false, icon: Users, condition: (currentUser?.referralsCount || 0) >= 5 },
      { id: 'r3', title: 'Invite 10 Friends', reward: 25000, completed: false, icon: Users, condition: (currentUser?.referralsCount || 0) >= 10 },
    ],
    levelup: [
      { id: 'l1', title: 'Reach Level 2', reward: 1000, completed: false, icon: Shield, condition: (currentUser?.level || 1) >= 2 },
      { id: 'l2', title: 'Reach Level 5', reward: 5000, completed: false, icon: Shield, condition: (currentUser?.level || 1) >= 5 },
      { id: 'l3', title: 'Reach Level 10', reward: 15000, completed: false, icon: Shield, condition: (currentUser?.level || 1) >= 10 },
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
    
    // Simulate checking
    setTimeout(() => {
        setTasks(prev => ({
          ...prev,
          [category]: prev[category as keyof typeof tasks].map(t => t.id === id ? { ...t, completed: true } : t)
        }));
        updateBalance(reward, 'earn', 'XP');
        playSuccessSound();
        setCompletingTaskId(null);
        
        // Trigger confetti explosion
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#8b5cf6', '#ec4899', '#fbbf24', '#34d399']
        });
    }, 1200);
  };

  const currentTasks = tasks[activeTab];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="mt-2 flex flex-col gap-3"
    >
      <div className="flex items-center justify-between px-1">
        <h3 className="font-semibold text-[11px] uppercase tracking-[0.2em] text-white/40 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          Mission Log
        </h3>
      </div>

      {/* Tabs */}
      <div className="flex bg-black/40 backdrop-blur-xl rounded-[1rem] p-1 border border-white/[0.05] shadow-inner shadow-black/50 overflow-x-auto no-scrollbar">
        {[
          { id: 'social', label: 'Social', icon: Share2 },
          { id: 'referral', label: 'Referrals', icon: Users },
          { id: 'levelup', label: 'Level Up', icon: Shield }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => { playClickSound(); setActiveTab(tab.id as any); }}
            className={cn(
              "flex-1 py-2 px-3 text-[10px] uppercase tracking-[0.1em] font-bold rounded-[0.75rem] transition-all duration-300 flex items-center justify-center gap-1.5 min-w-fit",
              activeTab === tab.id ? "bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.05)] border border-white/10" : "text-white/30 hover:text-white/60"
            )}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* Task List */}
      <div className="flex flex-col gap-2 min-h-[220px]">
        <AnimatePresence mode="popLayout">
          {currentTasks.map((task, i) => {
            const meetsCondition = 'condition' in task ? task.condition : true;
            const isCompleting = completingTaskId === task.id;
            
            return (
              <motion.div 
                layout
                key={task.id}
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ 
                   opacity: { delay: i * 0.1 },
                   y: { delay: i * 0.1 },
                   layout: { type: 'spring', stiffness: 200, damping: 20 }
                }}
                className={cn(
                  "rounded-[1.25rem] bg-black/40 backdrop-blur-xl border border-white/[0.04] overflow-hidden group hover:bg-white/[0.03] transition-colors relative mx-auto",
                  task.completed ? "w-14 h-14 p-0 flex items-center justify-center bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_20px_rgba(52,211,153,0.2)] mb-2" : "w-full p-4 flex items-center justify-between mb-2"
                )}
              >
                {!meetsCondition && !task.completed && (
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] z-10 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest bg-black/60 px-3 py-1 rounded-full border border-white/10">Locked</span>
                  </div>
                )}

                {task.completed ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring' }}
                  >
                     <Check className="w-6 h-6 text-emerald-400" strokeWidth={3} />
                  </motion.div>
                ) : (
                  <>
                     <div className="flex items-center gap-3">
                       <div className={cn(
                         "w-10 h-10 rounded-full flex items-center justify-center shrink-0 border",
                         "bg-white/5 border-white/10 text-white/50"
                       )}>
                         <task.icon className="w-4 h-4" />
                       </div>
                       <div className="flex flex-col gap-0.5">
                           <span className="text-[11px] text-white/90 font-bold tracking-wide">{task.title}</span>
                           <span className="text-[10px] text-brand-light font-mono font-bold flex items-center gap-1 drop-shadow-[0_0_5px_rgba(167,139,250,0.5)]">+{task.reward} XP</span>
                       </div>
                     </div>
                     
                     <button 
                       onClick={() => handleCompleteTask(activeTab, task.id, task.reward, meetsCondition)}
                       disabled={!meetsCondition || isCompleting}
                       className={cn(
                           "w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all group/btn",
                           isCompleting ? "bg-brand/20 border border-brand/40 text-brand-light shadow-[0_0_15px_rgba(139,92,246,0.5)]" : "bg-white/[0.05] border border-white/10 hover:bg-brand-light/20 hover:text-brand-light hover:border-brand-light/30 active:scale-95"
                       )}
                     >
                       {isCompleting ? (
                           <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                               <RefreshCw className="w-4 h-4 text-brand-light" />
                           </motion.div>
                       ) : (
                           <ChevronRight className="w-4 h-4 text-white/40 group-hover/btn:text-brand-light transition-colors" />
                       )}
                     </button>
                  </>
                )}
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
