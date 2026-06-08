import React, { useState, useEffect } from 'react';
import { X, Check, Plus, Trash2, Folder, Calendar, AlertCircle } from 'lucide-react';
import { Button } from './ui/Button';

interface ConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Task {
  id: string;
  title: string;
  priority: 'Rendah' | 'Sederhana' | 'Tinggi';
  completed: boolean;
  date: string;
}

const DEFAULT_TASKS: Task[] = [
  {
    id: '1',
    title: 'Konfigurasi Protokol SAML Kitabuddy',
    priority: 'Tinggi',
    completed: true,
    date: '2026-06-08',
  },
  {
    id: '2',
    title: 'Integrasi Kawalan Capaian Zero Trust',
    priority: 'Tinggi',
    completed: false,
    date: '2026-06-09',
  },
  {
    id: '3',
    title: 'Ujian Penembusan (Penetration Testing) Gateway',
    priority: 'Sederhana',
    completed: false,
    date: '2026-06-12',
  },
  {
    id: '4',
    title: 'Penaiktarafan Audit Log Sistem',
    priority: 'Rendah',
    completed: false,
    date: '2026-06-15',
  },
];

export const ConnectModal: React.FC<ConnectModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'Rendah' | 'Sederhana' | 'Tinggi'>('Sederhana');

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
    };

    const updated = [newTask, ...tasks];
    saveTasksToStorage(updated);
    setNewTaskTitle('');
    setNewTaskPriority('Sederhana');
  };

  const handleToggleTask = (id: string) => {
    const updated = tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
    saveTasksToStorage(updated);
  };

  const handleDeleteTask = (id: string) => {
    const updated = tasks.filter((t) => t.id !== id);
    saveTasksToStorage(updated);
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-slate-200 overflow-hidden animate-slide-up flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-6 flex justify-between items-center border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center text-brand-700">
              <Folder className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Urus Tugas Pembangunan Aktif</h2>
              <p className="text-xs text-slate-500">Pusat kawalan projek dan tindakan pematuhan keselamatan Kitabuddy.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Progress Bar & Summary */}
        <div className="px-6 py-4 bg-brand-50 border-b border-brand-100 flex items-center justify-between">
          <div className="flex-1 mr-6">
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
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
          <span className="hidden sm:inline-flex items-center bg-white px-3 py-1 rounded-full border border-brand-200 text-xs font-medium text-brand-800">
            <AlertCircle className="h-3.5 w-3.5 mr-1 text-brand-600" />
            Zero Trust Enabled
          </span>
        </div>

        {/* Form to Add New Task */}
        <form onSubmit={handleAddTask} className="p-6 border-b border-slate-100 bg-white grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-7">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Nama Tugasan</label>
            <input
              type="text"
              placeholder="Contoh: Audit kawalan akses OAuth..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all placeholder:text-slate-400"
            />
          </div>
          <div className="sm:col-span-3">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Keutamaan</label>
            <select
              value={newTaskPriority}
              onChange={(e) => setNewTaskPriority(e.target.value as any)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all cursor-pointer"
            >
              <option value="Rendah">Rendah</option>
              <option value="Sederhana">Sederhana</option>
              <option value="Tinggi">Tinggi</option>
            </select>
          </div>
          <div className="sm:col-span-2 flex items-end">
            <Button type="submit" className="w-full py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg flex items-center justify-center text-xs">
              <Plus className="h-4 w-4 mr-1" />
              Tambah
            </Button>
          </div>
        </form>

        {/* Tasks List */}
        <div className="p-6 overflow-y-auto flex-1 space-y-3 bg-slate-50/50 animate-fade-in">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Senarai Tugasan Aktif</h3>
          
          {tasks.length === 0 ? (
            <div className="text-center py-10 bg-white border border-dashed border-slate-200 rounded-xl">
              <p className="text-sm text-slate-400">Tiada tugasan ditemui. Tambah tugasan di atas untuk memulakan.</p>
            </div>
          ) : (
            tasks.map((task) => (
              <div 
                key={task.id} 
                className={`p-4 bg-white border rounded-xl flex items-center justify-between transition-all ${
                  task.completed ? 'border-slate-100 bg-slate-50/20 opacity-70' : 'border-slate-200 hover:shadow-sm'
                }`}
              >
                <div className="flex items-center space-x-3 mr-4">
                  <button
                    type="button"
                    onClick={() => handleToggleTask(task.id)}
                    className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                      task.completed 
                        ? 'bg-brand-600 border-brand-600 text-white' 
                        : 'border-slate-300 hover:border-brand-500 bg-white'
                    }`}
                  >
                    {task.completed && <Check className="h-3.5 w-3.5" />}
                  </button>
                  <div className="text-left">
                    <p className={`text-sm font-medium ${task.completed ? 'line-through text-slate-400 font-normal' : 'text-slate-800'}`}>
                      {task.title}
                    </p>
                    <div className="flex items-center space-x-2.5 mt-1 text-[11px] text-slate-400">
                      <span className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1 text-slate-400" />
                        {task.date}
                      </span>
                      <span>•</span>
                      <span className={`font-semibold px-1.5 py-0.5 rounded text-[10px] uppercase ${
                        task.priority === 'Tinggi' 
                          ? 'bg-red-50 text-red-600 font-bold' 
                          : task.priority === 'Sederhana'
                            ? 'bg-amber-50 text-amber-600 font-bold'
                            : 'bg-slate-100 text-slate-600 font-bold'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={() => handleDeleteTask(task.id)}
                  className="text-slate-400 hover:text-red-500 p-1.5 rounded-full hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-6 flex justify-end items-center border-t border-slate-100 bg-slate-50/50">
          <Button onClick={onClose} className="bg-brand-900 border-none px-6 text-xs text-white">Selesai</Button>
        </div>
      </div>
    </div>
  );
};
