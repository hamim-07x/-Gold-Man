import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Copy, Check, UserPlus, Coins, Shield, Star, Crown, ChevronRight, Share2, Gem, Target, Trophy } from 'lucide-react';
import { useAppStore, dbHelpers, User } from '../store/useAppStore';
import { cn } from '../lib/utils';
import { playClickSound, playSuccessSound } from '../lib/audio';
import confetti from 'canvas-confetti';

export function FriendsView() {
  const { currentUser, systemConfig } = useAppStore();
  const [copied, setCopied] = useState(false);
  const [referredUsers, setReferredUsers] = useState<User[]>([]);
  const [commissionPoints, setCommissionPoints] = useState(0);
  const [userCommissions, setUserCommissions] = useState<Record<string, number>>({});
  const [activeTab, setActiveTab] = useState<'tiers' | 'network' | 'how'>('tiers');

  const botUsername = systemConfig?.botUsername || 'MySuperBot';
  const inviteLink = `https://t.me/${botUsername}?start=${currentUser?.id}`;

  const friendsCount = currentUser?.referralsCount || 0;

  const tiers = [
      { level: 1, req: 1, reward: 1000, name: 'Novice Recruiter', icon: Shield, color: 'from-accent/10 to-accent/20', text: 'text-accent', iconColor: 'text-accent' },
      { level: 2, req: 5, reward: 10000, name: 'Network Builder', icon: Star, color: 'from-brand/10 to-brand/20', text: 'text-brand', iconColor: 'text-brand' },
      { level: 3, req: 20, reward: 50000, name: 'Elite Captain', icon: Gem, color: 'from-[#00B14F]/10 to-[#00B14F]/20', text: 'text-[#00B14F]', iconColor: 'text-[#00B14F]' },
      { level: 4, req: 50, reward: 200000, name: 'Global Ambassador', icon: Crown, color: 'from-[#EEA013]/10 to-[#EEA013]/20', text: 'text-[#EEA013]', iconColor: 'text-[#EEA013]' },
  ];

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
            colors: ['#0071e3', '#34c759', '#ffcc00']
        });
        setCopied(false);
    }, 1000);
  };

  return (
    <div className="pt-20 px-4 pb-32 flex flex-col gap-4">
      
      {/* Central Identity Card */}
      <motion.div 
        initial={{opacity:0, y:10}} animate={{opacity:1, y:0}}
        className="w-full bg-white rounded-3xl p-5 border border-black/5 relative shadow-lg overflow-hidden"
      >
          <div className="absolute top-0 right-0 w-40 h-40 bg-brand/5 blur-[50px] rounded-full pointer-events-none -mt-16" />
          
          <div className="flex flex-col items-center justify-center relative z-10 text-center mb-5">
              <div className="w-12 h-12 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center mb-3 shadow-sm">
                  <UserPlus className="w-6 h-6 text-brand" />
              </div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Referrals</h2>
              <p className="text-[10px] font-bold text-gray-500 tracking-widest uppercase mt-0.5">Build network, earn yield</p>
          </div>

          <div className="grid grid-cols-2 gap-3 relative z-10 mb-5">
              <div className="bg-gray-50 border border-black/5 rounded-2xl p-4 flex flex-col items-center justify-center shadow-sm">
                  <span className="text-[9px] uppercase tracking-widest text-gray-500 font-bold mb-1">Total Invites</span>
                  <span className="text-2xl font-mono font-black text-gray-900">{friendsCount}</span>
              </div>
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex flex-col items-center justify-center shadow-sm">
                  <span className="text-[9px] uppercase tracking-widest text-amber-600 font-bold mb-1">Commission</span>
                  <span className="text-xl font-mono font-black text-amber-500 drop-shadow-sm">+{commissionPoints.toFixed(0)} <span className="text-[9px] text-amber-500/50">FIFA</span></span>
              </div>
          </div>

          <div className="bg-gray-50 rounded-2xl p-2 flex items-center gap-2 border border-black/5 shadow-sm">
              <div className="flex-1 overflow-hidden pl-3 py-1">
                 <div className="text-[8px] uppercase font-bold text-gray-500 tracking-widest mb-0.5">Your Private Link</div>
                 <div className="text-[11px] font-mono text-brand truncate mr-2 font-bold">{inviteLink}</div>
              </div>
              <button 
                  onClick={handleCopy}
                  className="shrink-0 px-4 py-3 rounded-[1rem] bg-[#1d1d1f] hover:bg-black transition-all flex items-center justify-center font-bold text-white text-[10px] uppercase tracking-widest active:scale-95 shadow-md"
              >
                  {copied ? <Check className="w-4 h-4" /> : "COPY"}
              </button>
          </div>
      </motion.div>

       {/* Tabs Navigation */}
       <div className="flex bg-white rounded-full p-1 border border-black/5 shadow-sm overflow-x-auto no-scrollbar">
        {[
          { id: 'tiers', label: 'Tiers', icon: Trophy },
          { id: 'network', label: 'Network', icon: Users },
          { id: 'how', label: 'How To', icon: Share2 }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => { playClickSound(); setActiveTab(tab.id as any); }}
            className={cn(
               "flex-1 py-2.5 px-3 text-[10px] uppercase tracking-widest font-bold rounded-full transition-all duration-300 flex items-center justify-center gap-1.5 min-w-fit",
               activeTab === tab.id ? "bg-gray-100 text-gray-900 shadow-sm border border-black/5" : "text-gray-500 hover:text-gray-700"
            )}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tiers View */}
      {activeTab === 'tiers' && (
         <motion.div initial={{opacity:0}} animate={{opacity:1}} className="flex flex-col gap-3">
             {tiers.map((tier, idx) => {
                 const isUnlocked = friendsCount >= tier.req;
                 const progress = Math.min(100, (friendsCount / tier.req) * 100);
                 const Icon = tier.icon;
                 
                 return (
                     <div key={tier.level} className="relative overflow-hidden rounded-3xl p-5 bg-white border border-black/5 shadow-sm group">
                         {isUnlocked && <div className={cn("absolute inset-0 opacity-10 bg-gradient-to-r", tier.color)} />}
                         
                         <div className="flex items-center gap-4 relative z-10 w-full mb-4">
                             <div className={cn("w-12 h-12 rounded-[1rem] flex items-center justify-center shrink-0 shadow-sm border", isUnlocked ? cn(`bg-gradient-to-br border-black/5`, tier.color, tier.iconColor) : "bg-gray-50 border-black/5 text-gray-400")}>
                                 <Icon className="w-6 h-6" />
                             </div>
                             <div className="flex flex-col flex-1">
                                 <span className={cn("text-[13px] font-black uppercase tracking-widest", isUnlocked ? tier.text : "text-gray-400")}>{tier.name}</span>
                                 <span className="text-[11px] text-brand font-mono font-bold mt-0.5">+{tier.reward.toLocaleString()} FIFA Coin Bounty</span>
                             </div>
                             {isUnlocked && (
                                 <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-500 flex items-center justify-center shrink-0 border border-emerald-200">
                                    <Check className="w-4 h-4" />
                                 </div>
                             )}
                         </div>

                         <div className="relative z-10">
                             <div className="flex justify-between items-end mb-1.5 px-1">
                                 <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Progress</span>
                                 <span className="text-[11px] font-mono font-bold text-gray-900">{friendsCount} / {tier.req} <span className="text-gray-400 text-[9px]">Friends</span></span>
                             </div>
                             <div className="w-full h-2 rounded-full overflow-hidden bg-gray-100 border border-black/5">
                                 <div className={cn("h-full rounded-full transition-all duration-1000 ease-out shadow-sm", isUnlocked ? "bg-emerald-500" : "bg-brand")} style={{ width: `${progress}%` }} />
                             </div>
                         </div>
                     </div>
                 )
             })}
         </motion.div>
      )}

      {/* Network View */}
      {activeTab === 'network' && (
         <motion.div initial={{opacity:0}} animate={{opacity:1}} className="flex flex-col gap-3 pb-8">
             {referredUsers.length === 0 ? (
                 <div className="text-center py-12 px-4 bg-gray-50 rounded-[2rem] border border-black/5 border-dashed">
                     <div className="w-16 h-16 rounded-full bg-white mx-auto flex items-center justify-center mb-4 border border-black/5 shadow-sm">
                       <UserPlus className="w-6 h-6 text-gray-300" />
                     </div>
                     <p className="text-[11px] text-gray-500 tracking-[0.1em] font-bold uppercase">No Recruits Yet</p>
                     <p className="text-[10px] text-gray-400 mt-1 font-mono">Use your link above to assemble your team.</p>
                 </div>
             ) : (
                 referredUsers.map((user, i) => {
                   const userEarning = userCommissions[user.id] || 0;
                   return (
                     <motion.div 
                       key={user.id} initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} transition={{ delay: i * 0.05 }}
                       className="p-4 rounded-[1.5rem] bg-white border border-black/5 flex items-center justify-between gap-4 shadow-sm hover:bg-gray-50 transition-colors"
                     >
                       <div className="flex items-center gap-4 w-full overflow-hidden">
                           <div className="w-12 h-12 shrink-0 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center text-sm font-black text-brand shadow-sm uppercase overflow-hidden relative">
                             <span className="relative z-10">{user.username ? user.username[0] : user.firstName?.[0] || '?'}</span>
                           </div>
                           <div className="flex flex-col min-w-0 pr-2">
                             <div className="font-bold text-[13px] text-gray-900 truncate uppercase tracking-widest">
                               {user.firstName || 'Unknown'}
                             </div>
                             <div className="text-[10px] text-gray-500 font-mono tracking-widest mt-0.5 truncate">
                               ID: {user.id}
                             </div>
                           </div>
                       </div>
                       
                       <div className="flex flex-col items-end shrink-0 gap-1 border-l border-black/5 pl-4 ml-auto">
                          <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-widest text-gray-400 font-bold">
                             <Coins className="w-3 h-3 text-amber-500" /> Earned
                          </div>
                          <div className="text-sm font-mono font-black text-emerald-500 drop-shadow-sm">
                              +{userEarning.toFixed(0)}
                          </div>
                       </div>
                     </motion.div>
                   )
                 })
             )}
         </motion.div>
      )}

      {/* How To View */}
      {activeTab === 'how' && (
         <motion.div initial={{opacity:0}} animate={{opacity:1}} className="flex flex-col gap-4">
             <div className="bg-brand/5 border border-brand/10 rounded-3xl p-6 shadow-sm tracking-widest uppercase">
                 <ol className="relative border-l-2 border-brand/20 ml-2 flex flex-col gap-8">
                     <li className="pl-6 relative">
                         <div className="absolute w-5 h-5 bg-white rounded-full -left-[10.5px] border-[3px] border-brand flex items-center justify-center shadow-sm" />
                         <h3 className="text-[13px] font-black text-gray-900 mb-2">1. Share Your Link</h3>
                         <p className="text-[11px] text-gray-600 font-bold leading-relaxed normal-case">Copy your unique invite link from the terminal above and launch it directly to your network.</p>
                     </li>
                     <li className="pl-6 relative">
                         <div className="absolute w-5 h-5 bg-white rounded-full -left-[10.5px] border-[3px] border-brand flex items-center justify-center shadow-sm" />
                         <h3 className="text-[13px] font-black text-gray-900 mb-2">2. Network Registration</h3>
                         <p className="text-[11px] text-gray-600 font-bold leading-relaxed normal-case">When individuals deploy the Telegram Applet using your link, they securely bind to your network node.</p>
                     </li>
                     <li className="pl-6 relative">
                         <div className="absolute w-5 h-5 bg-white rounded-full -left-[10.5px] border-[3px] border-brand flex items-center justify-center shadow-sm" />
                         <h3 className="text-[13px] font-black text-gray-900 mb-2">3. Extract Commission</h3>
                         <p className="text-[11px] text-gray-600 font-bold leading-relaxed normal-case">Instantly receive a substantial FIFA Coin bounty upon their initial sync, plus a fixed percentage of all their future yields forever.</p>
                     </li>
                 </ol>
             </div>
         </motion.div>
      )}

    </div>
  );
}
