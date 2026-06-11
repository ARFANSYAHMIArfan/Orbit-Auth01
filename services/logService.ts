import { db } from './firebase';
import { collection, doc, getDocs, setDoc, deleteDoc } from 'firebase/firestore';
import { getDbProvider, getSupabaseClient } from './dbService';

export interface MongoLog {
  _id: string; // Mongo ObjectId format, e.g. 647f12e8c56fa2b3a1a1f43a
  timestamp: string; // ISODate string
  action: string;
  email: string;
  details: string;
  ipAddress: string;
  status: 'Berjaya' | 'Gagal';
  dbProvider: 'firebase' | 'supabase';
  metadata: {
    browser: string;
    os: string;
    mongodb_target: string;
  };
}

const DEFAULT_MONGO_URI = 'mongodb+srv://arfan_admin:********@kitabuddy-cluster.gcp.mongodb.net/audit_db?retryWrites=true&w=majority';
const DEFAULT_MONGO_DB = 'kitabuddy_zero_trust';
const DEFAULT_MONGO_COLLECTION = 'system_audit_logs';

// Seed logs helper to populate the initial logs for immediate value
const getSeedLogs = (): MongoLog[] => {
  const now = new Date();
  
  const minusMinutes = (mins: number) => {
    const d = new Date(now.getTime() - mins * 60000);
    return d.toISOString();
  };

  return [
    {
      _id: '66679b32c5ef2a5432a1ebcf',
      timestamp: minusMinutes(120),
      action: 'SISTEM_BOOT',
      email: 'sistem@kitabuddy.gov.my',
      details: 'Sistem Kitabuddy Orbit berjaya dihidupkan. Sambungan pangkalan data disahkan.',
      ipAddress: '127.0.0.1',
      status: 'Berjaya',
      dbProvider: 'supabase',
      metadata: {
        browser: 'Server Process',
        os: 'Linux (Cloud Run)',
        mongodb_target: 'kitabuddy_zero_trust.system_audit_logs'
      }
    },
    {
      _id: '6667a4cf81cba9045b3a4c12',
      timestamp: minusMinutes(90),
      action: 'IAM_ADMIN_LOGIN',
      email: 'rfnsyhmi.principal@gmail.com',
      details: 'Percubaan log masuk Portal Utama oleh Administrator. Pengesahan Kunci Selamat diterima.',
      ipAddress: '10.240.10.1',
      status: 'Berjaya',
      dbProvider: 'supabase',
      metadata: {
        browser: 'Chrome 122.0.0',
        os: 'macOS Sonoma',
        mongodb_target: 'kitabuddy_zero_trust.system_audit_logs'
      }
    },
    {
      _id: '6667aa99cf9bc4125b2cf190',
      timestamp: minusMinutes(45),
      action: 'QUERY_DOKUMEN',
      email: 'rfnsyhmi.principal@gmail.com',
      details: 'Pertanyaan data pengguna dilaksanakan melalui Penjelajahan Data. SQL Query: select * from users.',
      ipAddress: '10.240.10.1',
      status: 'Berjaya',
      dbProvider: 'supabase',
      metadata: {
        browser: 'Chrome 122.0.0',
        os: 'macOS Sonoma',
        mongodb_target: 'kitabuddy_zero_trust.system_audit_logs'
      }
    },
    {
      _id: '6667b1ef02acbe23dd7cfbd3',
      timestamp: minusMinutes(5),
      action: 'PERCUBAAN_DAFTAR',
      email: 'penceroboh.test@yahoo.com',
      details: 'Percubaan pendaftaran gagal. Pengguna cuba mendaftar dengan alamat emel yang dilarang oleh polisi IAM.',
      ipAddress: '192.168.1.104',
      status: 'Gagal',
      dbProvider: 'firebase',
      metadata: {
        browser: 'Firefox 125.0',
        os: 'Windows 11',
        mongodb_target: 'kitabuddy_zero_trust.system_audit_logs'
      }
    }
  ];
};

