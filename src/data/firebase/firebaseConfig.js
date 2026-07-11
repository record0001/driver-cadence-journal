import { initializeApp } from 'firebase/app';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentSingleTabManager,
} from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// Значения берутся из переменных окружения Vite (.env файл, не коммитить в git).
/*
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};
*/


const firebaseConfig = {
  apiKey: "AIzaSyDZpBFBxFuAOHzjzb6Cc4sk7ha4uWuATuU",
  authDomain: "driver-cadence-journal.firebaseapp.com",
  projectId: "driver-cadence-journal",
  storageBucket: "driver-cadence-journal.firebasestorage.app",
  messagingSenderId: "126209909985",
  appId: "1:126209909985:web:e558401c8beb61209ec3a0",
  measurementId: "G-C2EYP01TRY"
}



export const firebaseApp = initializeApp(firebaseConfig);

// alert(firebaseApp);
// alert(JSON.stringify(firebaseApp, null, 2));

// Offline-first: локальный кэш Firestore, автоматическая очередь несинхронизированных
// записей. persistentSingleTabManager — сознательное упрощение MVP: persistence
// работает в одной активной вкладке (см. Этап 4 архитектуры — известное ограничение).
export const db = initializeFirestore(firebaseApp, {
  localCache: persistentLocalCache({
    tabManager: persistentSingleTabManager({}),
  }),
});

export const auth = getAuth(firebaseApp);
export const googleAuthProvider = new GoogleAuthProvider();
