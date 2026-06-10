import React, { useState, useEffect } from 'react';
import { 
  Search, Plus, Edit2, Trash2, ChevronRight, FileJson, Info, 
  User as UserIcon, Mail, Lock, Eye, EyeOff, Shield, ShieldCheck, CheckCircle
} from 'lucide-react';
import { Button } from './ui/Button';
import { dbService, getDbProvider } from '../services/dbService';

interface DataExplorerProps {
  onBack: () => void;
}

export const DataExplorer: React.FC<DataExplorerProps> = ({ onBack }) => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [query, setQuery] = useState('{}');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Documents');
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

  // Modals status
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Kakitangan');
  const [department, setDepartment] = useState('Sistem Kawalan IAM');
  const [generatedId, setGeneratedId] = useState('');

  const fetchDocs = async () => {
    setIsLoading(true);
    const docs = await dbService.queryDocuments(query);
    setDocuments(docs);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleFind = () => {
    setSelectedDocId(null);
    fetchDocs();
  };

  const handleReset = () => {
    setQuery('{}');
    setSelectedDocId(null);
    setTimeout(fetchDocs, 10);
  };

  // Open Add Dialog
  const openAddModal = () => {
    // Generate randomized unique user ID automatically
    const randId = 'u_usr_' + Math.random().toString(36).substring(2, 8);
    setGeneratedId(randId);
    setName('');
    setEmail('');
    setPassword('');
    setRole('Kakitangan');
    setDepartment('Sistem Kawalan IAM');
    setShowPassword(false);
    setIsAddModalOpen(true);
  };

  // Submit Add User
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) return;

    setIsLoading(true);
    setIsAddModalOpen(false);

    // Dynamic configuration for security simulation
    const randomIp = `10.240.10.${Math.floor(Math.random() * 254) + 1}`;

    await dbService.updateUser(generatedId, {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: password,
      role: role,
      department: department,
      lastActive: 'Sesaat yang lalu',
      ipAddress: randomIp,
      status: 'Aktif'
    });

    setActionSuccess('Pengguna baru berjaya ditambahkan ke dalam direktori pangkalan data.');
    setTimeout(() => setActionSuccess(null), 4000);

    setQuery('{}'); // reset filter query to show all including the new user
    await fetchDocs();
  };

  // Open Edit Dialog
  const openEditModal = () => {
    if (!selectedDocId) return;
    const docToEdit = documents.find(d => d.id === selectedDocId);
    if (!docToEdit) return;

    setGeneratedId(docToEdit.id);
    setName(docToEdit.name || '');
    setEmail(docToEdit.email || '');
    setPassword(docToEdit.password || '');
    setRole(docToEdit.role || 'Kakitangan');
    setDepartment(docToEdit.department || 'Sistem Kawalan IAM');
    setShowPassword(false);
    setIsEditModalOpen(true);
  };

  // Submit Edit User
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setIsLoading(true);
    setIsEditModalOpen(false);

    const docToEdit = documents.find(d => d.id === selectedDocId);

    await dbService.updateUser(generatedId, {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      ...(password ? { password } : {}),
      role: role,
      department: department,
      lastActive: 'Baru dikemas kini',
      ipAddress: docToEdit?.ipAddress || '127.0.0.1',
      status: docToEdit?.status || 'Aktif'
    });

    setActionSuccess('Rekod profil pengguna berjaya dikemas kini.');
    setTimeout(() => setActionSuccess(null), 4000);
    
    setSelectedDocId(null);
    await fetchDocs();
  };

  // Delete User doc
  const handleDeleteDoc = async () => {
    if (!selectedDocId) return;
    const confirmDelete = window.confirm(`Adakah anda pasti mahu memadam pengguna dengan ID: ${selectedDocId}?`);
    if (!confirmDelete) return;

    setIsLoading(true);
    await dbService.deleteUser(selectedDocId);
    setSelectedDocId(null);
    setActionSuccess('Talian profil pengguna telah dikeluarkan daripada sistem keselamatan.');
    setTimeout(() => setActionSuccess(null), 4000);
    await fetchDocs();
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden animate-fade-in flex flex-col min-h-[600px] relative">
      
      {/* Dynamic Action Alerts */}
      {actionSuccess && (
        <div className="bg-emerald-50 border-b border-emerald-150 py-3 px-6 flex items-center gap-2.5 text-emerald-800 text-xs font-semibold animate-fade-in shrink-0">
          <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Breadcrumbs & Top Bar */}
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center text-xs space-x-2 text-slate-500 font-medium font-mono">
          <span className="text-brand-700 hover:underline cursor-pointer font-bold">
            {getDbProvider() === 'supabase' ? 'supabase_db' : 'kitabuddy_default_firestore'}
          </span>
          <ChevronRight className="h-3 w-3" />
          <span className="text-brand-700 hover:underline cursor-pointer font-bold">
            {getDbProvider() === 'supabase' ? 'public' : 'Sistem-Auth'}
          </span>
          <ChevronRight className="h-3 w-3" />
          <span className="text-slate-900 font-semibold flex items-center gap-1.5">
            <span>{getDbProvider() === 'supabase' ? 'users (Jadual)' : 'users (Koleksi)'}</span>
            <span className={`h-2 w-2 rounded-full inline-block ${getDbProvider() === 'supabase' ? 'bg-emerald-500 animate-pulse' : 'bg-orange-500'}`} title={`Connected via ${getDbProvider()}`}></span>
          </span>
        </div>
        <div className="flex items-center space-x-2 flex-wrap gap-2">
          <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
            getDbProvider() === 'supabase' 
              ? 'bg-emerald-50 border border-emerald-150 text-emerald-800' 
              : 'bg-indigo-50 border border-indigo-150 text-indigo-800'
          }`}>
            Penyedia: {getDbProvider() === 'supabase' ? 'Supabase (PostgreSQL)' : 'Firebase Guest (Firestore)'}
          </span>
          <Button variant="outline" className="h-8 text-xs py-0 font-semibold" onClick={handleReset}>Segarkan Semua</Button>
          <Button className="h-8 text-xs py-0 bg-brand-600 hover:bg-brand-700 border-none text-white font-semibold">Visual Data</Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 border-b border-slate-100 flex space-x-6">
        {['Documents', 'Aggregations', 'Schema', 'Indexes', 'Validation'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === tab ? 'border-brand-600 text-brand-700' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab} {tab === 'Documents' && (
              <span className="text-[10px] bg-brand-100 text-brand-800 font-bold px-1.5 py-0.2 rounded-full">
                {documents.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Query Bar */}
      <div className="p-4 bg-white border-b border-slate-100 flex items-center space-x-3">
        <div className="relative flex-1 group">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center space-x-2 text-slate-400">
             <Search className="h-4 w-4" />
             <span className="text-sm font-mono opacity-50">Filter</span>
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-20 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-md font-mono text-sm focus:outline-none focus:ring-1 focus:ring-brand-500 focus:bg-white transition-all"
            placeholder="{ field: 'value' }"
          />
        </div>
        <Button onClick={handleFind} className="bg-brand-600 hover:bg-brand-700 h-9 px-4 text-xs font-semibold">Cari</Button>
        <Button variant="outline" onClick={handleReset} className="h-9 px-4 text-xs">Set Semula</Button>
      </div>

      {/* Toolbar */}
      <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
        <div className="flex space-x-2">
          <button 
            type="button"
            onClick={openAddModal}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-brand-600 text-white rounded text-xs font-bold hover:bg-brand-700 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>TAMBAH DATA</span>
          </button>

          <button 
            type="button"
            disabled={!selectedDocId}
            onClick={openEditModal}
            className={`flex items-center space-x-1.5 px-3 py-1.5 border rounded text-xs font-bold transition-colors ${
              selectedDocId 
                ? 'border-brand-550 text-brand-700 bg-brand-50 hover:bg-brand-100/70' 
                : 'border-slate-200 text-slate-400 bg-slate-100 cursor-not-allowed opacity-50'
            }`}
          >
            <Edit2 className="h-3.5 w-3.5" />
            <span>KEMAS KINI</span>
          </button>

          <button 
            type="button"
            disabled={!selectedDocId}
            onClick={handleDeleteDoc}
            className={`flex items-center space-x-1.5 px-3 py-1.5 border rounded text-xs font-bold transition-colors ${
              selectedDocId 
                ? 'border-red-250 text-red-700 bg-red-50 hover:bg-red-100/70' 
                : 'border-slate-200 text-slate-400 bg-slate-100 cursor-not-allowed opacity-50'
            }`}
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>PADAM</span>
          </button>
        </div>
        <div className="text-[11px] text-slate-500 font-medium">
           Memaparkan {documents.length} dokumen pangkalan data
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto p-6 bg-slate-50/30">
        {isLoading ? (
          <div className="h-full flex flex-col items-center justify-center space-y-3 opacity-50 py-20">
             <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
             <span className="text-sm font-medium">Memproses arahan data aman...</span>
          </div>
        ) : documents.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-20">
            <div className="w-16 h-20 border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center">
              <FileJson className="h-10 w-10 text-slate-200" />
            </div>
            <div>
              <h4 className="text-xl font-bold text-slate-900">Koleksi ini tiada data</h4>
              <p className="text-sm text-slate-500 mt-2 max-w-sm">
                Sila tambah data pengguna baru menggunakan butang <b>"TAMBAH DATA"</b> di atas.
              </p>
            </div>
            <Button onClick={openAddModal} className="bg-brand-600 hover:bg-brand-700 border-none text-white">Tambah Pengguna Pertama</Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-slate-450 italic">Tip: Klik kad dokumentasi di bawah untuk memilih rekod bagi operasi "KEMAS KINI" atau "PADAM".</p>
            {documents.map((doc, i) => {
              const isSelected = selectedDocId === doc.id;
              return (
                <div 
                  key={doc.id || i} 
                  onClick={() => setSelectedDocId(isSelected ? null : doc.id)}
                  className={`group border rounded-xl overflow-hidden transition-all duration-150 cursor-pointer ${
                    isSelected 
                      ? 'border-brand-500 ring-2 ring-brand-100 shadow-sm' 
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  {/* Header metadata bar */}
                  <div className={`px-4 py-2.5 border-b flex items-center justify-between select-none ${
                    isSelected ? 'bg-brand-50/50 border-brand-150' : 'bg-slate-50 border-slate-100'
                  }`}>
                    <div className="flex items-center space-x-2.5">
                      <input 
                        type="checkbox" 
                        checked={isSelected}
                        onChange={() => {}} // Controlled via card click
                        className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 pointer-events-none"
                      />
                      <span className="text-[11px] font-bold text-brand-850 font-mono">_id: "{doc.id}"</span>
                    </div>
                    
                    <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-slate-200/60 text-slate-650">
                      {doc.role || 'PENGGUNA'}
                    </span>
                  </div>

                  {/* Document Raw JSON Pre */}
                  <div className="p-4 bg-white font-mono text-xs overflow-x-auto">
                    <pre className="text-slate-800 leading-relaxed">
                      {JSON.stringify(doc, null, 2)}
                    </pre>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center text-[10px] text-slate-400 space-x-4">
         <div className="flex items-center space-x-1">
           <Info className="h-3.5 w-3.5" />
           <span>Gunakan tatasusunan pertanyaan JSON untuk pemaparan dinamik, contoh: <code className="bg-slate-100 px-1 py-0.5 rounded font-semibold font-mono text-slate-700">{"{\"role\":\"admin\"}"}</code></span>
         </div>
         <Button variant="ghost" onClick={onBack} className="h-6 text-[10px] py-0 px-2 ml-auto">Kembali ke Dashboard</Button>
      </div>

      {/* ADD NEW USER MODAL DIALOG */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden animate-slide-up flex flex-col">
            
            <div className="p-5 border-b border-slate-150 bg-slate-50 flex justify-between items-center text-slate-900">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-brand-100 text-brand-700 rounded-lg">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Daftar Pengguna Baru (IAM)</h3>
                  <p className="text-[11px] text-slate-500">Kemas kemasukan profil ke pangkalan data keselamatan.</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setIsAddModalOpen(false)} 
                className="text-slate-450 hover:text-slate-750 text-sm font-semibold p-1.5"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4 text-xs font-medium">
              
              {/* ID (Read-only generated ID) */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Auto-Generated USER ID</label>
                <div className="flex items-center bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 font-mono text-slate-600 select-all">
                  <Lock className="h-3.5 w-3.5 mr-2 opacity-55 text-slate-600" />
                  <span>{generatedId}</span>
                  <span className="ml-auto text-[9px] font-bold uppercase tracking-wide bg-brand-100 text-brand-850 px-1.5 py-0.2 rounded-md">Automated</span>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Nama Penuh Pengguna</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Masukkan nama penuh"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-slate-850 bg-slate-50/30 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all font-semibold"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-bold">Alamat Emel</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="Contoh: user@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-slate-850 bg-slate-50/30 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Kata Laluan (Password)</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2 border border-slate-300 rounded-lg text-slate-850 bg-slate-50/30 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-650"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Grid Role & Department */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Peranan (Role)</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer font-bold text-slate-800"
                  >
                    <option value="Kakitangan">Kakitangan</option>
                    <option value="IAM Portal Administrator">IAM Admin</option>
                    <option value="CISO Administrator">CISO Admin</option>
                    <option value="Pemerhati Luar">Pemerhati Luar</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Jabatan (Department)</label>
                  <input
                    type="text"
                    required
                    placeholder="Seni Bina Awan"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-850 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsAddModalOpen(false)}
                  className="h-10 px-4"
                >
                  Batal
                </Button>
                <Button 
                  type="submit" 
                  className="bg-brand-600 hover:bg-brand-700 h-10 px-5 text-white border-none font-bold"
                >
                  Pendaftaran Pengguna
                </Button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL DIALOG */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden animate-slide-up flex flex-col">
            
            <div className="p-5 border-b border-slate-150 bg-slate-50 flex justify-between items-center text-slate-900">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
                  <Edit2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Kemas Kini Profil Pengguna</h3>
                  <p className="text-[11px] text-slate-500">Edit butiran profil pengguna terpilih dalam direktori.</p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setIsEditModalOpen(false)} 
                className="text-slate-450 hover:text-slate-750 text-sm font-semibold p-1.5"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 text-xs font-semibold">
              
              {/* User ID (Read-only) */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">USER ID (Kekal)</label>
                <div className="flex items-center bg-slate-150 border border-slate-200 rounded-lg px-3 py-2 font-mono text-slate-650">
                  <Lock className="h-3.5 w-3.5 mr-2 opacity-50" />
                  <span>{generatedId}</span>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Nama Penuh Pengguna</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-slate-850 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all font-semibold"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Alamat Emel</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-slate-850 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Kata Laluan Baru (Kosongkan jika tiada perubahan)</label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Kekalkan kata laluan sedia ada"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2 border border-slate-300 rounded-lg text-slate-850 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-650"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Grid Role & Department */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Peranan (Role)</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer font-bold text-slate-800"
                  >
                    <option value="Kakitangan">Kakitangan</option>
                    <option value="IAM Portal Administrator">IAM Admin</option>
                    <option value="CISO Administrator">CISO Admin</option>
                    <option value="Pemerhati Luar">Pemerhati Luar</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Jabatan (Department)</label>
                  <input
                    type="text"
                    required
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-850 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditModalOpen(false)}
                  className="h-10 px-4"
                >
                  Batal
                </Button>
                <Button 
                  type="submit" 
                  className="bg-brand-650 hover:bg-brand-700 h-10 px-5 text-white border-none font-bold"
                >
                  Simpan Perubahan
                </Button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
