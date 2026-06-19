import React, { useState, useEffect } from 'react';
import { useAppStore, dbHelpers, User } from '../store/useAppStore';
import { motion, AnimatePresence } from 'motion/react';
import { Search, ShieldAlert, ShieldCheck, Users, Calendar, Settings as SettingsIcon, LogOut, ChevronRight, Activity } from 'lucide-react';
import { cn } from '../lib/utils';

type AdminTab = 'users' | 'events' | 'settings';

export function AdminPanel({ onExit }: { onExit?: () => void }) {
  const { systemConfig, updateSystemConfig } = useAppStore();
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<AdminTab>('users');
  
  const [configForm, setConfigForm] = useState(systemConfig);

  useEffect(() => {
    setConfigForm(systemConfig);
  }, [systemConfig]);

  const handleSaveConfig = () => {
    updateSystemConfig(configForm);
  };

  useEffect(() => {
    const unsub = dbHelpers.listenUsers((data) => {
      setUsers(data);
    });
    return () => unsub();
  }, []);

  const handleToggleBan = async (user: User) => {
    await dbHelpers.updateUser(user.id, { isBanned: !user.isBanned });
  };

  const filteredUsers = users.filter(u => u.id.includes(search) || u.username?.toLowerCase().includes(search.toLowerCase()));

  const tabs: {id: AdminTab, icon: React.ElementType, label: string}[] = [
    { id: 'users', icon: Users, label: 'Nodes' },
    { id: 'events', icon: Calendar, label: 'Events' },
    { id: 'settings', icon: SettingsIcon, label: 'Config' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }} 
      animate={{ opacity: 1, scale: 1 }} 
      exit={{ opacity: 0, scale: 0.95 }}
      className="absolute inset-0 z-50 bg-[#050505] text-white overflow-hidden flex flex-col font-sans"
    >
      {/* Premium Background Lighting */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-brand-light/10 blur-[120px] rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-rose-500/10 blur-[100px] rounded-full pointer-events-none translate-x-1/3 translate-y-1/3" />

      {/* Header */}
      <div className="pt-12 pb-4 px-5 shrink-0 flex justify-between items-center z-10 border-b border-white/[0.05] bg-black/20 backdrop-blur-3xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-brand/20 flex items-center justify-center border border-brand/30 shadow-[0_0_15px_rgba(var(--color-brand-light),0.5)]">
            <Activity className="w-4 h-4 text-brand-light" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-[14px] font-bold tracking-widest uppercase text-white/90">Core Panel</h1>
            <p className="text-[9px] font-mono text-white/40 tracking-widest">{users.length} ACTIVE NODES</p>
          </div>
        </div>
        <button 
          onClick={onExit}
          className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:bg-white/10 hover:text-white transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Top Nav Tabs */}
      <div className="flex px-4 pt-4 gap-2 shrink-0 z-10 overflow-x-auto custom-scrollbar pb-2">
        {tabs.map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-semibold tracking-wide transition-all shrink-0 border backdrop-blur-md", 
              activeTab === tab.id 
                ? "bg-white/10 text-white border-white/20 shadow-lg shadow-black/50" 
                : "bg-white/[0.02] text-white/40 border-white/5 hover:text-white/70"
            )}
          >
            <tab.icon className={cn("w-3.5 h-3.5", activeTab === tab.id ? "text-brand-light" : "")} /> 
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-4 pb-24 z-10">
        <AnimatePresence mode="wait">
          {activeTab === 'users' && (
            <motion.div key="users" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}}>
              
              <div className="relative mb-4 mt-2">
                <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input 
                  type="text" 
                  placeholder="Sync target node ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl pl-10 pr-4 py-3.5 text-[13px] text-white focus:outline-none focus:border-brand-light/50 transition-colors placeholder:text-white/20 shadow-inner shadow-black/50"
                />
              </div>

              <div className="flex flex-col gap-2">
                {filteredUsers.length === 0 && (
                  <div className="text-center text-[11px] text-white/30 uppercase tracking-widest py-10">No modules found</div>
                )}
                {filteredUsers.map((user, idx) => (
                  <motion.div 
                    initial={{opacity:0, y:5}}
                    animate={{opacity:1, y:0}}
                    transition={{ delay: Math.min(idx * 0.05, 0.5) }}
                    key={user.id} 
                    className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.05] backdrop-blur-lg flex flex-col gap-3 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 blur-2xl rounded-full pointer-events-none" />
                    
                    <div className="flex justify-between items-center z-10 w-full">
                      <div className="flex items-center gap-3">
                        <div className="text-left w-full">
                          <div className="font-semibold text-[13px] text-white/90 truncate max-w-[150px]">
                            {user.username ? `@${user.username}` : user.firstName || 'Unknown'}
                          </div>
                          <div className="text-[10px] text-white/40 font-mono tracking-widest truncate max-w-[120px] mt-0.5">
                            ID:{user.id}
                          </div>
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => handleToggleBan(user)}
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center border shrink-0 transition-all",
                          user.isBanned 
                            ? "bg-rose-500/10 border-rose-500/20 text-rose-500" 
                            : "bg-white/[0.03] border-white/[0.05] text-white/30 hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/20"
                        )}
                      >
                        {user.isBanned ? <ShieldAlert className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <div className="flex gap-2 z-10">
                      <div className="flex-1 bg-black/40 rounded-xl px-3 py-2 flex flex-col items-center justify-center">
                        <span className="text-[9px] uppercase text-white/30 tracking-widest mb-0.5">USD</span>
                        <span className="text-[12px] font-mono text-emerald-400">${user.balance.toFixed(2)}</span>
                      </div>
                      <div className="flex-1 bg-black/40 rounded-xl px-3 py-2 flex flex-col items-center justify-center">
                        <span className="text-[9px] uppercase text-white/30 tracking-widest mb-0.5">XP</span>
                        <span className="text-[12px] font-mono text-amber-400">{user.xpBalance?.toFixed(0) || 0}</span>
                      </div>
                      <div className="flex-1 bg-black/40 rounded-xl px-3 py-2 flex flex-col items-center justify-center">
                        <span className="text-[9px] uppercase text-white/30 tracking-widest mb-0.5">REFS</span>
                        <span className="text-[12px] font-mono text-brand-light">{user.referralsCount || 0}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'events' && (
            <motion.div key="events" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}} className="pt-4">
              <div className="p-8 rounded-3xl flex flex-col items-center justify-center text-center bg-black/20 border border-white/5 backdrop-blur-xl relative overflow-hidden">
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-brand/20 blur-[50px] pointer-events-none" />
                 <Calendar className="w-10 h-10 text-white/20 mb-4" strokeWidth={1} />
                 <h4 className="text-white/80 font-medium text-[15px] mb-1">Event Matrix Offline</h4>
                 <p className="text-white/30 text-[11px] uppercase tracking-widest leading-relaxed max-w-[200px]">
                   Awaiting structural deployment of event schema.
                 </p>
                 <button className="mt-6 bg-white/[0.05] hover:bg-white/10 text-white py-3 px-5 rounded-2xl text-[12px] tracking-wide font-medium transition-colors border border-white/10">
                   Override & Inject Module
                 </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div key="settings" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}} className="flex flex-col gap-4 mt-2">
              <div className="p-5 rounded-3xl bg-black/40 border border-white border-opacity-5 backdrop-blur-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/10 blur-2xl rounded-full pointer-events-none" />
                <h4 className="text-[10px] uppercase tracking-[0.2em] font-semibold text-white/30 mb-5 flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5" /> Rewards Configuration
                </h4>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-[13px] text-white/70">Base Mine Rate (XP)</label>
                    <input type="number" value={configForm.baseMineRate} onChange={e => setConfigForm({...configForm, baseMineRate: Number(e.target.value)})} className="w-20 bg-white/5 border border-white/10 text-center rounded-xl p-2 text-[13px] text-amber-400 font-mono focus:outline-none focus:border-white/30 transition-colors" />
                  </div>
                  <div className="w-full h-px bg-white/5 my-2" />
                  <div className="flex justify-between items-center">
                    <label className="text-[13px] text-white/70">L1 Referral Comm. (%)</label>
                    <input type="number" value={configForm.referralL1} onChange={e => setConfigForm({...configForm, referralL1: Number(e.target.value)})} className="w-20 bg-white/5 border border-white/10 text-center rounded-xl p-2 text-[13px] text-brand-light font-mono focus:outline-none focus:border-white/30 transition-colors" />
                  </div>
                  <div className="flex justify-between items-center">
                    <label className="text-[13px] text-white/70">L2 Referral Comm. (%)</label>
                    <input type="number" value={configForm.referralL2} onChange={e => setConfigForm({...configForm, referralL2: Number(e.target.value)})} className="w-20 bg-white/5 border border-white/10 text-center rounded-xl p-2 text-[13px] text-brand-light font-mono focus:outline-none focus:border-white/30 transition-colors" />
                  </div>
                  <div className="flex justify-between items-center">
                    <label className="text-[13px] text-white/70">L3 Referral Comm. (%)</label>
                    <input type="number" value={configForm.referralL3} onChange={e => setConfigForm({...configForm, referralL3: Number(e.target.value)})} className="w-20 bg-white/5 border border-white/10 text-center rounded-xl p-2 text-[13px] text-brand-light font-mono focus:outline-none focus:border-white/30 transition-colors" />
                  </div>
                  
                  <button onClick={handleSaveConfig} className="w-full bg-white/10 text-white text-[13px] font-semibold tracking-wide py-3.5 rounded-2xl mt-4 hover:bg-brand/80 transition-colors shadow-lg active:scale-95">
                    Deploy Changes
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
