import React, { useState, useEffect } from 'react';
import { useAppStore, dbHelpers, User, Transaction } from '../store/useAppStore';
import { motion, AnimatePresence } from 'motion/react';
import { Search, ShieldAlert, ShieldCheck, Users, Calendar, Settings as SettingsIcon, LogOut, Activity, MessageSquare, Send, ClipboardList, ArrowDown, ArrowUp, Sparkles, Hash, X, Clock, UserIcon, CheckCircle2, ChevronRight, SearchCode, Server, Database } from 'lucide-react';
import { cn } from '../lib/utils';
import { collection, addDoc, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';

type AdminTab = 'dashboard' | 'transactions' | 'events' | 'communications' | 'settings';

export function AdminPanel({ onExit }: { onExit?: () => void }) {
  const { systemConfig, updateSystemConfig, showToast } = useAppStore();
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userTxs, setUserTxs] = useState<Transaction[]>([]);
  const [isFetchingTxs, setIsFetchingTxs] = useState(false);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [globalTxSearch, setGlobalTxSearch] = useState('');
  
  const [configForm, setConfigForm] = useState(systemConfig);

  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifType, setNotifType] = useState<'info' | 'warning' | 'success'>('info');

  useEffect(() => {
    setConfigForm(systemConfig);
  }, [systemConfig]);

  const handleSaveConfig = () => {
    updateSystemConfig(configForm);
  };

  const handleSendNotification = async () => {
    if(!notifTitle.trim() || !notifMessage.trim()) return;
    try {
        await addDoc(collection(db, 'notifications'), {
            title: notifTitle,
            message: notifMessage,
            type: notifType,
            timestamp: Date.now()
        });
        showToast('Notification Dispatched', 'success');
        setNotifTitle('');
        setNotifMessage('');
    } catch (e) {
        showToast('Failed to send notification', 'error');
    }
  };

  useEffect(() => {
    const unsub = dbHelpers.listenUsers((data) => {
      setUsers(data);
    });
    return () => unsub();
  }, []);
  
  useEffect(() => {
     if(selectedUser) {
        // User TXs fetch removed to optimize database load and reduce reads.
        // Admins can search via the "Transactions" tab.
        setUserTxs([]);
     } else {
        setUserTxs([]);
     }
  }, [selectedUser]);

  const handleGlobalTxSearch = async () => {
      if(!globalTxSearch.trim()) return;
      setIsFetchingTxs(true);
      try {
          const q = query(collection(db, 'transactions'), where('id', '==', globalTxSearch.trim()));
          const snap = await getDocs(q);
          if(!snap.empty) {
              const tx = { id: snap.docs[0].id, ...snap.docs[0].data() } as Transaction;
              setSelectedTx(tx);
          } else {
              showToast('Transaction not found', 'error');
          }
      } catch(e) {
          showToast('Search failed', 'error');
      }
      setIsFetchingTxs(false);
  };

  const handleToggleBan = async (user: User) => {
    await dbHelpers.updateUser(user.id, { isBanned: !user.isBanned });
  };

  const filteredUsers = users.filter(u => u.id.includes(search) || u.username?.toLowerCase().includes(search.toLowerCase()));

  const tabs: {id: AdminTab, icon: React.ElementType, label: string}[] = [
    { id: 'dashboard', icon: Activity, label: 'Dash' },
    { id: 'transactions', icon: SearchCode, label: 'Search Tx' },
    { id: 'events', icon: Calendar, label: 'Events' },
    { id: 'settings', icon: SettingsIcon, label: 'Config' },
  ];
  
  const totalActive = users.filter(u => u.lastLoginAt && u.lastLoginAt > Date.now() - 86400000).length;
  const totalPoints = users.reduce((acc, u) => acc + (u.xpBalance || 0), 0);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }} 
      animate={{ opacity: 1, scale: 1 }} 
      exit={{ opacity: 0, scale: 0.95 }}
      className="absolute inset-0 z-[100] bg-[#f5f5f7] text-gray-900 overflow-hidden flex flex-col font-sans"
    >
      {/* Premium Background Lighting */}
      <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-brand/10 blur-[100px] rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2" />
      
      {/* Header */}
      <div className="pt-10 pb-3 px-4 shrink-0 flex justify-between items-center z-10 border-b border-black/5 bg-white/70 backdrop-blur-3xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center border border-black/5 shadow-sm">
            <Server className="w-4 h-4 text-brand" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-[13px] font-black tracking-[0.2em] uppercase text-gray-900">Core Panel</h1>
            <p className="text-[10px] font-mono font-bold text-gray-400 tracking-[0.2em] uppercase leading-tight">SYS.ADMIN</p>
          </div>
        </div>
        <button 
          onClick={onExit}
          className="w-8 h-8 rounded-xl bg-white border border-black/5 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      {/* Top Nav Tabs */}
      <div className="flex px-3 pt-4 gap-2 shrink-0 z-10 overflow-x-auto custom-scrollbar pb-2">
        {tabs.map(tab => (
          <button 
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setSelectedUser(null); }}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 border", 
              activeTab === tab.id && !selectedUser
                ? "bg-white text-brand border-black/5 shadow-sm" 
                : "bg-transparent text-gray-500 border-transparent hover:text-gray-900 hover:bg-black/5"
            )}
          >
            <tab.icon className={cn("w-3.5 h-3.5", activeTab === tab.id && !selectedUser ? "text-brand" : "")} strokeWidth={2.5} /> 
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-4 pb-20 z-10">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && !selectedUser && (
            <motion.div key="dashboard" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}}>
              
              {/* Dashboard Stats Board */}
              <div className="grid grid-cols-2 gap-3 mb-4 mt-2">
                  <div className="bg-white border border-black/5 rounded-[1.25rem] p-4 flex flex-col justify-center shadow-sm">
                      <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400 flex items-center gap-2 mb-1.5"><Users className="w-3.5 h-3.5 text-brand" /> Total Nodes</span>
                      <span className="text-xl font-bold font-mono text-gray-900">{users.length.toLocaleString()}</span>
                  </div>
                  <div className="bg-white border border-black/5 rounded-[1.25rem] p-4 flex flex-col justify-center shadow-sm">
                      <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400 flex items-center gap-2 mb-1.5"><Activity className="w-3.5 h-3.5 text-emerald-500" /> Active (24h)</span>
                      <span className="text-xl font-bold font-mono text-gray-900">{totalActive.toLocaleString()}</span>
                  </div>
                  <div className="bg-white border border-black/5 rounded-[1.25rem] p-4 flex flex-col justify-center shadow-sm">
                      <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400 flex items-center gap-2 mb-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-blue-500" /> Tasks Done</span>
                      <span className="text-xl font-bold font-mono text-gray-900">{users.reduce((acc, u) => acc + (u.tasksCompleted || 0), 0).toLocaleString()}</span>
                  </div>
                  <div className="bg-white border border-black/5 rounded-[1.25rem] p-4 flex flex-col justify-center shadow-sm">
                      <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400 flex items-center gap-2 mb-1.5"><Users className="w-3.5 h-3.5 text-rose-500" /> Referrals</span>
                      <span className="text-xl font-bold font-mono text-gray-900">{users.reduce((acc, u) => acc + (u.referralsCount || 0), 0).toLocaleString()}</span>
                  </div>
                  <div className="col-span-2 bg-gradient-to-br from-brand/5 to-white border border-brand/10 rounded-[1.5rem] p-5 flex flex-col justify-center relative overflow-hidden shadow-sm">
                      <div className="absolute right-0 top-0 w-32 h-32 bg-brand/10 blur-[30px] rounded-full pointer-events-none" />
                      <span className="text-[11px] uppercase tracking-widest font-bold text-gray-500 flex items-center gap-2 mb-2"><Database className="w-4 h-4 text-brand" /> Total Points Yield</span>
                      <span className="text-3xl font-black font-mono text-gray-900 tracking-tight">{totalPoints.toLocaleString(undefined, {maximumFractionDigits: 0})} <span className="text-xs text-gray-400">FIFA</span></span>
                  </div>
              </div>

              <div className="relative mb-4">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Sync target node ID or Username..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-white border border-black/5 rounded-2xl pl-10 pr-4 py-3.5 text-sm text-gray-900 focus:outline-none focus:border-brand/30 focus:ring-2 focus:ring-brand/10 transition-all placeholder:text-gray-400 shadow-sm font-medium"
                />
              </div>

              <div className="flex flex-col gap-2.5">
                {filteredUsers.length === 0 && (
                  <div className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest py-8 bg-white border border-black/5 border-dashed rounded-2xl">No modules found</div>
                )}
                {filteredUsers.map((user, idx) => (
                  <motion.div 
                    initial={{opacity:0, y:5}} animate={{opacity:1, y:0}} transition={{ delay: Math.min(idx * 0.02, 0.2) }}
                    key={user.id} 
                    onClick={() => setSelectedUser(user)}
                    className="px-4 py-3.5 rounded-[1.25rem] bg-white border border-black/5 shadow-sm hover:shadow-md flex items-center justify-between cursor-pointer transition-all border-l-4 data-[banned=true]:border-l-rose-500 border-l-transparent"
                    data-banned={user.isBanned}
                  >
                        <div className="flex flex-col min-w-0 pr-3">
                          <div className="font-bold text-[13px] text-gray-900 truncate flex items-center gap-2">
                            {user.username ? `@${user.username}` : user.firstName || 'Unknown'}
                            {user.isBanned && <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-500 text-[9px] uppercase tracking-widest font-black border border-rose-100">Banned</span>}
                          </div>
                          <div className="text-[10px] text-gray-400 font-mono tracking-widest truncate mt-0.5 font-bold">
                            {user.id}
                          </div>
                        </div>
                        <div className="flex flex-col items-end shrink-0">
                           <span className="text-[13px] font-mono font-bold text-gray-900">{user.xpBalance?.toFixed(0) || 0} <span className="text-[10px] text-gray-400">XP</span></span>
                           <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest mt-0.5 flex items-center gap-1"><Users className="w-3 h-3 text-brand"/> {user.referralsCount || 0}</span>
                        </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'dashboard' && selectedUser && (
            <motion.div key="user_details" initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:20}} className="flex flex-col gap-3 mt-2 pb-10">
                <button 
                  onClick={() => setSelectedUser(null)}
                  className="flex items-center gap-1 bg-white hover:bg-gray-50 border border-black/5 w-fit px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-600 transition-colors shadow-sm"
                >
                  <ChevronRight className="w-4 h-4 rotate-180" /> Dashboard
                </button>

                <div className="p-5 rounded-[1.5rem] bg-white border border-black/5 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 blur-[40px] pointer-events-none" />
                    
                    <div className="flex justify-between items-start z-10 relative">
                        <div className="flex flex-col">
                           <span className="text-[15px] font-black tracking-wide text-gray-900">{selectedUser.firstName} {selectedUser.lastName}</span>
                           <span className="text-[10px] text-gray-500 font-mono mt-1 tracking-widest font-bold">@{selectedUser.username || 'unknown'} | ID: {selectedUser.id}</span>
                        </div>
                        <button 
                            onClick={() => handleToggleBan(selectedUser)}
                            className={cn(
                              "px-3 py-2 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest border transition-colors shrink-0 shadow-sm",
                              selectedUser.isBanned 
                                ? "bg-rose-50 border-rose-100 text-rose-500 hover:bg-rose-100" 
                                : "bg-white border-black/5 text-gray-500 hover:bg-rose-50 hover:text-rose-500 hover:border-rose-100"
                            )}
                        >
                            {selectedUser.isBanned ? <ShieldAlert className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                            {selectedUser.isBanned ? 'Banned' : 'Ban Node'}
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-5 z-10 relative">
                         <div className="bg-gray-50 rounded-[1rem] p-3 border border-black/5">
                             <span className="text-[10px] uppercase tracking-widest font-black text-gray-400 block mb-1">Available Yield</span>
                             <span className="text-[15px] font-mono font-black text-gray-900">{selectedUser.xpBalance?.toFixed(0) || 0} XP</span>
                         </div>
                         <div className="bg-gray-50 rounded-[1rem] p-3 border border-black/5">
                             <span className="text-[10px] uppercase tracking-widest font-black text-gray-400 block mb-1">Direct Referrals</span>
                             <span className="text-[15px] font-mono font-black text-brand">{selectedUser.referralsCount || 0}</span>
                         </div>
                         <div className="bg-gray-50 rounded-[1rem] p-3 border border-black/5">
                             <span className="text-[10px] uppercase tracking-widest font-black text-gray-400 block mb-1">USD Holding</span>
                             <span className="text-[15px] font-mono font-black text-emerald-500">${selectedUser.balance?.toFixed(2)}</span>
                         </div>
                         <div className="bg-gray-50 rounded-[1rem] p-3 border border-black/5">
                             <span className="text-[10px] uppercase tracking-widest font-black text-gray-400 block mb-1">Join Date</span>
                             <span className="text-[13px] font-mono font-black text-gray-600">{selectedUser.joinedAt ? new Date(selectedUser.joinedAt).toLocaleDateString() : 'N/A'}</span>
                         </div>
                    </div>
                </div>

                <div className="flex flex-col gap-3 mt-4">
                    <h3 className="text-[11px] uppercase font-black tracking-widest text-gray-500 flex items-center gap-2 px-2"><SearchCode className="w-4 h-4" /> Trace Transactions</h3>
                    <div className="p-5 bg-white border border-black/5 border-dashed rounded-[1.5rem] flex flex-col items-center justify-center text-center gap-2.5 shadow-sm">
                        <SearchCode className="w-8 h-8 text-gray-300 mb-1" />
                        <span className="text-[11px] font-black uppercase tracking-widest text-gray-400">Ledger History Disabled</span>
                        <p className="text-[11px] text-gray-500 font-medium px-4">To conserve database load, full transaction histories are hidden. To trace a specific flow, copy the user's ID and use the <span className="text-brand font-bold">Search Tx</span> tab.</p>
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                setActiveTab('transactions');
                            }}
                            className="mt-3 px-5 py-2.5 bg-brand text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-brand/90 transition-colors shadow-md"
                        >
                            Open Search Tab
                        </button>
                    </div>
                </div>
            </motion.div>
          )}

          {activeTab === 'transactions' && (
            <motion.div key="transactions_global" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}} className="flex flex-col mt-2">
                <div className="p-5 rounded-[1.5rem] bg-white border border-black/5 shadow-sm relative overflow-hidden flex flex-col gap-3">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 blur-[40px] pointer-events-none" />
                    <h4 className="text-[11px] uppercase tracking-[0.2em] font-black text-gray-400 flex items-center gap-2 z-10">
                      <SearchCode className="w-4 h-4 text-brand" /> Global Tx Lookup
                    </h4>
                    <p className="text-[11px] text-gray-500 font-medium leading-relaxed mb-1 relative z-10">
                        Query the core network ledger by an exact ID. Search bypasses pagination to locate directly.
                    </p>
                    <div className="flex gap-2 relative z-10 flex-col sm:flex-row">
                        <input 
                            type="text" 
                            placeholder="Enter TX ID..."
                            value={globalTxSearch}
                            onChange={(e) => setGlobalTxSearch(e.target.value)}
                            className="flex-1 bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-brand/30 focus:ring-2 focus:ring-brand/10 transition-all placeholder:text-gray-400 font-mono font-medium shadow-inner"
                        />
                        <button 
                            onClick={handleGlobalTxSearch}
                            disabled={isFetchingTxs}
                            className="bg-brand text-white px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand/90 transition-colors active:scale-95 disabled:opacity-50 shrink-0 flex items-center justify-center gap-1 shadow-md"
                        >
                            {isFetchingTxs ? "..." : "Retrieve"}
                        </button>
                    </div>
                </div>
            </motion.div>
          )}

          {activeTab === 'events' && (
            <motion.div key="events" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}} className="flex flex-col gap-3 mt-2">
              <div className="p-5 rounded-[1.5rem] bg-white border border-black/5 shadow-sm relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 blur-[40px] pointer-events-none" />
                 
                 <div className="flex justify-between items-center mb-4">
                    <h4 className="text-[11px] uppercase tracking-[0.2em] font-black text-gray-400 flex items-center gap-2 z-10 relative">
                      <Calendar className="w-4 h-4 text-brand" /> Tasks Matrix
                    </h4>
                    <button 
                       onClick={() => {
                          const newTask = {
                             id: 'task_' + Date.now(),
                             type: 'telegram',
                             title: 'New Telegram Task',
                             reward: 1000,
                             link: 'https://t.me/...'
                          };
                          const updatedTasks = [...(configForm.tasks || []), newTask];
                          setConfigForm({...configForm, tasks: updatedTasks});
                       }}
                       className="bg-gray-50 text-gray-600 border border-black/5 hover:bg-gray-100 px-3 py-2 rounded-xl text-[10px] tracking-wider uppercase font-black transition-all shadow-sm"
                    >
                       + Add Task
                    </button>
                 </div>

                 <div className="flex flex-col gap-4 relative z-10">
                    {(!configForm.tasks || configForm.tasks.length === 0) && (
                       <div className="text-center py-8 text-gray-400 text-[10px] uppercase font-black tracking-widest border border-black/5 border-dashed rounded-xl bg-gray-50">No active tasks schema</div>
                    )}
                    {configForm.tasks?.map((task, index) => (
                       <div key={task.id} className="p-4 bg-gray-50 border border-black/5 rounded-2xl flex flex-col gap-4 relative group shadow-inner">
                          <button 
                            onClick={() => {
                               const filtered = configForm.tasks?.filter(t => t.id !== task.id);
                               setConfigForm({...configForm, tasks: filtered});
                            }}
                            className="absolute -top-2.5 -right-2.5 w-6 h-6 bg-white border border-black/5 text-rose-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-50 shadow-md z-20"
                          >
                             <LogOut className="w-3 h-3" />
                          </button>
                          
                          <div className="flex gap-3">
                             <div className="flex-1">
                                <label className="text-[10px] uppercase text-gray-400 mb-1.5 tracking-widest block font-black">Platform</label>
                                <select 
                                  value={task.type}
                                  onChange={(e) => {
                                      const updated = [...(configForm.tasks || [])];
                                      updated[index] = {...task, type: e.target.value as any};
                                      setConfigForm({...configForm, tasks: updated});
                                  }}
                                  className="w-full bg-white border border-black/5 rounded-xl p-2.5 text-[13px] font-medium text-gray-900 focus:outline-none focus:border-brand/30 focus:ring-2 focus:ring-brand/10 shadow-sm"
                                >
                                  <option value="telegram">Telegram</option>
                                  <option value="twitter">Twitter</option>
                                  <option value="youtube">YouTube</option>
                                  <option value="website">Website</option>
                                  <option value="other">Other</option>
                                </select>
                             </div>
                             <div className="flex-1">
                                <label className="text-[10px] uppercase text-gray-400 mb-1.5 tracking-widest block font-black">Reward (XP)</label>
                                <input 
                                  type="number"
                                  value={task.reward}
                                  onChange={(e) => {
                                      const updated = [...(configForm.tasks || [])];
                                      updated[index] = {...task, reward: Number(e.target.value)};
                                      setConfigForm({...configForm, tasks: updated});
                                  }}
                                  className="w-full bg-white border border-black/5 rounded-xl p-2.5 text-[13px] text-gray-900 font-mono font-bold focus:outline-none focus:border-brand/30 focus:ring-2 focus:ring-brand/10 shadow-sm"
                                />
                             </div>
                          </div>
                          <div>
                             <label className="text-[10px] uppercase text-gray-400 mb-1.5 tracking-widest block font-black">Title</label>
                             <input 
                               type="text"
                               value={task.title}
                               onChange={(e) => {
                                   const updated = [...(configForm.tasks || [])];
                                   updated[index] = {...task, title: e.target.value};
                                   setConfigForm({...configForm, tasks: updated});
                               }}
                               className="w-full bg-white border border-black/5 rounded-xl p-2.5 text-[13px] font-medium text-gray-900 focus:outline-none focus:border-brand/30 focus:ring-2 focus:ring-brand/10 shadow-sm"
                             />
                          </div>
                          <div>
                             <label className="text-[10px] uppercase text-gray-400 mb-1.5 tracking-widest block font-black">URL</label>
                             <input 
                               type="url"
                               value={task.link}
                               onChange={(e) => {
                                   const updated = [...(configForm.tasks || [])];
                                   updated[index] = {...task, link: e.target.value};
                                   setConfigForm({...configForm, tasks: updated});
                               }}
                               className="w-full bg-white border border-black/5 rounded-xl p-2.5 text-[13px] text-gray-600 font-mono font-medium focus:outline-none focus:border-brand/30 focus:ring-2 focus:ring-brand/10 shadow-sm"
                             />
                          </div>
                       </div>
                    ))}

                    {configForm.tasks && configForm.tasks.length > 0 && (
                       <button onClick={handleSaveConfig} className="w-full bg-brand text-white text-[11px] uppercase tracking-widest font-black py-3.5 rounded-xl mt-2 hover:bg-brand/90 transition-colors shadow-md active:scale-95">
                         Deploy Matrix
                       </button>
                    )}
                 </div>
              </div>
            </motion.div>
          )}
          
          {activeTab === 'settings' && (
            <motion.div key="settings" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}} className="flex flex-col gap-3 mt-2 mb-10 w-full self-center">
              <div className="p-5 rounded-[1.5rem] bg-white border border-black/5 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-[40px] rounded-full pointer-events-none" />
                <h4 className="text-[11px] uppercase tracking-[0.2em] font-black text-gray-400 mb-5 flex items-center gap-2">
                  <Activity className="w-4 h-4" /> Config Options
                </h4>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-black/5 shadow-inner">
                    <label className="text-[13px] font-black text-gray-700 tracking-wide px-2">Base Mine (XP)</label>
                    <input type="number" value={configForm.baseMineRate} onChange={e => setConfigForm({...configForm, baseMineRate: Number(e.target.value)})} className="w-20 bg-white border border-black/5 text-center rounded-[0.8rem] py-2 px-2 text-[13px] text-gray-900 font-mono font-bold focus:outline-none focus:border-brand/30 focus:ring-2 focus:ring-brand/10 transition-all shadow-sm" />
                  </div>
                  <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-black/5 shadow-inner">
                    <label className="text-[13px] font-black text-gray-700 tracking-wide px-2">L1 Comm (%)</label>
                    <input type="number" value={configForm.referralL1} onChange={e => setConfigForm({...configForm, referralL1: Number(e.target.value)})} className="w-20 bg-white border border-black/5 text-center rounded-[0.8rem] py-2 px-2 text-[13px] text-brand font-mono font-bold focus:outline-none focus:border-brand/30 focus:ring-2 focus:ring-brand/10 transition-all shadow-sm" />
                  </div>
                  <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-black/5 shadow-inner">
                    <label className="text-[13px] font-black text-gray-700 tracking-wide px-2">L2 Comm (%)</label>
                    <input type="number" value={configForm.referralL2} onChange={e => setConfigForm({...configForm, referralL2: Number(e.target.value)})} className="w-20 bg-white border border-black/5 text-center rounded-[0.8rem] py-2 px-2 text-[13px] text-brand font-mono font-bold focus:outline-none focus:border-brand/30 focus:ring-2 focus:ring-brand/10 transition-all shadow-sm" />
                  </div>
                  <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-black/5 shadow-inner">
                    <label className="text-[13px] font-black text-gray-700 tracking-wide px-2">L3 Comm (%)</label>
                    <input type="number" value={configForm.referralL3} onChange={e => setConfigForm({...configForm, referralL3: Number(e.target.value)})} className="w-20 bg-white border border-black/5 text-center rounded-[0.8rem] py-2 px-2 text-[13px] text-brand font-mono font-bold focus:outline-none focus:border-brand/30 focus:ring-2 focus:ring-brand/10 transition-all shadow-sm" />
                  </div>
                  
                  <div className="flex flex-col gap-2 mt-2">
                    <label className="text-[10px] text-gray-400 uppercase font-black tracking-widest px-2 mt-2">Bot Username</label>
                    <input type="text" placeholder="e.g. MySuperBot" value={configForm.botUsername || ''} onChange={e => setConfigForm({...configForm, botUsername: e.target.value})} className="w-full bg-gray-50 border border-black/5 rounded-2xl p-3.5 text-[13px] text-gray-900 font-mono font-medium focus:outline-none focus:border-brand/30 focus:ring-2 focus:ring-brand/10 transition-all shadow-inner placeholder:text-gray-400" />
                  </div>
                  
                  <button onClick={handleSaveConfig} className="w-full bg-brand text-white text-[11px] uppercase tracking-widest font-black py-4 rounded-2xl mt-4 hover:bg-brand/90 transition-colors active:scale-95 shadow-md">
                    Deploy Update
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Transaction Details Modal */}
      <AnimatePresence>
         {selectedTx && (
            <>
               <motion.div 
                 initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                 onClick={() => { setSelectedTx(null); }}
                 className="fixed inset-0 z-[120] bg-black/20 backdrop-blur-sm"
               />
               <motion.div
                 initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                 transition={{ type: "spring", damping: 25, stiffness: 200 }}
                 className="fixed bottom-0 left-0 w-full bg-white rounded-t-[2.5rem] z-[125] pb-safe shadow-[0_-20px_60px_rgba(0,0,0,0.1)] overflow-hidden"
               >
                  <div className="absolute top-0 right-0 w-48 h-48 bg-brand/5 blur-[80px] rounded-full pointer-events-none -mr-24 -mt-24 mix-blend-multiply" />
                  
                  <div className="flex flex-col p-6 w-full relative z-10">
                     <div className="w-12 h-1 bg-black/10 rounded-full mx-auto mb-6" />
                     
                     <div className="flex items-center justify-between mb-8">
                        <h2 className="text-[13px] font-black tracking-[0.2em] uppercase text-gray-900 border border-black/5 px-3 py-1 bg-gray-50 rounded-lg shadow-sm">Ledger Detail</h2>
                        <button onClick={() => { setSelectedTx(null); }} className="w-8 h-8 rounded-full bg-gray-50 border border-black/5 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all shadow-sm">
                           <X className="w-4 h-4" />
                        </button>
                     </div>

                     <div className="flex flex-col items-center justify-center gap-2 mb-8">
                        <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0 border border-black/5">
                           {selectedTx.type === 'deposit' ? <ArrowDown className="w-5 h-5 text-emerald-500" /> : 
                            selectedTx.type === 'withdraw' ? <ArrowUp className="w-5 h-5 text-gray-400" /> :
                            selectedTx.type === 'mine' ? <Activity className="w-5 h-5 text-brand" /> :
                            <Sparkles className="w-5 h-5 text-brand-light" />}
                        </div>
                        <div className="flex items-end gap-1 mt-2">
                           <span className={cn("text-4xl font-black leading-none tracking-tight", selectedTx.type === 'withdraw' ? 'text-gray-900' : 'text-emerald-500')}>
                              {selectedTx.type === 'withdraw' ? '-' : '+'}{Math.abs(selectedTx.amount).toFixed(2)}
                           </span>
                           <span className="text-[13px] font-black text-gray-400 mb-1">FIFA</span>
                        </div>
                        <div className="px-3 py-1 bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-lg mt-2 shadow-sm">
                           Confirmed
                        </div>
                     </div>

                     <div className="flex flex-col gap-3">
                         <div className="flex items-center justify-between p-3.5 bg-gray-50 border border-black/5 rounded-2xl shadow-inner">
                            <div className="flex items-center gap-2 text-gray-500"><Hash className="w-4 h-4" /> <span className="text-[10px] uppercase tracking-widest font-black text-gray-400">TX ID</span></div>
                            <span className="text-[11px] text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md font-mono font-bold break-all text-right max-w-[50%] select-all border border-emerald-100 shadow-sm">{selectedTx.id}</span>
                         </div>
                         <div className="flex items-center justify-between p-3.5 bg-gray-50 border border-black/5 rounded-2xl shadow-inner">
                            <div className="flex items-center gap-2 text-gray-500"><Clock className="w-4 h-4" /> <span className="text-[10px] uppercase tracking-widest font-black text-gray-400">Time</span></div>
                            <span className="text-[11px] text-gray-900 font-mono font-bold text-right">{new Date(selectedTx.timestamp).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                         </div>
                         <div className="flex items-center justify-between p-3.5 bg-gray-50 border border-black/5 rounded-2xl shadow-inner">
                            <div className="flex items-center gap-2 text-gray-500"><Activity className="w-4 h-4" /> <span className="text-[10px] uppercase tracking-widest font-black text-gray-400">Type</span></div>
                            <span className="text-[11px] text-gray-900 font-black capitalize tracking-wide">{selectedTx.type.replace('_', ' ')}</span>
                         </div>
                         <div className="flex items-center justify-between p-3.5 bg-gray-50 border border-black/5 rounded-2xl shadow-inner">
                              <div className="flex items-center gap-2 text-gray-500"><UserIcon className="w-4 h-4" /> <span className="text-[10px] uppercase tracking-widest font-black text-gray-400">Target User</span></div>
                              <span className="text-[11px] text-brand font-mono font-bold bg-brand/5 border border-brand/10 px-2 py-1 rounded-lg truncate max-w-[50%] select-all shadow-sm">{selectedTx.userId}</span>
                         </div>
                         {selectedTx.originId && (
                           <div className="flex items-center justify-between p-3.5 bg-gray-50 border border-black/5 rounded-2xl shadow-inner">
                              <div className="flex items-center gap-2 text-gray-500"><UserIcon className="w-4 h-4" /> <span className="text-[10px] uppercase tracking-widest font-black text-gray-400">{selectedTx.type === 'deposit' ? 'From' : 'To'}</span></div>
                              <span className="text-[11px] text-brand font-mono font-bold bg-brand/5 border border-brand/10 px-2 py-1 rounded-lg truncate max-w-[50%] select-all shadow-sm">{selectedTx.originId}</span>
                           </div>
                         )}
                     </div>
                  </div>
               </motion.div>
            </>
         )}
      </AnimatePresence>
    </motion.div>
  );
}
