import { User } from '../types';

/**
 * MongoDB Service Layer
 * Mempunyai keupayaan untuk query data secara simulasi.
 */

const DB_NAME = 'kitabuddy_db';
const COLLECTION_USERS = 'users';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mongodbService = {
  // Simulasi mencari semua dokumen dalam koleksi
  async getAllDocuments(collection: string = COLLECTION_USERS): Promise<any[]> {
    await delay(400);
    const db = JSON.parse(localStorage.getItem(DB_NAME) || '{}');
    return db[collection] || [];
  },

  // Simulasi mencari user by email
  async findUser(email: string): Promise<User | null> {
    await delay(500);
    const db = JSON.parse(localStorage.getItem(DB_NAME) || '{}');
    const users = db[COLLECTION_USERS] || [];
    return users.find((u: User) => u.email === email) || null;
  },

  // Simulasi query (penapisan mudah)
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
      console.error("Invalid Query Syntax");
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

  async checkConnection(): Promise<boolean> {
    await delay(300);
    return true;
  }
};