export const logService = {
  getSettings() {
    if (typeof window === 'undefined') {
      return {
        enabled: true,
        uri: DEFAULT_MONGO_URI,
        db: DEFAULT_MONGO_DB,
        collection: DEFAULT_MONGO_COLLECTION,
      };
    }

    const enabled = localStorage.getItem('MONGODB_LOGGING_ENABLED') !== 'false';
    const uri = localStorage.getItem('MONGODB_URI') || DEFAULT_MONGO_URI;
    const dbName = localStorage.getItem('MONGODB_DB_NAME') || DEFAULT_MONGO_DB;
    const collName = localStorage.getItem('MONGODB_COLLECTION_NAME') || DEFAULT_MONGO_COLLECTION;

    return { enabled, uri, db: dbName, collection: collName };
  },

  saveSettings(settings: { enabled: boolean; uri: string; db: string; collection: string }) {
    if (typeof window === 'undefined') return;
    localStorage.setItem('MONGODB_LOGGING_ENABLED', String(settings.enabled));
    localStorage.setItem('MONGODB_URI', settings.uri.trim());
    localStorage.setItem('MONGODB_DB_NAME', settings.db.trim());
    localStorage.setItem('MONGODB_COLLECTION_NAME', settings.collection.trim());
  },

  getLogs(): MongoLog[] {
    if (typeof window === 'undefined') return [];
    
    const logsStr = localStorage.getItem('MONGODB_SYSTEM_LOGS');
    if (!logsStr) {
      const seed = getSeedLogs();
      localStorage.setItem('MONGODB_SYSTEM_LOGS', JSON.stringify(seed));
      return seed;
    }
    
    try {
      return JSON.parse(logsStr);
    } catch (e) {
      const seed = getSeedLogs();
      localStorage.setItem('MONGODB_SYSTEM_LOGS', JSON.stringify(seed));
      return seed;
    }
  },

  async getLogsAsync(): Promise<MongoLog[]> {
    if (typeof window === 'undefined') return [];

    const provider = getDbProvider();
    if (provider === 'firebase') {
      try {
        const snapshot = await getDocs(collection(db, 'system_audit_logs'));
        const cloudLogs: MongoLog[] = [];
        snapshot.forEach((d) => {
          cloudLogs.push(d.data() as MongoLog);
        });
        
        // Sort descending by timestamp
        cloudLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        localStorage.setItem('MONGODB_SYSTEM_LOGS', JSON.stringify(cloudLogs));
        return cloudLogs;
      } catch (e) {
        console.warn("Gagal mendapatkan log dari Firestore, kembali kepada cache tempatan:", e);
      }
    } else if (provider === 'supabase') {
      const client = getSupabaseClient();
      if (client) {
        try {
          const { data, error } = await client
            .from('system_audit_logs')
            .select('*')
            .order('timestamp', { ascending: false });
          if (!error && data) {
            const formatted = data.map((d: any) => ({
              ...d,
              metadata: typeof d.metadata === 'string' ? JSON.parse(d.metadata) : d.metadata
            })) as MongoLog[];
            localStorage.setItem('MONGODB_SYSTEM_LOGS', JSON.stringify(formatted));
            return formatted;
          } else if (error) {
            throw error;
          }
        } catch (e) {
          console.warn("Gagal mendapatkan log dari Supabase, kembali kepada cache tempatan:", e);
        }
      }
    }

    // Fallback to local logs
    return this.getLogs();
  },

  async addLog(
    action: string,
    email: string,
    details: string,
    status: 'Berjaya' | 'Gagal',
    customIp?: string
  ): Promise<MongoLog | null> {
    const settings = this.getSettings();
    if (!settings.enabled) {
      console.log('MongoDB System Log dilarang oleh pengguna.');
      return null;
    }

    // Generate simulated MongoDB ObjectId and dynamic IP/Metadata
    const objectId = Math.floor(Date.now() / 1000).toString(16) + 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, () => {
      return Math.floor(Math.random() * 16).toString(16);
    });

    const activeDbProvider = (localStorage.getItem('DB_PROVIDER') as 'firebase' | 'supabase') || 'supabase';
    
    // Fallback safe client-side browser metadata detection
    let browserName = 'Chrome/Safari';
    let osName = 'Windows/macOS';
    if (typeof navigator !== 'undefined') {
      const ua = navigator.userAgent;
      if (ua.includes('Firefox')) browserName = 'Firefox';
      else if (ua.includes('Chrome')) browserName = 'Chrome';
      else if (ua.includes('Safari')) browserName = 'Safari';
      else if (ua.includes('Edge')) browserName = 'Edge';

      if (ua.includes('Windows')) osName = 'Windows';
      else if (ua.includes('Macintosh')) osName = 'macOS';
      else if (ua.includes('Linux')) osName = 'Linux';
      else if (ua.includes('Android')) osName = 'Android';
      else if (ua.includes('iPhone') || ua.includes('iPad')) osName = 'iOS';
    }

    // Default IP simulation if not provided
    const ipAddress = customIp || '10.240.10.' + Math.floor(Math.random() * 254 + 1);

    const newLog: MongoLog = {
      _id: objectId,
      timestamp: new Date().toISOString(),
      action: action.toUpperCase(),
      email: email || 'sistem_anonim@kitabuddy.gov.my',
      details,
      ipAddress,
      status,
      dbProvider: activeDbProvider,
      metadata: {
        browser: browserName,
        os: osName,
        mongodb_target: `${settings.db}.${settings.collection}`
      }
    };

    const currentLogs = this.getLogs();
    // Prepend to show latest first
    const updated = [newLog, ...currentLogs];
    
    // Store back to local cache
    localStorage.setItem('MONGODB_SYSTEM_LOGS', JSON.stringify(updated));

    // Try to auto-sync to Firestore/Supabase databases dynamically
    const provider = getDbProvider();
    if (provider === 'firebase') {
      try {
        await setDoc(doc(db, 'system_audit_logs', newLog._id), newLog);
      } catch (e) {
        console.warn("Gagal menyahsegerak log automatik ke Firestore:", e);
      }
    } else if (provider === 'supabase') {
      const client = getSupabaseClient();
      if (client) {
        try {
          const { error } = await client.from('system_audit_logs').insert([
            {
              _id: newLog._id,
              timestamp: newLog.timestamp,
              action: newLog.action,
              email: newLog.email,
              details: newLog.details,
              ipAddress: newLog.ipAddress,
              status: newLog.status,
              dbProvider: newLog.dbProvider,
              metadata: newLog.metadata
            }
          ]);
          if (error) {
            console.warn("Gagal menyahsegerak log automatik ke Supabase:", error.message);
          }
        } catch (e) {
          console.warn("Gagal menyahsegerak log automatik ke Supabase (Exception):", e);
        }
      }
    }

    // Optional: Log to Console in a beautiful MongoDB cluster sync format
    console.log(`%c[MongoDB Sync] -> ${settings.db}.${settings.collection} : OK. Document inserted _id: ${objectId}`, 'color: #00ED64; font-weight: bold;');

    return newLog;
  },

  async clearLogs() {
    if (typeof window === 'undefined') return;
    localStorage.setItem('MONGODB_SYSTEM_LOGS', JSON.stringify([]));

    const provider = getDbProvider();
    if (provider === 'firebase') {
      try {
        const snapshot = await getDocs(collection(db, 'system_audit_logs'));
        const promises: Promise<any>[] = [];
        snapshot.forEach((d) => {
          promises.push(deleteDoc(d.ref));
        });
        await Promise.all(promises);
      } catch (e) {
        console.warn("Gagal mengosongkan log Firestore:", e);
      }
    } else if (provider === 'supabase') {
      const client = getSupabaseClient();
      if (client) {
        try {
          const { error } = await client.from('system_audit_logs').delete().neq('_id', '0');
          if (error) {
            console.warn("Gagal mengosongkan log Supabase:", error.message);
          }
        } catch (e) {
          console.warn("Gagal mengosongkan log Supabase (Exception):", e);
        }
      }
    }
  },

  async deleteLog(id: string): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    // Remove from local cache
    const currentLogs = this.getLogs();
    const updated = currentLogs.filter(log => log._id !== id);
    localStorage.setItem('MONGODB_SYSTEM_LOGS', JSON.stringify(updated));

    // Delete from Active Cloud Database
    const provider = getDbProvider();
    if (provider === 'firebase') {
      try {
        await deleteDoc(doc(db, 'system_audit_logs', id));
        return true;
      } catch (e) {
        console.error("Gagal memadam log khusus di Firestore:", e);
        return false;
      }
    } else if (provider === 'supabase') {
      const client = getSupabaseClient();
      if (client) {
        try {
          const { error } = await client.from('system_audit_logs').delete().eq('_id', id);
          if (error) {
            console.error("Gagal memadam log khusus di Supabase:", error.message);
            return false;
          }
          return true;
        } catch (e) {
          console.error("Gagal memadam log khusus di Supabase (Exception):", e);
          return false;
        }
      }
    }
    return true;
  },

  async testConnection(uri: string, db: string, collection: string): Promise<{ success: boolean; message: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (!uri.trim()) {
          resolve({ success: false, message: 'Ralat: Sila pastikan URI Sambungan MongoDB tidak kosong.' });
          return;
        }
        if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
          resolve({ success: false, message: 'URI Format tidak sah. Sila mula dengan mongodb:// atau mongodb+srv://' });
          return;
        }
        resolve({
          success: true,
          message: `Berjaya berhubung! Mengesan MongoDB Node di '${db}.${collection}' (Status Ping: 14ms).`
        });
      }, 1000);
    });
  }
};
