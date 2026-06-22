import React, { useState, useEffect } from 'react';
import { RefreshCw, ArrowDown, ArrowUp, Zap, Sparkles, X, Send, User as UserIcon, Layers, Calendar, CheckCircle2, ChevronRight, Hash, Clock, CreditCard, Activity, Pickaxe, Dribbble } from 'lucide-react';
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
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [selectedTokenInfo, setSelectedTokenInfo] = useState<'FIFA' | 'BNB' | 'USDT' | 'USDC' | null>(null);
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
        setAllTransactions(txs.sort((a,b) => b.timestamp - a.timestamp));
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
       confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 }, colors: ['#0071e3', '#34c759'] });
    }
  };

  const xpBalance = currentUser?.xpBalance || 0;
  const usdBalance = (xpBalance * 0.005).toFixed(2);

  const displayedTransactions = showFullHistory ? allTransactions : allTransactions.slice(0, 5);

  const getTxIcon = (type: string) => {
    switch (type) {
        case 'deposit': return <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center border border-accent/20"><ArrowDown className="w-5 h-5" strokeWidth={2.5} /></div>;
        case 'withdraw': return <div className="w-10 h-10 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center border border-red-500/20"><ArrowUp className="w-5 h-5" strokeWidth={2.5} /></div>;
        case 'earn': 
        case 'daily_login': return <div className="w-10 h-10 rounded-full bg-brand/10 text-brand flex items-center justify-center border border-brand/20"><Sparkles className="w-5 h-5" strokeWidth={2.5} /></div>;
        case 'mine': return <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center border border-blue-500/20"><Pickaxe className="w-5 h-5" strokeWidth={2.5} /></div>;
        default: return <div className="w-10 h-10 rounded-full bg-black/5 text-gray-400 flex items-center justify-center border border-black/5"><Layers className="w-5 h-5" strokeWidth={2.5} /></div>;
    }
  };

  return (
    <div className="flex flex-col gap-5 px-4 pt-16 pb-32 min-h-[100dvh]">

      {/* Premium Wallet Card Design */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full relative z-10 rounded-3xl p-5 bg-white border border-black/5 shadow-lg overflow-hidden mt-4"
      >
        <div className="absolute top-0 right-0 w-40 h-40 bg-brand/5 blur-[50px] rounded-full pointer-events-none -mt-16" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent/5 blur-[50px] rounded-full pointer-events-none -ml-8 -mb-8" />

         <div className="flex flex-col items-center justify-center relative z-10 w-full mb-6">
            <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1">
               Balance Overview
            </span>
            <span className="text-4xl font-black text-gray-900 tracking-tight leading-none">
               ${usdBalance}
            </span>
         </div>
         
         {/* Token Balances Grid */}
         <div className="grid grid-cols-2 gap-2 relative z-10 mb-4">
            <button onClick={() => { playClickSound(); setSelectedTokenInfo('FIFA'); }} className="p-2.5 bg-gray-50 border border-black/5 hover:bg-gray-100 transition-all rounded-2xl flex items-center justify-between group active:scale-95 shadow-sm">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-brand/10 text-brand flex items-center justify-center border border-brand/20">
                        <Dribbble className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex flex-col items-start leading-tight">
                        <span className="text-gray-900 font-bold text-[11px]">FIFA</span>
                    </div>
                </div>
                <div className="text-right">
                    <span className="text-gray-900 font-mono font-bold text-xs">{xpBalance.toFixed(0)}</span>
                </div>
            </button>
            <button onClick={() => { playClickSound(); setSelectedTokenInfo('USDT'); }} className="p-2.5 bg-gray-50 border border-black/5 hover:bg-gray-100 transition-all rounded-2xl flex items-center justify-between group active:scale-95 shadow-sm">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
                        <span className="text-[8px] font-black tracking-widest leading-none">USDT</span>
                    </div>
                    <div className="flex flex-col items-start leading-tight">
                        <span className="text-gray-900 font-bold text-[11px]">USDT</span>
                    </div>
                </div>
                <div className="text-right">
                    <span className="text-gray-900 font-mono font-bold text-xs">0.00</span>
                </div>
            </button>
            <button onClick={() => { playClickSound(); setSelectedTokenInfo('USDC'); }} className="p-2.5 bg-gray-50 border border-black/5 hover:bg-gray-100 transition-all rounded-2xl flex items-center justify-between group active:scale-95 shadow-sm">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center border border-blue-500/20">
                        <span className="text-[8px] font-black tracking-widest leading-none">USDC</span>
                    </div>
                    <div className="flex flex-col items-start leading-tight">
                        <span className="text-gray-900 font-bold text-[11px]">USDC</span>
                    </div>
                </div>
                <div className="text-right">
                    <span className="text-gray-900 font-mono font-bold text-xs">0.00</span>
                </div>
            </button>
            <button onClick={() => { playClickSound(); setSelectedTokenInfo('BNB'); }} className="p-2.5 bg-gray-50 border border-black/5 hover:bg-gray-100 transition-all rounded-2xl flex items-center justify-between group active:scale-95 shadow-sm">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
                        <span className="text-[8px] font-black tracking-widest leading-none">BNB</span>
                    </div>
                    <div className="flex flex-col items-start leading-tight">
                        <span className="text-gray-900 font-bold text-[11px]">BNB</span>
                    </div>
                </div>
                <div className="text-right">
                    <span className="text-gray-900 font-mono font-bold text-xs">0.00</span>
                </div>
            </button>
         </div>
        
        {/* Quick Actions Array */}
        <div className="flex items-center gap-2 relative z-10 w-full justify-between">
           <button 
             onClick={() => { playClickSound(); showToast('Wallet Address copied to clipboard!', 'info', 'Receive Wallet'); }}
             className="flex-1 flex items-center justify-center gap-1.5 bg-[#1d1d1f] hover:bg-black active:scale-95 transition-all text-white py-2.5 rounded-xl border border-black/10 shadow-sm"
           >
             <ArrowDown className="w-4 h-4" strokeWidth={2.5} />
             <span className="text-[10px] font-bold uppercase tracking-widest">Receive</span>
           </button>
           <button 
             onClick={() => { playClickSound(); setShowPayModal(true); }}
             className="flex-1 flex items-center justify-center gap-1.5 bg-gray-100 hover:bg-gray-200 active:scale-95 transition-all text-gray-900 py-2.5 rounded-xl border border-black/5 shadow-sm"
           >
             <Send className="w-4 h-4 ml-0.5" strokeWidth={2.5} />
             <span className="text-[10px] font-bold uppercase tracking-widest">Send</span>
           </button>
        </div>
      </motion.div>

      {/* Token Details Modal */}
      <AnimatePresence>
         {selectedTokenInfo && (
            <>
               <motion.div 
                 initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                 onClick={() => { playClickSound(); setSelectedTokenInfo(null); }}
                 className="fixed inset-0 z-[110] bg-black/20 backdrop-blur-md"
               />
               <motion.div
                 initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                 transition={{ type: "spring", damping: 25, stiffness: 200 }}
                 className="fixed bottom-0 left-0 w-full bg-white border-t border-black/5 rounded-t-3xl z-[115] pb-safe shadow-[0_-20px_60px_rgba(0,0,0,0.1)] flex flex-col h-[85vh]"
               >
                  <div className="absolute top-0 right-0 w-48 h-48 bg-brand/5 blur-[50px] rounded-full pointer-events-none -mr-10 -mt-10" />
                  
                  <div className="flex justify-between items-center p-6 border-b border-black/5 relative z-10 shrink-0">
                     <div className="flex items-center gap-3">
                         {selectedTokenInfo === 'FIFA' ? (
                             <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center border border-brand/20">
                                 <Dribbble className="w-5 h-5" />
                             </div>
                         ) : (
                             <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center border border-black/5">
                                 <span className="text-xs font-black tracking-widest">{selectedTokenInfo}</span>
                             </div>
                         )}
                         <div className="flex flex-col">
                            <h3 className="text-xl font-bold text-gray-900 tracking-tight">{selectedTokenInfo} History</h3>
                            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Network Transactions</span>
                         </div>
                     </div>
                     <button onClick={() => { playClickSound(); setSelectedTokenInfo(null); }} className="w-8 h-8 rounded-full bg-black/5 text-gray-500 hover:text-gray-900 hover:bg-black/10 flex items-center justify-center transition-colors">
                        <X className="w-4 h-4" />
                     </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                     {selectedTokenInfo === 'FIFA' ? (
                         allTransactions.length === 0 ? (
                             <div className="py-20 text-center text-gray-400 text-[10px] tracking-widest uppercase font-bold">
                                 {t(language, 'noTx')}
                             </div>
                         ) : (
                             <div className="flex flex-col gap-2">
                                 {allTransactions.map((tx) => (
                                     <div 
                                         key={tx.id} 
                                         onClick={() => { playClickSound(); setSelectedTx(tx); }}
                                         className="p-3 rounded-2xl bg-white border border-black/5 flex items-center justify-between group hover:bg-gray-50 transition-all cursor-pointer shadow-sm"
                                     >
                                         <div className="flex items-center gap-3 relative w-full">
                                             {getTxIcon(tx.type)}
                                             <div className="flex-1 min-w-0">
                                                 <h4 className="font-bold text-sm text-gray-900 capitalize tracking-wide">{tx.type.replace('_', ' ')}</h4>
                                                 <p className="text-[10px] text-gray-500 tracking-widest font-mono font-bold mt-0.5 truncate">
                                                     {new Date(tx.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                 </p>
                                             </div>
                                             <div className="flex items-center gap-2 shrink-0">
                                                 <div className={cn("font-mono font-bold text-sm", tx.type === 'withdraw' ? 'text-gray-900' : 'text-accent')}>
                                                     {tx.type === 'withdraw' ? '-' : '+'}{Math.abs(tx.amount).toFixed(0)}
                                                 </div>
                                                 <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-900 transition-colors" />
                                             </div>
                                         </div>
                                     </div>
                                 ))}
                             </div>
                         )
                     ) : (
                         <div className="py-20 text-center text-gray-400 text-[10px] tracking-widest uppercase font-bold">
                             No {selectedTokenInfo} transactions
                         </div>
                     )}
                  </div>
               </motion.div>
            </>
         )}
      </AnimatePresence>
      
      {/* Transaction Details Modal (Bottom Sheet Design) */}
      <AnimatePresence>
         {selectedTx && (
            <>
               <motion.div 
                 initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                 onClick={() => { playClickSound(); setSelectedTx(null); }}
                 className="fixed inset-0 z-[120] bg-black/20 backdrop-blur-md"
               />
               <motion.div
                 initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                 transition={{ type: "spring", damping: 25, stiffness: 200 }}
                 className="fixed bottom-0 left-0 w-full bg-white border-t border-black/5 rounded-t-3xl z-[125] pb-safe shadow-[0_-20px_60px_rgba(0,0,0,0.1)] overflow-hidden"
               >
                  <div className="absolute top-0 right-0 w-48 h-48 bg-brand/5 blur-[50px] rounded-full pointer-events-none -mr-10 -mt-10" />
                  
                  <div className="flex flex-col p-5 w-full relative z-10">
                     <div className="w-10 h-1 bg-black/10 rounded-full mx-auto mb-4" />
                     
                     <div className="flex items-center justify-between mb-5">
                        <h2 className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-500">Transaction Detail</h2>
                        <button onClick={() => { playClickSound(); setSelectedTx(null); }} className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-black/10 transition-all">
                           <X className="w-4 h-4" />
                        </button>
                     </div>

                     <div className="flex flex-col items-center justify-center gap-2 mb-6">
                        {getTxIcon(selectedTx.type)}
                        <div className="flex items-end gap-1 mt-1">
                           <span className={cn("text-3xl font-bold leading-none tracking-tight", selectedTx.type === 'withdraw' ? 'text-gray-900' : 'text-accent')}>
                              {selectedTx.type === 'withdraw' ? '-' : '+'}{Math.abs(selectedTx.amount).toFixed(2)}
                           </span>
                           <span className="text-xs font-bold text-gray-500 mb-1">FIFA</span>
                        </div>
                        <div className="px-3 py-1 bg-accent/10 border border-accent/20 text-accent text-[9px] font-bold uppercase tracking-widest rounded-lg flex items-center gap-1.5 mt-1">
                           <CheckCircle2 className="w-3 h-3" /> Completed
                        </div>
                     </div>

                     <div className="flex flex-col gap-2">
                         <div className="flex items-center justify-between p-3 bg-gray-50 border border-black/5 rounded-2xl">
                            <div className="flex items-center gap-2 text-gray-500">
                               <Hash className="w-4 h-4" /> <span className="text-[10px] uppercase tracking-widest font-bold">Transaction ID</span>
                            </div>
                            <span className="text-[10px] text-gray-900 bg-black/5 px-2 py-1 rounded-lg font-mono font-bold break-all text-right max-w-[50%] select-all">{selectedTx.id}</span>
                         </div>
                         <div className="flex items-center justify-between p-3 bg-gray-50 border border-black/5 rounded-2xl">
                            <div className="flex items-center gap-2 text-gray-500">
                               <Clock className="w-4 h-4" /> <span className="text-[10px] uppercase tracking-widest font-bold">Date & Time</span>
                            </div>
                            <span className="text-[10px] text-gray-900 font-mono font-bold text-right">
                               {new Date(selectedTx.timestamp).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                            </span>
                         </div>
                         <div className="flex items-center justify-between p-3 bg-gray-50 border border-black/5 rounded-2xl">
                            <div className="flex items-center gap-2 text-gray-500">
                               <Activity className="w-4 h-4" /> <span className="text-[10px] uppercase tracking-widest font-bold">Type</span>
                            </div>
                            <span className="text-xs text-gray-900 font-bold capitalize tracking-wide">{selectedTx.type.replace('_', ' ')}</span>
                         </div>
                         {selectedTx.originId && (
                           <div className="flex items-center justify-between p-3 bg-gray-50 border border-black/5 rounded-2xl">
                              <div className="flex items-center gap-2 text-gray-500">
                                 <UserIcon className="w-4 h-4" /> <span className="text-[10px] uppercase tracking-widest font-bold">{selectedTx.type === 'deposit' ? 'From' : 'To'}</span>
                              </div>
                              <span className="text-[10px] text-gray-900 font-mono font-bold bg-black/5 px-2 py-1 rounded-lg truncate max-w-[50%]">{selectedTx.originId}</span>
                           </div>
                         )}
                     </div>
                  </div>
               </motion.div>
            </>
         )}
      </AnimatePresence>

      {/* Send Modal */}
      <AnimatePresence>
        {showPayModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center px-4 bg-black/20 backdrop-blur-md"
          >
            <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
               className="w-full max-w-sm rounded-[2rem] bg-white border border-black/5 shadow-xl overflow-hidden relative"
            >
               <div className="p-5 flex flex-col gap-4 relative z-10 w-full min-h-[min-content]">
                  <div className="flex items-center justify-between">
                    <h3 className="text-gray-900 font-bold tracking-widest uppercase text-sm flex items-center gap-2">
                       <Send className="w-4 h-4 text-brand" /> Transfer Funds
                    </h3>
                    <button type="button" onClick={() => { playClickSound(); setShowPayModal(false); }} className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-black/10 transition-all border border-black/5">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form onSubmit={handlePaySubmit} className="flex flex-col gap-3 mt-1">
                     <div className="flex flex-col gap-2">
                        <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold px-2">Recipient (Username)</label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-mono text-sm">@</span>
                          <input 
                             type="text" 
                             required
                             value={payTgId}
                             onChange={(e) => setPayTgId(e.target.value)}
                             placeholder="username"
                             className="w-full bg-gray-50 border border-black/5 rounded-2xl py-3 pl-8 pr-3 text-gray-900 font-mono text-sm placeholder:text-gray-400 focus:outline-none focus:border-brand/30 focus:ring-1 focus:ring-brand/30 transition-all font-bold shadow-sm"
                          />
                        </div>
                        
                        {/* Premium Resolved User Preview */}
                        <div className="px-2 transition-all mt-1">
                           {isSearching && (
                               <span className="text-[10px] text-gray-400 uppercase tracking-widest flex items-center gap-2 font-bold"><RefreshCw className="w-3 h-3 animate-spin"/> Locating user...</span>
                           )}
                           {resolvedUser && !isSearching && (
                               <div className="flex flex-col w-full p-2.5 bg-accent/5 border border-accent/20 rounded-xl shadow-sm relative overflow-hidden mt-1">
                                  <div className="flex items-center gap-3 relative z-10">
                                      {resolvedUser.photoUrl ? (
                                          <img src={resolvedUser.photoUrl} alt="Profile" className="w-8 h-8 rounded-full object-cover border border-accent/20 flex-shrink-0" />
                                      ) : (
                                          <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center shadow-sm flex-shrink-0">
                                            <span className="font-bold text-sm uppercase tracking-widest">
                                                {(resolvedUser.firstName || resolvedUser.username || '?').charAt(0)}
                                            </span>
                                          </div>
                                      )}
                                      <div className="flex flex-col flex-1 min-w-0">
                                          <span className="text-sm text-gray-900 font-bold tracking-wide truncate">{resolvedUser.firstName || ''} {resolvedUser.lastName || ''}</span>
                                          {resolvedUser.username && (
                                              <span className="text-[10px] text-gray-500 font-bold tracking-widest truncate">@{resolvedUser.username}</span>
                                          )}
                                      </div>
                                  </div>
                               </div>
                           )}
                           {!resolvedUser && !isSearching && payTgId.length > 2 && (
                               <span className="text-[10px] text-red-500 uppercase tracking-widest flex items-center gap-2 font-bold mt-1"><X className="w-3 h-3"/> User not found</span>
                           )}
                        </div>
                     </div>

                     <div className="flex flex-col gap-2 relative mt-1">
                         <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold px-2">Amount (FIFA)</label>
                         <div className="relative">
                           <input 
                              type="number" 
                              required
                              value={payAmount}
                              onChange={(e) => setPayAmount(e.target.value)}
                              placeholder="0"
                              min="10"
                              max={xpBalance}
                              className="w-full bg-gray-50 border border-black/5 rounded-2xl py-3 px-3 pl-10 text-gray-900 font-mono text-lg focus:outline-none focus:border-brand/30 focus:ring-1 focus:ring-brand/30 transition-all font-bold tracking-wider shadow-sm"
                           />
                           <div className="absolute left-3.5 top-1/2 -translate-y-1/2">
                               <Dribbble className="w-4 h-4 text-gray-400" />
                           </div>
                           <div className="absolute top-1/2 -translate-y-1/2 right-3">
                               <button type="button" onClick={() => { playClickSound(); setPayAmount(xpBalance.toFixed(0)); }} className="text-[10px] text-gray-900 uppercase font-black tracking-widest px-2.5 py-1.5 bg-black/5 hover:bg-black/10 transition-all rounded-lg active:scale-95">Max</button>
                           </div>
                         </div>
                         <div className="flex justify-between px-2 mt-1">
                           <span className="text-[9px] text-gray-400 font-mono tracking-[0.2em] uppercase font-bold">Min: 10</span>
                           <span className="text-[9px] text-accent font-mono tracking-[0.2em] font-bold">Available: {xpBalance.toFixed(0)}</span>
                         </div>
                     </div>

                     <button 
                       type="submit"
                       disabled={!resolvedUser || parseInt(payAmount) < 10}
                       className="w-full mt-4 py-3.5 rounded-xl bg-[#1d1d1f] text-white font-bold uppercase tracking-[0.2em] text-[11px] shadow-md disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all flex items-center justify-center gap-2 hover:bg-black"
                     >
                       <Send className="w-4 h-4" /> Confirm Transfer
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
