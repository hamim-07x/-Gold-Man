import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, initializeFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "gen-lang-client-0836368056",
  appId: "1:489722787147:web:d299d8261606cdbbae64ce",
  apiKey: "AIzaSyDV2ApnlscI7Jv6yj7E4Z8F9lGbNvQEb_g",
  authDomain: "gen-lang-client-0836368056.firebaseapp.com",
  storageBucket: "gen-lang-client-0836368056.firebasestorage.app",
  messagingSenderId: "489722787147",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app, "ai-studio-54861a14-2af0-4ea7-a685-49a191792793");

