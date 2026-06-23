import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, Menu, Bell, Plus, Calendar, Users, RefreshCw, Store, X, Info, Dribbble, Trophy } from 'lucide-react';
import { useAppStore, dbHelpers } from './store/useAppStore';
import { cn } from './lib/utils';
import { t } from './lib/i18n';
import confetti from 'canvas-confetti';
import { playClickSound, playSuccessSound } from './lib/audio';

import { Navigation } from './components/Navigation';
import { Sidebar } from './components/Sidebar';
import { WalletView } from './components/WalletView';
import { DashboardView } from './components/DashboardView';
import { FriendsView } from './components/FriendsView';
import { GlobalToast } from './components/GlobalToast';

import { AdminPanel } from './components/AdminPanel';

function SplashScreen({ onFinish }: { onFinish: () => void }) {
  useEffect(() => {
    const t = setTimeout(onFinish, 2500);
    return () => clearTimeout(t);
  }, [onFinish]);

  return (
    <div className="fixed inset-0 bg-white z-[100] flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.5, rotate: -180 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative mb-6"
      >
        <div className="absolute inset-0 blur-[30px] bg-brand/10 rounded-full" />
        <Dribbble className="w-32 h-32 text-brand football-spin relative z-10 drop-shadow-sm" strokeWidth={1.5} />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="font-display font-black text-3xl tracking-[0.4em] text-transparent bg-clip-text bg-gradient-to-br from-brand to-brand/70"
      >
        FIFA
      </motion.div>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: 150 }}
        transition={{ duration: 1.5, delay: 0.5, ease: 'easeInOut' }}
        className="h-[2px] bg-brand mt-8 shadow-[0_0_10px_theme(colors.brand.DEFAULT)]"
      />
    </div>
  );
}

