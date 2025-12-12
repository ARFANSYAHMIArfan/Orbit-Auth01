import { User } from '../types';
import { auth, database } from '../lib/firebase';
import firebase from 'firebase/app';

// Helper to map Firebase User to our App User type
const mapFirebaseUser = (firebaseUser: firebase.User, dbName?: string): User => {
    return {
        id: firebaseUser.uid,
        name: dbName || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
        email: firebaseUser.email || ''
    };
};

export const loginUser = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    const firebaseUser = userCredential.user;
    
    if (!firebaseUser) {
        throw new Error('User not found');
    }

    // Fetch extra data from DB
    const snapshot = await database.ref(`users/${firebaseUser.uid}`).once('value');
    
    let dbName = '';
    if (snapshot.exists()) {
      const userData = snapshot.val();
      dbName = userData.username || userData.name;
    }

    return mapFirebaseUser(firebaseUser, dbName);
  } catch (error: any) {
    console.error("Login Error:", error);
    throw new Error(getErrorMessage(error.code));
  }
};

export const registerUser = async (name: string, email: string, password: string): Promise<User> => {
  try {
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    const firebaseUser = userCredential.user;

    if (!firebaseUser) {
        throw new Error('Failed to create user');
    }

    await firebaseUser.updateProfile({ displayName: name });

    // Save user to Realtime Database
    await database.ref('users/' + firebaseUser.uid).set({
      username: name,
      email: email,
      createdAt: new Date().toISOString(),
      provider: 'email'
    });

    return mapFirebaseUser(firebaseUser, name);
  } catch (error: any) {
    console.error("Register Error:", error);
    throw new Error(getErrorMessage(error.code));
  }
};

export const loginWithSocial = async (providerName: 'Google' | 'GitHub' | 'Facebook'): Promise<User> => {
    try {
        let provider: firebase.auth.AuthProvider;
        if (providerName === 'Google') {
            provider = new firebase.auth.GoogleAuthProvider();
        } else if (providerName === 'GitHub') {
            provider = new firebase.auth.GithubAuthProvider();
        } else {
            // Placeholder for Facebook or others not configured
            throw new Error(`${providerName} login is not fully configured yet.`);
        }

        const result = await auth.signInWithPopup(provider);
        const firebaseUser = result.user;
        
        if (!firebaseUser) {
            throw new Error('Social login failed');
        }

        // Check if user exists in DB, if not, save them
        const snapshot = await database.ref(`users/${firebaseUser.uid}`).once('value');

        if (!snapshot.exists()) {
            await database.ref('users/' + firebaseUser.uid).set({
                username: firebaseUser.displayName,
                email: firebaseUser.email,
                createdAt: new Date().toISOString(),
                provider: providerName
            });
        }

        return mapFirebaseUser(firebaseUser);
    } catch (error: any) {
        console.error(`${providerName} Login Error:`, error);
        if (error.code === 'auth/account-exists-with-different-credential') {
            throw new Error('Email ini sudah didaftarkan menggunakan cara login yang lain (contoh: Google vs Email).');
        }
        if (error.code === 'auth/popup-closed-by-user') {
            throw new Error('Login dibatalkan.');
        }
        throw new Error(getErrorMessage(error.code));
    }
};

export const resetPasswordRequest = async (email: string): Promise<boolean> => {
    try {
        await auth.sendPasswordResetEmail(email);
        return true;
    } catch (error: any) {
        throw new Error(getErrorMessage(error.code));
    }
};

function getErrorMessage(code: string): string {
    switch (code) {
        case 'auth/invalid-credential': return 'Email atau password salah.';
        case 'auth/user-not-found': return 'Tiada akaun ditemui dengan email ini.';
        case 'auth/wrong-password': return 'Password salah.';
        case 'auth/email-already-in-use': return 'Email ini sudah digunakan.';
        case 'auth/weak-password': return 'Password terlalu lemah.';
        case 'auth/invalid-email': return 'Format email tidak sah.';
        default: return 'Ralat berlaku. Sila cuba lagi.';
    }
}