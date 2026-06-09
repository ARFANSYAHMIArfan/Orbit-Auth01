import React, { useState, useEffect } from 'react';
import { 
  X, Check, Plus, Trash2, Folder, Calendar, AlertCircle, Link as LinkIcon, 
  ShieldAlert, ShieldCheck, Mail, ChevronDown, ChevronUp, ExternalLink, Globe, Lock, Key
} from 'lucide-react';
import { Button } from './ui/Button';

interface ConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AssociatedLink {
  id: string;
  name: string;
  url: string;
}

interface Task {
  id: string;
  title: string;
  priority: 'Rendah' | 'Sederhana' | 'Tinggi';
  completed: boolean;
  date: string;
  links?: AssociatedLink[];
  accessLevel?: 'Semua' | 'Ahli' | 'Pentadbir' | 'Peribadi';
  allowedEmails?: string[];
}

const DEFAULT_TASKS: Task[] = [
  {
    id: '1',
    title: 'Konfigurasi Protokol SAML Kitabuddy',
    priority: 'Tinggi',
    completed: true,
    date: '2026-06-08',
    links: [
      { id: 'l1', name: 'Dokumentasi SAML', url: 'https://saml-doc.example.com' },
      { id: 'l2', name: 'Rajah Aliran Autentikasi', url: 'https://charts.example.com/saml-flow' }
    ],
    accessLevel: 'Ahli',
    allowedEmails: ['m-10531068@moe-dl.edu.my']
  },
  {
    id: '2',
    title: 'Integrasi Kawalan Capaian Zero Trust',
    priority: 'Tinggi',
    completed: false,
    date: '2026-06-09',
    links: [],
    accessLevel: 'Pentadbir',
    allowedEmails: ['arfan@muzaffar.edu.my']
  },
  {
    id: '3',
    title: 'Ujian Penembusan (Penetration Testing) Gateway',
    priority: 'Sederhana',
    completed: false,
    date: '2026-06-12',
    links: [
      { id: 'l3', name: 'Laporan Penembusan Draft', url: 'https://pentest-draft.example.com' }
    ],
    accessLevel: 'Pentadbir',
    allowedEmails: []
  },
  {
    id: '4',
    title: 'Penaiktarafan Audit Log Sistem',
    priority: 'Rendah',
    completed: false,
    date: '2026-06-15',
    links: [],
    accessLevel: 'Semua',
    allowedEmails: []
  },
];

