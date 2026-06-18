import React, { useState } from 'react';
import { Wallet, RefreshCw, ArrowDown, ArrowUp, CircleDollarSign } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { motion } from 'motion/react';
import { dbHelpers } from '../store/useAppStore';

export function WalletView() {
  const { currentUser, updateBalance } = useAppStore();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const transactions = currentUser ? dbHelpers.getTransactions(currentUser.id) : [];

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <div className="flex flex-col gap-6 px-6 pt-24 pb-32 min-h-screen">
      
      {/* Top Balance Card */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="glass-card p-6 flex flex-col gap-6 relative"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand/10 blur-[40px] rounded-full pointer-events-none" />
        
        <div className="flex justify-between items-center z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-glass-200 flex items-center justify-center border border-white/5">
              <Wallet className="w-5 h-5 text-brand-light" />
            </div>
            <h2 className="font-medium text-lg text-white/90">Your Balance</h2>
          </div>
          <div className="w-2.5 h-2.5 bg-green-500 rounded-full shadow-[0_0_8px_theme(colors.green.500)]" />
        </div>

        <div className="z-10">
          <button 
            onClick={handleRefresh}
            className="flex items-center gap-2 text-white/50 text-sm hover:text-white/80 mb-2 transition"
          >
            Refresh Balance 
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-brand-light' : ''}`} />
          </button>
          <div className="text-[3.5rem] leading-none font-display font-bold tracking-tight">
            {currentUser?.balance.toFixed(2)} <span className="text-xl text-brand-light font-sans align-top">USDT</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-2 z-10">
          <button 
            onClick={() => updateBalance(100, 'deposit')} // Demo functionality
            className="bg-brand hover:bg-brand-light text-white py-4 rounded-xl font-medium flex items-center justify-center gap-2 transition active:scale-95 shadow-lg shadow-brand/20"
          >
            <ArrowDown className="w-5 h-5" /> Deposit
          </button>
          <button 
            onClick={() => {
              if (currentUser && currentUser.balance >= 10) {
                updateBalance(-10, 'withdraw');
              }
            }}
            className="glass-button py-4 rounded-xl font-medium text-white flex items-center justify-center gap-2"
          >
            <ArrowUp className="w-5 h-5 text-white/70" /> Withdraw
          </button>
        </div>
      </motion.div>

      {/* Transactions List */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6 flex flex-col gap-4"
      >
        <h3 className="font-semibold text-lg text-white mb-2">Transactions</h3>
        
        <div className="flex flex-col gap-4">
          {transactions.length === 0 ? (
            <div className="text-center text-white/30 py-8">
              No transactions yet
            </div>
          ) : (
            transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-glass-200 border border-white/5 flex items-center justify-center">
                    {tx.type === 'deposit' ? <ArrowDown className="w-5 h-5 text-brand" /> : 
                     tx.type === 'withdraw' ? <ArrowUp className="w-5 h-5 text-white/60" /> :
                     <CircleDollarSign className="w-5 h-5 text-green-400" />}
                  </div>
                  <div>
                    <h4 className="font-semibold text-white capitalize">{tx.type}</h4>
                    <p className="text-xs text-white/40">
                      {new Date(tx.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-semibold ${tx.type === 'withdraw' ? 'text-white' : 'text-brand-light'}`}>
                    {tx.type === 'withdraw' ? '-' : '+'}${Math.abs(tx.amount).toFixed(2)}
                  </div>
                  <div className="text-xs text-white/40 capitalize">{tx.status}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>

    </div>
  );
}
