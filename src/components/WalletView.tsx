import React, { useState, useEffect } from 'react';
import { RefreshCw, ArrowDown, ArrowUp, Zap, Sparkles, X, Send, User as UserIcon, Layers } from 'lucide-react';
import { useAppStore, dbHelpers, Transaction, User } from '../store/useAppStore';
import { motion, AnimatePresence } from 'motion/react';
import { t } from '../lib/i18n';
import { cn } from '../lib/utils';
import { playClickSound, playSuccessSound } from '../lib/audio';
import confetti from 'canvas-confetti';

export function WalletView() {
  const { currentUser, language, transferTokens, showToast } = useAppStore();
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [showFullHistory, setShowFullHistory] = useState(false);
  const [activeTab, setActiveTab] = useState<'tokens' | 'nfts'>('tokens');
  
  // Send logic
  const [showPayModal, setShowPayModal] = useState(false);
  const [payTgId, setPayTgId] = useState('');
  const [payAmount, setPayAmount] = useState('');
  const [resolvedUser, setResolvedUser] = useState<User | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  
  useEffect(() => {
    if (currentUser) {
      const unsub = dbHelpers.getTransactions(currentUser.id, (txs) => {
        setAllTransactions(txs);
      });
      return () => unsub();
    }
  }, [currentUser?.id]);

  // Debounced search for user
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (payTgId.length > 2) {
        setIsSearching(true);
        const user = await dbHelpers.findUserByUsername(payTgId);
        setResolvedUser(user);
        setIsSearching(false);
      } else {
        setResolvedUser(null);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [payTgId]);

  const handlePaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvedUser || !payAmount) return;
    
    const amountNum = parseFloat(payAmount);
    if (amountNum < 10) {
      showToast('Minimum transfer is 10 tokens', 'error');
      return;
    }

    playClickSound();
    
    const success = await transferTokens(resolvedUser.id, amountNum);
    if (success) {
       setShowPayModal(false);
       setPayTgId('');
       setPayAmount('');
       setResolvedUser(null);
       confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 }, colors: ['#8b5cf6', '#ec4899'] });
    }
  };

  const xpBalance = currentUser?.xpBalance || 0;
  const usdBalance = (xpBalance * 0.005).toFixed(2);

  const displayedTransactions = showFullHistory ? allTransactions : allTransactions.slice(0, 5);

  return (
    <div className="flex flex-col gap-5 px-4 pt-16 pb-32 min-h-[100dvh]">

      {/* Top Total Balance Section */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center pt-6 pb-2 relative z-10"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-brand-light/20 blur-[80px] rounded-full pointer-events-none -mt-20 mix-blend-screen" />
        
        <span className="text-[10px] text-white/50 uppercase tracking-[0.2em] font-bold mb-1 flex items-center gap-1.5">
           Total Net Worth
        </span>
        <div className="flex items-start justify-center gap-1">
          <span className="text-[1.5rem] font-bold text-white/40 mt-1.5">$</span>
          <span className="text-[4rem] font-bold text-white leading-none tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
            {usdBalance.split('.')[0]}<span className="text-white/50 text-[1.75rem]">.{usdBalance.split('.')[1]}</span>
          </span>
        </div>
        
        <div className="mt-4 flex items-center justify-center gap-2 px-6 py-2 bg-white/[0.03] rounded-full border border-white/[0.05]">
          <Zap className="w-3.5 h-3.5 text-glow-pink" />
          <span className="text-white text-[14px] font-mono font-bold">{xpBalance.toFixed(0)} <span className="text-[10px] text-white/40 uppercase tracking-widest ml-1">FIFA</span></span>
        </div>
        
        {/* Quick Actions */}
        <div className="flex items-center gap-3 mt-8 w-full max-w-xs">
           <button 
             onClick={() => { playClickSound(); showToast('Wallet Address copied to clipboard!', 'info', 'Receive'); }}
             className="flex-1 flex flex-col items-center justify-center gap-2 bg-white/5 hover:bg-white/10 active:scale-95 transition-all text-white py-4 rounded-[1.5rem] border border-white/10 shadow-[0_5px_15px_rgba(0,0,0,0.3)]"
           >
             <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 text-emerald-400 mb-1">
                <ArrowDown className="w-5 h-5" strokeWidth={2.5} />
             </div>
             <span className="text-[11px] font-bold uppercase tracking-widest text-white/80">Receive</span>
           </button>
           <button 
             onClick={() => { 
               playClickSound(); 
               setShowPayModal(true); 
             }}
             className="flex-1 flex flex-col items-center justify-center gap-2 bg-white/5 hover:bg-white/10 active:scale-95 transition-all text-white py-4 rounded-[1.5rem] border border-white/10 shadow-[0_5px_15px_rgba(0,0,0,0.3)] group"
           >
             <div className="w-10 h-10 rounded-full bg-brand-light/20 flex items-center justify-center border border-brand-light/30 text-brand-light mb-1 shadow-[0_0_15px_rgba(139,92,246,0.3)] group-hover:bg-brand-light/30 transition-colors">
                <Send className="w-5 h-5 ml-0.5" strokeWidth={2.5} />
             </div>
             <span className="text-[11px] font-bold uppercase tracking-widest text-white/80">Send</span>
           </button>
        </div>
      </motion.div>

      <div className="relative mt-4">
          <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col gap-4"
          >
              <div className="flex flex-col gap-2 relative z-10 mt-2">
                  <div className="flex items-center justify-between px-1 py-1">
                      <h3 className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-semibold flex items-center gap-1.5">
                          Recent Activity
                      </h3>
                      {allTransactions.length > 5 && (
                          <button 
                              onClick={(e) => { playClickSound(); setShowFullHistory(!showFullHistory); }}
                              className="text-[9px] text-brand-light uppercase tracking-widest hover:text-white transition-colors"
                          >
                              {showFullHistory ? 'Show Less' : 'View All'}
                          </button>
                      )}
                  </div>

                  {allTransactions.length === 0 ? (
                      <div className="py-6 text-center text-white/20 text-[9px] tracking-[0.2em] uppercase bg-black/20 rounded-2xl border border-white/[0.02]">
                          {t(language, 'noTx')}
                      </div>
                  ) : (
                      <div className="flex flex-col gap-1.5">
                          {displayedTransactions.map((tx) => (
                              <div key={tx.id} className="p-4 rounded-[1.25rem] bg-black/40 backdrop-blur-xl border border-white/[0.04] flex items-center justify-between relative overflow-hidden group hover:bg-white/[0.03] transition-colors">
                                  <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/[0.05]">
                                          {tx.type === 'deposit' ? <ArrowDown className="w-4 h-4 text-emerald-400" /> : 
                                           tx.type === 'withdraw' ? <ArrowUp className="w-4 h-4 text-white/60" /> :
                                           <Sparkles className="w-4 h-4 text-glow-pink" />}
                                      </div>
                                      <div>
                                          <h4 className="font-bold text-[12px] text-white/90 capitalize tracking-wide">{tx.type.replace('_', ' ')}</h4>
                                          <p className="text-[9px] text-white/30 tracking-widest font-mono mt-0.5">
                                              {new Date(tx.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                          </p>
                                      </div>
                                  </div>
                                  <div className="text-right shrink-0">
                                      <div className={cn("font-mono font-bold text-[14px]", tx.type === 'withdraw' ? 'text-white/60' : 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]')}>
                                          {tx.type === 'withdraw' ? '-' : '+'}{Math.abs(tx.amount).toFixed(0)} <span className="text-[9px] text-glow-pink font-semibold">FIFA</span>
                                      </div>
                                  </div>
                              </div>
                          ))}
                      </div>
                  )}
              </div>
          </motion.div>
      </div>

      {/* Send Modal */}
      <AnimatePresence>
        {showPayModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center px-4 bg-black/60 backdrop-blur-md"
          >
            <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
               className="w-full max-w-sm rounded-[2rem] bg-black/90 border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden relative"
            >
               <div className="absolute top-0 right-0 w-48 h-48 bg-brand-light/10 blur-[60px] rounded-full pointer-events-none -mr-20 -mt-20 mix-blend-screen" />
               <div className="absolute bottom-0 left-0 w-32 h-32 bg-glow-pink/10 blur-[60px] rounded-full pointer-events-none -ml-16 -mb-16 mix-blend-screen" />
               
               <div className="p-6 flex flex-col gap-5 relative z-10 w-full min-h-[min-content]">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-bold tracking-widest uppercase text-[12px] flex items-center gap-2">
                       <Send className="w-4 h-4 text-brand-light" /> Send Tokens
                    </h3>
                    <button type="button" onClick={() => { playClickSound(); setShowPayModal(false); }} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form onSubmit={handlePaySubmit} className="flex flex-col gap-4 mt-2 object-contain">
                     <div className="flex flex-col gap-2">
                        <label className="text-[10px] text-white/50 uppercase tracking-widest font-semibold px-1">Recipient (Telegram Username)</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-mono text-[14px]">@</span>
                          <input 
                             type="text" 
                             required
                             value={payTgId}
                             onChange={(e) => setPayTgId(e.target.value)}
                             placeholder="username"
                             className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-9 pr-4 text-white font-mono text-[14px] placeholder:text-white/20 focus:outline-none focus:border-brand-light/50 focus:ring-1 focus:ring-brand-light/50 transition-all font-bold"
                          />
                        </div>
                        
                        {/* Resolved User Preview */}
                        <div className="min-h-[40px] px-1 transition-all flex items-center gap-2">
                           {isSearching ? (
                               <span className="text-[10px] text-white/30 uppercase tracking-widest flex items-center gap-2"><RefreshCw className="w-3 h-3 animate-spin"/> Locating user...</span>
                           ) : resolvedUser ? (
                               <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30"><UserIcon className="w-3 h-3" /></div>
                                  <span className="text-[11px] text-emerald-400 font-bold tracking-wide">{resolvedUser.firstName || ''} {resolvedUser.lastName || ''}</span>
                               </div>
                           ) : payTgId.length > 2 && (
                               <span className="text-[10px] text-red-400/80 uppercase tracking-widest flex items-center gap-2"><X className="w-3 h-3"/> User not found on network</span>
                           )}
                        </div>
                     </div>

                     <div className="flex flex-col gap-2 relative">
                         <label className="text-[10px] text-white/50 uppercase tracking-widest font-semibold px-1">Amount (FIFA)</label>
                         <div className="relative">
                           <input 
                              type="number" 
                              required
                              value={payAmount}
                              onChange={(e) => setPayAmount(e.target.value)}
                              placeholder="0"
                              min="10"
                              max={xpBalance}
                              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-white font-mono text-[20px] placeholder:text-white/10 focus:outline-none focus:border-brand-light/50 focus:ring-1 focus:ring-brand-light/50 transition-all font-bold text-center tracking-wider"
                           />
                           <div className="absolute top-1/2 -translate-y-1/2 right-4">
                               <button type="button" onClick={() => setPayAmount(xpBalance.toFixed(0))} className="text-[9px] text-brand-light uppercase font-bold tracking-widest px-2 py-1 bg-brand-light/10 hover:bg-brand-light/20 transition-colors rounded-md border border-brand-light/20">Max</button>
                           </div>
                         </div>
                         <div className="flex justify-between px-1 mt-1">
                           <span className="text-[9px] text-white/30 font-mono tracking-widest uppercase">Min: 10</span>
                           <span className="text-[9px] text-white/40 font-mono">Available: {xpBalance.toFixed(0)}</span>
                         </div>
                     </div>

                     <button 
                       type="submit"
                       disabled={!resolvedUser || parseInt(payAmount) < 10}
                       className="w-full mt-4 py-4 rounded-2xl bg-gradient-to-r from-brand to-glow-pink text-white font-bold uppercase tracking-[0.2em] text-[12px] shadow-[0_5px_20px_rgba(139,92,246,0.3)] disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed active:scale-95 transition-all flex items-center justify-center gap-2 border border-white/20"
                     >
                       <Send className="w-3.5 h-3.5" /> Confirm Transfer
                     </button>
                  </form>
               </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
