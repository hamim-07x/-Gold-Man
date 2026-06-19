import { create } from 'zustand';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, addDoc, onSnapshot, writeBatch, orderBy } from 'firebase/firestore';

export interface SystemConfig {
  baseMineRate: number;
  referralL1: number;
  referralL2: number;
  referralL3: number;
}

export interface User {
  id: string; // Telegram ID
  username?: string;
  firstName?: string;
  lastName?: string;
  photoUrl?: string;
  balance: number;
  xpBalance?: number;
  usdcBalance?: number;
  miningStartedAt?: number | null;
  joinNumber: number;
  joinedAt: number;
  referralsCount: number;
  referredBy?: string;
  isBanned?: boolean;
  dailyStreak?: number;
  lastLoginAt?: number;
  level?: number;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'deposit' | 'withdraw' | 'earn' | 'referral' | 'mine' | 'referral_commission' | 'daily_login';
  amount: number;
  currency?: 'USD' | 'USDC' | 'XP';
  timestamp: number;
  status: 'pending' | 'completed' | 'failed';
  originId?: string;
}

export interface NotificationMsg {
  id: string;
  title: string;
  message: string;
  timestamp: number;
  type: 'info' | 'warning' | 'success';
}

interface AppState {
  isInitialized: boolean;
  currentUser: User | null;
  isAdmin: boolean;
  language: string;
  toast: { message: string, type: 'success' | 'error' | 'info', title?: string } | null;
  notifications: NotificationMsg[];
  setLanguage: (lang: string) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info', title?: string) => void;
  hideToast: () => void;
  initSession: (tgUser: any, startParam?: string) => void;
  adminLogin: (pin: string) => boolean;
  updateBalance: (amount: number, type: Transaction['type'], currency?: 'USD'|'USDC'|'XP') => void;
  startMining: () => void;
  claimMining: () => void;
  claimDailyLogin: () => Promise<void>;
  transferTokens: (toUserId: string, amount: number) => Promise<boolean>;
  systemConfig: SystemConfig;
  updateSystemConfig: (config: SystemConfig) => Promise<void>;
}

const DEFAULT_CONFIG: SystemConfig = {
  baseMineRate: 50,
  referralL1: 10,
  referralL2: 5,
  referralL3: 2
};

// Temporary global variable to hold snapshot unsubscriber to avoid multiple listeners
let userListenerUnsub: any = null;
let configListenerUnsub: any = null;
let notificationListenerUnsub: any = null;

