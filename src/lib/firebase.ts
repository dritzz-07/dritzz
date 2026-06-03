import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyB4rNZmGnIr6po4ZJxzq_wS_FeEE_Zq9tU",
  authDomain: "dritzz-83eb1.firebaseapp.com",
  projectId: "dritzz-83eb1",
  storageBucket: "dritzz-83eb1.firebasestorage.app",
  messagingSenderId: "614586510097",
  appId: "1:614586510097:web:dcf85601c62fbf45c73ab0"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
