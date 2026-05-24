import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  browserLocalPersistence, 
  browserPopupRedirectResolver, 
  inMemoryPersistence,
  initializeAuth 
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Check if we are in an iframe where storage access might be restricted
const isIframe = () => {
    try {
        return window.self !== window.top;
    } catch (e) {
        return true;
    }
}

// Initialize auth with dependencies to avoid some environment-specific network errors
export const auth = initializeAuth(app, {
  persistence: [browserLocalPersistence, inMemoryPersistence],
  popupRedirectResolver: browserPopupRedirectResolver
});

export const googleProvider = new GoogleAuthProvider();
