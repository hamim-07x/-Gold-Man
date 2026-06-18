import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Menu, ShieldAlert } from 'lucide-react';
import { useAppStore } from './store/useAppStore';
import { cn } from './lib/utils';

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
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: 'easeOut' }}
        className="relative"
      >
        <div className="absolute inset-0 blur-[60px] bg-brand/30 rounded-full" />
        <div className="relative font-display font-bold text-5xl tracking-widest text-transparent bg-clip-text bg-gradient-to-br from-white to-white/40">
          GSCL
        </div>
      </motion.div>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: 200 }}
        transition={{ duration: 1.5, delay: 0.5, ease: 'easeInOut' }}
        className="h-[2px] bg-brand-light mt-12 rounded-full shadow-[0_0_10px_theme(colors.brand.light)]"
      />
    </div>
  );
}

export default function App() {
  const { isInitialized, initSession, isAdmin, adminLogin } = useAppStore();
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

  return (
    <div className="relative min-h-[100dvh] bg-app-bg text-white selection:bg-brand/30 overflow-hidden">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-brand rounded-full blur-[120px] opacity-20 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-indigo-800 rounded-full blur-[120px] opacity-20 pointer-events-none" />

      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 p-6 flex justify-between items-center z-40 bg-app-bg/60 backdrop-blur-xl border-b border-white/[0.02]">
        <button 
          onClick={() => setSidebarOpen(true)}
          className="p-2 -ml-2 text-white/80 hover:text-white"
        >
          <Menu className="w-6 h-6" />
        </button>
        <span className="font-display font-medium text-lg tracking-wide">
          {currentTab.toUpperCase()}
        </span>
        <button className="p-2 -mr-2 text-white/50 hover:text-white relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-brand rounded-full" />
        </button>
      </div>

      {/* Main Content Area */}
      <main className="w-full">
        {currentTab === 'dashboard' && <DashboardView />}
        {currentTab === 'wallet' && <WalletView />}
        {(currentTab === 'earn' || currentTab === 'friends') && (
          <div className="pt-32 text-center text-white/40 font-display">
            Module in development
          </div>
        )}
      </main>

      <Navigation currentTab={currentTab} onChange={setCurrentTab} />

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Admin Login Modal */}
      <AnimatePresence>
        {showAdminLogin && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-6">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card w-full max-w-sm p-6 flex flex-col gap-4"
            >
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2 text-red-400">
                  <ShieldAlert className="w-5 h-5" />
                  <h3 className="font-semibold">Admin Access</h3>
                </div>
                <button onClick={() => setShowAdminLogin(false)} className="text-white/40">✕</button>
              </div>
              <input 
                type="password"
                placeholder="Enter PIN"
                autoFocus
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-center tracking-[0.5em] text-2xl outline-none focus:border-brand transition-colors"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const ok = adminLogin(e.currentTarget.value);
                    if (ok) {
                      setShowAdminLogin(false);
                      setCurrentTab('admin');
                    } else {
                      e.currentTarget.value = '';
                      e.currentTarget.classList.add('border-red-500');
                    }
                  }
                }}
              />
              <p className="text-xs text-white/40 text-center mt-2">Hint: 0000</p>
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
    <div className="absolute inset-0 bg-app-bg z-50 overflow-y-auto px-6 pt-24 pb-32">
       <h1 className="text-2xl font-display font-semibold mb-6 flex items-center gap-2 text-brand-light">
         <ShieldAlert /> Admin Dashboard
       </h1>
       <div className="glass-card p-6 flex flex-col gap-4">
         <div className="text-white/60 mb-2">Total Users: <span className="text-white font-bold">{users.length}</span></div>
         <div className="flex flex-col gap-2">
           {users.map((u: any) => (
             <div key={u.id} className="flex justify-between items-center p-3 rounded-lg bg-white/5 border border-white/5">
                <div>
                  <div className="font-semibold">{u.firstName} {u.lastName}</div>
                  <div className="text-xs text-white/40">ID: {u.id} | Join #{u.joinNumber}</div>
                </div>
                <div className="text-brand-light font-medium">${u.balance}</div>
             </div>
           ))}
         </div>
       </div>
    </div>
  );
}
