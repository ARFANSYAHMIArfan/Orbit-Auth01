import React, { useState, useEffect } from 'react';
import { AuthForm } from './components/auth/AuthForm';
import { Dashboard } from './components/Dashboard';
import { User, AuthMode } from './types';
import { Sparkles, Database } from 'lucide-react';
import { mongodbService } from './services/mongodbService';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [isConnecting, setIsConnecting] = useState(true);

  useEffect(() => {
    // Initial MongoDB Connection "Handshake"
    const initDb = async () => {
      await mongodbService.checkConnection();
      setIsConnecting(false);
    };
    initDb();
  }, []);

  const handleLogin = async (name: string, email: string) => {
    // Check if user exists in our "MongoDB"
    let existingUser = await mongodbService.findUser(email);
    
    if (!existingUser) {
      // Create new user record in MongoDB on first login
      existingUser = await mongodbService.updateUser(Math.random().toString(36).substr(2, 9), {
        name,
        email
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
        <Database className="h-12 w-12 text-brand-600 animate-bounce mb-4" />
        <p className="text-slate-600 font-medium animate-pulse">Menyambung ke MongoDB Atlas...</p>
      </div>
    );
  }

  if (user) {
    return <Dashboard user={user} onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen w-full flex bg-brand-50">
      {/* Left Column - Hero/Brand */}
      <div className="hidden lg:flex w-1/2 relative bg-brand-900 overflow-hidden text-white flex-col justify-between p-12">
        {/* Background Effects */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-brand-900" />
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-brand-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-pulse" />
          <div className="absolute top-1/2 right-0 w-64 h-64 bg-orange-200 rounded-full mix-blend-multiply filter blur-[96px] opacity-20" />
          <div className="absolute bottom-0 left-1/2 w-80 h-80 bg-brand-500 rounded-full mix-blend-multiply filter blur-[100px] opacity-30" />
        </div>

        {/* Content */}
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
            <Database className="h-4 w-4" />
            <span className="text-sm font-medium">MongoDB Integrated</span>
          </div>
        </div>
        
        <div className="relative z-10 text-[10px] text-slate-300 uppercase tracking-wider leading-relaxed opacity-70">
          <p>© 2025 HAK CIPTA TERPELIHARA SM SAINS MUZAFFAR SYAH</p>
          <p className="mt-1">DIBANGUNKAN OLEH: MUHAMMAD ARFAN</p>
        </div>
      </div>

      {/* Right Column - Auth Form */}
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
          onLogin={handleLogin} 
        />
      </div>
    </div>
  );
};

export default App;