import React, { useState, useEffect } from 'react';
import { useAppStore, dbHelpers, User, Transaction } from '../store/useAppStore';
import { Search, Users, Calendar, Settings as SettingsIcon, LogOut, Activity, MessageSquare, Bell, CheckCircle2, Crown, Menu, Check, X, ShieldAlert, ShieldCheck } from 'lucide-react';
import { cn } from '../lib/utils';
import { collection, addDoc, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';

type AdminTab = 'dashboard' | 'users' | 'tasks' | 'channels' | 'payment_methods' | 'withdrawals' | 'notifications' | 'settings' | 'bot_tokens';

export function AdminPanel({ onExit }: { onExit?: () => void }) {
  const { systemConfig, updateSystemConfig, showToast, notifications } = useAppStore();
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [menuOpen, setMenuOpen] = useState(false);
  const [configForm, setConfigForm] = useState(systemConfig);

  useEffect(() => {
    setConfigForm(systemConfig);
  }, [systemConfig]);

  const handleSaveConfig = () => {
    updateSystemConfig(configForm);
    showToast('Changes saved successfully!', 'success');
  };

  useEffect(() => {
    const unsub = dbHelpers.listenUsers((data) => {
      setUsers(data);
    });
    return () => unsub();
  }, []);

  const totalActive = users.filter(u => u.lastLoginAt && u.lastLoginAt > Date.now() - 86400000).length;
  const totalPoints = users.reduce((acc, u) => acc + (u.xpBalance || 0), 0);
  const tasksCompleted = users.reduce((acc, u) => acc + (u.tasksCompleted || 0), 0);

  const tabs: {id: AdminTab, icon: React.ElementType, label: string}[] = [
    { id: 'dashboard', icon: Activity, label: 'Dashboard' },
    { id: 'users', icon: Users, label: 'Users' },
    { id: 'tasks', icon: CheckCircle2, label: 'Tasks' },
    { id: 'channels', icon: MessageSquare, label: 'Channels' },
    { id: 'payment_methods', icon: Activity, label: 'Payment Methods' },
    { id: 'withdrawals', icon: Activity, label: 'Withdrawals' },
    { id: 'notifications', icon: Bell, label: 'Notifications' },
    { id: 'settings', icon: SettingsIcon, label: 'Settings' },
    { id: 'bot_tokens', icon: SettingsIcon, label: 'Bot Tokens' },
  ];

  return (
    <div className="absolute inset-0 z-[100] bg-[#0A0A0F] text-[#FFFFFF] font-['Inter',sans-serif] flex overflow-hidden">
      
      {/* Sidebar */}
      <div className={cn(
         "w-[260px] bg-[#14141A] border-r border-[#2A2A35] absolute md:relative z-50 h-full flex flex-col shrink-0 transition-transform duration-300",
         menuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
         <div className="p-5 border-b border-[#2A2A35] flex items-center gap-3">
             <Crown className="w-6 h-6 text-[#FF6B35]" />
             <h2 className="text-[#FF6B35] text-xl font-bold">Epoch</h2>
             <button onClick={() => setMenuOpen(false)} className="ml-auto md:hidden text-gray-400">
               <X className="w-5 h-5" />
             </button>
         </div>
         <div className="py-5 flex-1 overflow-y-auto">
             {tabs.map(tab => (
                 <button
                    key={tab.id}
                    onClick={() => { setActiveTab(tab.id); setMenuOpen(false); }}
                    className={cn(
                       "w-full text-left px-5 py-3 flex items-center gap-3 transition-colors text-[14px]",
                       activeTab === tab.id 
                         ? "bg-[#FF6B35]/10 text-[#FF6B35] border-l-4 border-[#FF6B35]" 
                         : "text-[#A1A1AA] hover:bg-[#FF6B35]/5 hover:text-[#FF6B35] border-l-4 border-transparent"
                    )}
                 >
                    <tab.icon className="w-4 h-4" /> {tab.label}
                 </button>
             ))}
             <button
                onClick={onExit}
                className="w-full text-left px-5 py-3 flex items-center gap-3 transition-colors text-[14px] text-[#A1A1AA] hover:bg-[#FF6B35]/5 hover:text-[#FF6B35] border-l-4 border-transparent mt-4"
             >
                <LogOut className="w-4 h-4" /> Exit to User App
             </button>
         </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full bg-[#0A0A0F] overflow-y-auto relative p-4">
         <div className="flex justify-between items-center mb-8">
             <div className="flex items-center gap-3">
                 <button className="md:hidden text-white" onClick={() => setMenuOpen(true)}>
                    <Menu className="w-6 h-6" />
                 </button>
                 <h1 className="text-2xl font-bold capitalize">{activeTab.replace('_', ' ')}</h1>
             </div>
         </div>

         {activeTab === 'dashboard' && (
            <div className="flex flex-col gap-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    <div className="bg-[#14141A] rounded-xl p-4 border border-[#2A2A35]">
                       <div className="text-[#A1A1AA] text-xs flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> Total Users</div>
                       <div className="text-xl font-extrabold text-[#FF6B35] mt-2">{users.length}</div>
                    </div>
                    <div className="bg-[#14141A] rounded-xl p-4 border border-[#2A2A35]">
                       <div className="text-[#A1A1AA] text-xs flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Tasks Completed</div>
                       <div className="text-xl font-extrabold text-[#FF6B35] mt-2">{tasksCompleted}</div>
                    </div>
                    <div className="bg-[#14141A] rounded-xl p-4 border border-[#2A2A35]">
                       <div className="text-[#A1A1AA] text-xs flex items-center gap-1.5"><Activity className="w-3.5 h-3.5" /> Active Nodes</div>
                       <div className="text-xl font-extrabold text-[#F59E0B] mt-2">{totalActive}</div>
                    </div>
                </div>

                <div className="bg-[#14141A] rounded-xl border border-[#2A2A35] overflow-hidden mt-2">
                   <div className="p-4 border-b border-[#2A2A35] font-semibold text-[15px] text-[#FF6B35] flex items-center gap-2.5">
                       <Users className="w-4 h-4" /> Recent Users
                   </div>
                   <div className="p-4 overflow-x-auto">
                       <table className="w-full text-left border-collapse min-w-[500px]">
                          <thead>
                             <tr>
                                <th className="p-2 border-b border-[#2A2A35] font-semibold text-[#FF6B35] whitespace-nowrap text-xs">ID</th>
                                <th className="p-2 border-b border-[#2A2A35] font-semibold text-[#FF6B35] whitespace-nowrap text-xs">Name</th>
                                <th className="p-2 border-b border-[#2A2A35] font-semibold text-[#FF6B35] whitespace-nowrap text-xs">Yield</th>
                             </tr>
                          </thead>
                          <tbody>
                             {users.slice(0, 10).map(u => (
                                <tr key={u.id}>
                                   <td className="p-2 border-b border-[#2A2A35] text-[11px] text-gray-400">{u.id.substring(0,8)}...</td>
                                   <td className="p-2 border-b border-[#2A2A35] text-[11px]">{u.firstName} {u.lastName}</td>
                                   <td className="p-2 border-b border-[#2A2A35] text-[11px] font-mono">{u.xpBalance?.toFixed(0) || 0}</td>
                                </tr>
                             ))}
                             {users.length === 0 && <tr><td colSpan={3} className="p-3 text-center text-gray-500 text-xs">No users found</td></tr>}
                          </tbody>
                       </table>
                   </div>
                </div>
            </div>
         )}
         
         {activeTab === 'users' && (
             <div className="bg-[#14141A] rounded-xl border border-[#2A2A35] overflow-hidden">
                <div className="p-4 border-b border-[#2A2A35] font-semibold text-[15px] text-[#FF6B35] flex items-center justify-between">
                    <div className="flex items-center gap-2.5"><Users className="w-4 h-4" /> All Users</div>
                    <div className="text-xs text-gray-400">Total: {users.length}</div>
                </div>
                <div className="p-4 border-b border-[#2A2A35] flex items-center gap-3">
                    <div className="flex-1 bg-[#0A0A0F] border border-[#2A2A35] rounded-lg p-2.5 flex items-center gap-2">
                        <Search className="w-4 h-4 text-gray-500" />
                        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by ID, Username..." className="bg-transparent border-none text-white outline-none w-full text-xs" />
                    </div>
                </div>
                <div className="p-4 overflow-x-auto">
                     <table className="w-full text-left border-collapse min-w-[600px] text-xs">
                       <thead>
                          <tr>
                             <th className="p-2 border-b border-[#2A2A35] font-semibold text-[#FF6B35] whitespace-nowrap text-xs">ID</th>
                             <th className="p-2 border-b border-[#2A2A35] font-semibold text-[#FF6B35] whitespace-nowrap text-xs">Name</th>
                             <th className="p-2 border-b border-[#2A2A35] font-semibold text-[#FF6B35] whitespace-nowrap text-xs">Username</th>
                             <th className="p-2 border-b border-[#2A2A35] font-semibold text-[#FF6B35] whitespace-nowrap text-xs">Joined At</th>
                             <th className="p-2 border-b border-[#2A2A35] font-semibold text-[#FF6B35] whitespace-nowrap text-xs">FIFA Coin</th>
                          </tr>
                       </thead>
                       <tbody>
                          {users
                            .filter(u => search ? (u.id.includes(search) || (u.username||'').toLowerCase().includes(search.toLowerCase())) : true)
                            .sort((a,b) => a.joinedAt - b.joinedAt)
                            .map(u => (
                             <tr key={u.id} className="hover:bg-white/5 transition-colors">
                                <td className="p-2 border-b border-[#2A2A35] text-[11px] font-mono text-gray-400">{u.id}</td>
                                <td className="p-2 border-b border-[#2A2A35] text-[11px] font-medium">{u.firstName} {u.lastName}</td>
                                <td className="p-2 border-b border-[#2A2A35] text-[11px] text-gray-400">@{u.username || 'unknown'}</td>
                                <td className="p-2 border-b border-[#2A2A35] text-[11px] text-gray-400">{new Date(u.joinedAt).toLocaleDateString()}</td>
                                <td className="p-2 border-b border-[#2A2A35] text-[11px] font-mono text-brand font-bold">{u.xpBalance?.toFixed(2) || 0}</td>
                             </tr>
                          ))}
                          {users.length === 0 && <tr><td colSpan={5} className="p-4 text-center text-gray-500 text-xs">No users have joined yet.</td></tr>}
                       </tbody>
                    </table>
                </div>
             </div>
         )}
         
         {activeTab === 'settings' && (
             <div className="bg-[#14141A] rounded-xl border border-[#2A2A35] overflow-hidden">
                <div className="p-4 border-b border-[#2A2A35] font-semibold text-[15px] text-[#FF6B35] flex items-center gap-2.5">
                    <SettingsIcon className="w-4 h-4" /> System Settings
                </div>
                <div className="p-4 space-y-4">
                    <div className="flex flex-col gap-4">
                       <div className="form-group">
                           <label className="block text-[#A1A1AA] mb-2 text-xs font-bold">Bot Username</label>
                           <input type="text" value={configForm.botUsername || ''} onChange={e => setConfigForm({...configForm, botUsername: e.target.value})} className="w-full max-w-sm p-2.5 bg-[#1F1F2A] border border-[#2A2A35] rounded-xl text-white outline-none focus:border-[#FF6B35] text-sm" />
                       </div>
                       
                       <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mt-2">
                           <div className="form-group">
                               <label className="block text-[#A1A1AA] mb-2 text-xs font-bold">Tier 1 Referral %</label>
                               <input type="number" value={configForm.referralL1 || 0} onChange={e => setConfigForm({...configForm, referralL1: parseInt(e.target.value)})} className="w-full p-2.5 bg-[#1F1F2A] border border-[#2A2A35] rounded-xl text-white outline-none focus:border-[#FF6B35] text-sm" />
                           </div>
                           <div className="form-group">
                               <label className="block text-[#A1A1AA] mb-2 text-xs font-bold">Tier 2 Referral %</label>
                               <input type="number" value={configForm.referralL2 || 0} onChange={e => setConfigForm({...configForm, referralL2: parseInt(e.target.value)})} className="w-full p-2.5 bg-[#1F1F2A] border border-[#2A2A35] rounded-xl text-white outline-none focus:border-[#FF6B35] text-sm" />
                           </div>
                           <div className="form-group">
                               <label className="block text-[#A1A1AA] mb-2 text-xs font-bold">Tier 3 Referral %</label>
                               <input type="number" value={configForm.referralL3 || 0} onChange={e => setConfigForm({...configForm, referralL3: parseInt(e.target.value)})} className="w-full p-2.5 bg-[#1F1F2A] border border-[#2A2A35] rounded-xl text-white outline-none focus:border-[#FF6B35] text-sm" />
                           </div>
                       </div>

                       <div className="form-group pt-4">
                           <label className="flex items-center gap-3 cursor-pointer p-3 bg-[#1F1F2A] border border-[#2A2A35] rounded-xl w-max hover:border-[#FF6B35]/50 transition-colors">
                              <input type="checkbox" checked={configForm.isDbSaveEnabled || false} onChange={e => setConfigForm({...configForm, isDbSaveEnabled: e.target.checked})} className="w-4 h-4 accent-[#FF6B35]" />
                              <span className="text-white font-bold text-xs">Enable Database Saving (Write Operations)</span>
                           </label>
                       </div>
                    </div>
                    <div className="flex items-center gap-3 mt-4 pt-4 border-t border-[#2A2A35]">
                       <button onClick={handleSaveConfig} className="bg-gradient-to-br from-[#FF6B35] to-[#E85D2C] text-white px-4 py-2 rounded-xl font-bold uppercase tracking-widest text-[11px] shadow-lg shadow-[#FF6B35]/20 hover:scale-[1.02] active:scale-95 transition-all">
                          Save Settings
                       </button>
                       <button onClick={async () => {
                           if(window.confirm('Are you sure you want to permanently clear all users and transactions? This cannot be undone.')){
                               try{
                                   await dbHelpers.wipeDatabase();
                                   showToast('Database wiped successfully', 'success');
                               }catch(e){
                                   showToast('Error wiping database', 'error');
                               }
                           }
                       }} className="bg-red-500/10 text-red-500 border border-red-500/20 px-4 py-2 rounded-xl font-bold tracking-widest text-[11px] uppercase hover:bg-red-500 hover:text-white transition-colors">
                          Clear Database Data
                       </button>
                    </div>
                </div>
             </div>
         )}

         {activeTab === 'tasks' && (
            <div className="bg-[#14141A] rounded-[20px] border border-[#2A2A35] overflow-hidden">
                <div className="p-5 border-b border-[#2A2A35] font-semibold text-[18px] text-[#FF6B35] flex items-center justify-between">
                    <div className="flex items-center gap-2.5"><CheckCircle2 className="w-5 h-5" /> Admin Tasks Configuration</div>
                    <button 
                       onClick={() => {
                          const newTasks = [...(configForm.tasks || [])];
                          newTasks.push({ id: `task_${Date.now()}`, title: 'New Task', type: 'website', reward: 100, isOfficial: true, link: '' } as any);
                          setConfigForm({...configForm, tasks: newTasks});
                       }}
                       className="text-xs bg-[#FF6B35]/10 text-[#FF6B35] px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-[#FF6B35]/20 font-bold uppercase tracking-widest"
                    >
                       + Add Task
                    </button>
                </div>
                <div className="p-5 flex flex-col gap-4">
                    {configForm.tasks?.length === 0 && <p className="text-gray-500 text-sm py-4">No tasks configured.</p>}
                    {configForm.tasks?.map((task, i) => (
                       <div key={task.id} className="p-5 bg-[#1F1F2A] rounded-xl border border-[#2A2A35] flex flex-col md:flex-row items-end md:items-center justify-between gap-4">
                           <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                               <div className="flex flex-col gap-1 w-full">
                                   <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Title</span>
                                   <input value={task.title} onChange={e => { const n = [...(configForm.tasks||[])]; n[i].title = e.target.value; setConfigForm({...configForm, tasks: n}); }} className="w-full bg-[#14141A] border border-[#2A2A35] rounded-lg p-2 text-white outline-none text-sm focus:border-[#FF6B35]" />
                               </div>
                               <div className="flex flex-col gap-1 w-full">
                                   <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Type (Icon)</span>
                                   <select value={task.type || 'website'} onChange={e => { const n = [...(configForm.tasks||[])]; n[i].type = e.target.value as any; setConfigForm({...configForm, tasks: n}); }} className="w-full bg-[#14141A] border border-[#2A2A35] rounded-lg p-[9px] text-white outline-none text-sm focus:border-[#FF6B35]">
                                      <option value="twitter">Twitter</option>
                                      <option value="telegram">Telegram</option>
                                      <option value="youtube">YouTube</option>
                                      <option value="website">Website</option>
                                   </select>
                               </div>
                               <div className="flex flex-col gap-1 w-full">
                                   <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Reward (FIFA Coin)</span>
                                   <input type="number" value={task.reward} onChange={e => { const n = [...(configForm.tasks||[])]; n[i].reward = parseInt(e.target.value) || 0; setConfigForm({...configForm, tasks: n}); }} className="w-full bg-[#14141A] border border-[#2A2A35] rounded-lg p-2 text-white outline-none text-sm focus:border-[#FF6B35]" />
                               </div>
                               <div className="flex flex-col gap-1 w-full">
                                   <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">URL Link</span>
                                   <input value={task.link || ''} onChange={e => { const n = [...(configForm.tasks||[])]; n[i].link = e.target.value; setConfigForm({...configForm, tasks: n}); }} placeholder="https://" className="w-full bg-[#14141A] border border-[#2A2A35] rounded-lg p-2 text-[#FF6B35] font-mono outline-none text-sm focus:border-[#FF6B35]" />
                               </div>
                           </div>
                           <div className="shrink-0">
                               <button 
                                 onClick={() => {
                                     const n = [...(configForm.tasks||[])];
                                     n.splice(i, 1);
                                     setConfigForm({...configForm, tasks: n});
                                 }} 
                                 className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center -mb-2 md:mb-0"
                               >
                                 <X className="w-5 h-5" />
                               </button>
                           </div>
                       </div>
                    ))}
                    <div className="mt-4 border-t border-[#2A2A35] pt-4">
                       <button onClick={handleSaveConfig} className="bg-gradient-to-br from-[#FF6B35] to-[#E85D2C] text-white px-8 py-3.5 rounded-xl font-bold uppercase tracking-[0.2em] text-[12px] shadow-lg shadow-[#FF6B35]/20 hover:scale-[1.02] active:scale-95 transition-all">Save Tasks Config</button>
                    </div>
                </div>
            </div>
         )}
         {activeTab === 'channels' && (
            <div className="bg-[#14141A] rounded-[20px] border border-[#2A2A35] overflow-hidden">
                <div className="p-5 border-b border-[#2A2A35] font-semibold text-[18px] text-[#FF6B35] flex items-center justify-between">
                    <div className="flex items-center gap-2.5"><MessageSquare className="w-5 h-5" /> Telegram Channels Configurations</div>
                    <button 
                       onClick={() => {
                          const n = [...(configForm.telegramChannels || [])];
                          n.push({ id: `chan_${Date.now()}`, name: 'New Channel', handle: 'mychannel', botToken: '', reward: 100 });
                          setConfigForm({...configForm, telegramChannels: n});
                       }}
                       className="text-xs bg-[#FF6B35]/10 text-[#FF6B35] px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-[#FF6B35]/20 font-bold uppercase tracking-widest"
                    >
                       + Add Channel
                    </button>
                </div>
                <div className="p-5 flex flex-col gap-4">
                    <p className="text-gray-400 text-sm mb-2">Configure Telegram channels that users must join. You must use a bot token to verify membership via the Telegram API.</p>
                    {configForm.telegramChannels?.length === 0 && <p className="text-gray-500 text-sm py-4">No channels configured.</p>}
                    {configForm.telegramChannels?.map((chan, i) => (
                       <div key={chan.id} className="p-5 bg-[#1F1F2A] rounded-xl border border-[#2A2A35] flex flex-col gap-4">
                           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                               <div className="flex flex-col gap-1 w-full">
                                   <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Channel Name</span>
                                   <input value={chan.name} onChange={e => { const n = [...(configForm.telegramChannels||[])]; n[i].name = e.target.value; setConfigForm({...configForm, telegramChannels: n}); }} className="w-full bg-[#14141A] border border-[#2A2A35] rounded-lg p-2 text-white outline-none text-sm focus:border-[#FF6B35]" />
                               </div>
                               <div className="flex flex-col gap-1 w-full">
                                   <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Channel Handle</span>
                                   <div className="relative">
                                      <span className="absolute left-2 top-2 text-gray-500">@</span>
                                      <input value={chan.handle} onChange={e => { let val = e.target.value.replace('@',''); const n = [...(configForm.telegramChannels||[])]; n[i].handle = val; setConfigForm({...configForm, telegramChannels: n}); }} placeholder="mychannel" className="w-full bg-[#14141A] border border-[#2A2A35] rounded-lg p-2 pl-6 text-white outline-none text-sm focus:border-[#FF6B35]" />
                                   </div>
                               </div>
                               <div className="flex flex-col gap-1 w-full">
                                   <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Bot Token API</span>
                                   <input value={chan.botToken} type="password" onChange={e => { const n = [...(configForm.telegramChannels||[])]; n[i].botToken = e.target.value; setConfigForm({...configForm, telegramChannels: n}); }} placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11" className="w-full bg-[#14141A] border border-[#2A2A35] rounded-lg p-2 text-white outline-none text-sm focus:border-[#FF6B35]" />
                               </div>
                               <div className="flex flex-col gap-1 w-full">
                                   <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Reward (FIFA Coin)</span>
                                   <input type="number" value={chan.reward} onChange={e => { const n = [...(configForm.telegramChannels||[])]; n[i].reward = parseInt(e.target.value) || 0; setConfigForm({...configForm, telegramChannels: n}); }} className="w-full bg-[#14141A] border border-[#2A2A35] rounded-lg p-2 text-white outline-none text-sm focus:border-[#FF6B35]" />
                               </div>
                           </div>
                           <div className="flex justify-end mt-2">
                               <button 
                                 onClick={() => {
                                     const n = [...(configForm.telegramChannels||[])];
                                     n.splice(i, 1);
                                     setConfigForm({...configForm, telegramChannels: n});
                                 }} 
                                 className="text-xs flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-colors uppercase tracking-widest font-bold"
                               >
                                 <X className="w-4 h-4" /> Remove Channel
                               </button>
                           </div>
                       </div>
                    ))}
                    <div className="mt-4 border-t border-[#2A2A35] pt-4">
                       <button onClick={handleSaveConfig} className="bg-gradient-to-br from-[#FF6B35] to-[#E85D2C] text-white px-8 py-3.5 rounded-xl font-bold uppercase tracking-[0.2em] text-[12px] shadow-lg shadow-[#FF6B35]/20 hover:scale-[1.02] active:scale-95 transition-all">Save Channels Config</button>
                    </div>
                </div>
            </div>
         )}
         {activeTab === 'notifications' && (
            <div className="bg-[#14141A] rounded-[20px] border border-[#2A2A35] overflow-hidden">
                <div className="p-5 border-b border-[#2A2A35] font-semibold text-[18px] text-[#FF6B35] flex items-center justify-between">
                    <div className="flex items-center gap-2.5"><Bell className="w-5 h-5" /> Push Notifications</div>
                    <button 
                       onClick={async () => {
                          try {
                             await dbHelpers.addNotification({ title: 'New Alert', message: 'This is a test notification.', timestamp: Date.now(), type: 'info' });
                             showToast('Notification added', 'success');
                          } catch(e) {
                             showToast('Error adding notification', 'error');
                          }
                       }}
                       className="text-xs bg-[#FF6B35]/10 text-[#FF6B35] px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-[#FF6B35]/20 font-bold uppercase tracking-widest"
                    >
                       + Send Notification
                    </button>
                </div>
                <div className="p-5 flex flex-col gap-4">
                    <p className="text-gray-400 text-sm mb-2">Manage broadcast notifications. These will be shown to all users inside the app.</p>
                    {notifications?.length === 0 && <p className="text-gray-500 text-sm py-4">No active notifications.</p>}
                    {notifications?.map((notif) => (
                       <div key={notif.id} className="p-5 bg-[#1F1F2A] rounded-xl border border-[#2A2A35] flex flex-col gap-4">
                           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                               <div className="flex flex-col gap-1 w-full">
                                   <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Title</span>
                                   <input value={notif.title} onChange={e => { dbHelpers.updateNotification(notif.id, { title: e.target.value }) }} className="w-full bg-[#14141A] border border-[#2A2A35] rounded-lg p-2 text-white outline-none text-sm focus:border-[#FF6B35]" />
                               </div>
                               <div className="flex flex-col gap-1 w-full">
                                   <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Type</span>
                                   <select value={notif.type} onChange={e => { dbHelpers.updateNotification(notif.id, { type: e.target.value as any }) }} className="w-full bg-[#14141A] border border-[#2A2A35] rounded-lg p-[9px] text-white outline-none text-sm focus:border-[#FF6B35]">
                                      <option value="info">Info</option>
                                      <option value="success">Success</option>
                                      <option value="warning">Warning</option>
                                   </select>
                               </div>
                               <div className="flex flex-col gap-1 w-full col-span-1 md:col-span-2 lg:col-span-3">
                                   <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Message</span>
                                   <textarea value={notif.message} onChange={e => { dbHelpers.updateNotification(notif.id, { message: e.target.value }) }} className="w-full bg-[#14141A] border border-[#2A2A35] rounded-lg p-2 text-white outline-none text-sm focus:border-[#FF6B35] min-h-[80px]" />
                               </div>
                           </div>
                           <div className="flex justify-end mt-2">
                               <button 
                                 onClick={async () => {
                                     try {
                                         await dbHelpers.deleteNotification(notif.id);
                                         showToast('Notification deleted', 'success');
                                     } catch(e) {
                                         showToast('Error deleting notification', 'error');
                                     }
                                 }} 
                                 className="text-xs flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-colors uppercase tracking-widest font-bold"
                               >
                                 <X className="w-4 h-4" /> Delete
                               </button>
                           </div>
                       </div>
                    ))}
                </div>
            </div>
         )}
      </div>
    </div>
  );
}
