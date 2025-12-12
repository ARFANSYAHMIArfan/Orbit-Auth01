import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

// PENTING: Pastikan konfigurasi ini sepadan dengan projek Firebase anda.
const firebaseConfig = {
  apiKey: "AIzaSyDPwMF9yxopZY4ujf1UpBvaBYTBeP72EG0",
  authDomain: "orbit-auth01.firebaseapp.com",
  databaseURL: "https://orbit-auth01-default-rtdb.firebaseio.com",
  projectId: "orbit-auth01",
  storageBucket: "orbit-auth01.firebasestorage.app",
  messagingSenderId: "561508542344",
  appId: "1:561508542344:web:12c1c3645a138d7783fc3df"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const database = getDatabase(app);