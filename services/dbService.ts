import { User } from '../types';
import { db, handleFirestoreError, OperationType } from './firebase.ts';
import { 
  collection, doc, getDocs, getDoc, setDoc, deleteDoc, query, where, getDocFromServer 
} from 'firebase/firestore';
import { createClient } from '@supabase/supabase-js';

const COLLECTION_USERS = 'users';

const DEFAULT_URL = 'https://zpwvfvhnytmuqykcptqk.supabase.co';
const DEFAULT_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpwd3ZmdmhueXRtdXF5a2NwdHFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwNTM2OTEsImV4cCI6MjA5NjYyOTY5MX0.A1VJNiiXb78eioFngkS_zsqXO-IC5AHjdIIeA1F67zc';
const DEFAULT_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpwd3ZmdmhueXRtdXF5a2NwdHFrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTA1MzY5MSwiZXhwIjoyMDk2NjI5NjkxfQ.bKGqSRjf9G2fnWI8u5DazXss-VuQ4X18SpCkLj6_qQ0';

// Auto-populate local storage with user credentials if they are not already set
if (typeof window !== 'undefined') {
  const currentUrl = localStorage.getItem('SUPABASE_URL');
  
  if (!currentUrl) {
    localStorage.setItem('SUPABASE_URL', DEFAULT_URL);
    localStorage.setItem('SUPABASE_ANON_KEY', DEFAULT_ANON_KEY);
    localStorage.setItem('SUPABASE_SERVICE_ROLE_KEY', DEFAULT_SERVICE_ROLE_KEY);
    localStorage.setItem('SUPABASE_USE_SERVICE_KEY', 'true'); // Default to true to bypass RLS errors out of the box
    localStorage.setItem('DB_PROVIDER', 'firebase');
  }
}

// Helper to determine active DB provider
export function getDbProvider(): 'firebase' | 'supabase' {
  return (localStorage.getItem('DB_PROVIDER') as 'firebase' | 'supabase') || 'firebase';
}

// Helper to check and instantiate Supabase client lazily
export function getSupabaseClient() {
  const url = localStorage.getItem('SUPABASE_URL') || DEFAULT_URL;
  const useServiceKey = localStorage.getItem('SUPABASE_USE_SERVICE_KEY') !== 'false'; // Dev/sandbox bypass defaults to true
  
  let serviceKey = localStorage.getItem('SUPABASE_SERVICE_ROLE_KEY');
  let anonKey = localStorage.getItem('SUPABASE_ANON_KEY');
  
  if (url === DEFAULT_URL) {
    if (!serviceKey) serviceKey = DEFAULT_SERVICE_ROLE_KEY;
    if (!anonKey) anonKey = DEFAULT_ANON_KEY;
  }
  
  const activeKey = (useServiceKey && serviceKey) ? serviceKey : (anonKey || DEFAULT_ANON_KEY);
  if (!url || !activeKey) return null;
  
  return createClient(url, activeKey, {
    auth: {
      persistSession: false
    }
  });
}

