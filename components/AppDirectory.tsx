import React, { useState, useEffect } from 'react';
import { 
  Search, BookOpen, Award, Clock, FileText, Key, Plus, Trash2, 
  ExternalLink, Globe, Lock, ShieldCheck, ShieldAlert, ArrowLeft,
  CheckCircle2, AlertTriangle, Sparkles, Filter, HelpCircle, Mail, UserCheck, Inbox, ThumbsUp, ThumbsDown
} from 'lucide-react';
import { User } from '../types';
import { Button } from './ui/Button';

interface AppDirectoryProps {
  onBack: () => void;
  user: User;
}

export interface AppItem {
  id: string;
  name: string;
  description: string;
  url: string;
  category: 'Akademik' | 'Hal Ehwal Pelajar' | 'Utiliti' | 'Sistem Pentadbiran' | 'Pendidikan';
  accessLevel: 'Semua' | 'Kakitangan' | 'Pentadbir';
  allowedEmails?: string[];
  status: 'Aktif' | 'Penyelenggaraan' | 'Ujian';
  iconName: 'BookOpen' | 'Award' | 'Clock' | 'FileText' | 'Key' | 'Globe';
}

export interface AppRequest {
  id: string;
  name: string;
  url: string;
  category: 'Akademik' | 'Hal Ehwal Pelajar' | 'Utiliti' | 'Sistem Pentadbiran' | 'Pendidikan';
  description: string;
  requesterEmail: string;
  status: 'Menunggu Kelulusan' | 'Diluluskan' | 'Ditolak';
  timestamp: string;
}

const DEFAULT_APPS: AppItem[] = [
  {
    id: 'app-safe',
    name: 'Sistem Laporan Buli (S.A.F.E)',
    description: 'Sistem pelaporan salah laku dan buli secara selamat, pantas dan sulit demi memelihara kebajikan serta keselamatan murid.',
    url: 'https://safe.kitabuddy.dpdns.org/',
    category: 'Utiliti',
    accessLevel: 'Semua',
    status: 'Aktif',
    iconName: 'Key',
    allowedEmails: []
  },
  {
    id: 'app-kitabuddy',
    name: 'Aplikasi KitaBUDDY',
    description: 'Aplikasi utama KitaBUDDY untuk rujukan pembelajaran digital bersepadu, perpustakaan pintar, dan interaksi pintar.',
    url: 'https://app.kitabuddy.dpdns.org/',
    category: 'Pendidikan',
    accessLevel: 'Semua',
    status: 'Aktif',
    iconName: 'BookOpen',
    allowedEmails: []
  }
];

