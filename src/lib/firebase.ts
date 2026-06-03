import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyB4rNZmGnIr6po4ZJxzq_wS_FeEE_Zq9tU",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "dritzz-83eb1.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "dritzz-83eb1",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "dritzz-83eb1.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "614586510097",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:614586510097:web:dcf85601c62fbf45c73ab0"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
