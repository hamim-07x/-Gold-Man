import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Copy, Check, UserPlus, Coins } from 'lucide-react';
import { useAppStore, dbHelpers, User } from '../store/useAppStore';

export function FriendsView() {
  const { currentUser } = useAppStore();
  const [copied, setCopied] = useState(false);
  const [referredUsers, setReferredUsers] = useState<User[]>([]);
  const [commissionPoints, setCommissionPoints] = useState(0);

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
        setCommissionPoints(total);
      });
      return () => {
         unsub();
         unsubTxs();
      }
    }
  }, [currentUser?.id]);

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="pt-20 px-4 pb-32 flex flex-col gap-4">
      <motion.div 
        initial={{opacity:0, y:10}} 
        animate={{opacity:1, y:0}} 
        className="p-6 rounded-[2rem] bg-black/40 backdrop-blur-2xl border border-white/[0.05] relative overflow-hidden"
      >
         <div className="absolute top-0 right-0 w-32 h-32 bg-brand/10 blur-[50px] pointer-events-none" />
         
         <div className="flex justify-between items-center mb-6">
           <h2 className="text-[12px] uppercase tracking-[0.2em] font-semibold text-white/40 flex items-center gap-2">
              <Users className="w-4 h-4 text-brand-light" /> My Squad
           </h2>
           <span className="text-2xl font-mono text-white/90">{currentUser?.referralsCount || 0}</span>
         </div>

         <div className="bg-white/[0.02] border border-white/[0.04] p-4 rounded-[1.5rem] flex items-center justify-between mb-4">
            <div className="overflow-hidden">
               <div className="text-[10px] uppercase text-white/30 tracking-widest mb-1">Invite Link</div>
               <div className="text-[13px] font-mono text-brand-light truncate mr-4">
                 {inviteLink}
               </div>
            </div>
            <button 
              onClick={handleCopy}
              className="w-10 h-10 shrink-0 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center transition-colors active:scale-95"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-white/50" />}
            </button>
         </div>

         <div className="bg-amber-500/5 border border-amber-500/10 p-4 rounded-[1.5rem] flex items-center gap-4">
            <div className="w-10 h-10 shrink-0 rounded-full bg-amber-500/10 flex items-center justify-center">
              <Coins className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <div className="text-[10px] uppercase text-amber-500/50 tracking-widest mb-0.5">Mining Commission Earned</div>
              <div className="text-xl font-mono text-amber-400">+{commissionPoints.toFixed(1)} XP</div>
            </div>
         </div>
      </motion.div>

      <div className="flex flex-col gap-3">
         <h3 className="text-[11px] uppercase tracking-[0.2em] text-white/30 px-2 mt-2">Recruits</h3>
         {referredUsers.length === 0 ? (
           <div className="text-center py-10 px-4">
             <div className="w-12 h-12 rounded-full bg-white/[0.02] mx-auto flex items-center justify-center mb-3">
               <UserPlus className="w-5 h-5 text-white/20" />
             </div>
             <p className="text-[12px] text-white/30 tracking-wide uppercase">No recruits yet.</p>
           </div>
         ) : (
           referredUsers.map((user, i) => (
             <motion.div 
               key={user.id}
               initial={{opacity:0, y:10}}
               animate={{opacity:1, y:0}}
               transition={{ delay: i * 0.05 }}
               className="p-4 rounded-[1.5rem] bg-black/40 border border-white/[0.04] flex items-center gap-4"
             >
               <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand/20 to-rose-500/20 border border-white/5 flex items-center justify-center text-[15px] font-bold text-white shadow-inner shadow-black overflow-hidden relative">
                 {user.username ? user.username[0].toUpperCase() : user.firstName?.[0] || '?'}
               </div>
               <div className="flex-1 overflow-hidden">
                 <div className="font-semibold text-[14px] text-white/90 truncate mr-2">
                   {user.firstName} {user.lastName} {user.username ? `(@${user.username})` : ''}
                 </div>
                 <div className="text-[10px] text-white/40 font-mono tracking-widest mt-0.5">
                   JOINED: {new Date(user.joinedAt).toLocaleDateString()}
                 </div>
               </div>
               <div className="text-right shrink-0">
                  <div className="text-[10px] uppercase text-white/30 tracking-widest mb-0.5">Balance</div>
                  <div className="text-[12px] font-mono text-brand-light">{user.xpBalance?.toFixed(0) || 0} XP</div>
               </div>
             </motion.div>
           ))
         )}
      </div>

    </div>
  );
}
