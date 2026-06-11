import React, { useState } from 'react';
import { User } from '../types';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { LogOut, Sparkles, Activity, Folder, Settings, ArrowLeft, User as UserIcon, Bell, Shield, Globe, CheckCircle2, Database, Terminal } from 'lucide-react';
import { ConnectModal } from './ConnectModal';
import { DataExplorer } from './DataExplorer';
import { StatusView } from './StatusView';
import { MongoLogsView } from './MongoLogsView';
import { dbService } from '../services/dbService';
import { logService } from '../services/logService';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

const SettingsView: React.FC<{ onBack: () => void; user: User }> = ({ onBack, user }) => {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [language, setLanguage] = useState("Bahasa Melayu (Malaysia)");
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Supabase & Firebase Integration States
  const [dbProvider, setDbProvider] = useState<'firebase' | 'supabase'>(
    (localStorage.getItem('DB_PROVIDER') as 'firebase' | 'supabase') || 'supabase'
  );
  const [supabaseUrl, setSupabaseUrl] = useState(localStorage.getItem('SUPABASE_URL') || '');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(localStorage.getItem('SUPABASE_ANON_KEY') || '');
  const [supabaseServiceRoleKey, setSupabaseServiceRoleKey] = useState(localStorage.getItem('SUPABASE_SERVICE_ROLE_KEY') || '');
  const [useServiceKey, setUseServiceKey] = useState(localStorage.getItem('SUPABASE_USE_SERVICE_KEY') !== 'false');
  
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
  const [connectionMessage, setConnectionMessage] = useState('');

  // MongoDB System Logging States
  const [mongoEnabled, setMongoEnabled] = useState(localStorage.getItem('MONGODB_LOGGING_ENABLED') !== 'false');
  const [mongoUri, setMongoUri] = useState(
    localStorage.getItem('MONGODB_URI') || 
    'mongodb+srv://arfan_admin:********@kitabuddy-cluster.gcp.mongodb.net/audit_db?retryWrites=true&w=majority'
  );
  const [mongoDbName, setMongoDbName] = useState(localStorage.getItem('MONGODB_DB_NAME') || 'kitabuddy_zero_trust');
  const [mongoCollection, setMongoCollection] = useState(localStorage.getItem('MONGODB_COLLECTION_NAME') || 'system_audit_logs');
  
  const [mongoTestStatus, setMongoTestStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
  const [mongoTestMessage, setMongoTestMessage] = useState('');

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      // Save DB configurations to localStorage first to let dbService use the chosen provider
      localStorage.setItem('DB_PROVIDER', dbProvider);
      localStorage.setItem('SUPABASE_URL', supabaseUrl.trim());
      localStorage.setItem('SUPABASE_ANON_KEY', supabaseAnonKey.trim());
      localStorage.setItem('SUPABASE_SERVICE_ROLE_KEY', supabaseServiceRoleKey.trim());
      localStorage.setItem('SUPABASE_USE_SERVICE_KEY', String(useServiceKey));

      // Save MongoDB Logging configurations
      localStorage.setItem('MONGODB_LOGGING_ENABLED', String(mongoEnabled));
      localStorage.setItem('MONGODB_URI', mongoUri.trim());
      localStorage.setItem('MONGODB_DB_NAME', mongoDbName.trim());
      localStorage.setItem('MONGODB_COLLECTION_NAME', mongoCollection.trim());

      // Save profile updates to current DB
      await dbService.updateUser(user.id, { name, email });

      // Log success to MongoDB system audit log
      await logService.addLog(
        'KEMASKINI_TETAPAN',
        user.email,
        `Pengguna '${user.email}' mengemaskini tetapan sistem IAM dan profil database.`,
        'Berjaya'
      );
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 4500);
    } catch (error: any) {
      console.error("Failed to save to database", error);
      setSaveError(error.message || String(error));

      // Log fail to MongoDB system audit log
      await logService.addLog(
        'KEMASKINI_TETAPAN',
        user.email,
        `Gagal menyimpan profil: ${error.message || String(error)}`,
        'Gagal'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestMongo = async () => {
    setMongoTestStatus('testing');
    const result = await logService.testConnection(mongoUri, mongoDbName, mongoCollection);
    setMongoTestStatus(result.success ? 'success' : 'failed');
    setMongoTestMessage(result.message);

    // Record the test event
    await logService.addLog(
      'MENGUJI_MONGODB',
      user.email,
      `Ujian penyambungan pemandu log MongoDB dilakukan untuk ${mongoDbName}.${mongoCollection}.`,
      result.success ? 'Berjaya' : 'Gagal'
    );
  };

  const handleTestConnection = async () => {
    if (!supabaseUrl.trim()) {
      setConnectionStatus('failed');
      setConnectionMessage('Sila masukkan URL Supabase anda terlebih dahulu.');
      return;
    }
    
    setConnectionStatus('testing');
    
    // Temporarily cache values for testing connection
    const oldProvider = localStorage.getItem('DB_PROVIDER');
    const oldUrl = localStorage.getItem('SUPABASE_URL');
    const oldKey = localStorage.getItem('SUPABASE_ANON_KEY');
    const oldServiceKey = localStorage.getItem('SUPABASE_SERVICE_ROLE_KEY');
    const oldUseService = localStorage.getItem('SUPABASE_USE_SERVICE_KEY');
    
    localStorage.setItem('DB_PROVIDER', 'supabase');
    localStorage.setItem('SUPABASE_URL', supabaseUrl.trim());
    localStorage.setItem('SUPABASE_ANON_KEY', supabaseAnonKey.trim());
    localStorage.setItem('SUPABASE_SERVICE_ROLE_KEY', supabaseServiceRoleKey.trim());
    localStorage.setItem('SUPABASE_USE_SERVICE_KEY', String(useServiceKey));
    
    try {
      const isOk = await dbService.checkConnection();
      if (isOk) {
        setConnectionStatus('success');
        setConnectionMessage('Ujian sambungan berjaya! Kredensial Supabase anda sah.');
      } else {
        setConnectionStatus('failed');
        setConnectionMessage('Gagal menyambung. Sila pastikan jadual "users" wujud di Supabase.');
      }
    } catch (err: any) {
      setConnectionStatus('failed');
      setConnectionMessage(`Ralat sambungan: ${err.message || 'Gagal menyambung.'}`);
    } finally {
      // Restore previous settings if not saved yet
      if (oldProvider) localStorage.setItem('DB_PROVIDER', oldProvider);
      else localStorage.removeItem('DB_PROVIDER');
      
      if (oldUrl) localStorage.setItem('SUPABASE_URL', oldUrl);
      else localStorage.removeItem('SUPABASE_URL');
      
      if (oldKey) localStorage.setItem('SUPABASE_ANON_KEY', oldKey);
      else localStorage.removeItem('SUPABASE_ANON_KEY');
      
      if (oldServiceKey) localStorage.setItem('SUPABASE_SERVICE_ROLE_KEY', oldServiceKey);
      else localStorage.removeItem('SUPABASE_SERVICE_ROLE_KEY');
      
      if (oldUseService) localStorage.setItem('SUPABASE_USE_SERVICE_KEY', oldUseService);
      else localStorage.removeItem('SUPABASE_USE_SERVICE_KEY');
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack} className="p-2 h-auto" disabled={isSaving}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Tetapan</h2>
            <p className="text-slate-500 text-sm">Konfigurasikan pilihan ruang kerja dan akaun anda.</p>
          </div>
        </div>
        {showSuccess && (
          <div className="flex items-center space-x-2 text-emerald-600 bg-emerald-50 px-4 py-2 border border-emerald-150 rounded-lg animate-slide-up self-start sm:self-center">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span className="text-sm font-semibold">Uapan keselamatan berjaya dikemaskini!</span>
          </div>
        )}
      </div>

      {saveError && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-900 rounded-xl p-5 text-sm space-y-3 leading-relaxed animate-slide-up shadow-sm">
          <div className="flex items-start gap-2.5">
            <span className="text-red-600 font-bold text-base">⚠️</span>
            <div>
              <p className="font-bold text-red-900">Gagal Mengemas Kini Rekod Pangkalan Data:</p>
              <p className="text-xs font-semibold text-red-750 mt-1">Kami cuba mendaftarkan profil/konfigurasi anda tetapi pangkalan data anda menolaknya dengan ralat:</p>
            </div>
          </div>
          <pre className="p-3 bg-white border border-red-100 rounded-lg font-mono text-xs text-red-800 overflow-x-auto whitespace-pre-wrap select-all">
            {saveError}
          </pre>
          {saveError.toLowerCase().includes('row-level security') && (
            <div className="text-xs space-y-1.5 border-t border-red-150/45 pt-3 text-red-850">
              <p className="font-bold text-slate-900 flex items-center gap-1.5">
                <span>💡 Cara Menyelesaikan Isu Row-Level Security (RLS) Supabase:</span>
              </p>
              <p>Sila salin perintah SQL di bawah dan jalankannya di dalam <strong>SQL Editor Supabase</strong> anda:</p>
              <pre className="p-2.5 bg-slate-900 text-slate-200 rounded-md font-mono text-[11px] overflow-x-auto select-all cursor-pointer" title="Klik untuk salin" onClick={(e) => {
                const range = document.createRange();
                range.selectNode(e.currentTarget);
                window.getSelection()?.removeAllRanges();
                window.getSelection()?.addRange(range);
              }}>
                {"ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;"}
              </pre>
              <p className="text-[10px] italic pt-1 text-slate-600">Tip: Jika anda mahu menyimpan polisi RLS aktif secara rasmi, sila bina polisi keselamatan yang membenarkan operasi baca/tulis bagi peranan anonim.</p>
            </div>
          )}
        </div>
      )}

      <div className="grid gap-6 bg-slate-50/20">
        {/* Pilihan Pangkalan Data (Supabase / Firebase) */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Database className="h-5 w-5 text-brand-600" />
              <div>
                <h3 className="font-semibold text-slate-900">Penyepaduan Pangkalan Data (Supabase & Firebase)</h3>
                <p className="text-xs text-slate-500 mt-0.5">Pilih dan konfigurasikan sambungan pangkalan data awan pilihan anda.</p>
              </div>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Penyedia Pangkalan Data Aktif</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setDbProvider('firebase')}
                  className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    dbProvider === 'firebase'
                      ? 'border-brand-500 ring-2 ring-brand-100 bg-brand-50/30'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <span className="font-bold text-sm text-slate-950">Firebase Firestore</span>
                  <span className="text-xs text-slate-500 mt-1">Menggunakan pangkalan data serverless terurus keselamatan tinggi yang sedia ada.</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDbProvider('supabase')}
                  className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    dbProvider === 'supabase'
                      ? 'border-brand-500 ring-2 ring-brand-100 bg-brand-50/30'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <span className="font-bold text-sm text-slate-950">Supabase (PostgreSQL)</span>
                  <span className="text-xs text-slate-500 mt-1">Sambung ke pangkalan data PostgreSQL berprestasi tinggi milik peribadi anda.</span>
                </button>
              </div>
            </div>

            {dbProvider === 'supabase' && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4 animate-slide-up">
                <h4 className="font-bold text-slate-850 text-xs uppercase tracking-wider">Konfigurasi Sambungan Supabase</h4>
                
                <div className="grid grid-cols-1 gap-4">
                  <Input 
                    label="Supabase URL (API Endpoint)" 
                    placeholder="https://your-project.supabase.co"
                    value={supabaseUrl} 
                    onChange={(e) => setSupabaseUrl(e.target.value)} 
                    disabled={isSaving}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input 
                      label="Supabase API Anon Key (Client Key)" 
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5..."
                      value={supabaseAnonKey} 
                      onChange={(e) => setSupabaseAnonKey(e.target.value)} 
                      disabled={isSaving}
                      type="password"
                    />
                    <Input 
                      label="Supabase Service Role Key (Bypass RLS)" 
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5..."
                      value={supabaseServiceRoleKey} 
                      onChange={(e) => setSupabaseServiceRoleKey(e.target.value)} 
                      disabled={isSaving}
                      type="password"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2 py-1 border-t border-slate-250/20 pt-3">
                  <input 
                    type="checkbox" 
                    id="use_service_key" 
                    checked={useServiceKey} 
                    onChange={(e) => setUseServiceKey(e.target.checked)} 
                    disabled={isSaving}
                    className="rounded text-brand-600 focus:ring-brand-500 h-4 w-4 border-slate-300 cursor-pointer"
                  />
                  <label htmlFor="use_service_key" className="text-xs font-semibold text-slate-705 cursor-pointer selection:bg-transparent">
                    Pintasi Polisi RLS (Bypass Row-Level Security) menggunakan Service Role Key (Disyorkan jika polisi RLS belum dikonfigurasikan)
                  </label>
                </div>

                <div className="bg-slate-100/70 p-4 rounded-lg border border-slate-200 text-xs font-sans space-y-2 text-slate-700 mt-4 leading-relaxed">
                  <p className="font-bold text-slate-900">💡 Panduan Persediaan SQL Supabase:</p>
                  <p>Sila tampal dan laksanakan kod SQL ini di dalam <strong>SQL Editor</strong> di papan pemuka Supabase anda untuk membina jadual <code>users</code> serta menetapkan kebenaran keselamatan:</p>
                  <pre className="p-3 bg-slate-900 text-slate-200 rounded-md font-mono text-[11px] overflow-x-auto select-all cursor-pointer leading-normal" title="Klik untuk pilih semua/Salin" onClick={(e) => {
                    const range = document.createRange();
                    range.selectNode(e.currentTarget);
                    window.getSelection()?.removeAllRanges();
                    window.getSelection()?.addRange(range);
                  }}>
{`-- 1. Bina jadual users jika belum wujud
create table if not exists public.users (
  id text primary key,
  name text not null,
  email text unique not null,
  password text,
  role text,
  department text,
  "lastActive" text,
  "ipAddress" text,
  status text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. PILIHAN A (Sangat Disyorkan): Lumpuhkan RLS demi memudahkan pembangunan setempat
alter table public.users disable row level security;

-- 3. PILIHAN B (Alternatif): Jika anda mahu mengekalkan RLS aktif, benarkan akses umum untuk table ini
-- alter table public.users enable row level security;
-- drop policy if exists "Allow public access" on public.users;
-- create policy "Allow public access" on public.users for all using (true) with check (true);`}
                  </pre>
                  <p className="text-[10px] text-slate-500 italic mt-1">Tip: Menjalankan "disable row level security" (Pilihan A) adalah cara terpantas untuk membina pangkalan data tanpa sebarang ralat polisi RLS.</p>
                </div>

                <div className="pt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between border-t border-slate-200/60 mt-4 gap-4">
                  <div className="text-xs flex items-center gap-2">
                    {connectionStatus === 'testing' && (
                      <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                        <span className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></span>
                        Menguji sambungan pangkalan data...
                      </span>
                    )}
                    {connectionStatus === 'success' && (
                      <span className="text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-150">
                        {connectionMessage}
                      </span>
                    )}
                    {connectionStatus === 'failed' && (
                      <span className="text-rose-700 font-bold bg-rose-50 px-2.5 py-1 rounded-md border border-rose-150">
                        {connectionMessage}
                      </span>
                    )}
                  </div>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleTestConnection}
                    disabled={connectionStatus === 'testing'}
                    className="h-8.5 text-xs font-semibold"
                  >
                    Uji Sambungan Supabase
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Pilihan Penyepaduan MongoDB Log Sistem */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Database className="h-5 w-5 text-emerald-600" />
              <div>
                <h3 className="font-semibold text-slate-900">Penyepaduan MongoDB Log Sistem</h3>
                <p className="text-xs text-slate-500 mt-0.5">Selaraskan setiap transaksi keselamatan IAM dan navigasi ke pangkalan data dokumen MongoDB secara masa nyata.</p>
              </div>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-sm text-slate-950 block">Status Pengaktifan Log</span>
                <span className="text-xs text-slate-500">Apabila diaktifkan, setiap pendaftaran, kemas kini, pertanyaan, dan tindakan data explorer akan dialirkan ke MongoDB Cluster anda.</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={mongoEnabled}
                  onChange={(e) => setMongoEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-350 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            {mongoEnabled && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4 animate-slide-up">
                <h4 className="font-bold text-slate-850 text-xs uppercase tracking-wider">Konfigurasi Sambungan MongoDB Atlas (Klien Terjamin)</h4>
                
                <div className="grid grid-cols-1 gap-4">
                  <Input 
                    label="MongoDB Connection URI" 
                    placeholder="mongodb+srv://username:password@cluster.mongodb.net/database"
                    value={mongoUri} 
                    onChange={(e) => setMongoUri(e.target.value)} 
                    disabled={isSaving}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input 
                      label="Nama Database (Database Name)" 
                      placeholder="kitabuddy_zero_trust"
                      value={mongoDbName} 
                      onChange={(e) => setMongoDbName(e.target.value)} 
                      disabled={isSaving}
                    />
                    <Input 
                      label="Nama Koleksi (Collection Name)" 
                      placeholder="system_audit_logs"
                      value={mongoCollection} 
                      onChange={(e) => setMongoCollection(e.target.value)} 
                      disabled={isSaving}
                    />
                  </div>
                </div>

                <div className="pt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between border-t border-slate-150/40 mt-4 gap-4">
                  <div className="text-xs flex items-center gap-2">
                    {mongoTestStatus === 'testing' && (
                      <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                        <span className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></span>
                        Menguji sambungan kluster MongoDB...
                      </span>
                    )}
                    {mongoTestStatus === 'success' && (
                      <span className="text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-150">
                        {mongoTestMessage}
                      </span>
                    )}
                    {mongoTestStatus === 'failed' && (
                      <span className="text-rose-700 font-bold bg-rose-50 px-2.5 py-1 rounded-md border border-rose-150">
                        {mongoTestMessage}
                      </span>
                    )}
                  </div>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleTestMongo}
                    disabled={mongoTestStatus === 'testing'}
                    className="h-8.5 text-xs font-semibold"
                  >
                    Uji Sambungan MongoDB
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center space-x-3">
            <UserIcon className="h-5 w-5 text-brand-600" />
            <h3 className="font-semibold text-slate-900">Profil Pengguna</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
             <Input 
               label="Nama Penuh" 
               value={name} 
               onChange={(e) => setName(e.target.value)} 
               disabled={isSaving}
             />
             <Input 
               label="Alamat Emel" 
               value={email} 
               onChange={(e) => setEmail(e.target.value)} 
               disabled={isSaving}
             />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center space-x-3">
            <Globe className="h-5 w-5 text-brand-600" />
            <h3 className="font-semibold text-slate-900">Bahasa & Wilayah</h3>
          </div>
          <div className="p-6 space-y-4">
             <div className="space-y-2 max-w-md">
                <Input 
                  label="Bahasa Pilihan" 
                  value={language} 
                  onChange={(e) => setLanguage(e.target.value)} 
                  disabled={isSaving}
                />
             </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center space-x-3">
            <Shield className="h-5 w-5 text-brand-600" />
            <h3 className="font-semibold text-slate-900">Keselamatan</h3>
          </div>
          <div className="p-6 flex justify-between items-center">
             <div>
               <p className="font-medium text-slate-900">Tukar Kata Laluan</p>
               <p className="text-sm text-slate-500">Kemas kini kata laluan anda secara berkala.</p>
             </div>
             <Button variant="outline" disabled={isSaving}>Kemas Kini</Button>
          </div>
        </div>

        <div className="flex justify-end pt-4 space-x-3">
          <Button variant="ghost" onClick={onBack} disabled={isSaving}>Batal</Button>
          <Button onClick={handleSave} isLoading={isSaving} className="min-w-[160px]">
            Simpan Perubahan
          </Button>
        </div>
      </div>
    </div>
  );
};

