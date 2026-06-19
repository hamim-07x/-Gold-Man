import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, Menu, Bell, Plus, Calendar, Users, RefreshCw } from 'lucide-react';
import { useAppStore, dbHelpers } from './store/useAppStore';
import { cn } from './lib/utils';
import { t } from './lib/i18n';

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
    <div className="fixed inset-0 bg-app-bg z-[100] flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: 'easeOut' }}
        className="relative"
      >
        <div className="absolute inset-0 blur-[80px] bg-brand/30 rounded-full" />
        <div className="relative font-display font-medium text-4xl tracking-[0.3em] text-transparent bg-clip-text bg-gradient-to-br from-white to-white/70">
          GSCL
        </div>
      </motion.div>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: 120 }}
        transition={{ duration: 1.5, delay: 0.5, ease: 'easeInOut' }}
        className="h-[1px] bg-brand-light mt-10 shadow-[0_0_8px_theme(colors.brand.light)]"
      />
    </div>
  );
}

export default function App() {
  const { isInitialized, initSession, language, adminLogin } = useAppStore();
  const [showSplash, setShowSplash] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  // Pull-to-refresh state
  const [startY, setStartY] = useState(0);
  const [pullingDistance, setPullingDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

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
    if (currentTab === 'friends') return 'FRIENDS';
    if (currentTab === 'profile') return 'PROFILE';
    return currentTab;
  };

  return (
    <div className="relative min-h-[100dvh] bg-app-bg text-white selection:bg-brand/30 overflow-hidden">
      <GlobalToast />
      
      {/* Background Ambient Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[300px] h-[300px] bg-brand rounded-full blur-[100px] opacity-20 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[300px] h-[300px] bg-indigo-900 rounded-full blur-[100px] opacity-20 pointer-events-none" />

      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 px-4 py-3 h-[60px] flex justify-between items-center z-40 bg-[#050505]/40 backdrop-blur-[40px] @supports(backdrop-filter:blur(40px)){backdrop-saturate-150} border-b border-white/[0.06] shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
        <button 
          onClick={() => setSidebarOpen(true)}
          className="p-1.5 text-white/70 hover:text-white transition-colors"
        >
          <Menu className="w-5 h-5" strokeWidth={1.5} />
        </button>
        <span className="font-display font-medium text-[15px] tracking-widest text-white/90 uppercase">
          {getTabTitle()}
        </span>
        <button className="p-1.5 text-white/50 hover:text-white relative transition-colors">
          <Bell className="w-5 h-5" strokeWidth={1.5} />
          <span className="absolute top-1.5 right-2 w-1.5 h-1.5 bg-brand-light rounded-full shadow-[0_0_5px_theme(colors.brand.light)]" />
        </button>
      </div>

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
                className="w-10 h-10 rounded-full bg-black/60 border border-white/20 shadow-[0_4px_20px_rgba(0,0,0,0.5)] flex items-center justify-center backdrop-blur-md"
             >
                <RefreshCw className="w-5 h-5 text-brand-light drop-shadow-[0_0_8px_theme(colors.brand.light)]" strokeWidth={2} />
             </motion.div>
          </div>

          {currentTab === 'dashboard' && <DashboardView />}
          {currentTab === 'wallet' && <WalletView />}
          {currentTab === 'earn' && (
            <div className="pt-24 px-4 pb-32 flex flex-col gap-4">
               <div className="p-6 rounded-[2rem] bg-black/40 backdrop-blur-2xl border border-white/[0.05] relative overflow-hidden flex flex-col gap-4">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-brand/20 blur-[50px] pointer-events-none" />
                 <h2 className="text-[11px] font-semibold tracking-[0.2em] text-white/40 uppercase flex items-center gap-2">
                   <Calendar className="w-3.5 h-3.5" /> Event Matrix
                 </h2>
                 {JSON.parse(localStorage.getItem('fake_db_events') || '[]').length === 0 ? (
                   <div className="text-center text-white/30 py-10 text-[12px] tracking-wide uppercase">No active operations</div>
                 ) : (
                   JSON.parse(localStorage.getItem('fake_db_events') || '[]').map((ev: any) => (
                     <motion.div initial={{opacity:0, y:10}} animate={{opacity:1,y:0}} key={ev.id} className="p-4 rounded-[1.5rem] flex flex-col sm:flex-row gap-4 justify-between sm:items-center bg-black/40 border border-white/[0.04]">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-white/[0.05] flex items-center justify-center border border-white/[0.02]">
                            <Calendar className="w-4 h-4 text-brand-light drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]" strokeWidth={1.5} />
                          </div>
                          <div>
                             <div className="font-semibold text-[14px] text-white/90">{ev.title}</div>
                             <div className="text-[10px] text-white/40 font-mono tracking-widest mt-0.5">ID: {ev.id || 'N/A'}</div>
                          </div>
                        </div>
                        <button className="w-full sm:w-auto bg-white/[0.05] hover:bg-white/[0.1] px-5 py-3 rounded-xl text-brand-light text-[12px] tracking-wide font-semibold shadow-inner shadow-black/50 border border-white/5 transition-all">
                           Claim {ev.reward} XP
                        </button>
                     </motion.div>
                   ))
                 )}
               </div>
            </div>
          )}
          {currentTab === 'friends' && (
            <FriendsView />
          )}
        </motion.div>
      </main>

      <Navigation currentTab={currentTab} onChange={setCurrentTab} />

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Admin Login Modal */}
      <AnimatePresence>
        {showAdminLogin && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-[20px] p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card w-full max-w-[320px] p-6 flex flex-col gap-4 border border-white/10 ring-1 ring-white/5 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-2 text-red-400">
                  <ShieldAlert className="w-4 h-4" strokeWidth={1.5} />
                  <h3 className="font-medium text-sm tracking-wide">Admin Access</h3>
                </div>
                <button onClick={() => setShowAdminLogin(false)} className="text-white/40 hover:text-white">
                   <span className="text-xl leading-none">×</span>
                </button>
              </div>
              <input 
                type="password"
                placeholder="PIN"
                autoFocus
                className="w-full bg-[#050505]/50 border border-white/5 rounded-[16px] px-4 py-3.5 text-center tracking-[0.5em] text-xl outline-none focus:border-brand-light/50 focus:bg-white/5 transition-all text-white placeholder:text-white/20"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const ok = adminLogin(e.currentTarget.value);
                    if (ok) {
                      setShowAdminLogin(false);
                      setCurrentTab('admin');
                    } else {
                      e.currentTarget.value = '';
                      e.currentTarget.classList.add('border-red-500/50');
                    }
                  }
                }}
              />
              <p className="text-[10px] text-white/30 text-center uppercase tracking-widest mt-1">Four digit code</p>
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
