import React, { useState } from 'react';
import { User } from '../types';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { LogOut, Sparkles, Activity, Folder, Settings, ArrowLeft, User as UserIcon, Bell, Shield, Globe } from 'lucide-react';
import { ConnectModal } from './ConnectModal';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

const SettingsView: React.FC<{ onBack: () => void; user: User }> = ({ onBack, user }) => {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [language, setLanguage] = useState("Bahasa Melayu (Malaysia)");

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="mb-8 flex items-center space-x-4">
        <Button variant="ghost" onClick={onBack} className="p-2 h-auto">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Tetapan</h2>
          <p className="text-slate-500 text-sm">Konfigurasikan pilihan ruang kerja dan akaun anda.</p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Profile Section */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center space-x-3">
            <UserIcon className="h-5 w-5 text-brand-600" />
            <h3 className="font-semibold text-slate-900">Profil Pengguna</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
             <Input 
               label="Nama Penuh" 
               value={name} 
               onChange={(e) => setName(e.target.value)} 
             />
             <Input 
               label="Alamat Emel" 
               value={email} 
               onChange={(e) => setEmail(e.target.value)} 
             />
          </div>
        </div>

        {/* Preferences Section */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
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
                />
             </div>
          </div>
        </div>

        {/* Security Section */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center space-x-3">
            <Shield className="h-5 w-5 text-brand-600" />
            <h3 className="font-semibold text-slate-900">Keselamatan</h3>
          </div>
          <div className="p-6 flex justify-between items-center">
             <div>
               <p className="font-medium text-slate-900">Tukar Kata Laluan</p>
               <p className="text-sm text-slate-500">Kemas kini kata laluan anda secara berkala.</p>
             </div>
             <Button variant="outline">Kemas Kini</Button>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={onBack}>Simpan Perubahan</Button>
        </div>
      </div>
    </div>
  );
};

export const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [currentView, setCurrentView] = useState<'home' | 'settings'>('home');
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);

  const items = [
    { 
      title: 'Check Status', 
      desc: 'Lihat status sistem dan metrik prestasi masa nyata.', 
      color: 'bg-blue-50 text-blue-700',
      href: 'https://kitabuddy-orbit.betteruptime.com/',
      onClick: undefined,
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
      title: 'Tetapan', 
      desc: 'Konfigurasikan pilihan ruang kerja anda.', 
      color: 'bg-slate-50 text-slate-700',
      href: null,
      onClick: () => setCurrentView('settings'),
      icon: Settings
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
                Selamat Datang ke Pusat Capaian Tanpa Kepercayaan (Zero-Trust Network Platform) KitaBUDDY: Menjamin Keselamatan dan Akses Pengguna Berguna
              </h2>
              
              <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8">
                Fokus, capai, cemerlang. Jadikan hari ini luar biasa.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-12">
                {items.map((item, i) => {
                  const CardContent = () => (
                    <>
                      <div className={`w-10 h-10 rounded-lg ${item.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                        <item.icon className="h-5 w-5" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">{item.title}</h3>
                      <p className="text-slate-500 text-sm">{item.desc}</p>
                    </>
                  );

                  if (item.href) {
                    return (
                      <a
                        key={i}
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-6 rounded-xl border border-slate-100 hover:border-brand-200 hover:shadow-md transition-all cursor-pointer bg-white group block"
                      >
                        <CardContent />
                      </a>
                    );
                  }

                  return (
                    <div 
                      key={i} 
                      onClick={item.onClick}
                      className="p-6 rounded-xl border border-slate-100 hover:border-brand-200 hover:shadow-md transition-all cursor-pointer bg-white group"
                    >
                      <CardContent />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <SettingsView onBack={() => setCurrentView('home')} user={user} />
        )}
      </main>

      <ConnectModal 
        isOpen={isConnectModalOpen} 
        onClose={() => setIsConnectModalOpen(false)} 
      />
    </div>
  );
};