export const AppDirectory: React.FC<AppDirectoryProps> = ({ onBack, user }) => {
  const [apps, setApps] = useState<AppItem[]>([]);
  const [requests, setRequests] = useState<AppRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  
  // App Creation Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [showRequestsPanel, setShowRequestsPanel] = useState(false);
  const [newAppName, setNewAppName] = useState('');
  const [newAppDesc, setNewAppDesc] = useState('');
  const [newAppUrl, setNewAppUrl] = useState('');
  const [newAppCategory, setNewAppCategory] = useState<AppItem['category']>('Education' as any === 'Pendidikan' ? 'Pendidikan' : 'Pendidikan');
  const [newAppAccess, setNewAppAccess] = useState<AppItem['accessLevel']>('Semua');
  const [newAppIcon, setNewAppIcon] = useState<AppItem['iconName']>('Globe');
  
  // Alert/Notification State
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
  // Whitelist management per app (expanded ID)
  const [expandedAppId, setExpandedAppId] = useState<string | null>(null);
  const [newEmail, setNewEmail] = useState('');

  // Simulated Launch State
  const [launchingApp, setLaunchingApp] = useState<AppItem | null>(null);
  const [launchProgress, setLaunchProgress] = useState(0);

  const adminEmail = 'rfnsyhmi.principal@gmail.com';
  const isAdmin = user.email.toLowerCase() === adminEmail.toLowerCase() || user.role === 'Admin';

  // Load state from localStorage on mount
  useEffect(() => {
    const savedApps = localStorage.getItem('kitabuddy_accessible_apps');
    if (savedApps) {
      try {
        setApps(JSON.parse(savedApps));
      } catch (e) {
        setApps(DEFAULT_APPS);
      }
    } else {
      setApps(DEFAULT_APPS);
      localStorage.setItem('kitabuddy_accessible_apps', JSON.stringify(DEFAULT_APPS));
    }

    const savedReqs = localStorage.getItem('kitabuddy_app_requests');
    if (savedReqs) {
      try {
        setRequests(JSON.parse(savedReqs));
      } catch (e) {
        setRequests([]);
      }
    }
  }, []);

  const saveApps = (updatedApps: AppItem[]) => {
    setApps(updatedApps);
    localStorage.setItem('kitabuddy_accessible_apps', JSON.stringify(updatedApps));
  };

  const saveRequests = (updatedReqs: AppRequest[]) => {
    setRequests(updatedReqs);
    localStorage.setItem('kitabuddy_app_requests', JSON.stringify(updatedReqs));
  };

  // Form submission: either adds directly (admin) or submits a request (others)
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppName.trim() || !newAppUrl.trim()) {
      showAlert('error', 'Nama aplikasi dan Pautan URL adalah wajib!');
      return;
    }

    let urlFormatted = newAppUrl.trim();
    if (!/^https?:\/\//i.test(urlFormatted)) {
      urlFormatted = 'https://' + urlFormatted;
    }

    if (isAdmin) {
      // Create and save application directly
      const newApp: AppItem = {
        id: Math.random().toString(36).substring(2, 9),
        name: newAppName.trim(),
        description: newAppDesc.trim() || 'Tiada huraian disediakan untuk aplikasi capaian ini.',
        url: urlFormatted,
        category: newAppCategory,
        accessLevel: newAppAccess,
        status: 'Aktif',
        iconName: newAppIcon,
        allowedEmails: []
      };

      const updated = [...apps, newApp];
      saveApps(updated);
      showAlert('success', `Aplikasi '${newApp.name}' berjaya ditambah terus oleh Pentadbir!`);
    } else {
      // Create request for approval
      const newRequest: AppRequest = {
        id: Math.random().toString(36).substring(2, 9),
        name: newAppName.trim(),
        url: urlFormatted,
        category: newAppCategory,
        description: newAppDesc.trim() || 'Permohonan capaian aplikasi ke kabin KitaBUDDY.',
        requesterEmail: user.email,
        status: 'Menunggu Kelulusan',
        timestamp: new Date().toLocaleDateString('ms-MY', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
      };

      const updated = [...requests, newRequest];
      saveRequests(updated);
      showAlert('success', `Permohonan bagi '${newRequest.name}' telah dihantar kepada Pentadbir untuk diluluskan!`);
    }
    
    // Reset Form
    setNewAppName('');
    setNewAppDesc('');
    setNewAppUrl('');
    setNewAppCategory('Pendidikan');
    setNewAppAccess('Semua');
    setNewAppIcon('Globe');
    setShowAddForm(false);
  };

  // Admin approves request
  const handleApproveRequest = (req: AppRequest) => {
    const updatedRequests = requests.map(r => r.id === req.id ? { ...r, status: 'Diluluskan' as const } : r);
    saveRequests(updatedRequests);

    // Map appropriate iconName based on category
    let iconName: AppItem['iconName'] = 'Globe';
    if (req.category === 'Pendidikan' || req.category === 'Akademik') iconName = 'BookOpen';
    else if (req.category === 'Utiliti') iconName = 'Key';
    else if (req.category === 'Sistem Pentadbiran') iconName = 'Clock';
    else if (req.category === 'Hal Ehwal Pelajar') iconName = 'Award';

    const newApp: AppItem = {
      id: req.id,
      name: req.name,
      description: req.description,
      url: req.url,
      category: req.category,
      accessLevel: 'Semua',
      status: 'Aktif',
      iconName,
      allowedEmails: []
    };

    const updatedApps = [...apps, newApp];
    saveApps(updatedApps);
    showAlert('success', `Permohonan '${req.name}' berjaya diluluskan dan dimasukkan ke Direktori Utama!`);
  };

  // Admin rejects request
  const handleRejectRequest = (reqId: string) => {
    const updatedRequests = requests.map(r => r.id === reqId ? { ...r, status: 'Ditolak' as const } : r);
    saveRequests(updatedRequests);
    showAlert('error', 'Permohonan telah ditolak.');
  };

  const handleDeleteApp = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAdmin) {
      showAlert('error', 'Hanya Pentadbir sah sahaja yang dibenarkan memadam aplikasi.');
      return;
    }
    const toDelete = apps.find(a => a.id === id);
    const updated = apps.filter(a => a.id !== id);
    saveApps(updated);
    if (expandedAppId === id) setExpandedAppId(null);
    if (toDelete) {
      showAlert('success', `Aplikasi '${toDelete.name}' berjaya dipadam.`);
    }
  };

  const handleAddEmailWhitelist = (appId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim() || !newEmail.includes('@')) {
      showAlert('error', 'Sila masukkan format alamat e-mel yang sah.');
      return;
    }

    const emailToRegister = newEmail.trim().toLowerCase();

    const updated = apps.map(app => {
      if (app.id === appId) {
        const currentWhitelist = app.allowedEmails || [];
        if (currentWhitelist.includes(emailToRegister)) {
          return app;
        }
        return {
          ...app,
          allowedEmails: [...currentWhitelist, emailToRegister]
        };
      }
      return app;
    });

    saveApps(updated);
    setNewEmail('');
    showAlert('success', `E-mel ${emailToRegister} telah ditambahkan ke senarai pelepasan khas.`);
  };

  const handleRemoveEmailWhitelist = (appId: string, email: string) => {
    const updated = apps.map(app => {
      if (app.id === appId) {
        return {
          ...app,
          allowedEmails: (app.allowedEmails || []).filter(e => e !== email)
        };
      }
      return app;
    });
    saveApps(updated);
    showAlert('success', 'E-mel berjaya dipadam daripada senarai pelepasan.');
  };

  const checkHasAccess = (app: AppItem): boolean => {
    if (app.allowedEmails && app.allowedEmails.includes(user.email.toLowerCase())) {
      return true;
    }

    const role = user.role || 'Guru/Murid';

    if (app.accessLevel === 'Semua') {
      return true;
    }

    if (app.accessLevel === 'Kakitangan') {
      return (
        role === 'Kakitangan' || 
        role === 'Pentadbir' || 
        role === 'CISO' || 
        role === 'Developer' || 
        role === 'Admin' || 
        role === 'Guru/Murid' || 
        role === 'Guru'
      );
    }

    if (app.accessLevel === 'Pentadbir') {
      return (
        role === 'Pentadbir' || 
        role === 'CISO' || 
        role === 'Developer' || 
        role === 'Admin' || 
        isAdmin
      );
    }

    return false;
  };

  const showAlert = (type: 'success' | 'error', message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 4500);
  };

  const handleLaunchApp = (app: AppItem) => {
    if (!checkHasAccess(app)) {
      showAlert('error', `Akses Ditolak! Anda tidak mempunyai hak capaian untuk '${app.name}'.`);
      return;
    }

    setLaunchingApp(app);
    setLaunchProgress(0);

    const interval = setInterval(() => {
      setLaunchProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            window.open(app.url, '_blank', 'noreferrer,noopener');
            setLaunchingApp(null);
          }, 600);
          return 100;
        }
        return prev + 20;
      });
    }, 150);
  };

  const renderIcon = (name: string, className: string) => {
    switch (name) {
      case 'BookOpen': return <BookOpen className={className} />;
      case 'Award': return <Award className={className} />;
      case 'Clock': return <Clock className={className} />;
      case 'FileText': return <FileText className={className} />;
      case 'Key': return <Key className={className} />;
      default: return <Globe className={className} />;
    }
  };

  // Filter apps
  const filteredApps = apps.filter(app => {
    const matchesSearch = 
      app.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      app.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
      app.url.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'Semua' || app.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const categories = ['Semua', 'Pendidikan', 'Utiliti', 'Akademik', 'Hal Ehwal Pelajar', 'Sistem Pentadbiran'];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-12">
      {/* Simulation Overlay Modal for Launching */}
      {launchingApp && (
        <div id="launch-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center space-y-6 shadow-2xl border border-slate-100 animate-scale-up">
            <div className="relative inline-flex items-center justify-center p-5 bg-brand-50 rounded-full text-brand-600 animate-spin">
              <Sparkles className="h-10 w-10 text-brand-600" />
            </div>
            
            <div className="space-y-2">
              <h3 className="font-bold text-slate-950 text-lg">Pihak Berkuasa Zero Trust Mengesahkan...</h3>
              <p className="text-slate-500 text-sm">Menghubungkan token SSO anda ke pangkalan data <span className="font-semibold text-brand-700">{launchingApp.name}</span> secara selamat.</p>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-slate-400">
                <span>MEMASANG PINTU GERBANG</span>
                <span>{launchProgress}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
                <div 
                  className="bg-brand-600 h-full transition-all duration-300" 
                  style={{ width: `${launchProgress}%` }}
                ></div>
              </div>
            </div>

            <div className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">
              SESI DISAHKAN SEBAGAI: {user.email} (IP: {user.ipAddress || 'Masa Nyata'})
            </div>
          </div>
        </div>
      )}

      {/* Header Block */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack} className="p-2 h-auto text-slate-600 hover:bg-slate-100 rounded-full" id="back-to-home">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Pustaka & Direktori Aplikasi</h2>
              <span className="bg-brand-100 text-brand-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Masa Nyata
              </span>
            </div>
            <p className="text-slate-500 text-sm mt-0.5">Katalog pautan rasmi aplikasi KitaBUDDY bersepadu dengan perlindungan identiti digital.</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              setShowRequestsPanel(!showRequestsPanel);
              setShowAddForm(false);
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold border flex items-center gap-2 shadow-xs transition-all ${
              showRequestsPanel 
                ? 'bg-slate-900 text-white border-slate-900' 
                : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
            }`}
          >
            <Inbox className="h-4 w-4" />
            {isAdmin ? `Senarai Permohonan (${requests.filter(r => r.status === 'Menunggu Kelulusan').length})` : 'Senarai Permohonan Saya'}
          </button>

          <Button 
            onClick={() => {
              setShowAddForm(!showAddForm);
              setShowRequestsPanel(false);
            }} 
            className="bg-brand-700 hover:bg-brand-850 text-white text-xs font-bold flex items-center gap-1.5 py-2.5 rounded-xl shadow-xs"
            id="toggle-add-app-btn"
          >
            <Plus className="h-4 w-4" />
            {showAddForm ? 'Kembali' : isAdmin ? 'Tambah Aplikasi Baru' : 'Mohon Tambah Aplikasi'}
          </Button>
        </div>
      </div>

      {/* Notification Banner */}
      {alert && (
        <div className={`p-4 rounded-xl border flex items-center gap-3 text-sm animate-slide-up shadow-sm ${
          alert.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
            : 'bg-red-50 border-red-200 text-red-900'
        }`}>
          {alert.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
          )}
          <span className="font-medium">{alert.message}</span>
        </div>
      )}

      {/* Dynamic App Adding / Request Request Form */}
      {showAddForm && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 animate-slide-down space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-950 text-base flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-brand-600 animate-pulse" />
              {isAdmin ? 'Daftarkan Pautan Aplikasi Baru (Pentadbir)' : 'Mohon Pendaftaran Aplikasi / Portal Baru'}
            </h3>
            <p className="text-xs text-slate-500">
              {isAdmin 
                ? 'Sebagai pentadbir berdaftar, anda boleh mendaftarkan pautan aplikasi terus ke direktori utama.' 
                : 'Muat naik cadangan sistem sekolah atau pautan digital. Permohonan akan dihantar kepada rfnsyhmi.principal@gmail.com.'}
            </p>
          </div>

          <form onSubmit={handleSubmitForm} className="grid grid-cols-1 md:grid-cols-12 gap-5 text-sm">
            <div className="md:col-span-6 space-y-1.5">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Nama Aplikasi</label>
              <input
                type="text"
                required
                placeholder="cth: Sistem Laporan Buli (S.A.F.E)"
                value={newAppName}
                onChange={(e) => setNewAppName(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 font-medium"
              />
            </div>

            <div className="md:col-span-6 space-y-1.5">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Pautan Web URL (Target URL)</label>
              <input
                type="text"
                required
                placeholder="cth: safe.kitabuddy.dpdns.org"
                value={newAppUrl}
                onChange={(e) => setNewAppUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 font-medium font-mono"
              />
            </div>

            <div className="md:col-span-12 space-y-1.5">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Deskripsi Aplikasi</label>
              <textarea
                placeholder="Padankan ringkasan ringkas fungsi sistem ini kepada pengguna agar mudah difahami..."
                value={newAppDesc}
                onChange={(e) => setNewAppDesc(e.target.value)}
                rows={2}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 font-medium"
              />
            </div>

            <div className="md:col-span-4 space-y-1.5">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Kategori Aplikasi</label>
              <select
                value={newAppCategory}
                onChange={(e) => setNewAppCategory(e.target.value as any)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 font-semibold text-slate-705 cursor-pointer bg-slate-50"
              >
                <option value="Pendidikan">Pendidikan</option>
                <option value="Utiliti">Utiliti</option>
                <option value="Akademik">Akademik</option>
                <option value="Hal Ehwal Pelajar">Hal Ehwal Pelajar</option>
                <option value="Sistem Pentadbiran">Sistem Pentadbiran</option>
              </select>
            </div>

            {isAdmin && (
              <>
                <div className="md:col-span-4 space-y-1.5">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Zon Tahap Akses Minimum</label>
                  <select
                    value={newAppAccess}
                    onChange={(e) => setNewAppAccess(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 font-semibold text-slate-705 cursor-pointer bg-slate-50"
                  >
                    <option value="Semua">Semua Pengguna (Awam)</option>
                    <option value="Kakitangan">Kakitangan Sekolah & Guru</option>
                    <option value="Pentadbir">Pentadbir Portal & CISO</option>
                  </select>
                </div>

                <div className="md:col-span-4 space-y-1.5">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Ikon Standard Card</label>
                  <select
                    value={newAppIcon}
                    onChange={(e) => setNewAppIcon(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 font-semibold text-slate-705 cursor-pointer bg-slate-50"
                  >
                    <option value="BookOpen">Buku (Pendidikan/Akademik)</option>
                    <option value="Key">Kunci (Keselamatan/Log)</option>
                    <option value="Award">Anugerah (Disiplin/Sukan)</option>
                    <option value="Clock">Jam (Kehadiran/Masa)</option>
                    <option value="FileText">Fail (Ujian/Keputusan)</option>
                    <option value="Globe">Dunia (Pautan Umum)</option>
                  </select>
                </div>
              </>
            )}

            <div className="md:col-span-12 flex justify-end gap-2 pt-3">
              <Button type="button" variant="ghost" onClick={() => setShowAddForm(false)}>Batal</Button>
              <Button type="submit" className="bg-brand-900 border-none px-6 text-white text-xs font-bold">
                {isAdmin ? 'Tambah Terus' : 'Hantar Permohonan Kelulusan'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Requests Management / Status Sub-panel */}
      {showRequestsPanel && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6 animate-fade-in">
          <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Inbox className="h-5 w-5 text-brand-650" />
                {isAdmin ? 'Pengurusan Permohonan Integrasi Aplikasi' : 'Status Permohonan Cadangan Anda'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {isAdmin 
                  ? 'Kakitangan dan murid sedia menghantar permohonan pautan internet luaran atau dalaman bagi penambahan pustaka digital.' 
                  : 'Semak fasa kelulusan pendaftaran sistem yang telah anda mohon sebelum masuk ke direktori utama.'}
              </p>
            </div>
          </div>

          {/* Request List */}
          {requests.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs italic">
              Tiada permohonan direkodkan pada masa ini.
            </div>
          ) : (
            <div className="space-y-4">
              {requests
                .filter(r => isAdmin ? true : r.requesterEmail.toLowerCase() === user.email.toLowerCase())
                .map((req) => (
                  <div key={req.id} className="border border-slate-100 rounded-xl p-4 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs font-medium">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 text-sm">{req.name}</span>
                        <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded text-[10px] uppercase font-bold">
                          {req.category}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          req.status === 'Menunggu Kelulusan' ? 'bg-amber-100 text-amber-800' :
                          req.status === 'Diluluskan' ? 'bg-emerald-105 bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'
                        }`}>
                          {req.status}
                        </span>
                      </div>
                      <p className="text-slate-500 font-mono text-[11px] truncate max-w-md">{req.url}</p>
                      <p className="text-slate-600 italic">"{req.description}"</p>
                      <div className="text-[10px] text-slate-400">
                        Dipohon oleh: <span className="font-bold">{req.requesterEmail}</span> pada {req.timestamp}
                      </div>
                    </div>

                    {/* Admin Actions */}
                    {isAdmin && req.status === 'Menunggu Kelulusan' && (
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleApproveRequest(req)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 px-3 rounded-lg flex items-center gap-1"
                        >
                          <ThumbsUp className="h-3 w-3" />
                          Luluskan
                        </button>
                        <button
                          onClick={() => handleRejectRequest(req.id)}
                          className="bg-red-550 hover:bg-red-650 text-white font-bold py-1.5 px-3 rounded-lg flex items-center gap-1"
                        >
                          <ThumbsDown className="h-3 w-3" />
                          Tolak
                        </button>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Main Panel Box */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        
        {/* Verification Info Bar */}
        <div className="bg-indigo-50/50 p-5 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
              <UserCheck className="h-5 w-5 text-indigo-700" />
            </div>
            <div>
              <p className="font-bold text-slate-900 text-[13px] leading-tight flex items-center gap-1.5">
                Pengguna Sesi: {user.name} {isAdmin && <span className="bg-red-100 text-red-800 text-[9px] px-1.5 py-0.2 rounded font-extrabold uppercase ml-1">PENTADBIR</span>}
              </p>
              <p className="text-slate-500 text-xs mt-0.5">
                Emel: <span className="font-semibold text-slate-700">{user.email}</span> | Peranan: <span className="font-semibold text-slate-700">{user.role || (isAdmin ? 'Admin Portal Utama' : 'Pelajar / Awam')}</span>
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 text-xs font-medium text-emerald-800 bg-white border border-emerald-150 px-3.5 py-1.5 rounded-full shadow-xs">
            <ShieldCheck className="h-4 w-4 text-emerald-600 animate-pulse" />
            <span>Kebenaran IAM Zero-Trust Disahkan</span>
          </div>
        </div>

        {/* Filter and Search Actions */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/20 flex flex-col md:flex-row gap-4 justify-between items-stretch">
          
          {/* Search */}
          <div className="relative group flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-brand-600 transition-colors" />
            <input
              type="text"
              placeholder="Cari aplikasi atau pautan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 text-sm font-medium transition-all"
            />
          </div>

          {/* Category Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1.5 md:pb-0">
            <div className="flex items-center text-xs text-slate-400 font-bold uppercase gap-1 shrink-0 mr-1">
              <Filter className="h-3 w-3" />
              <span>Saring:</span>
            </div>
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all shrink-0 ${
                    isSelected 
                      ? 'bg-brand-900 border-none text-white shadow-xs' 
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* App list Grid */}
        <div className="p-6 bg-slate-50/20">
          {filteredApps.length === 0 ? (
            <div className="text-center py-16 bg-white border border-dashed border-slate-200 rounded-2xl max-w-xl mx-auto space-y-4">
              <HelpCircle className="h-10 w-10 text-slate-350 mx-auto animate-bounce" />
              <div>
                <p className="font-bold text-slate-800 text-sm">Tiada Aplikasi Ditemui</p>
                <p className="text-slate-500 text-xs max-w-xs mx-auto mt-1">Cuba bersihkan kotak carian atau pilih kategori yang lain.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="app-cards-grid">
              {filteredApps.map((app) => {
                const hasAccess = checkHasAccess(app);
                const isExpanded = expandedAppId === app.id;
                const hasEmails = app.allowedEmails && app.allowedEmails.length > 0;

                return (
                  <div 
                    key={app.id}
                    className={`bg-white border text-left rounded-2xl overflow-hidden transition-all duration-300 flex flex-col justify-between ${
                      hasAccess 
                        ? 'border-slate-200/80 hover:border-brand-300 hover:shadow-md' 
                        : 'border-slate-100 bg-slate-50/50 opacity-80'
                    }`}
                  >
                    <div className="p-5 space-y-4 flex-1">
                      {/* Top Badges and Actions */}
                      <div className="flex items-center justify-between">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${
                          app.category === 'Pendidikan' ? 'bg-violet-50 text-violet-750' :
                          app.category === 'Utiliti' ? 'bg-emerald-50 text-emerald-750' :
                          app.category === 'Akademik' ? 'bg-sky-50 text-sky-750' :
                          app.category === 'Hal Ehwal Pelajar' ? 'bg-amber-50 text-amber-750' :
                          'bg-indigo-50 text-indigo-750'
                        }`}>
                          {app.category}
                        </span>

                        <div className="flex items-center gap-1.5">
                          {/* Access Level Tag */}
                          <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                            app.accessLevel === 'Pentadbir' ? 'bg-red-50 text-red-750 border border-red-100' :
                            app.accessLevel === 'Kakitangan' ? 'bg-indigo-50 text-indigo-750 border border-indigo-100' :
                            'bg-emerald-50 text-emerald-750 border border-emerald-100'
                          }`}>
                            {app.accessLevel === 'Pentadbir' ? <Lock className="h-2.5 w-2.5" /> : <Globe className="h-2.5 w-2.5" />}
                            {app.accessLevel === 'Semua' ? 'Akses Terbuka' : `${app.accessLevel} Sahaja`}
                          </span>

                          {/* Delete Action Button for Admin only */}
                          {isAdmin && (
                            <button
                              onClick={(e) => handleDeleteApp(app.id, e)}
                              className="p-1 hover:bg-red-50 text-slate-350 hover:text-red-600 rounded-lg transition-colors ml-1.5"
                              title="Padam Aplikasi"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Icon & Title block */}
                      <div className="flex items-start gap-3.5 pt-1">
                        <div className={`p-3 rounded-xl shrink-0 ${
                          hasAccess 
                            ? 'bg-brand-50 text-brand-750' 
                            : 'bg-slate-200 text-slate-500'
                        }`}>
                          {renderIcon(app.iconName, 'h-6 w-6')}
                        </div>
                        
                        <div>
                          <h3 className="font-bold text-slate-900 group-hover:text-brand-700 text-base flex items-center gap-1.5 line-clamp-1">
                            {app.name}
                            {!hasAccess && <Lock className="h-4 w-4 text-red-500 shrink-0" />}
                          </h3>
                          <p className="text-slate-450 text-[11px] font-medium font-mono truncate max-w-[280px]" title={app.url}>
                            {app.url}
                          </p>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-slate-600 text-xs leading-relaxed line-clamp-3">
                        {app.description}
                      </p>
                    </div>

                    {/* Bottom Actions and Launch section */}
                    <div className="border-t border-slate-100 p-4 bg-slate-50/30 flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        
                        {/* Whitelist Settings Trigger (Disabled/hidden for non-administrators or customized) */}
                        {isAdmin ? (
                          <button
                            type="button"
                            onClick={() => setExpandedAppId(isExpanded ? null : app.id)}
                            className="text-xs font-bold text-brand-750 hover:underline flex items-center gap-1 text-left"
                          >
                            <Mail className="h-3.5 w-3.5 text-brand-600" />
                            {hasEmails ? `${app.allowedEmails?.length} Pelepasan` : 'Konfigurasi Hak Khusus'}
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-mono uppercase">
                            IP: Disulitkan dengan SAML
                          </span>
                        )}

                        {/* Status tag */}
                        <span className={`text-[10px] font-bold px-2 py-0.2 rounded-md ${
                          app.status === 'Aktif' ? 'bg-emerald-50 text-emerald-800' :
                          app.status === 'Ujian' ? 'bg-amber-50 text-amber-800' : 'bg-red-50 text-red-850'
                        }`}>
                          {app.status}
                        </span>
                      </div>

                      {/* Launch Button */}
                      {hasAccess ? (
                        <button
                          onClick={() => handleLaunchApp(app)}
                          className="w-full flex items-center justify-center gap-1.5 bg-brand-900 hover:bg-brand-850 text-white font-bold py-2 rounded-xl text-xs transition-colors shadow-xs"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          Buka Capaian Aplikasi
                        </button>
                      ) : (
                        <div className="flex flex-col gap-2">
                          <button
                            disabled
                            className="w-full flex items-center justify-center gap-1.5 bg-slate-100 text-slate-400 font-bold py-2 rounded-xl text-xs cursor-not-allowed border border-slate-200"
                          >
                            <ShieldAlert className="h-3.5 w-3.5 text-red-500" />
                            Capaian Disekat: Zero Trust
                          </button>
                          <p className="text-[10px] text-red-500 italic text-center leading-normal">
                            Sila hubungi Pentadbir Sekolah untuk mendaftar emel pelepasan anda bagi sistem ini.
                          </p>
                        </div>
                      )}

                      {/* Whitelist Panel (Only shown to Administrator) */}
                      {isAdmin && isExpanded && (
                        <div className="border-t border-slate-200 pt-3 mt-1 space-y-3 animate-fade-in text-xs">
                          <div className="bg-white p-3 rounded-lg border border-slate-150 space-y-2">
                            <span className="font-bold text-slate-700 block">Pelepasan E-mel Tersuai (Whitelist)</span>
                            <p className="text-[10px] text-slate-400 leading-normal">Benarkan e-mel guru/pelajar khusus ini melangkau zon sekatan kebenaran untuk membuka aplikasi ini secara eksklusif.</p>
                            
                            {/* Tags list */}
                            {hasEmails ? (
                              <div className="flex flex-wrap gap-1.5 max-h-[80px] overflow-y-auto bg-slate-50 p-2 rounded border border-slate-100">
                                {app.allowedEmails?.map(em => (
                                  <span key={em} className="inline-flex items-center gap-1 bg-brand-50 border border-brand-150 text-brand-800 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                                    {em}
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveEmailWhitelist(app.id, em)}
                                      className="text-brand-400 hover:text-red-500 rounded"
                                    >
                                      &times;
                                    </button>
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <p className="text-[10px] text-slate-550 italic">Tiada emel berdaftar. Polisi asal dikekalkan.</p>
                            )}

                            {/* Add email target form */}
                            <form onSubmit={(e) => handleAddEmailWhitelist(app.id, e)} className="flex gap-1.5 pt-1">
                              <input
                                type="email"
                                required
                                placeholder="cth: amirullah@moe-dl.edu.my"
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                className="flex-1 px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-slate-50 focus:bg-white focus:outline-none"
                              />
                              <button
                                type="submit"
                                className="px-3 py-1.5 bg-brand-900 border-none text-white text-[11px] font-bold rounded-lg shrink-0"
                              >
                                Benarkan
                              </button>
                            </form>
                          </div>
                        </div>
                      )}

                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
