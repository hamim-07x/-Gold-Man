import React, { useState } from 'react';
import { Wallet, RefreshCw, ArrowDown, ArrowUp, CircleDollarSign } from 'lucide-react';
import { useAppStore, dbHelpers } from '../store/useAppStore';
import { motion } from 'motion/react';
import { t } from '../lib/i18n';

export function WalletView() {
  const { currentUser, updateBalance, language } = useAppStore();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const transactions = currentUser ? dbHelpers.getTransactions(currentUser.id) : [];

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <div className="flex flex-col gap-4 px-4 pt-20 pb-28 min-h-[100dvh]">
      
      {/* Top Balance Card */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="glass-card p-5 flex flex-col relative overflow-hidden"
      >
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-light/10 blur-[50px] rounded-full pointer-events-none" />
        
        <div className="flex justify-between items-center z-10 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 backdrop-blur-md">
              <Wallet className="w-4 h-4 text-brand-light" strokeWidth={1.5} />
            </div>
            <h2 className="font-medium text-[15px] tracking-wide text-white/90">{t(language, 'balance')}</h2>
          </div>
          <div className="w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_8px_theme(colors.emerald.400/50)]" />
        </div>

        <div className="z-10 mb-6">
          <button 
            onClick={handleRefresh}
            className="flex items-center gap-1.5 text-white/40 text-[11px] mb-1.5 hover:text-white/70 transition uppercase tracking-wider"
          >
            {t(language, 'refresh')} 
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-brand-light' : ''}`} strokeWidth={1.5} />
          </button>
          <div className="text-[2.5rem] leading-none font-display font-medium tracking-tight flex items-baseline gap-2">
            {currentUser?.balance.toFixed(2)} <span className="text-sm font-semibold text-brand-light font-sans tracking-widest">USDT</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 z-10">
          <button 
            onClick={() => updateBalance(100, 'deposit')}
            className="bg-brand hover:bg-brand-light text-white py-3 rounded-2xl text-sm font-medium flex items-center justify-center gap-2 transition active:scale-95 shadow-lg shadow-brand/20 relative overflow-hidden flex-nowrap whitespace-nowrap px-2"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            <ArrowDown className="w-4 h-4 shrink-0 relative" strokeWidth={2} /> <span className="relative">{t(language, 'deposit')}</span>
          </button>
          <button 
            onClick={() => {
              if (currentUser && currentUser.balance >= 10) {
                updateBalance(-10, 'withdraw');
              }
            }}
            className="glass-button py-3 text-sm font-medium text-white flex items-center justify-center gap-2 active:scale-95 flex-nowrap whitespace-nowrap px-2"
          >
            <ArrowUp className="w-4 h-4 shrink-0 text-white/70" strokeWidth={2} /> {t(language, 'withdraw')}
          </button>
        </div>
      </motion.div>

      {/* Transactions List */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-5 flex flex-col gap-4"
      >
        <h3 className="font-semibold text-[15px] tracking-wide text-white mb-1">{t(language, 'transactions')}</h3>
        
        <div className="flex flex-col gap-3">
          {transactions.length === 0 ? (
            <div className="text-center text-white/30 py-6 text-sm">
              {t(language, 'noTx')}
            </div>
          ) : (
            transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-2 hover:bg-white/5 rounded-2xl transition-colors -mx-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-[14px] bg-white/5 border border-white/5 flex items-center justify-center shrink-0">
                    {tx.type === 'deposit' ? <ArrowDown className="w-4 h-4 text-brand-light" strokeWidth={1.5} /> : 
                     tx.type === 'withdraw' ? <ArrowUp className="w-4 h-4 text-white/60" strokeWidth={1.5} /> :
                     <CircleDollarSign className="w-4 h-4 text-emerald-400" strokeWidth={1.5} />}
                  </div>
                  <div>
                    <h4 className="font-medium text-[14px] text-white/90 capitalize">{tx.type === 'deposit' ? t(language, 'deposit') : tx.type === 'withdraw' ? t(language, 'withdraw') : tx.type}</h4>
                    <p className="text-[11px] text-white/40 tracking-wide">
                      {new Date(tx.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className={`font-medium text-[14px] ${tx.type === 'withdraw' ? 'text-white/90' : 'text-brand-light'}`}>
                    {tx.type === 'withdraw' ? '-' : '+'}${Math.abs(tx.amount).toFixed(2)}
                  </div>
                  <div className="text-[11px] text-white/40 capitalize tracking-wide">{tx.status === 'pending' ? t(language, 'pending') : tx.status === 'completed' ? t(language, 'completed') : tx.status}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>

    </div>
  );
}
