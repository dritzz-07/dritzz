import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.includes('run.app');

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyB4rNZmGnIr6po4ZJxzq_wS_FeEE_Zq9tU",
  // Use default firebaseapp.com for local dev/preview since they don't host /__/auth/handler
  // Use the actual hostname (dritzz.com) in production Firebase Hosting to fix auth errors
  authDomain: isDev ? "dritzz-83eb1.firebaseapp.com" : window.location.hostname,
  projectId: "dritzz-83eb1",
  storageBucket: "dritzz-83eb1.firebasestorage.app",
  messagingSenderId: "614586510097",
  appId: "1:614586510097:web:dcf85601c62fbf45c73ab0"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

