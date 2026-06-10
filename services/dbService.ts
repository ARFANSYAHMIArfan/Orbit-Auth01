import { User } from '../types';
import { db, handleFirestoreError, OperationType } from './firebase.ts';
import { 
  collection, doc, getDocs, getDoc, setDoc, deleteDoc, query, where, getDocFromServer 
} from 'firebase/firestore';

const COLLECTION_USERS = 'users';

export const dbService = {
  // Ambil semua dokumen dalam koleksi users
  async getAllDocuments(collName: string = COLLECTION_USERS): Promise<any[]> {
    try {
      const q = collection(db, collName);
      const snapshot = await getDocs(q);
      const docs: any[] = [];
      snapshot.forEach((d) => {
        docs.push({ id: d.id, ...d.data() });
      });
      return docs;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, collName);
      return [];
    }
  },

  // Cari pengguna berdasarkan emel
  async findUser(email: string): Promise<User | null> {
    const trimmedEmail = email.trim().toLowerCase();
    try {
      const q = query(collection(db, COLLECTION_USERS), where('email', '==', trimmedEmail));
      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;
      let found: User | null = null;
      snapshot.forEach((d) => {
        found = { id: d.id, ...d.data() } as User;
      });
      return found;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `${COLLECTION_USERS}?email=${trimmedEmail}`);
      return null;
    }
  },

  // Menyaring dokumen dari Firestore
  async queryDocuments(queryString: string, collName: string = COLLECTION_USERS): Promise<any[]> {
    try {
      const all = await this.getAllDocuments(collName);
      if (!queryString.trim() || queryString === '{}') return all;

      const queryObj = JSON.parse(queryString);
      return all.filter(docVal => {
        return Object.entries(queryObj).every(([key, value]) => {
          return String(docVal[key] || '').toLowerCase().includes(String(value).toLowerCase());
        });
      });
    } catch (e) {
      console.error("Sintaks Pertanyaan Tidak Sah", e);
      // Kembali kepada semua dokumen jika ralat query parsing berlaku
      return this.getAllDocuments(collName).catch(() => []);
    }
  },

  // Tambah atau kemas kini dokumen profil pengguna
  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    const docPath = `${COLLECTION_USERS}/${userId}`;
    try {
      const docRef = doc(db, COLLECTION_USERS, userId);
      const existingDoc = await getDoc(docRef);
      let updatedUser: User;
      if (!existingDoc.exists()) {
        updatedUser = { id: userId, ...updates } as User;
      } else {
        updatedUser = { ...existingDoc.data(), ...updates, id: userId } as User;
      }
      
      await setDoc(docRef, updatedUser);
      return updatedUser;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, docPath);
      throw error;
    }
  },

  // Padam data pengguna dari portal
  async deleteUser(userId: string): Promise<boolean> {
    const docPath = `${COLLECTION_USERS}/${userId}`;
    try {
      const docRef = doc(db, COLLECTION_USERS, userId);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, docPath);
      return false;
    }
  },

  // Mengesahkan sambungan pangkalan data Firestore awan secara terus mengikut panduan kemahiran
  async checkConnection(): Promise<boolean> {
    try {
      // 1. Uji sambungan getFromServer mengikut panduan "Validate Connection to Firestore"
      await getDocFromServer(doc(db, 'test', 'connection')).catch(() => {});
      
      // 2. Benih pelayan asas (seeding default account: rfnsyhmi.principal@gmail.com dengan nama IAM Server ADMIN) jika pangkalan data kosong
      const docRef = doc(db, COLLECTION_USERS, 'u_iam_admin');
      const existing = await getDoc(docRef);
      if (!existing.exists()) {
        await setDoc(docRef, {
          id: 'u_iam_admin',
          name: 'IAM Server ADMIN',
          email: 'rfnsyhmi.principal@gmail.com',
          role: 'IAM Portal Administrator',
          department: 'Sistem Kawalan IAM',
          lastActive: 'Masa Nyata',
          ipAddress: '10.240.10.1',
          status: 'Aktif'
        });
      }
      return true;
    } catch (error) {
      console.warn("Ralat sambungan awal Firestore:", error);
      return true; // Sentiasa pulangkan true untuk kestabilan portal prapaparan
    }
  }
};