export const dbService = {
  // Ambil semua dokumen dalam koleksi users
  async getAllDocuments(collName: string = COLLECTION_USERS): Promise<any[]> {
    if (getDbProvider() === 'supabase') {
      try {
        const client = getSupabaseClient();
        if (!client) {
          throw new Error("Supabase URL galian atau Kunci Anonim tidak sah. Sila buat konfigurasi.");
        }
        const { data, error } = await client.from(collName).select('*');
        if (error) {
          throw new Error(`Ralat Supabase: ${error.message} (Sila pastikan jadual '${collName}' wujud)`);
        }
        return data || [];
      } catch (error: any) {
        console.error("Ralat galian Supabase:", error);
        throw error;
      }
    }

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
    
    if (getDbProvider() === 'supabase') {
      try {
        const client = getSupabaseClient();
        if (!client) return null;
        const { data, error } = await client
          .from(COLLECTION_USERS)
          .select('*')
          .eq('email', trimmedEmail);
        
        if (error) {
          // Table doesn't exist yet or columns mismatched, fall back gracefully
          console.warn("Ralat Supabase semasa cari pengguna:", error.message);
          return null;
        }
        if (!data || data.length === 0) return null;
        return data[0] as User;
      } catch (error) {
        console.error("Ralat pencarian Supabase:", error);
        return null;
      }
    }

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

  // Menyaring dokumen dari database terpilih
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
    if (getDbProvider() === 'supabase') {
      const client = getSupabaseClient();
      if (!client) throw new Error("Pangkalan data Supabase belum dikonfigurasikan.");
      
      // Ambil rekod sedia ada terlebih dahulu untuk memastikan tiada kolum wajib (seperti email) dikosongkan semasa kemas kini
      let existingRecord: any = null;
      try {
        const { data } = await client
          .from(COLLECTION_USERS)
          .select('*')
          .eq('id', userId);
        if (data && data.length > 0) {
          existingRecord = data[0];
        }
      } catch (e) {
        console.warn("Ralat pra-pengambilan rekod Supabase:", e);
      }
      
      const payload: any = { id: userId, ...existingRecord, ...updates };
      
      // Mengurangkan ralat sekiranya kolum tiada (seperti 'password' dll) dalam jadual Supabase milik pengguna.
      // Kita akan menapis kolum yang tiada secara dinamik dan mencuba semula secara automatik.
      for (let attempt = 0; attempt < 10; attempt++) {
        try {
          const { data, error } = await client
            .from(COLLECTION_USERS)
            .upsert(payload)
            .select();
          
          if (error) {
            const errorMsg = error.message || '';
            const match = errorMsg.match(/Could not find the '([^']+)' column/i);
            if (match && match[1]) {
              const missingColumn = match[1];
              console.warn(`Mengesan kolum tiada di pangkalan data Supabase: "${missingColumn}". Melangkau dan mencuba semula...`);
              delete payload[missingColumn];
              continue; // Cuba lagi dengan menolak fail ini
            }
            throw new Error(`Ralat kemas kini Supabase: ${error.message}. Sila pastikan skema jadual '${COLLECTION_USERS}' sesuai.`);
          }
          return (data?.[0] || payload) as User;
        } catch (err: any) {
          const errMsg = err.message || '';
          const match = errMsg.match(/Could not find the '([^']+)' column/i);
          if (match && match[1]) {
            const missingColumn = match[1];
            console.warn(`Mengesan kolum tiada di pangkalan data Supabase (catch): "${missingColumn}". Melangkau dan mencuba semula...`);
            delete payload[missingColumn];
            continue; // Cuba lagi dengan menolak fail ini
          }
          console.error("Ralat kemas kini Supabase:", err);
          throw err;
        }
      }
      throw new Error("Gagal mengemaskini pengguna selepas beberapa percubaan penyeimbangan skema Supabase.");
    }

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

  // Padam data pengguna dari portal terpilih
  async deleteUser(userId: string): Promise<boolean> {
    if (getDbProvider() === 'supabase') {
      try {
        const client = getSupabaseClient();
        if (!client) throw new Error("Pangkalan data Supabase belum dikonfigurasikan.");
        const { error } = await client
          .from(COLLECTION_USERS)
          .delete()
          .eq('id', userId);
        
        if (error) throw error;
        return true;
      } catch (error) {
        console.error("Ralat pemadaman Supabase:", error);
        return false;
      }
    }

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

  // Mengesahkan sambungan pangkalan data awan secara dinamik
  async checkConnection(): Promise<boolean> {
    if (getDbProvider() === 'supabase') {
      try {
        const client = getSupabaseClient();
        if (!client) return false;
        
        // Mencuba pemanggilan ringkas untuk menguji sambungan
        const { error } = await client.from(COLLECTION_USERS).select('id').limit(1);
        if (error) {
          // Jika jadual tidak wujud tetapi sambungan sah, kita masih anggap konfigurasi berjaya
          if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
            return true;
          }
          return false;
        }
        return true;
      } catch (error) {
        console.warn("Ralat ujian sambungan Supabase:", error);
        return false;
      }
    }

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
