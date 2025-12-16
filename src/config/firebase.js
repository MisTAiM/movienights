/* ========================================
   Firebase Configuration (Optional)
   Watch Party works without Firebase (local mode)
   ======================================== */

import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get, update, remove, onValue, push, serverTimestamp } from 'firebase/database';

// Check if Firebase environment variables are set
const hasFirebaseConfig = Boolean(
  import.meta.env.VITE_FIREBASE_API_KEY && 
  import.meta.env.VITE_FIREBASE_DATABASE_URL
);

let app = null;
let database = null;

if (hasFirebaseConfig) {
  try {
    const firebaseConfig = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID
    };
    
    app = initializeApp(firebaseConfig);
    database = getDatabase(app);
    console.log('✅ Firebase initialized');
  } catch (error) {
    console.warn('⚠️ Firebase init error:', error.message);
  }
} else {
  console.log('ℹ️ Firebase not configured - Watch Party uses local sync');
}

export { 
  database, 
  ref, 
  set, 
  get, 
  update, 
  remove, 
  onValue, 
  push,
  serverTimestamp,
  hasFirebaseConfig
};

export default app;
