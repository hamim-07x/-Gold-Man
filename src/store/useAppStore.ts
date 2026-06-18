import { create } from 'zustand';

export interface User {
  id: string; // Telegram ID
  username?: string;
  firstName?: string;
  lastName?: string;
  photoUrl?: string;
  balance: number;
  joinNumber: number;
  joinedAt: number;
  referralsCount: number;
  referredBy?: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'deposit' | 'withdraw' | 'earn' | 'referral';
  amount: number;
  timestamp: number;
  status: 'pending' | 'completed' | 'failed';
}

interface AppState {
  isInitialized: boolean;
  currentUser: User | null;
  isAdmin: boolean;
  language: string;
  setLanguage: (lang: string) => void;
  initSession: (tgUser: any, startParam?: string) => void;
  adminLogin: (pin: string) => boolean;
  updateBalance: (amount: number, type: Transaction['type']) => void;
}

// Temporary LocalStorage Wrapper for robust state across reloads before Firebase
const getStorage = (key: string, defaultValue: any) => {
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : defaultValue;
};
const setStorage = (key: string, value: any) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const useAppStore = create<AppState>((set, get) => ({
  isInitialized: false,
  currentUser: null,
  isAdmin: false,
  language: 'en',
  setLanguage: (lang) => set({ language: lang }),
  
  initSession: (tgUser, startParam) => {
    // Simulate robust DB initialization
    if (!tgUser || !tgUser.id) return;
    
    // In actual production, this connects to Firebase.
    const allUsers: Record<string, User> = getStorage('fake_db_users', {});
    
    let user = allUsers[tgUser.id];
    
    if (!user) {
      // New user registration
      user = {
        id: tgUser.id.toString(),
        username: tgUser.username,
        firstName: tgUser.first_name,
        lastName: tgUser.last_name,
        photoUrl: tgUser.photo_url,
        balance: 0,
        joinNumber: Object.keys(allUsers).length + 1,
        joinedAt: Date.now(),
        referralsCount: 0,
        referredBy: startParam // Referral system mock
      };
      
      // Credit referrer if exists
      if (startParam && allUsers[startParam]) {
        allUsers[startParam].referralsCount += 1;
        // give bonus to referrer
        allUsers[startParam].balance += 10;
        
        const txs: Transaction[] = getStorage('fake_db_txs', []);
        txs.push({
          id: Math.random().toString(36).slice(2, 9),
          userId: startParam,
          type: 'referral',
          amount: 10,
          timestamp: Date.now(),
          status: 'completed'
        });
        setStorage('fake_db_txs', txs);
      }
      
      allUsers[user.id] = user;
      setStorage('fake_db_users', allUsers);
    }
    
    set({ currentUser: user, isInitialized: true });
  },
  
  adminLogin: (pin) => {
    if (pin === '0000') {
      set({ isAdmin: true });
      return true;
    }
    return false;
  },
  
  updateBalance: (amount, type) => {
    const { currentUser } = get();
    if (!currentUser) return;
    
    const newBalance = currentUser.balance + amount;
    const allUsers = getStorage('fake_db_users', {});
    
    allUsers[currentUser.id] = { ...currentUser, balance: newBalance };
    setStorage('fake_db_users', allUsers);
    
    const txs: Transaction[] = getStorage('fake_db_txs', []);
    txs.unshift({
      id: Math.random().toString(36).slice(2, 9),
      userId: currentUser.id,
      type,
      amount,
      timestamp: Date.now(),
      status: 'pending' // Just for UI look
    });
    setStorage('fake_db_txs', txs);
    
    set({ currentUser: { ...currentUser, balance: newBalance } });
  }
}));

// Exporting helpers to view 'DB' from admin
export const dbHelpers = {
  getAllUsers: (): User[] => Object.values(getStorage('fake_db_users', {})),
  getTransactions: (userId: string): Transaction[] => {
    const all = getStorage('fake_db_txs', []) as Transaction[];
    return all.filter(t => t.userId === userId);
  },
  getAllTransactions: (): Transaction[] => getStorage('fake_db_txs', [])
};
