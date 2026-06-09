import { User } from '../types';

/**
 * Sistem Simpanan Data Tempatan Terpelihara (dbService)
 * Menguruskan profil dan data pengguna secara simulasi di peringkat penyemak imbas (browser storage).
 */

const DB_NAME = 'kitabuddy_db';
const COLLECTION_USERS = 'users';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const dbService = {
  // Simulasi mencari semua dokumen dalam koleksi
  async getAllDocuments(collection: string = COLLECTION_USERS): Promise<any[]> {
    await delay(400);
    const db = JSON.parse(localStorage.getItem(DB_NAME) || '{}');
    return db[collection] || [];
  },

  // Simulasi mencari pengguna berdasarkan emel
  async findUser(email: string): Promise<User | null> {
    await delay(500);
    const db = JSON.parse(localStorage.getItem(DB_NAME) || '{}');
    const users = db[COLLECTION_USERS] || [];
    return users.find((u: User) => u.email === email) || null;
  },

  // Simulasi pertanyaan (tapis) dokumen
  async queryDocuments(queryString: string, collection: string = COLLECTION_USERS): Promise<any[]> {
    await delay(600);
    const all = await this.getAllDocuments(collection);
    
    if (!queryString.trim() || queryString === '{}') return all;

    try {
      const queryObj = JSON.parse(queryString);
      return all.filter(doc => {
        return Object.entries(queryObj).every(([key, value]) => {
          return String(doc[key]).toLowerCase().includes(String(value).toLowerCase());
        });
      });
    } catch (e) {
      console.error("Sintaks Pertanyaan Tidak Sah");
      return all;
    }
  },

  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    await delay(800);
    const db = JSON.parse(localStorage.getItem(DB_NAME) || '{}');
    const users = db[COLLECTION_USERS] || [];
    const index = users.findIndex((u: User) => u.id === userId);
    
    if (index === -1) {
      const newUser = { id: userId, ...updates } as User;
      users.push(newUser);
      db[COLLECTION_USERS] = users;
      localStorage.setItem(DB_NAME, JSON.stringify(db));
      return newUser;
    }
    
    const updatedUser = { ...users[index], ...updates };
    users[index] = updatedUser;
    db[COLLECTION_USERS] = users;
    localStorage.setItem(DB_NAME, JSON.stringify(db));
    return updatedUser;
  },

  async deleteUser(userId: string): Promise<boolean> {
    await delay(600);
    const db = JSON.parse(localStorage.getItem(DB_NAME) || '{}');
    const users = db[COLLECTION_USERS] || [];
    const filtered = users.filter((u: User) => u.id !== userId);
    db[COLLECTION_USERS] = filtered;
    localStorage.setItem(DB_NAME, JSON.stringify(db));
    return true;
  },

  async checkConnection(): Promise<boolean> {
    await delay(300);
    const db = JSON.parse(localStorage.getItem(DB_NAME) || '{}');
    let users = db[COLLECTION_USERS] || [];

    // Purge old mock accounts if they exist in localStorage
    const oldEmails = ['arfan@muzaffar.edu.my', 'syahril@kamal.edu.my', 'kitabuddy_bot@moe.edu.my', 'fatimah@moe-dl.edu.my'];
    users = users.filter((u: any) => !oldEmails.includes(u.email));

    const DEFAULT_USERS = [
      {
        id: 'u_iam_admin',
        name: 'IAM Server ADMIN',
        email: 'rfnsyhmi.principal@gmail.com',
        role: 'IAM Portal Administrator',
        department: 'Sistem Kawalan IAM',
        lastActive: 'Masa Nyata',
        ipAddress: '10.240.10.1',
        status: 'Aktif'
      }
    ];

    let modified = false;
    DEFAULT_USERS.forEach(defUser => {
      if (!users.some((u: any) => u.email === defUser.email)) {
        users.push(defUser);
        modified = true;
      }
    });

    // If we purged old emails, we set modified to true
    const currentEmails = users.map((u: any) => u.email);
    if (oldEmails.some(e => currentEmails.includes(e)) || modified || !db[COLLECTION_USERS] || db[COLLECTION_USERS].length !== users.length) {
      db[COLLECTION_USERS] = users;
      localStorage.setItem(DB_NAME, JSON.stringify(db));
    }

    return true;
  }
};