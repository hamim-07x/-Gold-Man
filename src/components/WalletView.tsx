import React, { useState, useEffect } from 'react';
import { RefreshCw, ArrowDown, ArrowUp, CircleDollarSign, ArrowRightLeft, Pickaxe, Sparkles, Zap, ShieldCheck } from 'lucide-react';
import { useAppStore, dbHelpers, Transaction } from '../store/useAppStore';
import { motion, AnimatePresence } from 'motion/react';
import { t } from '../lib/i18n';
import { cn } from '../lib/utils';

export function WalletView() {
  const { currentUser, language } = useAppStore();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  
  useEffect(() => {
    if (currentUser) {
      const unsub = dbHelpers.getTransactions(currentUser.id, (txs) => {
        setAllTransactions(txs);
      });
      return () => unsub();
    }
  }, [currentUser?.id]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const usdcBalance = currentUser?.usdcBalance || 0;
  const xpBalance = currentUser?.xpBalance || 0;

  return (
    <div className="flex flex-col gap-6 px-4 pt-20 pb-32 min-h-[100dvh]">
      
      {/* Header with Title and Refresh */}
      <div className="flex justify-between items-center z-10 px-2 mt-2">
        <h2 className="font-semibold text-[16px] tracking-wide text-white/90 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-accent" /> Secure Vault
        </h2>
        <button 
          onClick={handleRefresh}
          className="flex items-center gap-1.5 text-white/40 text-[10px] font-semibold hover:text-white transition uppercase tracking-widest bg-white/5 py-1.5 px-3 rounded-full border border-white/5"
        >
          {t(language, 'refresh')} 
          <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-brand-light' : ''}`} strokeWidth={2} />
        </button>
      </div>

      {/* USDC Card */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="p-6 rounded-[2rem] bg-gradient-to-br from-[#2775CA]/10 to-black/40 backdrop-blur-2xl border border-white/[0.05] shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex flex-col relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#2775CA]/20 blur-[80px] rounded-full pointer-events-none -mr-20 -mt-20" />
        
        <div className="flex items-center gap-3 z-10 mb-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-white shadow-[0_0_15px_rgba(39,117,202,0.4)] relative border border-white/10">
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 32C24.8366 32 32 24.8366 32 16C32 7.16344 24.8366 0 16 0C7.16344 0 0 7.16344 0 16C0 24.8366 7.16344 32 16 32Z" fill="#2775CA"/>
              <path d="M19.1129 11.2335C18.2323 10.741 17.2023 10.4571 16.0967 10.4571C12.8718 10.4571 10.5186 12.6391 10.5186 15.656C10.5186 18.0664 12.0626 19.3491 14.8687 20.0886C17.4328 20.7634 18.2323 21.321 18.2323 22.3789C18.2323 23.4939 17.2759 24.2323 15.8202 24.2323C14.3986 24.2323 13.1611 23.6309 12.1643 22.5694L9.84591 25.1388C11.5165 26.969 13.6826 27.6749 15.6175 27.8188V32H16.815V27.8388C19.7891 27.6111 22.1246 25.597 22.1246 22.4549C22.1246 19.5526 19.8251 18.2366 17.0645 17.5253C14.8327 16.942 14.2813 16.4864 14.2813 15.5481C14.2813 14.6338 15.1506 13.9185 16.3562 13.9185C17.5978 13.9185 18.5835 14.382 19.4632 15.1972L21.6521 12.6076C20.897 11.9682 20.0385 11.4927 19.1129 11.2335Z" fill="white"/>
              <path d="M16.815 4V8.1612C16.815 8.1612 16.4475 8.12521 16.0648 8.12521C15.6501 8.12521 15.2474 8.1612 15.2474 8.1612V4H16.815Z" fill="white"/>
            </svg>
          </div>
          <div>
            <div className="text-[12px] uppercase text-[#4aa5ff] font-bold tracking-[0.1em] drop-shadow-[0_0_8px_rgba(74,165,255,0.4)]">USD Coin</div>
            <div className="text-[10px] text-white/40 tracking-widest font-mono">SPL / POLYGON</div>
          </div>
        </div>

        <div className="z-10 flex items-baseline gap-2 mb-6">
          <span className="text-[3rem] font-display font-medium text-white tracking-tight leading-none drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
            {usdcBalance.toFixed(2)}
          </span>
          <span className="text-[1rem] font-semibold text-[#4aa5ff]">USDC</span>
        </div>

        <div className="flex gap-3 z-10 w-full mt-auto">
          <button className="flex-1 bg-white/[0.05] hover:bg-white/[0.1] py-3.5 rounded-2xl flex items-center justify-center gap-2 text-[12px] font-semibold transition border border-white/5 shadow-inner shadow-white/5 active:scale-95 text-[#4aa5ff]">
            <ArrowDown className="w-4 h-4" /> Deposit
          </button>
          <button className="flex-1 bg-white/[0.05] hover:bg-white/[0.1] py-3.5 rounded-2xl flex items-center justify-center gap-2 text-[12px] font-semibold transition border border-white/5 shadow-inner shadow-white/5 active:scale-95 text-white/70">
            <ArrowUp className="w-4 h-4" /> Withdraw
          </button>
        </div>
      </motion.div>

      {/* Points Card */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="p-6 rounded-[2rem] bg-gradient-to-br from-brand/10 to-glow-pink/5 backdrop-blur-2xl border border-white/[0.05] shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex flex-col relative overflow-hidden"
      >
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-glow-pink/10 blur-[80px] rounded-full pointer-events-none -ml-20 -mb-20" />
        
        <div className="flex items-center gap-3 z-10 mb-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-tr from-brand to-glow-pink shadow-[0_0_20px_rgba(236,72,153,0.4)] relative">
            <div className="absolute inset-[2px] rounded-full bg-black flex items-center justify-center hidden"></div>
            <Zap className="w-6 h-6 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" fill="currentColor" />
          </div>
          <div>
            <div className="text-[12px] uppercase bg-clip-text text-transparent bg-gradient-to-r from-brand-light to-glow-pink font-bold tracking-[0.1em]">Mining Points</div>
            <div className="text-[10px] text-white/40 tracking-widest font-mono">REWARD XP</div>
          </div>
        </div>

        <div className="z-10 flex items-baseline gap-2 mb-2">
          <span className="text-[2.5rem] font-mono font-medium text-white tracking-tight leading-none drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">
            {xpBalance.toFixed(0)}
          </span>
          <span className="text-[1rem] font-semibold text-brand-light">XP</span>
        </div>
      </motion.div>

      {/* Transactions List */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mt-2"
      >
        <h3 className="font-semibold text-[11px] uppercase tracking-[0.2em] text-white/40 mb-3 px-2 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-accent-light" />
          Recent Activity
        </h3>
        
        <div className="flex flex-col gap-2">
          {allTransactions.length === 0 ? (
            <div className="p-8 rounded-[1.5rem] bg-black/30 backdrop-blur-xl border border-white/[0.04] text-center text-white/30 text-[12px] tracking-wide shadow-inner">
              {t(language, 'noTx')}
            </div>
          ) : (
            allTransactions.slice(0, 10).map((tx) => (
              <div key={tx.id} className="p-4 rounded-[1.5rem] bg-black/40 backdrop-blur-xl border border-white/[0.04] flex items-center justify-between hover:bg-white/5 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
                <div className="flex items-center gap-3 w-full">
                  <div className="w-10 h-10 rounded-[14px] bg-white/5 border border-white/10 flex items-center justify-center shrink-0 shadow-inner overflow-hidden">
                    {tx.type === 'deposit' ? <ArrowDown className="w-4 h-4 text-emerald-400" /> : 
                     tx.type === 'withdraw' ? <ArrowUp className="w-4 h-4 text-rose-400" /> :
                     tx.type === 'referral_commission' ? <Sparkles className="w-4 h-4 text-amber-400" /> :
                     tx.type === 'daily_login' ? <Zap className="w-4 h-4 text-glow-pink" /> :
                     tx.currency === 'USDC' ? <CircleDollarSign className="w-4 h-4 text-[#4aa5ff]" /> :
                     <Pickaxe className="w-4 h-4 text-brand-light" />}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <h4 className="font-medium text-[13px] text-white/90 capitalize truncate">{tx.type.replace('_', ' ')}</h4>
                    <p className="text-[10px] text-white/40 tracking-wider font-mono mt-0.5">
                      {new Date(tx.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className={cn("font-mono font-medium text-[14px]", tx.type === 'withdraw' ? 'text-white/90' : 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.4)]')}>
                      {tx.type === 'withdraw' ? '-' : '+'}{Math.abs(tx.amount).toFixed(tx.currency === 'XP' ? 0 : 2)} {tx.currency || 'USD'}
                    </div>
                    <div className="text-[9px] text-white/30 uppercase tracking-widest mt-1">{tx.status}</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}
