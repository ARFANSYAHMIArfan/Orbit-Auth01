import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Search, Database, Terminal, RefreshCw, FileJson, 
  Trash2, Download, PlusCircle, CheckCircle2, XCircle, 
  Settings, Server, Activity, ShieldCheck, HelpCircle, Copy, Check
} from 'lucide-react';
import { Button } from './ui/Button';
import { logService, MongoLog } from '../services/logService';

interface MongoLogsViewProps {
  onBack: () => void;
  userEmail: string;
}

export const MongoLogsView: React.FC<MongoLogsViewProps> = ({ onBack, userEmail }) => {
  const [logs, setLogs] = useState<MongoLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Custom sandbox/simulate action state
  const [simulateAction, setSimulateAction] = useState('LOG_MASUK');
  const [simulateDetail, setSimulateDetail] = useState('');
  const [simulateStatus, setSimulateStatus] = useState<'Berjaya' | 'Gagal'>('Berjaya');
  const [isSimulatingCheck, setIsSimulatingCheck] = useState(false);
  const [showSimulateToast, setShowSimulateToast] = useState(false);
  
  // Settings copy feedback
  const [copiedSettingId, setCopiedSettingId] = useState<string | null>(null);

  const settings = logService.getSettings();

  useEffect(() => {
    refreshLogs();
  }, []);

  const refreshLogs = async () => {
    setIsLoading(true);
    try {
      const data = await logService.getLogsAsync();
      setLogs(data);
    } catch (e) {
      console.warn("Ralat memuatkan log keselamatan:", e);
      setLogs(logService.getLogs());
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearLogs = async () => {
    if (window.confirm('Adakah anda pasti mahu mengosongkan semua rekod log sistem MongoDB? Tindakan ini tidak boleh dibatalkan.')) {
      setIsLoading(true);
      // Optimistically clear the UI logs list before waiting on database roundtrip
      setLogs([]);
      try {
        await logService.clearLogs();
        await refreshLogs();
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSimulateLog = async () => {
    let finalDetail = simulateDetail.trim();
    if (!finalDetail) {
      if (simulateAction === 'LOG_MASUK') {
        finalDetail = simulateStatus === 'Berjaya' 
          ? `Pengguna ${userEmail} berjaya menentusahkan identiti dengan sistem.` 
          : `Gagal log masuk dari IP tidak dikenali. Pengesahan kata laluan ditolak.`;
      } else if (simulateAction === 'UPDATE_PROFIL') {
        finalDetail = `Kemaskini rekod nama utama dan emel pengguna berjaya dilaksanakan dalam metadata.`;
      } else if (simulateAction === 'QUERY_DOKUMEN') {
        finalDetail = `Query dilaksanakan dalam Data Explorer. Skema: 'users', SQL: "SELECT * FROM public.users LIMIT 100".`;
      } else if (simulateAction === 'PADAM_PENGGUNA') {
        finalDetail = `Permintaan memadam akaun u_usr_${Math.random().toString(36).substring(2, 6)} selesai dijalankan oleh admin.`;
      } else {
        finalDetail = `Aktiviti sistem dikesan: Kawalan Zero Trust diproses secara automatik.`;
      }
    }

    setIsSimulatingCheck(true);
    
    // Slight timeout to simulate network ping to the MongoDB host
    await new Promise(resolve => setTimeout(resolve, 600));
    
    await logService.addLog(simulateAction, userEmail, finalDetail, simulateStatus);
    await refreshLogs();
    setIsSimulatingCheck(false);
    setSimulateDetail('');
    setShowSimulateToast(true);
    setTimeout(() => setShowSimulateToast(false), 3000);
  };

  const handleDownloadLogs = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `kitabuddy_mongodb_audit_logs_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSettingId(id);
    setTimeout(() => setCopiedSettingId(null), 2000);
  };

  // Filter logic
  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log._id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAction = actionFilter === 'ALL' || log.action === actionFilter;
    const matchesStatus = statusFilter === 'ALL' || log.status === statusFilter;

    return matchesSearch && matchesAction && matchesStatus;
  });

  const getLogBadgeColors = (action: string, status: string) => {
    if (status === 'Gagal') return 'bg-rose-50 text-rose-700 border-rose-200';
    if (action.includes('BOOT') || action.includes('SYSTEM')) return 'bg-teal-50 text-teal-700 border-teal-200';
    if (action.includes('LOGIN') || action.includes('AUTH')) return 'bg-amber-50 text-amber-700 border-amber-200';
    if (action.includes('QUERY') || action.includes('EXPLORE')) return 'bg-sky-50 text-sky-700 border-sky-100';
    if (action.includes('DELETE') || action.includes('PADAM')) return 'bg-purple-50 text-purple-700 border-purple-200';
    return 'bg-slate-50 text-slate-700 border-slate-200';
  };

  // Stats calculation
  const totalLogs = logs.length;
  const successLogs = logs.filter(l => l.status === 'Berjaya').length;
  const failedLogs = logs.filter(l => l.status === 'Gagal').length;
  const currentTargetDb = `${settings.db}.${settings.collection}`;

  return (
    <div className="max-w-7xl mx-auto animate-fade-in flex flex-col space-y-6">
      {/* Toast Notification */}
      {showSimulateToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-emerald-500/30 text-white rounded-xl shadow-xl px-5 py-3.5 flex items-center space-x-3 animate-slide-up">
          <div className="h-6 w-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-100">Sync MongoDB Berjaya!</p>
            <p className="text-[11px] text-slate-400">Log audit selamat berjaya dihantar ke {currentTargetDb}</p>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack} className="p-2 h-auto text-slate-600 hover:text-slate-900">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Database className="h-6 w-6 text-brand-600" />
                <span>Log Audit Sistem MongoDB</span>
              </h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100 animate-pulse">
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                CONNECTED
              </span>
            </div>
            <p className="text-slate-500 text-sm">Pemantauan transaksi IAM serta integriti data yang disegerakkan ke kluster MongoDB.</p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <Button 
            variant="outline" 
            onClick={refreshLogs} 
            disabled={isLoading}
            className="h-9 px-3 text-xs flex items-center gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Sedang Segar...' : 'Segarkan Log'}
          </Button>
          <Button 
            variant="outline" 
            onClick={handleDownloadLogs} 
            disabled={totalLogs === 0 || isLoading}
            className="h-9 px-3 text-xs flex items-center gap-1.5"
          >
            <Download className="h-3.5 w-3.5" />
            Eksport JSON
          </Button>
          <Button 
            variant="ghost" 
            onClick={handleClearLogs} 
            disabled={totalLogs === 0 || isLoading}
            className="h-9 px-3 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-1.5"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Kosongkan Log
          </Button>
        </div>
      </div>

      {/* Stats Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-lg bg-indigo-50 text-indigo-700">
            <Terminal className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Jumlah Rekod Log</span>
            <span className="text-xl font-bold text-slate-800">{totalLogs} dokumen</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-lg bg-emerald-50 text-emerald-700">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Aktiviti Berjaya</span>
            <span className="text-xl font-bold text-emerald-700">{successLogs} log</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-lg bg-rose-50 text-rose-700">
            <XCircle className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Aktiviti Gagal (Blok)</span>
            <span className="text-xl font-bold text-rose-700">{failedLogs} sekatan</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-lg bg-slate-50 text-slate-700">
            <Database className="h-5 w-5 text-emerald-600" />
          </div>
          <div className="overflow-hidden w-full">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Sasaran MongoDB</span>
            <span className="text-xs font-mono font-bold text-slate-800 truncate block mt-1" title={currentTargetDb}>
              {settings.db}.{settings.collection}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Logs Explorer */}
        <div className="lg:col-span-2 flex flex-col space-y-4">
          {/* Filters Area */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-450" />
              <input
                type="text"
                placeholder="Cari log mengikut email, perincian, rujukan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 border border-slate-200 rounded-lg text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="py-1.5 px-3 border border-slate-200 rounded-lg text-xs font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
              >
                <option value="ALL">Semua Jenis Tugasan</option>
                <option value="SISTEM_BOOT">SISTEM_BOOT</option>
                <option value="LOG_MASUK">LOG_MASUK</option>
                <option value="QUERY_DOKUMEN">QUERY_DOKUMEN</option>
                <option value="UPDATE_PROFIL">UPDATE_PROFIL</option>
                <option value="PADAM_PENGGUNA">PADAM_PENGGUNA</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="py-1.5 px-3 border border-slate-200 rounded-lg text-xs font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
              >
                <option value="ALL">Semua Status</option>
                <option value="Berjaya">Berjaya</option>
                <option value="Gagal">Gagal</option>
              </select>
            </div>
          </div>

          {/* Logs Table / List */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Cap Masa (UTC)</th>
                    <th className="py-3 px-4">Tindakan / ID</th>
                    <th className="py-3 px-4">Butiran Melakukan Tindakan</th>
                    <th className="py-3 px-4">Klien IP</th>
                    <th className="py-3 px-4 text-right">Status</th>
                    <th className="py-3 px-4 text-center">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        <Terminal className="h-8 w-8 mx-auto text-slate-350 mb-2.5 animate-pulse" />
                        <p className="font-medium text-slate-500 text-sm">Tiada rekod dokumen ditemui.</p>
                        <p className="text-slate-400 text-xs mt-1">Cuba bersihkan turas carian atau simulasikan log baru menggunakan panel kanan.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => {
                      const isExpanded = expandedLogId === log._id;
                      const badgeStyles = getLogBadgeColors(log.action, log.status);

                      return (
                        <React.Fragment key={log._id}>
                          <tr 
                            onClick={() => setExpandedLogId(isExpanded ? null : log._id)}
                            className={`hover:bg-slate-50/50 cursor-pointer transition-colors ${isExpanded ? 'bg-slate-55/40' : ''}`}
                          >
                            <td className="py-3.5 px-4 font-mono text-xs text-slate-500">
                              {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </td>
                            <td className="py-3.5 px-4">
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${badgeStyles} block w-fit truncate`}>
                                {log.action}
                              </span>
                              <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
                                id: {log._id.substring(0, 10)}...
                              </span>
                            </td>
                            <td className="py-3.5 px-4 max-w-xs md:max-w-md">
                              <p className="text-slate-800 font-medium truncate">{log.details}</p>
                              <p className="text-xs text-slate-400 truncate">{log.email}</p>
                            </td>
                            <td className="py-3.5 px-4 font-mono text-xs text-slate-400">
                              {log.ipAddress}
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <span className={`inline-flex items-center gap-1 text-xs font-semibold ${log.status === 'Berjaya' ? 'text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100' : 'text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100'}`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${log.status === 'Berjaya' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                                {log.status}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <button
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  if (window.confirm("Padam dokumen log ini secara kekal dari pangkalan data & sistem?")) {
                                    setIsLoading(true);
                                    // Optimistically filter from UI logs list to guarantee instantaneous viewport feedback
                                    setLogs(prev => prev.filter(l => l._id !== log._id));
                                    try {
                                      await logService.deleteLog(log._id);
                                      await refreshLogs();
                                    } catch (err) {
                                      console.error(err);
                                    } finally {
                                      setIsLoading(false);
                                    }
                                  }
                                }}
                                className="p-1 px-2.5 text-rose-600 bg-rose-50 hover:bg-rose-100 hover:text-rose-800 border border-rose-200 rounded-md transition-colors inline-flex items-center justify-center gap-1.5"
                                title="Padam Log Ini"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                <span className="text-[10px] font-bold">Padam</span>
                              </button>
                            </td>
                          </tr>

                          {/* BSON JSON Output Expansion */}
                          {isExpanded && (
                            <tr>
                              <td colSpan={6} className="bg-slate-900 px-6 py-4 border-y border-slate-800 animate-slide-up">
                                <div className="space-y-3.5">
                                  <div className="flex justify-between items-center text-xs text-slate-400 font-semibold uppercase tracking-wider pb-1 border-b border-slate-820">
                                    <span className="flex items-center gap-2 font-mono text-emerald-400 text-[11px]">
                                      <FileJson className="h-3.5 w-3.5 text-emerald-400" />
                                      <span>MongoDB BSON Document : {settings.collection}._id({log._id})</span>
                                    </span>
                                    <div className="flex items-center space-x-2">
                                      <button 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleCopyText(JSON.stringify(log, null, 2), log._id);
                                        }}
                                        className="hover:text-white flex items-center gap-1 py-1 px-2 rounded-md bg-slate-800 border border-slate-700 transition"
                                      >
                                        {copiedSettingId === log._id ? (
                                          <>
                                            <Check className="h-3 w-3 text-emerald-400" />
                                            <span className="text-emerald-450 font-bold text-[10px]">Telah Disalin</span>
                                          </>
                                        ) : (
                                          <>
                                            <Copy className="h-3 w-3" />
                                            <span className="text-[10px]">Salin BSON</span>
                                          </>
                                        )}
                                      </button>
                                      <button 
                                        onClick={async (e) => {
                                          e.stopPropagation();
                                          if (window.confirm("Padam dokumen log ini secara kekal dari pangkalan data & sistem?")) {
                                            setIsLoading(true);
                                            // Optimistically filter from UI logs list to guarantee instantaneous viewport feedback
                                            setLogs(prev => prev.filter(l => l._id !== log._id));
                                            try {
                                              await logService.deleteLog(log._id);
                                              await refreshLogs();
                                            } catch (err) {
                                              console.error(err);
                                            } finally {
                                              setIsLoading(false);
                                            }
                                          }
                                        }}
                                        className="hover:text-rose-450 flex items-center gap-1 py-1 px-2 rounded-md bg-slate-800 border border-rose-950 text-rose-400 transition"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                        <span className="text-[10px]">Padam Log</span>
                                      </button>
                                      <button 
                                        className="hover:text-white flex items-center gap-1 py-1 px-2 rounded-md bg-slate-800 border border-slate-700 text-slate-300"
                                        onClick={() => setExpandedLogId(null)}
                                      >
                                        Tutup
                                      </button>
                                    </div>
                                  </div>
                                  <div className="font-mono text-[13px] text-slate-300 leading-normal overflow-x-auto p-4 bg-slate-950/70 rounded-lg border border-slate-850 space-y-1">
                                    <div><span className="text-slate-400">{"{"}</span></div>
                                    <div className="pl-4">
                                      <span className="text-sky-300">"_id"</span><span className="text-slate-400">: </span>
                                      <span className="text-emerald-400">ObjectId</span><span className="text-slate-400">(</span><span className="text-amber-200">"{log._id}"</span><span className="text-slate-400">),</span>
                                    </div>
                                    <div className="pl-4">
                                      <span className="text-sky-300">"timestamp"</span><span className="text-slate-400">: </span>
                                      <span className="text-teal-400">ISODate</span><span className="text-slate-400">(</span><span className="text-amber-200">"{log.timestamp}"</span><span className="text-slate-400">),</span>
                                    </div>
                                    <div className="pl-4">
                                      <span className="text-sky-300">"action"</span><span className="text-slate-400">: </span>
                                      <span className="text-amber-200">"{log.action}"</span><span className="text-slate-400">,</span>
                                    </div>
                                    <div className="pl-4">
                                      <span className="text-sky-300">"email"</span><span className="text-slate-400">: </span>
                                      <span className="text-amber-200">"{log.email}"</span><span className="text-slate-400">,</span>
                                    </div>
                                    <div className="pl-4">
                                      <span className="text-sky-300">"details"</span><span className="text-slate-400">: </span>
                                      <span className="text-amber-200">"{log.details}"</span><span className="text-slate-400">,</span>
                                    </div>
                                    <div className="pl-4">
                                      <span className="text-sky-300">"ipAddress"</span><span className="text-slate-400">: </span>
                                      <span className="text-amber-200">"{log.ipAddress}"</span><span className="text-slate-400">,</span>
                                    </div>
                                    <div className="pl-4">
                                      <span className="text-sky-300">"authDbProvider"</span><span className="text-slate-400">: </span>
                                      <span className="text-amber-200">"{log.dbProvider}"</span><span className="text-slate-400">,</span>
                                    </div>
                                    <div className="pl-4">
                                      <span className="text-sky-300">"status"</span><span className="text-slate-400">: </span>
                                      <span className="text-amber-200">"{log.status}"</span><span className="text-slate-400">,</span>
                                    </div>
                                    <div className="pl-4">
                                      <span className="text-sky-300">"metadata"</span><span className="text-slate-400">{" : {"}</span>
                                    </div>
                                    <div className="pl-8">
                                      <span className="text-sky-300">"browser"</span><span className="text-slate-400">: </span>
                                      <span className="text-amber-200">"{log.metadata.browser}"</span><span className="text-slate-400">,</span>
                                    </div>
                                    <div className="pl-8">
                                      <span className="text-sky-300">"os"</span><span className="text-slate-400">: </span>
                                      <span className="text-amber-200">"{log.metadata.os}"</span><span className="text-slate-400">,</span>
                                    </div>
                                    <div className="pl-8">
                                      <span className="text-sky-300">"mongodb_cluster_sync"</span><span className="text-slate-400">: </span>
                                      <span className="text-amber-200">"{log.metadata.mongodb_target}"</span>
                                    </div>
                                    <div className="pl-4">
                                      <span className="text-slate-400">{"}"}</span>
                                    </div>
                                    <div><span className="text-slate-400">{"}"}</span></div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            {filteredLogs.length > 0 && (
              <div className="py-2.5 px-4 bg-slate-50/70 border-t border-slate-200 text-xs text-slate-450 font-medium">
                Papar {filteredLogs.length} daripada {totalLogs} dokumen audit logs. Klik baris log untuk menyahkod skema BSON MongoDB.
              </div>
            )}
          </div>
        </div>

        {/* Action Panel / Simulation Sidebar */}
        <div className="space-y-6">
          {/* MongoDB Connection Status Card */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center space-x-3">
              <Database className="h-4.5 w-4.5 text-brand-600" />
              <h3 className="font-semibold text-slate-900 text-sm">Konfigurasi Sambungan MongoDB</h3>
            </div>
            <div className="p-5 space-y-4 text-xs font-medium text-slate-600 leading-relaxed">
              <div>
                <span className="block text-slate-400 font-bold uppercase tracking-wider text-[10px] mb-1">Dihantar ke Kluster MongoDB</span>
                <pre className="p-2 bg-slate-50 border border-slate-150 rounded-lg font-mono text-[11px] text-slate-700 break-all select-all leading-normal">
                  {settings.uri}
                </pre>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-[10px] text-slate-400">Penyedia Log: <strong>MongoDB Atlas (Cloud)</strong></span>
                  <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Sedia Diproses
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex gap-2">
                <Button 
                  variant="outline" 
                  fullWidth
                  className="h-8 text-xs font-semibold"
                  onClick={() => {
                    alert(`URI kluster aktif: ${settings.uri}\nDatabase: ${settings.db}\nCollection: ${settings.collection}\nLogs disegerakkan secara automatik menggunakan JSON payloads.`);
                  }}
                >
                  Maklumat Log Cluster
                </Button>
              </div>
            </div>
          </div>

          {/* Log Simulator Sandbox */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center space-x-3">
              <PlusCircle className="h-4.5 w-4.5 text-brand-600" />
              <h3 className="font-semibold text-slate-900 text-sm">Simulator Aktiviti IAM</h3>
            </div>
            
            <div className="p-5 space-y-4">
              <p className="text-xs text-slate-500 leading-relaxed">
                Uji integrasi log real-time dengan menolak aktiviti IAM di bawah. Tindakan ini akan menyuntik log audit BSON yang sepadan ke dalam koleksi MongoDB.
              </p>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Tindakan Log Sistem</label>
                <select
                  value={simulateAction}
                  onChange={(e) => setSimulateAction(e.target.value)}
                  className="w-full py-1.5 px-3 border border-slate-200 rounded-lg text-xs font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
                >
                  <option value="LOG_MASUK">LOG_MASUK (Login Pengguna)</option>
                  <option value="PERTANYAAN">QUERY_DOKUMEN (Carian Pangkalan Data)</option>
                  <option value="UPDATE_PROFIL">UPDATE_PROFIL (Tukar Maklumat Penting)</option>
                  <option value="HAD_KESELAMATAN">HAD_KESELAMATAN (Zero-Trust Block)</option>
                  <option value="PADAM_REKOD">PADAM_REKOD (Padam Pengguna dari IAM)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Status Pengesahan</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSimulateStatus('Berjaya')}
                    className={`py-1 rounded-md text-xs font-bold border transition-all ${
                      simulateStatus === 'Berjaya'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                        : 'border-slate-200 text-slate-650 hover:bg-slate-50'
                    }`}
                  >
                    Berjaya
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimulateStatus('Gagal')}
                    className={`py-1 rounded-md text-xs font-bold border transition-all ${
                      simulateStatus === 'Gagal'
                        ? 'border-rose-500 bg-rose-50 text-rose-800'
                        : 'border-slate-200 text-slate-650 hover:bg-slate-50'
                    }`}
                  >
                    Gagal (Blok)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Maklumat Kustom (Pilihan)</label>
                <textarea
                  placeholder="Butiran kustom log, biarkan kosong untuk automatik..."
                  value={simulateDetail}
                  onChange={(e) => setSimulateDetail(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
                  rows={2}
                />
              </div>

              <Button
                onClick={handleSimulateLog}
                isLoading={isSimulatingCheck}
                fullWidth
                className="text-xs font-bold py-2 bg-slate-900 border-none hover:bg-slate-800 text-white"
              >
                Hantar & Segerakkan Log ke MongoDB
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