export const ConnectModal: React.FC<ConnectModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'Rendah' | 'Sederhana' | 'Tinggi'>('Sederhana');
  
  // Custom access levels and links inputs state mapped by active expanded task
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [newLinkLabel, setNewLinkLabel] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newAllowedEmail, setNewAllowedEmail] = useState('');

  // Load tasks from LocalStorage or seed default tasks
  useEffect(() => {
    const saved = localStorage.getItem('kitabuddy_active_tasks');
    if (saved) {
      try {
        setTasks(JSON.parse(saved));
      } catch (e) {
        setTasks(DEFAULT_TASKS);
      }
    } else {
      setTasks(DEFAULT_TASKS);
      localStorage.setItem('kitabuddy_active_tasks', JSON.stringify(DEFAULT_TASKS));
    }
  }, []);

  // Save tasks helper
  const saveTasksToStorage = (updatedTasks: Task[]) => {
    setTasks(updatedTasks);
    localStorage.setItem('kitabuddy_active_tasks', JSON.stringify(updatedTasks));
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: Task = {
      id: Math.random().toString(36).substring(2, 9),
      title: newTaskTitle.trim(),
      priority: newTaskPriority,
      completed: false,
      date: new Date().toISOString().split('T')[0],
      links: [],
      accessLevel: 'Semua',
      allowedEmails: []
    };

    const updated = [newTask, ...tasks];
    saveTasksToStorage(updated);
    setNewTaskTitle('');
    setNewTaskPriority('Sederhana');
    setExpandedTaskId(newTask.id); // Expand the newly created task immediately
  };

  const handleToggleTask = (id: string) => {
    const updated = tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
    saveTasksToStorage(updated);
  };

  const handleDeleteTask = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = tasks.filter((t) => t.id !== id);
    if (expandedTaskId === id) {
      setExpandedTaskId(null);
    }
    saveTasksToStorage(updated);
  };

  // Add Link to an existing task
  const handleAddLink = (taskId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!newLinkLabel.trim() || !newLinkUrl.trim()) return;

    let formattedUrl = newLinkUrl.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = 'https://' + formattedUrl;
    }

    const newLink: AssociatedLink = {
      id: Math.random().toString(36).substring(2, 5),
      name: newLinkLabel.trim(),
      url: formattedUrl
    };

    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        const links = t.links ? [...t.links, newLink] : [newLink];
        return { ...t, links };
      }
      return t;
    });

    saveTasksToStorage(updated);
    setNewLinkLabel('');
    setNewLinkUrl('');
  };

  // Delete Link from a task
  const handleDeleteLink = (taskId: string, linkId: string) => {
    const updated = tasks.map((t) => {
      if (t.id === taskId && t.links) {
        return { ...t, links: t.links.filter((l) => l.id !== linkId) };
      }
      return t;
    });
    saveTasksToStorage(updated);
  };

  // Change access level for a task
  const handleChangeAccessLevel = (taskId: string, level: 'Semua' | 'Ahli' | 'Pentadbir' | 'Peribadi') => {
    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        return { ...t, accessLevel: level };
      }
      return t;
    });
    saveTasksToStorage(updated);
  };

  // Add allowed email to task access
  const handleAddAllowedEmail = (taskId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!newAllowedEmail.trim() || !newAllowedEmail.includes('@')) return;

    const email = newAllowedEmail.trim().toLowerCase();

    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        const allowedEmails = t.allowedEmails ? [...t.allowedEmails] : [];
        if (!allowedEmails.includes(email)) {
          allowedEmails.push(email);
        }
        return { ...t, allowedEmails };
      }
      return t;
    });

    saveTasksToStorage(updated);
    setNewAllowedEmail('');
  };

  // Remove allowed email from task access
  const handleRemoveAllowedEmail = (taskId: string, email: string) => {
    const updated = tasks.map((t) => {
      if (t.id === taskId && t.allowedEmails) {
        return { ...t, allowedEmails: t.allowedEmails.filter((e) => e !== email) };
      }
      return t;
    });
    saveTasksToStorage(updated);
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl border border-slate-200 overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 flex justify-between items-center border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center text-brand-700">
              <Folder className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Urus Tugas & Akses Keselamatan</h2>
              <p className="text-xs text-slate-500">Pusat kawalan projek, pautan rujukan, dan hak capaian pengguna Kitabuddy.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Progress Bar & Summary */}
        <div className="px-6 py-3.5 bg-brand-50 border-b border-brand-100 flex items-center justify-between">
          <div className="flex-1 mr-6">
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
              <span>Kemajuan Keberhasilan Projek</span>
              <span>{progressPercent}% ({completedCount}/{tasks.length} Selesai)</span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-brand-600 h-full transition-all duration-500 ease-out" 
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
          <span className="hidden sm:inline-flex items-center bg-white px-3 py-1 rounded-full border border-brand-200 text-xs font-medium text-brand-800 shrink-0">
            <ShieldCheck className="h-3.5 w-3.5 mr-1 text-emerald-600" />
            Pematuhan Zero Trust
          </span>
        </div>

        {/* Form to Add New Task */}
        <form onSubmit={handleAddTask} className="p-5 border-b border-slate-100 bg-white grid grid-cols-1 sm:grid-cols-12 gap-3 shrink-0">
          <div className="sm:col-span-7">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Nama Tugasan Baru</label>
            <input
              type="text"
              placeholder="Contoh: Audit kawalan akses OAuth..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all placeholder:text-slate-450"
            />
          </div>
          <div className="sm:col-span-3">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Keutamaan</label>
            <select
              value={newTaskPriority}
              onChange={(e) => setNewTaskPriority(e.target.value as any)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all cursor-pointer"
            >
              <option value="Rendah">Rendah (Low)</option>
              <option value="Sederhana">Sederhana (Medium)</option>
              <option value="Tinggi">Tinggi (High)</option>
            </select>
          </div>
          <div className="sm:col-span-2 flex items-end">
            <Button type="submit" className="w-full py-2.2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg flex items-center justify-center text-xs">
              <Plus className="h-4 w-4 mr-0.5" />
              Tambah
            </Button>
          </div>
        </form>

        {/* Tasks List */}
        <div className="p-5 overflow-y-auto flex-1 space-y-3 bg-slate-50/50 animate-fade-in custom-scrollbar">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Senarai Tugasan & Tahap Capaian</h3>
            <span className="text-[10px] text-slate-400">Klik kad tugasan untuk urus pautan & kebenaran akses</span>
          </div>
          
          {tasks.length === 0 ? (
            <div className="text-center py-10 bg-white border border-dashed border-slate-200 rounded-xl">
              <p className="text-sm text-slate-450">Tiada tugasan ditemui. Tambah tugasan di atas untuk bermula.</p>
            </div>
          ) : (
            tasks.map((task) => {
              const isExpanded = expandedTaskId === task.id;
              const hasLinks = task.links && task.links.length > 0;
              const hasAllowedEmails = task.allowedEmails && task.allowedEmails.length > 0;

              return (
                <div 
                  key={task.id} 
                  className={`bg-white border rounded-xl overflow-hidden transition-all duration-200 ${
                    task.completed 
                      ? 'border-slate-100 bg-slate-50/10' 
                      : isExpanded 
                        ? 'border-brand-300 shadow-md ring-1 ring-brand-100' 
                        : 'border-slate-200 hover:shadow-sm'
                  }`}
                >
                  {/* Master Card Line */}
                  <div 
                    onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                    className="p-4 flex items-center justify-between cursor-pointer select-none"
                  >
                    <div className="flex items-center space-x-3 mr-4 flex-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleTask(task.id);
                        }}
                        className={`w-5 h-5 rounded border flex items-center justify-center transition-colors shrink-0 ${
                          task.completed 
                            ? 'bg-brand-600 border-brand-600 text-white' 
                            : 'border-slate-300 hover:border-brand-500 bg-white'
                        }`}
                      >
                        {task.completed && <Check className="h-3.5 w-3.5" />}
                      </button>
                      
                      <div className="text-left flex-1 min-w-0">
                        <p className={`text-sm font-semibold truncate ${task.completed ? 'line-through text-slate-400 font-normal' : 'text-slate-800'}`}>
                          {task.title}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 mt-1 text-[11px] text-slate-400">
                          <span className="flex items-center shrink-0">
                            <Calendar className="h-3 w-3 mr-1 text-slate-400" />
                            {task.date}
                          </span>
                          <span className="hidden sm:inline">•</span>
                          <span className={`font-semibold px-1.5 py-0.2 rounded text-[9px] uppercase shrink-0 ${
                            task.priority === 'Tinggi' 
                              ? 'bg-red-50 text-red-650 font-bold' 
                              : task.priority === 'Sederhana'
                                ? 'bg-amber-50 text-amber-650 font-bold'
                                : 'bg-slate-100 text-slate-600 font-bold'
                          }`}>
                            {task.priority}
                          </span>
                          <span className="hidden sm:inline">•</span>
                          
                          {/* Access Level Badge */}
                          <span className={`inline-flex items-center font-medium px-1.5 py-0.2 rounded text-[9px] uppercase gap-0.5 shrink-0 ${
                            task.accessLevel === 'Pentadbir'
                              ? 'bg-red-100 text-red-800'
                              : task.accessLevel === 'Ahli'
                                ? 'bg-indigo-100 text-indigo-800'
                                : task.accessLevel === 'Peribadi'
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {task.accessLevel === 'Pentadbir' ? <Lock className="h-2 w-2" /> : <Globe className="h-2 w-2" />}
                            Akses: {task.accessLevel || 'Semua'}
                          </span>

                          {hasLinks && (
                            <span className="text-brand-600 font-medium shrink-0 bg-brand-50 px-1.5 rounded text-[9px]">
                              {task.links?.length} Pautan
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 shrink-0">
                      <button 
                        type="button"
                        onClick={(e) => handleDeleteTask(task.id, e)}
                        className="text-slate-400 hover:text-red-500 p-1.5 rounded-full hover:bg-red-100 transition-colors mr-1"
                        title="Padam Tugasan"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Detail Panel */}
                  {isExpanded && (
                    <div className="px-4 pb-5 pt-3 border-t border-slate-100 bg-slate-50/50 space-y-4 animate-fade-in text-xs">
                      
                      {/* Section 1: Associated Links / Pautan Berkaitan */}
                      <div className="bg-white p-3 rounded-lg border border-slate-200">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-bold text-slate-700 flex items-center gap-1">
                            <LinkIcon className="h-3.5 w-3.5 text-brand-600" />
                            Pautan Rujukan Berkaitan
                          </h4>
                          <span className="text-[10px] text-slate-400">Pautan kod, fail atau dokumen rujukan kerja</span>
                        </div>

                        {/* List of current links */}
                        {hasLinks ? (
                          <div className="space-y-1.5 mb-3">
                            {task.links?.map((link) => (
                              <div key={link.id} className="flex items-center justify-between bg-slate-50 p-2 rounded border border-slate-100 hover:border-slate-200 transition-colors">
                                <a 
                                  href={link.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-brand-700 hover:text-brand-800 font-medium flex items-center gap-1 truncate"
                                >
                                  <ExternalLink className="h-3 w-3 shrink-0" />
                                  <span className="truncate">{link.name}</span>
                                  <span className="text-[10px] text-slate-400 font-normal truncate">({link.url})</span>
                                </a>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteLink(task.id, link.id)}
                                  className="text-slate-400 hover:text-red-500 p-0.5 rounded transition-colors"
                                  title="Gugurkan Pautan"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[11px] text-slate-400 italic mb-3">Tiada pautan rujukan ditambat lagi.</p>
                        )}

                        {/* Add Link Form */}
                        <form onSubmit={(e) => handleAddLink(task.id, e)} className="flex flex-col sm:flex-row gap-2">
                          <input
                            type="text"
                            placeholder="Nama Pautan (cth: Pull Request / Repositori)"
                            value={newLinkLabel}
                            onChange={(e) => setNewLinkLabel(e.target.value)}
                            className="flex-1 px-2 py-1.5 border border-slate-300 rounded text-slate-700 font-medium placeholder:text-slate-400 bg-slate-50/50"
                          />
                          <input
                            type="text"
                            placeholder="Alamat URL (cth: github.com/user/repo)"
                            value={newLinkUrl}
                            onChange={(e) => setNewLinkUrl(e.target.value)}
                            className="flex-1 px-2 py-1.5 border border-slate-300 rounded text-slate-700 placeholder:text-slate-400 bg-slate-50/50"
                          />
                          <button
                            type="submit"
                            disabled={!newLinkLabel.trim() || !newLinkUrl.trim()}
                            className="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 text-white font-semibold rounded shrink-0 flex items-center justify-center gap-1 transition-colors"
                          >
                            <Plus className="h-3 w-3" /> Tambah Pautan
                          </button>
                        </form>
                      </div>

                      {/* Section 2: User Access Permissions / Kebenaran Capaian Akses */}
                      <div className="bg-white p-3 rounded-lg border border-slate-200 grid grid-cols-1 md:grid-cols-12 gap-4">
                        
                        {/* Selector */}
                        <div className="md:col-span-5 space-y-2">
                          <h4 className="font-bold text-slate-700 flex items-center gap-1">
                            <Key className="h-3.5 w-3.5 text-brand-600" />
                            Tahap Akses Kebenaran
                          </h4>
                          <p className="text-[10px] text-slate-400 leading-normal">Tentukan siapa yang dibenarkan melihat atau menukar status tugasan ini di dalam portal.</p>
                          
                          <div className="grid grid-cols-2 gap-1.5 pt-1">
                            {(['Semua', 'Ahli', 'Pentadbir', 'Peribadi'] as const).map((level) => {
                              const labels: Record<string, string> = {
                                Semua: 'Semua (Awam)',
                                Ahli: 'Ahli Kumpulan',
                                Pentadbir: 'Pentadbir CISO',
                                Peribadi: 'Peribadi Saya'
                              };
                              const isSelected = (task.accessLevel || 'Semua') === level;
                              return (
                                <button
                                  key={level}
                                  type="button"
                                  onClick={() => handleChangeAccessLevel(task.id, level)}
                                  className={`px-2 py-1.5 rounded text-[11px] font-semibold border text-left transition-all ${
                                    isSelected 
                                      ? 'bg-brand-50 border-brand-500 text-brand-800 font-bold shadow-xs' 
                                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                  }`}
                                >
                                  {labels[level]}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Allowed user emails list (whitelist) */}
                        <div className="md:col-span-7 flex flex-col justify-between space-y-2">
                          <div>
                            <h4 className="font-bold text-slate-700 flex items-center gap-1">
                              <Mail className="h-3.5 w-3.5 text-indigo-600" />
                              Pelepasan Capaian Pengguna Khusus (Whitelists)
                            </h4>
                            <p className="text-[10px] text-slate-400 mb-2 leading-normal">Benarkan emel kakitangan atau pentadbir tertentu untuk melangkau polisi asal.</p>
                            
                            {/* Whitelist emails tags */}
                            {hasAllowedEmails ? (
                              <div className="flex flex-wrap gap-1.5 max-h-[72px] overflow-y-auto mb-2 p-1.5 bg-slate-50 rounded border border-slate-100">
                                {task.allowedEmails?.map((email) => (
                                  <span key={email} className="inline-flex items-center gap-1 bg-indigo-50 border border-indigo-100 text-indigo-800 text-[10px] font-medium px-2 py-0.5 rounded-full">
                                    {email}
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveAllowedEmail(task.id, email)}
                                      className="text-indigo-400 hover:text-red-500 rounded"
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <p className="text-[10px] text-slate-400 italic mb-2">Tiada emel berdaftar khusus. Polisi tahap akses di sebelah kiri diutamakan.</p>
                            )}
                          </div>

                          {/* Add Email form */}
                          <form onSubmit={(e) => handleAddAllowedEmail(task.id, e)} className="flex gap-1.5">
                            <input
                              type="email"
                              placeholder="Kemasukkan Emel Pengguna (cth: user@moe.edu.my)"
                              value={newAllowedEmail}
                              onChange={(e) => setNewAllowedEmail(e.target.value)}
                              className="flex-1 px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-slate-50 placeholder:text-slate-400"
                            />
                            <button
                              type="submit"
                              disabled={!newAllowedEmail.trim() || !newAllowedEmail.includes('@')}
                              className="px-3 py-1.5 bg-brand-900 border-none text-white text-[11px] font-bold rounded shrink-0 transition-colors disabled:bg-slate-300"
                            >
                              Benarkan
                            </button>
                          </form>

                        </div>

                      </div>

                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-5 flex justify-end items-center border-t border-slate-100 bg-slate-50/50 shrink-0">
          <Button onClick={onClose} className="bg-brand-900 border-none px-6 text-xs text-white">Selesai & Simpan</Button>
        </div>
      </div>
    </div>
  );
};
