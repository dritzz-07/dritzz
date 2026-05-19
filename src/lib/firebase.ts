import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBeQF9kp3KcXh-govTv3sUB5VAifzZ213g",
  authDomain: "dritzz-83eb1.firebaseapp.com",
  projectId: "dritzz-83eb1",
  storageBucket: "dritzz-83eb1.firebasestorage.app",
  messagingSenderId: "614586510097",
  appId: "1:614586510097:web:dfc85601c62fbf45c73ab0"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