export default function App() {
  const { isInitialized, initSession, language, adminLogin, notifications } = useAppStore();
  const [showSplash, setShowSplash] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Pull-to-refresh state
  const [startY, setStartY] = useState(0);
  const [pullingDistance, setPullingDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [earnEvents, setEarnEvents] = useState(() => {
    const existing = localStorage.getItem('fake_db_events');
    if (!existing || JSON.parse(existing).length === 0) {
      const initial = [
        { id: 'ev1', title: 'Daily Login Bonus', reward: 50 },
        { id: 'ev2', title: 'Complete Profile', reward: 100 },
        { id: 'ev3', title: 'Invite 1st Friend', reward: 500 }
      ];
      localStorage.setItem('fake_db_events', JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(existing);
  });

  useEffect(() => {
    const handleStorage = () => {
      setEarnEvents(JSON.parse(localStorage.getItem('fake_db_events') || '[]'));
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    // Top of the document check
    if (window.scrollY <= 5 && !isRefreshing) {
       setStartY(e.touches[0].clientY);
    } else {
       setStartY(0);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startY === 0) return;
    const currentY = e.touches[0].clientY;
    const distance = currentY - startY;

    if (distance > 0) {
      // Prevent overscroll browser behavior if we are pulling down
      if (e.cancelable) e.preventDefault();
      
      const dampenedDistance = Math.min(distance * 0.4, 80);
      setPullingDistance(dampenedDistance);
    }
  };

  const handleTouchEnd = async () => {
    if (pullingDistance > 60) {
      setIsRefreshing(true);
      setPullingDistance(60); // Snap and hold
      
      // Simulate data fetch/update
      await new Promise(res => setTimeout(res, 1500));
      
      setIsRefreshing(false);
      setPullingDistance(0);
    } else {
      setPullingDistance(0);
    }
    setStartY(0);
  };

  useEffect(() => {
    // Initialize Telegram Web App
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
      const tgUser = tg.initDataUnsafe?.user;
      const startParam = tg.initDataUnsafe?.start_param;
      
      // Fallback for non-telegram local testing
      if (!tgUser) {
        initSession({
          id: 'mock_123',
          first_name: 'Mock',
          last_name: 'User',
          username: 'mock_user'
        });
      } else {
        initSession(tgUser, startParam);
      }
    }
  }, [initSession]);

  useEffect(() => {
    const handleAdminOpen = () => setShowAdminLogin(true);
    const handleAdminDirect = () => setCurrentTab('admin');
    window.addEventListener('open-admin-login', handleAdminOpen);
    window.addEventListener('open-admin-direct', handleAdminDirect);
    return () => {
      window.removeEventListener('open-admin-login', handleAdminOpen);
      window.removeEventListener('open-admin-direct', handleAdminDirect);
    };
  }, []);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  const getTabTitle = () => {
    if (currentTab === 'dashboard') return t(language, 'dashboard');
    if (currentTab === 'wallet') return t(language, 'wallet');
    if (currentTab === 'earn') return t(language, 'earn');
    if (currentTab === 'marketplace') return 'MARKETPLACE';
    if (currentTab === 'friends') return 'FRIENDS';
    if (currentTab === 'profile') return 'PROFILE';
    return currentTab;
  };

  return (
    <div className={cn(
      "relative min-h-[100dvh] text-gray-900 selection:bg-brand/20 overflow-hidden shadow-2xl pb-safe-bottom",
      currentTab === 'admin' ? "w-full bg-[#0A0A0F]" : "max-w-md mx-auto bg-slate-50"
    )}>
      <GlobalToast />
      
      {/* Background Ambient Glows (iOS 26 water like blur) */}
      {currentTab !== 'admin' && (
        <>
      <div className="absolute top-[-15%] left-[-20%] w-[400px] h-[400px] bg-brand/30 rounded-full blur-[100px] opacity-60 pointer-events-none mix-blend-multiply" />
      <div className="absolute top-[30%] right-[-20%] w-[350px] h-[350px] bg-accent/20 rounded-full blur-[120px] opacity-50 pointer-events-none mix-blend-multiply" />
      <div className="absolute bottom-[-10%] left-[20%] w-[350px] h-[350px] bg-brand-light/20 rounded-full blur-[100px] opacity-50 pointer-events-none mix-blend-multiply" />

      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 px-4 pt-safe-top pb-3 h-[60px] flex justify-between items-end z-40 bg-white/60 backdrop-blur-3xl border-b border-black/[0.03] shadow-[0_2px_20px_rgb(0,0,0,0.02)] max-w-md mx-auto">
        <button 
          onClick={() => { playClickSound(); setSidebarOpen(true); }}
          className="w-9 h-9 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-all bg-white/70 backdrop-blur-md hover:bg-white rounded-[1rem] border border-black/5 shadow-sm"
        >
          <Menu className="w-5 h-5" strokeWidth={2} />
        </button>
        <div className="flex flex-col items-center justify-center mb-0.5">
          <span className="text-[9px] text-brand font-mono font-bold tracking-[0.3em] uppercase">Epoch OS</span>
          <span className="font-black text-sm tracking-[0.1em] text-gray-900 mt-0.5">
            {getTabTitle()}
          </span>
        </div>
        <button onClick={() => { playClickSound(); setShowNotifications(true); }} className="w-9 h-9 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-all bg-white/70 backdrop-blur-md hover:bg-white rounded-[1rem] border border-black/5 shadow-sm relative">
          <Bell className="w-4 h-4" strokeWidth={2} />
          {notifications.length > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand rounded-full border-[1.5px] border-white shadow-[0_0_8px_theme(colors.brand.DEFAULT)] animate-pulse" />
          )}
        </button>
      </div>
      </>
      )}

      {/* Main Content Area */}
      <main 
        className="w-full relative z-10"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <motion.div
           animate={{ y: pullingDistance }}
           transition={{ type: 'spring', stiffness: 300, damping: 30 }}
           className="min-h-[100dvh]"
        >
          {/* Refresh indicator */}
          <div 
             className="absolute left-0 right-0 flex justify-center items-center pointer-events-none z-50"
             style={{ top: -60, height: 60 }}
          >
             <motion.div
                animate={{ 
                   rotate: isRefreshing ? 360 : pullingDistance * 4,
                   opacity: pullingDistance > 10 ? 1 : 0,
                   scale: Math.min(pullingDistance / 40, 1)
                }}
                transition={isRefreshing ? { rotate: { repeat: Infinity, duration: 1, ease: 'linear' } } : { type: 'spring', stiffness: 400, damping: 30 }}
                className="w-10 h-10 rounded-full bg-white border border-black/5 shadow-md flex items-center justify-center backdrop-blur-md"
             >
                <RefreshCw className="w-5 h-5 text-brand" strokeWidth={2.5} />
             </motion.div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentTab}
              initial={{ opacity: 0, y: 15, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -15, filter: 'blur(8px)' }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="w-full flex-1"
            >
              {currentTab === 'dashboard' && <DashboardView />}
              {currentTab === 'wallet' && <WalletView />}
              {currentTab === 'earn' && (
                <div className="pt-20 px-4 pb-28 flex flex-col gap-3">
                   <div className="p-5 rounded-[2rem] bg-white border border-black/5 shadow-sm relative overflow-hidden flex flex-col gap-4">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-brand/10 blur-[50px] pointer-events-none" />
                     <h2 className="text-[11px] font-black tracking-[0.2em] text-gray-500 uppercase flex items-center gap-1.5 z-10">
                       <Calendar className="w-4 h-4 text-brand" /> Event Matrix
                     </h2>
                     <div className="flex flex-col gap-3 z-10">
                         {earnEvents.length === 0 ? (
                           <div className="text-center text-gray-400 py-8 text-[11px] tracking-wide uppercase font-bold bg-gray-50 rounded-2xl border border-black/5 border-dashed">No active operations</div>
                         ) : (
                           earnEvents.map((ev: any) => (
                             <div key={ev.id} className="p-3.5 rounded-[1.25rem] flex items-center justify-between bg-gray-50 border border-black/5 shadow-inner">
                                <div className="flex items-center gap-3.5 min-w-0 pr-2">
                                  <div className="w-11 h-11 rounded-[1rem] bg-white flex items-center justify-center border border-black/5 shrink-0 shadow-sm">
                                    <Calendar className="w-5 h-5 text-brand" strokeWidth={1.5} />
                                  </div>
                                  <div className="flex flex-col gap-0.5 min-w-0">
                                     <div className="font-bold text-[13px] text-gray-900 tracking-wide truncate">{ev.title}</div>
                                     <div className="text-[10px] text-gray-400 font-mono tracking-widest font-medium">ID: {ev.id || 'N/A'}</div>
                                  </div>
                                </div>
                                <button 
                                   onClick={() => {
                                     playClickSound();
                                     playSuccessSound();
                                     confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
                                     const currentEvents = JSON.parse(localStorage.getItem('fake_db_events') || '[]');
                                     const newEvents = currentEvents.filter((e: any) => e.id !== ev.id);
                                     localStorage.setItem('fake_db_events', JSON.stringify(newEvents));
                                     useAppStore.getState().updateBalance(ev.reward, 'earn', 'XP');
                                     useAppStore.getState().showToast(`Claimed ${ev.reward} FIFA Coin from ${ev.title}`, 'success');
                                     window.dispatchEvent(new Event('storage'));
                                   }}
                                   className="shrink-0 bg-white hover:bg-gray-100 active:scale-95 px-4 py-2.5 text-[11px] rounded-[1rem] text-brand tracking-widest font-black shadow-sm border border-black/5 transition-all text-center">
                                   Claim {ev.reward} FIFA Coin
                                </button>
                             </div>
                           ))
                         )}
                     </div>
                   </div>
                </div>
              )}
              {currentTab === 'marketplace' && (
                <div className="pt-20 px-4 pb-28 flex flex-col items-center justify-center min-h-[70vh] gap-5">
                    <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center border border-black/5 relative shadow-md">
                        <div className="absolute inset-0 bg-brand/5 rounded-full blur-[20px] animate-pulse" />
                        <Store className="w-10 h-10 text-brand relative z-10" />
                    </div>
                    
                    <div className="text-center flex flex-col gap-1.5">
                        <h2 className="text-2xl font-black tracking-[0.3em] uppercase text-gray-900">Marketplace</h2>
                        <p className="text-[11px] text-brand tracking-[0.2em] uppercase font-bold">Opening Soon</p>
                    </div>

                    <div className="flex bg-white p-4 rounded-3xl border border-black/5 shadow-sm gap-4 mt-2">
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-2xl font-black text-gray-900 font-mono tracking-tighter w-12 text-center">30</span>
                            <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Days</span>
                        </div>
                        <span className="text-2xl font-black text-gray-300 mt-1">:</span>
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-2xl font-black text-gray-900 font-mono tracking-tighter w-12 text-center animate-pulse">23</span>
                            <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Hours</span>
                        </div>
                        <span className="text-2xl font-black text-gray-300 mt-1">:</span>
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-2xl font-black text-gray-900 font-mono tracking-tighter w-12 text-center animate-pulse">59</span>
                            <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Mins</span>
                        </div>
                    </div>
                    
                    <p className="text-[11px] text-gray-500 tracking-widest text-center uppercase max-w-[220px] mt-4 font-bold leading-relaxed">
                       Trade unique modules, synthetic assets, and NFTs globally.
                    </p>
                </div>
              )}
              {currentTab === 'friends' && (
                <FriendsView />
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </main>

      <Navigation currentTab={currentTab} onChange={setCurrentTab} />

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Notifications Slide-over */}
      <AnimatePresence>
         {showNotifications && (
            <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm"
               onClick={() => setShowNotifications(false)}
            >
               <motion.div 
                  initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  onClick={e => e.stopPropagation()}
                  className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white border-l border-black/5 flex flex-col shadow-2xl overflow-hidden"
               >
                  <div className="p-5 border-b border-black/5 flex items-center justify-between">
                     <h2 className="text-[13px] font-black tracking-[0.2em] uppercase text-gray-900">Notifications</h2>
                     <button onClick={() => setShowNotifications(false)} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors border border-black/5">
                        <X className="w-4 h-4 text-gray-500" />
                     </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                     {notifications.length === 0 ? (
                        <div className="text-center text-gray-400 text-[11px] font-bold uppercase mt-10 tracking-widest bg-gray-50 p-4 rounded-2xl border border-black/5 border-dashed">No notifications</div>
                     ) : (
                        notifications.map(n => (
                           <div key={n.id} className="p-4 rounded-2xl bg-white border border-black/5 shadow-sm flex gap-3">
                              <div className="pt-0.5">
                                 {n.type === 'success' ? <Bell className="w-5 h-5 text-emerald-500" /> : <Info className="w-5 h-5 text-brand" />}
                              </div>
                              <div className="flex-1">
                                 <div className="text-[13px] font-black text-gray-900 mb-1 tracking-wide">{n.title}</div>
                                 <div className="text-xs text-gray-600 leading-relaxed font-medium">{n.message}</div>
                                 <div className="text-[10px] font-bold text-gray-400 uppercase mt-2 tracking-widest">{new Date(n.timestamp).toLocaleTimeString()}</div>
                              </div>
                           </div>
                        ))
                     )}
                  </div>
               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>

      {/* Admin Login Modal */}
      <AnimatePresence>
        {showAdminLogin && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-[10px] p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-[320px] p-6 flex flex-col gap-5 border border-black/5 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-2 text-rose-500">
                  <ShieldAlert className="w-5 h-5" strokeWidth={1.5} />
                  <h3 className="font-black text-sm tracking-wide uppercase">Admin Access</h3>
                </div>
                <button onClick={() => setShowAdminLogin(false)} className="text-gray-400 hover:text-gray-900 transition-colors bg-gray-50 rounded-full p-1 border border-black/5">
                   <X className="w-4 h-4" />
                </button>
              </div>
              <input 
                type="password"
                placeholder="PIN"
                autoFocus
                className="w-full bg-gray-50 border border-black/5 rounded-2xl px-4 py-4 text-center tracking-[0.5em] text-2xl outline-none focus:border-brand/30 focus:ring-2 focus:ring-brand/10 transition-all text-gray-900 placeholder:text-gray-300 font-bold shadow-inner"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const ok = adminLogin(e.currentTarget.value);
                    if (ok) {
                      setShowAdminLogin(false);
                      setCurrentTab('admin');
                    } else {
                      e.currentTarget.value = '';
                      e.currentTarget.classList.add('border-rose-500/50');
                    }
                  }
                }}
              />
              <p className="text-[10px] font-bold text-gray-400 text-center uppercase tracking-widest">Four digit code</p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {currentTab === 'admin' && (
        <div className="absolute inset-0 z-50 overflow-hidden">
          <AdminPanel onExit={() => setCurrentTab('dashboard')} />
        </div>
      )}
    </div>
  );
}