export const useAppStore = create<AppState>((set, get) => ({
  isInitialized: false,
  currentUser: null,
  isAdmin: false,
  language: 'en',
  toast: null,
  notifications: [],
  systemConfig: DEFAULT_CONFIG,
  setLanguage: (lang) => set({ language: lang }),
  
  showToast: (message, type = 'info', title) => {
    set({ toast: { message, type, title } });
    if (type === 'success' || type === 'info') {
      import('../lib/audio').then(m => m.playSuccessSound());
    } else {
      import('../lib/audio').then(m => m.playErrorSound());
    }
    setTimeout(() => {
      set((state) => (state.toast?.message === message ? { toast: null } : state));
    }, 3000);
  },
  
  hideToast: () => set({ toast: null }),
  
  initSession: async (tgUser, startParam) => {
    if (!tgUser || !tgUser.id) return;
    
    try {
      const uid = tgUser.id.toString();

      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        const newUser: User = {
          id: uid,
          username: tgUser.username || "",
          firstName: tgUser.first_name || "",
          lastName: tgUser.last_name || "",
          photoUrl: tgUser.photo_url || "",
          balance: 0,
          xpBalance: 0,
          usdcBalance: 0,
          miningStartedAt: null,
          joinNumber: Date.now() + Math.floor(Math.random() * 1000), // Random placeholder instead of getDocs
          joinedAt: Date.now(),
          referralsCount: 0,
          referredBy: startParam || ""
        };
        
        await setDoc(userRef, newUser);
        
        if (startParam && startParam !== uid) {
          try {
             const batch = writeBatch(db);
             const ref1Doc = doc(db, 'users', startParam);
             const ref1Snap = await getDoc(ref1Doc);
             if (ref1Snap.exists()) {
               const ref1Data = ref1Snap.data() as User;
               batch.update(ref1Doc, {
                 referralsCount: (ref1Data.referralsCount || 0) + 1,
                 xpBalance: (ref1Data.xpBalance || 0) + 10
               });
               
               const tx1Ref = doc(collection(db, 'transactions'));
               batch.set(tx1Ref, {
                 userId: startParam, type: 'referral', amount: 10, currency: 'XP', timestamp: Date.now(), status: 'completed'
               });

               if (ref1Data.referredBy && ref1Data.referredBy !== uid) {
                 const ref2Doc = doc(db, 'users', ref1Data.referredBy);
                 const ref2Snap = await getDoc(ref2Doc);
                 if (ref2Snap.exists()) {
                   const ref2Data = ref2Snap.data() as User;
                   batch.update(ref2Doc, { xpBalance: (ref2Data.xpBalance || 0) + 5 });
                   
                   const tx2Ref = doc(collection(db, 'transactions'));
                   batch.set(tx2Ref, {
                     userId: ref1Data.referredBy, type: 'referral', amount: 5, currency: 'XP', timestamp: Date.now(), status: 'completed'
                   });
                   
                   if (ref2Data.referredBy && ref2Data.referredBy !== uid && ref2Data.referredBy !== startParam) {
                     const ref3Doc = doc(db, 'users', ref2Data.referredBy);
                     const ref3Snap = await getDoc(ref3Doc);
                     if (ref3Snap.exists()) {
                       const ref3Data = ref3Snap.data() as User;
                       batch.update(ref3Doc, { xpBalance: (ref3Data.xpBalance || 0) + 2 });
                       
                       const tx3Ref = doc(collection(db, 'transactions'));
                       batch.set(tx3Ref, {
                         userId: ref2Data.referredBy, type: 'referral', amount: 2, currency: 'XP', timestamp: Date.now(), status: 'completed'
                       });
                     }
                   }
                 }
               }
             }
             await batch.commit();
          } catch (refErr) {
             console.error("Referral process skipped due to error:", refErr);
          }
        }
      }

      if (configListenerUnsub) configListenerUnsub();
      configListenerUnsub = onSnapshot(doc(db, 'system', 'config'), (snapshot) => {
         if (snapshot.exists()) {
            set({ systemConfig: snapshot.data() as SystemConfig });
         } else {
            // Document doesn't exist, create it with default
            setDoc(doc(db, 'system', 'config'), DEFAULT_CONFIG).catch(console.error);
         }
      });

      if (notificationListenerUnsub) notificationListenerUnsub();
      notificationListenerUnsub = onSnapshot(query(collection(db, 'notifications'), orderBy('timestamp', 'desc')), (snapshot) => {
         set({ notifications: snapshot.docs.map(d => ({ id: d.id, ...d.data() } as NotificationMsg)) });
      });

      if (userListenerUnsub) userListenerUnsub();
      userListenerUnsub = onSnapshot(userRef, (snapshot) => {
         if (snapshot.exists()) {
            set({ currentUser: snapshot.data() as User, isInitialized: true });
         } else {
            set({ isInitialized: true }); // Prevent infinite spin if user drops abruptly
         }
      }, (error) => {
         console.error("onSnapshot error:", error);
         set({ isInitialized: true });
      });
      
    } catch (e) {
      console.error("Firebase init session error:", e);
      set({ isInitialized: true });
    }
  },
  
  adminLogin: (pin) => {
    if (pin === '0000') {
      set({ isAdmin: true });
      return true;
    }
    return false;
  },
  
  updateBalance: async (amount, type, currency = 'USD') => {
    const { currentUser } = get();
    if (!currentUser) return;
    
    let updates: any = {};
    if (currency === 'USD') updates.balance = (currentUser.balance || 0) + amount;
    else if (currency === 'XP') updates.xpBalance = (currentUser.xpBalance || 0) + amount;
    else if (currency === 'USDC') updates.usdcBalance = (currentUser.usdcBalance || 0) + amount;

    try {
      await updateDoc(doc(db, 'users', currentUser.id), updates);
      await addDoc(collection(db, 'transactions'), {
        userId: currentUser.id,
        type,
        amount,
        currency,
        timestamp: Date.now(),
        status: type === 'deposit' || type === 'withdraw' ? 'pending' : 'completed'
      });
      get().showToast(`${type === 'deposit' ? 'Deposit' : type === 'withdraw' ? 'Withdrawal' : 'Transaction'} requested`, 'success');
    } catch (e) { 
      console.error(e); 
      get().showToast('Transaction failed', 'error');
    }
  },

  updateSystemConfig: async (config) => {
    try {
      await setDoc(doc(db, 'system', 'config'), config);
    } catch (e) { console.error(e); }
  },

  startMining: async () => {
    const { currentUser } = get();
    if (!currentUser || currentUser.miningStartedAt) return;
    try {
      await updateDoc(doc(db, 'users', currentUser.id), { miningStartedAt: Date.now() });
    } catch (e) { console.error(e); }
  },

  claimMining: async () => {
    const { currentUser, systemConfig } = get();
    if (!currentUser || !currentUser.miningStartedAt) return;
    
    try {
      const batch = writeBatch(db);
      const userRef = doc(db, 'users', currentUser.id);
      
      batch.update(userRef, { miningStartedAt: null, xpBalance: (currentUser.xpBalance || 0) + systemConfig.baseMineRate });
      
      const txRef = doc(collection(db, 'transactions'));
      batch.set(txRef, {
        userId: currentUser.id, type: 'mine', amount: systemConfig.baseMineRate, currency: 'XP', timestamp: Date.now(), status: 'completed'
      });

      // Distribute Commission
      if (currentUser.referredBy) {
        const ref1Doc = doc(db, 'users', currentUser.referredBy);
        const ref1Snap = await getDoc(ref1Doc);
        if (ref1Snap.exists()) {
          const l1Reward = (systemConfig.baseMineRate * systemConfig.referralL1) / 100;
          const ref1Data = ref1Snap.data() as User;
          batch.update(ref1Doc, { xpBalance: (ref1Data.xpBalance || 0) + l1Reward });
          const tx1Ref = doc(collection(db, 'transactions'));
          batch.set(tx1Ref, { userId: currentUser.referredBy, type: 'referral_commission', amount: l1Reward, currency: 'XP', timestamp: Date.now(), status: 'completed', originId: currentUser.id });
          
          if (ref1Data.referredBy) {
            const ref2Doc = doc(db, 'users', ref1Data.referredBy);
            const ref2Snap = await getDoc(ref2Doc);
            if (ref2Snap.exists()) {
               const l2Reward = (systemConfig.baseMineRate * systemConfig.referralL2) / 100;
               const ref2Data = ref2Snap.data() as User;
               batch.update(ref2Doc, { xpBalance: (ref2Data.xpBalance || 0) + l2Reward });
               const tx2Ref = doc(collection(db, 'transactions'));
               batch.set(tx2Ref, { userId: ref1Data.referredBy, type: 'referral_commission', amount: l2Reward, currency: 'XP', timestamp: Date.now(), status: 'completed', originId: currentUser.id });

               if (ref2Data.referredBy) {
                 const ref3Doc = doc(db, 'users', ref2Data.referredBy);
                 const ref3Snap = await getDoc(ref3Doc);
                 if (ref3Snap.exists()) {
                   const l3Reward = (systemConfig.baseMineRate * systemConfig.referralL3) / 100;
                   const ref3Data = ref3Snap.data() as User;
                   batch.update(ref3Doc, { xpBalance: (ref3Data.xpBalance || 0) + l3Reward });
                   const tx3Ref = doc(collection(db, 'transactions'));
                   batch.set(tx3Ref, { userId: ref2Data.referredBy, type: 'referral_commission', amount: l3Reward, currency: 'XP', timestamp: Date.now(), status: 'completed', originId: currentUser.id });
                 }
               }
            }
          }
        }
      }

      await batch.commit();
      get().showToast('Mining rewards claimed successfully', 'success');

    } catch (e) { 
      console.error(e); 
      get().showToast('Failed to claim rewards', 'error');
    }
  },
  
  claimDailyLogin: async () => {
    const { currentUser } = get();
    if (!currentUser) return;
    
    const now = Date.now();
    const lastLogin = currentUser.lastLoginAt || 0;
    
    const today = new Date(now).setHours(0, 0, 0, 0);
    const lastLoginDate = new Date(lastLogin).setHours(0, 0, 0, 0);
    
    if (today === lastLoginDate && lastLogin !== 0) {
      return; // Already claimed today
    }
    
    const isYesterday = today - lastLoginDate === 86400000;
    let newStreak = 1;
    if (isYesterday && currentUser.dailyStreak) {
      newStreak = currentUser.dailyStreak + 1;
    }
    
    const rewardAmount = Math.min(newStreak * 10, 100); // Up to 100 XP
    
    try {
      const batch = writeBatch(db);
      const userRef = doc(db, 'users', currentUser.id);
      
      batch.update(userRef, {
        dailyStreak: newStreak,
        lastLoginAt: now,
        xpBalance: (currentUser.xpBalance || 0) + rewardAmount
      });
      
      const txRef = doc(collection(db, 'transactions'));
      batch.set(txRef, {
        userId: currentUser.id,
        type: 'daily_login',
        amount: rewardAmount,
        currency: 'XP',
        timestamp: now,
        status: 'completed'
      });
      
      await batch.commit();
      get().showToast(`Daily login claimed: +${rewardAmount} XP!`, 'success');
    } catch (e) {
      console.error(e);
      get().showToast('Failed to claim daily reward', 'error');
    }
  },

  transferTokens: async (toUserId: string, amount: number) => {
    const { currentUser } = get();
    if (!currentUser || amount <= 0 || (currentUser.xpBalance || 0) < amount) {
      get().showToast('Invalid transfer amount or insufficient balance', 'error');
      return false;
    }
    
    try {
      const batch = writeBatch(db);
      const senderRef = doc(db, 'users', currentUser.id);
      const receiverRef = doc(db, 'users', toUserId);
      
      const receiverSnap = await getDoc(receiverRef);
      if (!receiverSnap.exists()) {
        get().showToast('Recipient not found', 'error');
        return false;
      }
      const receiverData = receiverSnap.data() as User;

      batch.update(senderRef, { xpBalance: (currentUser.xpBalance || 0) - amount });
      batch.update(receiverRef, { xpBalance: (receiverData.xpBalance || 0) + amount });
      
      const txSendRef = doc(collection(db, 'transactions'));
      batch.set(txSendRef, {
        userId: currentUser.id,
        type: 'withdraw',
        amount: -amount,
        currency: 'XP',
        timestamp: Date.now(),
        status: 'completed',
        originId: toUserId
      });

      const txRecvRef = doc(collection(db, 'transactions'));
      batch.set(txRecvRef, {
        userId: toUserId,
        type: 'deposit',
        amount: amount,
        currency: 'XP',
        timestamp: Date.now(),
        status: 'completed',
        originId: currentUser.id
      });
      
      await batch.commit();
      get().showToast(`Successfully transferred ${amount} FIFA to ${receiverData.username || receiverData.firstName || toUserId}`, 'success');
      return true;
    } catch (e) {
      console.error(e);
      get().showToast('Transfer failed', 'error');
      return false;
    }
  }
}));

