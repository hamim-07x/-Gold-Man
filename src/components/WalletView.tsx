import React, { useState, useEffect } from 'react';
import { RefreshCw, ArrowDown, ArrowUp, X, Send, User as UserIcon, CheckCircle2, ChevronRight, Hash, Clock, Activity, Dribbble, Search, Copy, QrCode, ShieldCheck } from 'lucide-react';
import { useAppStore, dbHelpers, Transaction, User } from '../store/useAppStore';
import { motion, AnimatePresence } from 'motion/react';
import { t } from '../lib/i18n';
import { cn } from '../lib/utils';
import { playClickSound, playSuccessSound } from '../lib/audio';
import confetti from 'canvas-confetti';

export function WalletView() {
  const { currentUser, language, transferTokens, showToast } = useAppStore();
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [selectedTokenInfo, setSelectedTokenInfo] = useState<'FIFA' | 'BNB' | 'USDT' | 'USDC' | null>(null);
  
  // Modals
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  
  // Send logic
  const [paySearchQuery, setPaySearchQuery] = useState('');
  const [payAmount, setPayAmount] = useState('');
  const [resolvedUser, setResolvedUser] = useState<User | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(false);
  
  useEffect(() => {
    if (currentUser) {
      const unsub = dbHelpers.getTransactions(currentUser.id, (txs) => {
        setAllTransactions(txs.sort((a,b) => b.timestamp - a.timestamp));
      });
      return () => unsub();
    }
  }, [currentUser?.id]);

  const handleSearchUser = async () => {
    if (paySearchQuery.length < 2) return;
    setIsSearching(true);
    setSearchError(false);
    setResolvedUser(null);
    playClickSound();
    
    // Attempt search by username or text exact match ID
    const userByUsername = await dbHelpers.findUserByUsername(paySearchQuery);
    if (userByUsername) {
        setResolvedUser(userByUsername);
    } else {
        // Since we don't have a direct findUserById helper exposed easily without importing getDoc,
        // we can try looking at the store logic if possible.
        setSearchError(true);
    }
    setIsSearching(false);
  };

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
       setPaySearchQuery('');
       setPayAmount('');
       setResolvedUser(null);
       confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 }, colors: ['#0071e3', '#34c759'] });
    }
  };

  const fifaBalance = currentUser?.xpBalance || 0;
  const usdBalance = (fifaBalance * 0.005).toFixed(2);

  return (
    <div className="flex flex-col gap-4 px-4 pt-4 pb-28 min-h-[100dvh]">

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full relative z-10 flex flex-col items-center mt-2 bg-white/60 backdrop-blur-md p-6 rounded-3xl border border-black/5 shadow-sm"
      >
         <span className="text-[10px] text-gray-500 uppercase tracking-widest font-extrabold mb-1">
            Total Balance
         </span>
         <span className="text-[36px] font-black text-gray-900 tracking-tight leading-none mb-6 font-mono">
            ${usdBalance}
         </span>
         
         <div className="flex items-center gap-3 w-full max-w-[280px]">
            <button 
              onClick={() => { playClickSound(); setShowReceiveModal(true); }}
              className="flex-1 flex flex-row items-center justify-center gap-2 bg-[#1d1d1f] hover:bg-black active:scale-95 transition-all text-white py-2.5 rounded-xl border border-black/10 shadow-md cursor-pointer"
            >
               <ArrowDown className="w-4 h-4 opacity-90" strokeWidth={2.5} />
              <span className="text-[11px] font-bold uppercase tracking-widest">Receive</span>
            </button>
            <button 
              onClick={() => { 
                  playClickSound(); 
                  setShowPayModal(true); 
                  setPaySearchQuery(''); 
                  setResolvedUser(null);
                  setSearchError(false);
                  setPayAmount('');
              }}
              className="flex-1 flex flex-row items-center justify-center gap-2 bg-brand hover:bg-brand/90 active:scale-95 transition-all text-white py-2.5 rounded-xl border border-black/10 shadow-md cursor-pointer"
            >
               <Send className="w-4 h-4 opacity-90" strokeWidth={2.5} />
              <span className="text-[11px] font-bold uppercase tracking-widest">Send</span>
            </button>
         </div>
      </motion.div>

      <div className="flex flex-col w-full mt-4">
         <h3 className="text-[11px] uppercase tracking-[0.2em] font-extrabold text-gray-400 mb-3 ml-2 flex items-center gap-1.5">
            Assets
         </h3>
         
         <div className="flex flex-col bg-white border border-black/5 rounded-2xl shadow-sm overflow-hidden">
            <button onClick={() => { playClickSound(); setSelectedTokenInfo('FIFA'); }} className="p-3.5 border-b border-black/5 hover:bg-gray-50 transition-all flex items-center justify-between group active:bg-gray-100 cursor-pointer">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center border border-brand/20 shadow-sm">
                        <Dribbble className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col items-start leading-tight">
                        <span className="text-gray-900 font-extrabold text-[15px]">FIFA Coin</span>
                        <span className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mt-0.5">Primary</span>
                    </div>
                </div>
                <div className="flex flex-col items-end leading-tight">
                    <span className="text-gray-900 font-mono font-black text-[16px]">{fifaBalance.toFixed(2)}</span>
                    <span className="text-gray-400 font-bold text-[10px] mt-0.5">${usdBalance}</span>
                </div>
            </button>
            <button className="p-3.5 border-b border-black/5 hover:bg-gray-50 transition-all flex items-center justify-between group active:bg-gray-100 cursor-pointer">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20 shadow-sm">
                        <span className="text-[10px] font-black tracking-widest leading-none">USDT</span>
                    </div>
                    <div className="flex flex-col items-start leading-tight">
                        <span className="text-gray-900 font-extrabold text-[15px]">Tether</span>
                        <span className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mt-0.5">BEP20</span>
                    </div>
                </div>
                <div className="flex flex-col items-end leading-tight">
                    <span className="text-gray-900 font-mono font-black text-[16px]">0.00</span>
                    <span className="text-gray-400 font-bold text-[10px] mt-0.5">$0.00</span>
                </div>
            </button>
            <button className="p-3.5 hover:bg-gray-50 transition-all flex items-center justify-between group active:bg-gray-100 cursor-pointer">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#EEA013]/10 text-[#EEA013] flex items-center justify-center border border-[#EEA013]/20 shadow-sm">
                        <span className="text-[10px] font-black tracking-widest leading-none">BNB</span>
                    </div>
                    <div className="flex flex-col items-start leading-tight">
                        <span className="text-gray-900 font-extrabold text-[15px]">BNB</span>
                        <span className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mt-0.5">Binance</span>
                    </div>
                </div>
                <div className="flex flex-col items-end leading-tight">
                    <span className="text-gray-900 font-mono font-black text-[16px]">0.00</span>
                    <span className="text-gray-400 font-bold text-[10px] mt-0.5">$0.00</span>
                </div>
            </button>
         </div>
      </div>

      {/* Receive Modal (QR) */}
      <AnimatePresence>
        {showReceiveModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center px-4 pb-20 sm:pb-0 bg-black/40 backdrop-blur-md"
            onClick={() => setShowReceiveModal(false)}
          >
             <motion.div 
                initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-sm rounded-[2rem] bg-white shadow-xl overflow-hidden relative p-6 flex flex-col items-center"
             >
                <div className="absolute top-0 left-0 w-48 h-48 bg-brand/5 blur-[50px] rounded-full pointer-events-none -ml-10 -mt-10" />
                
                <div className="w-full flex justify-between items-center mb-6 relative z-10">
                   <h3 className="text-gray-900 font-black tracking-wide text-lg flex items-center gap-2">
                      <QrCode className="w-5 h-5 text-brand" /> Receive
                   </h3>
                   <button onClick={() => { playClickSound(); setShowReceiveModal(false); }} className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors cursor-pointer">
                      <X className="w-4 h-4" />
                   </button>
                </div>

                <div className="p-4 bg-white border-2 border-gray-100 rounded-3xl shadow-sm relative z-10 mx-auto flex items-center justify-center w-48 h-48 mb-6">
                    {/* Using qrserver for simple open source QR generation */}
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${currentUser?.id}&margin=0&color=000000&bgcolor=ffffff`} alt="QR Code" className="w-full h-full object-contain" />
                </div>

                <div className="w-full flex flex-col items-center gap-3 relative z-10">
                   <span className="text-[10px] font-bold text-gray-400 tracking-[0.2em] uppercase">Your Wallet Address (ID)</span>
                   <div className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl flex items-center justify-between">
                       <span className="text-xs font-mono font-bold text-gray-900 truncate mr-3 flex-1 selectable">{currentUser?.id}</span>
                       <button 
                          onClick={() => {
                              playClickSound();
                              navigator.clipboard.writeText(currentUser?.id || '');
                              showToast('Address Copied!', 'success');
                          }}
                          className="bg-white border border-gray-200 shadow-sm p-2 rounded-xl text-brand hover:bg-gray-50 transition-all cursor-pointer"
                       >
                          <Copy className="w-4 h-4" />
                       </button>
                   </div>
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Send Modal */}
      <AnimatePresence>
        {showPayModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center px-4 pb-20 sm:pb-0 bg-black/40 backdrop-blur-md"
            onClick={() => setShowPayModal(false)}
          >
            <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
               onClick={e => e.stopPropagation()}
               className="w-full max-w-sm rounded-[2rem] bg-white shadow-xl overflow-hidden relative"
            >
               <div className="absolute top-0 right-0 w-48 h-48 bg-brand/5 blur-[50px] rounded-full pointer-events-none -mr-10 -mt-10" />

               <div className="p-6 flex flex-col gap-5 relative z-10 w-full min-h-[min-content]">
                  <div className="flex items-center justify-between">
                    <h3 className="text-gray-900 font-black tracking-wide text-lg flex items-center gap-2">
                       <Send className="w-5 h-5 text-brand" /> Transfer Funds
                    </h3>
                    <button type="button" onClick={() => { playClickSound(); setShowPayModal(false); }} className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-all cursor-pointer">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex flex-col gap-1 w-full">
                     <label className="text-[10px] text-gray-500 uppercase tracking-widest font-extrabold px-1">Search ID or Username</label>
                     <div className="flex gap-2">
                        <div className="relative flex-1">
                          <input 
                             type="text" 
                             value={paySearchQuery}
                             onChange={(e) => setPaySearchQuery(e.target.value)}
                             placeholder="Search @username or ID"
                             className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3.5 px-4 text-gray-900 font-mono text-sm placeholder:text-gray-400 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all font-bold shadow-sm"
                          />
                        </div>
                        <button 
                           onClick={handleSearchUser}
                           disabled={isSearching}
                           className="bg-brand text-white px-4 py-3 rounded-xl shadow-md hover:bg-brand/90 active:scale-95 transition-all flex items-center justify-center cursor-pointer disabled:opacity-50"
                        >
                           {isSearching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                        </button>
                     </div>

                     {/* Profile Target Area */}
                     {searchError && (
                         <span className="text-[10px] text-red-500 uppercase tracking-widest flex items-center gap-1 font-bold mt-2 ml-1"><X className="w-3 h-3"/> User not found.</span>
                     )}
                     {resolvedUser && (
                         <div className="flex items-center gap-3 p-3 bg-white border-2 border-brand/20 rounded-xl mt-3 shadow-sm">
                             {resolvedUser.photoUrl ? (
                                 <img src={resolvedUser.photoUrl} alt="Profile" className="w-10 h-10 rounded-full object-cover border border-gray-100 flex-shrink-0" />
                             ) : (
                                 <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand/20 to-brand/10 text-brand flex items-center justify-center flex-shrink-0 shadow-inner">
                                   <span className="font-black text-sm uppercase tracking-widest">
                                       {(resolvedUser.firstName || resolvedUser.username || '?').charAt(0)}
                                   </span>
                                 </div>
                             )}
                             <div className="flex flex-col flex-1 min-w-0">
                                 <span className="text-[13px] text-gray-900 font-bold tracking-wide truncate flex items-center gap-1">
                                     {resolvedUser.firstName || ''} {resolvedUser.lastName || ''} <ShieldCheck className="w-3.5 h-3.5 text-brand" />
                                 </span>
                                 <div className="flex items-center gap-2">
                                     {resolvedUser.username && (
                                         <span className="text-[10px] text-gray-500 font-bold tracking-widest truncate">@{resolvedUser.username}</span>
                                     )}
                                     <span className="text-[10px] text-gray-400 font-mono tracking-widest truncate border border-gray-200 px-1.5 py-0.5 rounded">ID: {resolvedUser.id.substring(0,8)}...</span>
                                 </div>
                             </div>
                         </div>
                     )}
                  </div>

                  <form onSubmit={handlePaySubmit} className="flex flex-col gap-4 mt-2">
                     <div className="flex flex-col gap-1 w-full">
                         <label className="text-[10px] text-gray-500 uppercase tracking-widest font-extrabold px-1">Amount (FIFA Coin)</label>
                         <div className="relative">
                           <input 
                              type="number" 
                              required
                              value={payAmount}
                              onChange={(e) => setPayAmount(e.target.value)}
                              placeholder="0"
                              min="10"
                              max={fifaBalance}
                              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-4 px-4 pl-12 text-gray-900 font-mono text-xl focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all font-black tracking-wider shadow-sm"
                           />
                           <div className="absolute left-4 top-1/2 -translate-y-1/2">
                               <Dribbble className="w-5 h-5 text-gray-400" />
                           </div>
                           <div className="absolute top-1/2 -translate-y-1/2 right-3">
                               <button type="button" onClick={() => { playClickSound(); setPayAmount(fifaBalance.toFixed(0)); }} className="text-[10px] text-gray-900 uppercase font-black tracking-widest px-3 py-1.5 bg-black/5 hover:bg-black/10 transition-all rounded-lg active:scale-95 cursor-pointer">Max</button>
                           </div>
                         </div>
                         <div className="flex justify-between px-1 mt-1.5">
                           <span className="text-[9px] text-gray-400 font-mono tracking-[0.2em] uppercase font-bold">Min: 10</span>
                           <span className="text-[9px] text-brand font-mono tracking-[0.2em] font-bold">Avail: {fifaBalance.toFixed(2)}</span>
                         </div>
                     </div>

                     <button 
                       type="submit"
                       disabled={!resolvedUser || parseInt(payAmount) < 10}
                       className="w-full mt-2 py-4 rounded-xl bg-[#1d1d1f] hover:bg-black text-white font-black uppercase tracking-[0.2em] text-[12px] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                     >
                       <Send className="w-4 h-4" /> Send Transfer
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
