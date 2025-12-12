// Firebase client-side initialization is disabled.
// The application now uses an API-based authentication flow (Frontend -> Backend -> DB).

/*
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';

const firebaseConfig = {
  // Config removed
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export const auth = firebase.auth();
export const database = firebase.database();
*/

// Export dummy objects if imports exist elsewhere to prevent crash during refactor
export const auth = {};
export const database = {};