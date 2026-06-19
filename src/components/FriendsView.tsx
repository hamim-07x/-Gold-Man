import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, useAnimation } from 'motion/react';
import { Users, Copy, Check, UserPlus, Coins, Shield, Star, Crown } from 'lucide-react';
import { useAppStore, dbHelpers, User, Transaction } from '../store/useAppStore';
import { cn } from '../lib/utils';
import { playClickSound, playSuccessSound } from '../lib/audio';
import confetti from 'canvas-confetti';

export function FriendsView() {
  const { currentUser } = useAppStore();
  const [copied, setCopied] = useState(false);
  const [referredUsers, setReferredUsers] = useState<User[]>([]);
  const [commissionPoints, setCommissionPoints] = useState(0);
  const [userCommissions, setUserCommissions] = useState<Record<string, number>>({});

  const inviteLink = `https://t.me/AisBot?start=${currentUser?.id}`;

  useEffect(() => {
    if (currentUser?.id) {
      const unsub = dbHelpers.listenUsers((users) => {
        const referred = users.filter((u: User) => u.referredBy === currentUser.id);
        setReferredUsers(referred);
      });
      
      const unsubTxs = dbHelpers.getTransactions(currentUser.id, (txs) => {
        const total = txs
            .filter(tx => tx.type === 'referral_commission')
            .reduce((sum, tx) => sum + tx.amount, 0);
            
        const perUser: Record<string, number> = {};
        txs.forEach(tx => {
            if (tx.type === 'referral_commission' && tx.originId) {
                perUser[tx.originId] = (perUser[tx.originId] || 0) + tx.amount;
            }
        });
        
        setUserCommissions(perUser);
        setCommissionPoints(total);
      });
      return () => {
         unsub();
         unsubTxs();
      }
    }
  }, [currentUser?.id]);

  const handleCopy = () => {
    playClickSound();
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => {
        playSuccessSound();
        confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.8 },
            colors: ['#8b5cf6', '#a78bfa', '#fbbf24']
        });
        setCopied(false);
    }, 1000);
  };

  return (
    <div className="pt-20 px-4 pb-32 flex flex-col gap-4">
      <motion.div 
        initial={{opacity:0, y:10}} 
        animate={{opacity:1, y:0}} 
        className="p-6 rounded-[2rem] bg-black/40 backdrop-blur-2xl border border-white/[0.05] relative overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.5)]"
      >
         <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-brand-light/20 blur-[80px] pointer-events-none mix-blend-screen" />
         <div className="absolute bottom-0 left-0 w-[150px] h-[150px] bg-amber-500/10 blur-[80px] pointer-events-none mix-blend-screen" />
         
         <div className="flex justify-between items-center mb-6 relative z-10">
           <h2 className="text-[14px] uppercase tracking-[0.2em] font-bold text-white/90 flex items-center gap-2">
              <Users className="w-5 h-5 text-brand-light" /> My Squad
           </h2>
           <span className="text-3xl font-mono font-bold text-white tracking-tighter drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">{currentUser?.referralsCount || 0}</span>
         </div>

         <div className="bg-white/[0.03] border border-white/[0.06] p-4 rounded-[1.5rem] flex items-center justify-between mb-4 relative z-10 shadow-inner shadow-black/50">
            <div className="overflow-hidden">
               <div className="text-[10px] uppercase text-white/40 font-bold tracking-widest mb-1.5 flex items-center gap-1.5">
                   Share Link <Crown className="w-3 h-3 text-amber-400" />
               </div>
               <div className="text-[13px] font-mono font-bold text-brand-light truncate mr-4">
                 {inviteLink}
               </div>
            </div>
            <button 
              onClick={handleCopy}
              className="w-12 h-12 shrink-0 bg-gradient-to-br from-brand to-glow-pink hover:to-brand-light rounded-[1rem] flex items-center justify-center transition-all active:scale-95 shadow-[0_5px_15px_rgba(139,92,246,0.3)]"
            >
              <AnimatePresence mode="wait">
                {copied ? (
                    <motion.div key="check" initial={{scale:0.5, opacity:0}} animate={{scale:1, opacity:1}} exit={{scale:0.5, opacity:0}}>
                        <Check className="w-5 h-5 text-white" strokeWidth={3} />
                    </motion.div>
                ) : (
                    <motion.div key="copy" initial={{scale:0.5, opacity:0}} animate={{scale:1, opacity:1}} exit={{scale:0.5, opacity:0}}>
                        <Copy className="w-5 h-5 text-white" strokeWidth={2.5} />
                    </motion.div>
                )}
              </AnimatePresence>
            </button>
         </div>

         <div className="bg-gradient-to-r from-amber-500/10 to-amber-900/10 border border-amber-500/20 p-4 rounded-[1.5rem] flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 shrink-0 rounded-[1rem] bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(251,191,36,0.3)]">
              <Coins className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="text-[10px] uppercase text-amber-500/70 tracking-widest mb-0.5 font-bold">Network Commission</div>
              <div className="text-2xl font-mono font-bold text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]">+{commissionPoints.toFixed(1)} <span className="text-[12px] text-amber-400/70">FIFA</span></div>
            </div>
         </div>
      </motion.div>

      <div className="flex flex-col gap-3">
         <div className="flex items-center justify-between px-2 mt-2">
             <h3 className="text-[12px] uppercase tracking-[0.2em] font-bold text-white/50 flex items-center gap-1.5">
                 <Star className="w-3.5 h-3.5 text-glow-pink" /> Recruits
             </h3>
             <span className="text-[10px] font-mono text-white/30 uppercase font-bold tracking-widest">{referredUsers.length} Users</span>
         </div>
         {referredUsers.length === 0 ? (
           <div className="text-center py-12 px-4 bg-black/20 rounded-[2rem] border border-white/5 border-dashed">
             <div className="w-14 h-14 rounded-full bg-white/[0.02] mx-auto flex items-center justify-center mb-4 border border-white/5">
               <UserPlus className="w-6 h-6 text-white/20" />
             </div>
             <p className="text-[12px] text-white/40 tracking-[0.1em] font-bold uppercase">No Recruits Yet.</p>
             <p className="text-[10px] text-white/20 mt-2 font-mono">Share your link to earn passive FIFA.</p>
           </div>
         ) : (
           referredUsers.map((user, i) => {
             const userEarning = userCommissions[user.id] || 0;
             const usrLevel = user.level || 1;
               
             return (
             <motion.div 
               key={user.id}
               initial={{opacity:0, y:10}}
               animate={{opacity:1, y:0}}
               transition={{ delay: i * 0.05 }}
               className="p-4 rounded-[1.5rem] bg-black/40 backdrop-blur-xl border border-white/[0.04] flex items-center justify-between gap-3 shadow-[0_5px_20px_rgba(0,0,0,0.3)] hover:bg-white/[0.02] transition-colors group"
             >
               <div className="flex items-center gap-3">
                   <div className="w-12 h-12 rounded-[1.25rem] bg-gradient-to-br from-brand/30 to-glow-pink/30 border border-white/10 flex items-center justify-center text-[18px] font-bold text-white shadow-inner shadow-black/80 overflow-hidden relative">
                     <span className="relative z-10">{user.username ? user.username[0].toUpperCase() : user.firstName?.[0] || '?'}</span>
                     <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-black/50 to-transparent z-0" />
                   </div>
                   <div className="flex flex-col gap-0.5 max-w-[120px]">
                     <div className="font-bold text-[13px] text-white/90 truncate uppercase tracking-wider">
                       {user.firstName || 'Unknown'} {user.lastName || ''}
                     </div>
                     <div className="text-[9px] text-brand-light font-mono font-bold flex items-center gap-1.5 mt-0.5">
                       <Shield className="w-3 h-3" /> LEVEL {usrLevel}
                     </div>
                   </div>
               </div>
               
               <div className="flex flex-col items-end shrink-0 gap-1">
                  <div className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-white/40 font-bold">
                     <Coins className="w-3 h-3 text-amber-500/80" /> Earned
                  </div>
                  <div className="text-[14px] font-mono font-bold text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]">
                      +{userEarning.toFixed(1)} <span className="text-[9px] text-amber-400/50">FIFA</span>
                  </div>
               </div>
             </motion.div>
             )
           })
         )}
      </div>

    </div>
  );
}