// Provide basic fetching for admin tasks and transactions
export const dbHelpers = {
  getAllUsers: async (): Promise<User[]> => {
    const snap = await getDocs(collection(db, 'users'));
    return snap.docs.map(d => d.data() as User);
  },
  listenUsers: (callback: (users: User[]) => void) => {
    const q = query(collection(db, 'users'));
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map(d => d.data() as User).sort((a, b) => b.joinedAt - a.joinedAt));
    });
  },
  updateUser: async (userId: string, data: Partial<User>) => {
    await updateDoc(doc(db, 'users', userId), data);
  },
  findUserByUsername: async (username: string): Promise<User | null> => {
    const q = query(collection(db, 'users'), where('username', '==', username.replace('@', '')));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs[0].data() as User;
    }
    return null;
  },
  getTransactions: (userId: string, callback: (txs: Transaction[]) => void) => {
    const q = query(collection(db, 'transactions'), where('userId', '==', userId));
    return onSnapshot(q, (snap) => {
      const txs = snap.docs.map(d => ({ id: d.id, ...d.data() } as Transaction));
      callback(txs.sort((a,b) => b.timestamp - a.timestamp));
    });
  },
  getAllTransactions: async (): Promise<Transaction[]> => {
    const snap = await getDocs(collection(db, 'transactions'));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Transaction));
  }
};