export const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [currentView, setCurrentView] = useState<'home' | 'settings' | 'explorer' | 'status' | 'logs'>('home');
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);

  const items = [
    { 
      title: 'Check Status', 
      desc: 'Lihat status sistem dan metrik prestasi masa nyata.', 
      color: 'bg-blue-50 text-blue-700',
      href: null,
      onClick: () => setCurrentView('status'),
      icon: Activity
    },
    { 
      title: 'Projek', 
      desc: 'Urus tugas pembangunan aktif anda.', 
      color: 'bg-indigo-50 text-indigo-700',
      href: null,
      onClick: () => setIsConnectModalOpen(true),
      icon: Folder
    },
    { 
      title: 'Data Explorer', 
      desc: 'Query dan urus data pengguna anda secara visual.', 
      color: 'bg-emerald-50 text-emerald-700',
      href: null,
      onClick: () => setCurrentView('explorer'),
      icon: Database
    },
    { 
      title: 'Tetapan', 
      desc: 'Konfigurasikan pilihan ruang kerja anda.', 
      color: 'bg-slate-50 text-slate-700',
      href: null,
      onClick: () => setCurrentView('settings'),
      icon: Settings
    },
    { 
      title: 'Log Audit MongoDB', 
      desc: 'Pemantauan BSON audit logs keselamatan sistem.', 
      color: 'bg-emerald-50 text-emerald-900 border border-emerald-100',
      href: null,
      onClick: () => setCurrentView('logs'),
      icon: Terminal
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setCurrentView('home')}>
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">KITABUDDY</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:block text-sm text-slate-500">
                Log masuk sebagai <span className="font-medium text-slate-900">{user.email}</span>
              </div>
              <Button variant="ghost" onClick={onLogout} className="text-sm">
                <LogOut className="h-4 w-4 mr-2" />
                Log keluar
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {currentView === 'home' ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in">
            <div className="p-8 md:p-12 text-center">
              <div className="inline-flex items-center justify-center p-2 bg-brand-50 rounded-full mb-6">
                <Sparkles className="h-6 w-6 text-brand-600 animate-pulse" />
              </div>
              
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4 max-w-5xl mx-auto leading-tight">
                Selamat Datang ke Pusat Capaian Tanpa Kepercayaan KitaBUDDY
              </h2>
              
              <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8">
                Sistem berkonsepkan kawalan data tempatan yang selamat dan lestari.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 max-w-7xl mx-auto mt-12">
                {items.map((item, i) => {
                  const CardContent = () => (
                    <>
                      <div className={`w-10 h-10 rounded-lg ${item.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                        <item.icon className="h-5 w-5" />
                      </div>
                      <h3 className="text-[17px] font-semibold text-slate-900 mb-2 truncate" title={item.title}>{item.title}</h3>
                      <p className="text-slate-500 text-sm line-clamp-2 md:line-clamp-3">{item.desc}</p>
                    </>
                  );

                  if (item.href) {
                    return (
                      <a
                        key={i}
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-5 rounded-xl border border-slate-100 hover:border-brand-200 hover:shadow-md transition-all cursor-pointer bg-white group block text-left"
                      >
                        <CardContent />
                      </a>
                    );
                  }

                  return (
                    <div 
                      key={i} 
                      onClick={item.onClick}
                      className="p-5 rounded-xl border border-slate-100 hover:border-brand-200 hover:shadow-md transition-all cursor-pointer bg-white group text-left"
                    >
                      <CardContent />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : currentView === 'settings' ? (
          <SettingsView onBack={() => setCurrentView('home')} user={user} />
        ) : currentView === 'status' ? (
          <StatusView onBack={() => setCurrentView('home')} />
        ) : currentView === 'logs' ? (
          <MongoLogsView onBack={() => setCurrentView('home')} userEmail={user.email} />
        ) : (
          <DataExplorer onBack={() => setCurrentView('home')} />
        )}
      </main>

      <ConnectModal 
        isOpen={isConnectModalOpen} 
        onClose={() => setIsConnectModalOpen(false)} 
      />
    </div>
  );
};