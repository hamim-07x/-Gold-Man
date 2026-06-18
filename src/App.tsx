import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Menu, ShieldAlert } from 'lucide-react';
import { useAppStore } from './store/useAppStore';
import { cn } from './lib/utils';
import { t } from './lib/i18n';

import { MathCaptcha } from './components/MathCaptcha';
import { Navigation } from './components/Navigation';
import { Sidebar } from './components/Sidebar';
import { WalletView } from './components/WalletView';
import { DashboardView } from './components/DashboardView';

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
  const { isInitialized, initSession, isAdmin, adminLogin, language } = useAppStore();
  const [showSplash, setShowSplash] = useState(true);
  const [captchaSolved, setCaptchaSolved] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState('wallet');
  const [showAdminLogin, setShowAdminLogin] = useState(false);

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
    window.addEventListener('open-admin-login', handleAdminOpen);
    return () => window.removeEventListener('open-admin-login', handleAdminOpen);
  }, []);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  if (!captchaSolved && !isAdmin) {
    return <MathCaptcha onSuccess={() => setCaptchaSolved(true)} />;
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
      <main className="w-full relative z-10">
        {currentTab === 'dashboard' && <DashboardView />}
        {currentTab === 'wallet' && <WalletView />}
        {(currentTab === 'earn' || currentTab === 'friends') && (
          <div className="pt-28 text-center text-white/30 font-display text-sm tracking-widest px-4">
            MODULE NOT YET ACTIVE
          </div>
        )}
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

      {currentTab === 'admin' && isAdmin && (
        <AdminDashboard />
      )}
    </div>
  );
}

function AdminDashboard() {
  const { dbHelpers } = require('./store/useAppStore');
  const users = dbHelpers.getAllUsers();
  
  return (
    <div className="absolute inset-0 bg-[#050505] z-50 overflow-y-auto px-4 pt-20 pb-28">
       <h1 className="text-lg font-medium tracking-wide mb-5 flex items-center gap-2 text-brand-light">
         <ShieldAlert className="w-5 h-5" strokeWidth={1.5} /> Control Panel
       </h1>
       <div className="glass-card p-5 flex flex-col gap-4 border-none ring-1 ring-white/5">
         <div className="text-white/40 text-xs uppercase tracking-wider mb-2">Network Size: <span className="text-white/90 font-medium">{users.length} Nodes</span></div>
         <div className="flex flex-col gap-2">
           {users.map((u: any) => (
             <div key={u.id} className="flex justify-between items-center p-3 rounded-2xl bg-white/[0.02] border border-white/[0.02] hover:bg-white/[0.04]">
                <div>
                  <div className="font-medium text-sm tracking-wide text-white/90">{u.firstName} {u.lastName}</div>
                  <div className="text-[10px] text-white/30 font-mono mt-0.5">ID: {u.id} | N° {u.joinNumber}</div>
                </div>
                <div className="text-emerald-400 font-medium text-sm tracking-wider">${u.balance.toFixed(2)}</div>
             </div>
           ))}
         </div>
       </div>
    </div>
  );
}
