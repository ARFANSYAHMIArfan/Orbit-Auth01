import React, { useState, useEffect } from 'react';
import { useUser, useClerk } from '@clerk/clerk-react';
import { AuthForm } from './components/auth/AuthForm';
import { Dashboard } from './components/Dashboard';
import { User, AuthMode } from './types';
import { Sparkles, Shield, Key, AlertTriangle } from 'lucide-react';
import { dbService } from './services/dbService';
import { logService } from './services/logService';
import { SessionManager } from './components/SessionManager';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const cleanKey = PUBLISHABLE_KEY ? PUBLISHABLE_KEY.trim() : '';
const isLiveKey = cleanKey.startsWith('pk_live_');
const isProductionDomain = typeof window !== 'undefined' && (
  window.location.hostname === 'kitabuddy.dpdns.org' || 
  window.location.hostname.endsWith('.kitabuddy.dpdns.org')
);

// Hanya aktifkan modul Clerk jika ia adalah Test Key (di mana-mana sahaja)
// atau jika ia Live Key di domain produksi sah bagi mengelakkan ralat CORS Clerk JS.
const HAS_CLERK = !!(
  cleanKey.startsWith('pk_') && 
  (!isLiveKey || isProductionDomain)
);

// --- CLERK ENABLED MAIN CONTENT LAYER ---
const ClerkAppContent: React.FC = () => {
  const { isSignedIn, user: clerkUser, isLoaded } = useUser();
  const { signOut } = useClerk();
  const [appUser, setAppUser] = useState<User | null>(null);
  const [isSyncing, setIsSyncing] = useState(true);
  const [authMode, setAuthMode] = useState<AuthMode>('login');

  useEffect(() => {
    const syncClerkUser = async () => {
      if (!isLoaded) return;
      
      if (isSignedIn && clerkUser) {
        setIsSyncing(true);
        const email = clerkUser.primaryEmailAddress?.emailAddress || "saml.user@clerk.dev";
        const name = clerkUser.fullName || clerkUser.firstName || clerkUser.username || email.split('@')[0];
        const clerkId = clerkUser.id;

        try {
          // Cari profil pengguna yang selaras dalam sistem pangkalan data awan
          let existingUser = await dbService.findUser(email);
          if (!existingUser) {
            existingUser = await dbService.updateUser(clerkId, {
              name,
              email,
              role: 'Kakitangan',
              department: 'Sistem Kawalan Clerk',
              status: 'Aktif',
              lastActive: 'Masa Nyata',
              ipAddress: '10.240.10.' + Math.floor(Math.random() * 254 + 1)
            });
            await logService.addLog(
              'DAFTAR_PENGGUNA',
              email,
              `Pengguna baharu '${name}' didaftarkan secara automatik melalui Clerk SSO.`,
              'Berjaya'
            );
          } else {
            // Selaraskan maklumat terkini Clerk ke pangkalan data
            existingUser = await dbService.updateUser(existingUser.id, {
              name,
              email,
              lastActive: 'Masa Nyata'
            });
          }
          setAppUser(existingUser);
        } catch (error: any) {
          console.error("Gagal menyelaraskan rekod Clerk:", error);
          // Sandboxing fallback sekiranya Firestore lambat bertindak balas
          setAppUser({
            id: clerkId,
            name,
            email,
            role: 'Kakitangan',
            department: 'Sistem Kawalan Clerk',
            status: 'Aktif',
            lastActive: 'Masa Nyata',
            ipAddress: '127.0.0.1'
          });
        } finally {
          setIsSyncing(false);
        }
      } else {
        setAppUser(null);
        setIsSyncing(false);
      }
    };

    syncClerkUser();
  }, [isSignedIn, clerkUser, isLoaded]);

  const handleLogout = async () => {
    if (clerkUser) {
      await logService.addLog(
        'LOG_KELUAR',
        clerkUser.primaryEmailAddress?.emailAddress || 'clerk@user',
        `Pengguna log keluar dengan selamat dari portal via Clerk.`,
        'Berjaya'
      );
    }
    await signOut();
    setAppUser(null);
  };

  if (!isLoaded || isSyncing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-brand-50">
        <Shield className="h-12 w-12 text-brand-600 animate-bounce mb-4" />
        <p className="text-slate-600 font-medium animate-pulse">Menghubungkan Sesi Selamat Clerk...</p>
      </div>
    );
  }

  if (appUser) {
    return (
      <SessionManager onLogout={handleLogout}>
        <Dashboard user={appUser} onLogout={handleLogout} />
      </SessionManager>
    );
  }

  return (
    <div className="min-h-screen w-full flex bg-brand-50">
      {/* Left Column - Hero/Brand */}
      <div className="hidden lg:flex w-1/2 relative bg-brand-900 overflow-hidden text-white flex-col justify-between p-12">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-brand-900" />
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-brand-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-pulse" />
          <div className="absolute bottom-0 left-1/2 w-80 h-80 bg-brand-500 rounded-full mix-blend-multiply filter blur-[100px] opacity-30" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center space-x-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-brand-300" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">KITABUDDY: Zero Trust</span>
          </div>
        </div>

        <div className="relative z-10 max-w-lg">
          <blockquote className="text-4xl font-bold leading-tight mb-6 text-white">
            "Satu Platform. Akses Untuk Kita Semua"
          </blockquote>
          <div className="flex items-center space-x-2 text-brand-300 bg-white/5 border border-white/10 rounded-full px-4 py-2 w-fit">
            <Shield className="h-4 w-4" />
            <span className="text-sm font-medium">Sistem Kawalan SSO Clerk</span>
          </div>
        </div>
        
        <div className="relative z-10 text-[10px] text-slate-300 uppercase tracking-wider leading-relaxed opacity-70">
          <p>© 2025 HAK CIPTA TERPELIHARA SM SAINS MUZAFFAR SYAH</p>
          <p className="mt-1">DIBANGUNKAN OLEH: MUHAMMAD ARFAN</p>
        </div>
      </div>

      {/* Right Column - Clerk Unified Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative bg-brand-50">
        <div className="absolute top-6 left-6 lg:hidden flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">KITABUDDY</span>
        </div>
        
        <AuthForm 
          mode={authMode} 
          setMode={setAuthMode} 
          isClerkActive={true}
          onLogin={() => {}} 
        />
      </div>
    </div>
  );
};

// --- SANDBOX/FALLBACK STATE APP CONTENT ---
const SandboxAppContent: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [isConnecting, setIsConnecting] = useState(true);

  useEffect(() => {
    const initDb = async () => {
      await dbService.checkConnection();
      setIsConnecting(false);
    };
    initDb();
  }, []);

  const handleLogin = async (name: string, email: string) => {
    let existingUser = await dbService.findUser(email);
    if (!existingUser) {
      existingUser = await dbService.updateUser(Math.random().toString(36).substr(2, 9), {
        name,
        email,
        role: 'Kakitangan',
        department: 'Simulated Sandbox',
        status: 'Aktif',
        lastActive: 'Sesaat yang lalu'
      });
    }
    setUser(existingUser);
  };

  const handleLogout = () => {
    setUser(null);
    setAuthMode('login');
  };

  if (isConnecting) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-brand-50">
        <Shield className="h-12 w-12 text-brand-600 animate-bounce mb-4" />
        <p className="text-slate-600 font-medium animate-pulse">Memulakan Kawalan Akses Kitabuddy...</p>
      </div>
    );
  }

  if (user) {
    return (
      <SessionManager onLogout={handleLogout}>
        <Dashboard user={user} onLogout={handleLogout} />
      </SessionManager>
    );
  }

  return (
    <div className="min-h-screen w-full flex bg-brand-50 flex-col">
      {/* Informational Alert Header when Clerk publishable key is missing or we are in preview */}
      <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-3 text-center text-xs font-medium flex items-center justify-center gap-2">
        <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
        <span>
          {PUBLISHABLE_KEY && PUBLISHABLE_KEY.trim().startsWith('pk_live_') ? (
            <>
              <strong>⚠️ Pintu Gerbang SSO Clerk Dikesan (Live):</strong> Kunci pengeluaran (Production Key) anda dikesan berekreasi. Log masuk SSO Clerk rasmi aktif sepenuhnya di domain pengeluaran anda <a href="https://kitabuddy.dpdns.org" target="_blank" rel="noopener noreferrer" className="underline font-bold text-brand-700">kitabuddy.dpdns.org</a>. Di sini (pratonton AI Studio), sistem menggunakan <strong>Mod Sandbox Simulasi</strong> secara automatik untuk kelancaran ujian mendapat kebenaran tanpa ralat CORS Clerk.
            </>
          ) : (
            <>
              <strong>Clerk Belum Dikembangkan Sepenuhnya:</strong> Sila definesikan 
              <code className="mx-1 px-1.5 py-0.5 bg-amber-100 rounded border border-amber-300 font-mono text-[11px]">VITE_CLERK_PUBLISHABLE_KEY</code> 
              di menu Settings aplikasi untuk mengaktifkan log masuk SSO Clerk rasmi. Anda masih boleh menggunakan mod pembangun simulasi di bawah.
            </>
          )}
        </span>
      </div>

      <div className="flex-1 w-full flex">
        {/* Left Column - Hero/Brand */}
        <div className="hidden lg:flex w-1/2 relative bg-brand-900 overflow-hidden text-white flex-col justify-between p-12">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-brand-900" />
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-brand-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-pulse" />
            <div className="absolute bottom-0 left-1/2 w-80 h-80 bg-brand-500 rounded-full mix-blend-multiply filter blur-[100px] opacity-30" />
          </div>

          <div className="relative z-10">
            <div className="flex items-center space-x-2 mb-8">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-brand-300" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-white">KITABUDDY: Zero Trust</span>
            </div>
          </div>

          <div className="relative z-10 max-w-lg">
            <blockquote className="text-4xl font-bold leading-tight mb-6 text-white">
              "Satu Platform. Akses Untuk Kita Semua"
            </blockquote>
            <div className="flex items-center space-x-2 text-brand-300 bg-white/5 border border-white/10 rounded-full px-4 py-2 w-fit">
              <Shield className="h-4 w-4" />
              <span className="text-sm font-medium">Sistem Kawalan Zero Trust (Sandbox)</span>
            </div>
          </div>
          
          <div className="relative z-10 text-[10px] text-slate-300 uppercase tracking-wider leading-relaxed opacity-70">
            <p>© 2025 HAK CIPTA TERPELIHARA SM SAINS MUZAFFAR SYAH</p>
            <p className="mt-1">DIBANGUNKAN OLEH: MUHAMMAD ARFAN</p>
          </div>
        </div>

        {/* Right Column - Fallback Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative bg-brand-50">
          <div className="absolute top-6 left-6 lg:hidden flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">KITABUDDY</span>
          </div>
          
          <AuthForm 
            mode={authMode} 
            setMode={setAuthMode} 
            isClerkActive={false}
            onLogin={handleLogin} 
          />
        </div>
      </div>
    </div>
  );
};

// --- OUTER ROUTING ENGINE ---
const App: React.FC = () => {
  if (HAS_CLERK) {
    return <ClerkAppContent />;
  } else {
    return <SandboxAppContent />;
  }
};

export default App;