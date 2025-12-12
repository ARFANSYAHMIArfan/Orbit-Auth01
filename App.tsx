import React, { useState, useEffect } from 'react';
import { AuthForm } from './components/auth/AuthForm';
import { Dashboard } from './components/Dashboard';
import { User, AuthMode } from './types';
import { Sparkles } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authMode, setAuthMode] = useState<AuthMode>('login');

  useEffect(() => {
    // Send heartbeat signal when the app mounts
    const heartbeatUrl = 'https://uptime.betterstack.com/api/v1/heartbeat/wNsKizDoptBKLwbdP7DboYVY';
    fetch(heartbeatUrl).catch(err => {
      console.debug('Heartbeat failed:', err);
    });
  }, []);

  const handleLogin = (name: string, email: string) => {
    setUser({
      id: Math.random().toString(36).substr(2, 9),
      name,
      email,
    });
  };

  const handleLogout = () => {
    setUser(null);
    setAuthMode('login');
  };

  if (user) {
    return <Dashboard user={user} onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen w-full flex bg-slate-50">
      {/* Left Column - Hero/Brand */}
      <div className="hidden lg:flex w-1/2 relative bg-slate-900 overflow-hidden text-white flex-col justify-between p-12">
        {/* Background Effects */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://picsum.photos/1920/1080?grayscale&blur=2" 
            alt="Abstract Background" 
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-brand-900/90 via-slate-900/95 to-black/90 mix-blend-multiply" />
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-brand-500 rounded-full mix-blend-screen filter blur-[128px] opacity-40 animate-pulse" />
          <div className="absolute top-1/2 right-0 w-64 h-64 bg-purple-500 rounded-full mix-blend-screen filter blur-[96px] opacity-30" />
        </div>

        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-center space-x-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-brand-300" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">Orbit</span>
          </div>
        </div>

        <div className="relative z-10 max-w-lg">
          <blockquote className="text-2xl font-medium leading-relaxed mb-6 text-slate-100">
            "The future belongs to those who believe in the beauty of their dreams. Join us and build what's next."
          </blockquote>
          <div className="flex items-center space-x-4">
            <div className="flex -space-x-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-700 overflow-hidden">
                    <img src={`https://picsum.photos/50/50?random=${i}`} alt="User" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <p className="text-sm text-slate-400">Trusted by 10,000+ developers</p>
          </div>
        </div>
        
        <div className="relative z-10 text-xs text-slate-500">
          © 2024 Orbit Inc. All rights reserved.
        </div>
      </div>

      {/* Right Column - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        <div className="absolute top-6 left-6 lg:hidden flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">Orbit</span>
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