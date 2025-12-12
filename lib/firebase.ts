import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';

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
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Initialize Services
export const auth = firebase.auth();
export const database = firebase.database();
export default firebase;