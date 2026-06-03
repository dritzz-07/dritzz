import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyB4rNZmGnIr6po4ZJxzq_wS_FeEE_Zq9tU",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "charged-axle-k8gvj.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "charged-axle-k8gvj",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "charged-axle-k8gvj.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "160628866727",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:160628866727:web:621df029c0fd8db8e42582"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
