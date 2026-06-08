import React, { useState } from 'react';
import { ArrowLeft, RefreshCw, ExternalLink, ShieldCheck, Wifi, CloudLightning, CheckCircle, Server } from 'lucide-react';
import { Button } from './ui/Button';

interface StatusViewProps {
  onBack: () => void;
}

export const StatusView: React.FC<StatusViewProps> = ({ onBack }) => {
  const [iframeKey, setIframeKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const handleRefresh = () => {
    setIframeKey((prev) => prev + 1);
    setIsLoading(true);
  };

  return (
    <div className="max-w-7xl mx-auto animate-fade-in flex flex-col space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack} className="p-2 h-auto text-slate-600 hover:text-slate-900">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-slate-900">Pemantauan Status Sistem</h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 animate-pulse border border-emerald-100">
                <Wifi className="h-3 w-3" />
                Aktif
              </span>
            </div>
            <p className="text-slate-500 text-sm">Lihat metrik prestasi dan laporan uptime masa nyata Kitabuddy Orbit.</p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <Button 
            variant="outline" 
            onClick={handleRefresh} 
            className="h-9 px-3 text-xs flex items-center gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Muat Semula
          </Button>
          <a
            href="https://kitabuddy-orbit.betteruptime.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="h-9 px-3 text-xs inline-flex items-center justify-center gap-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Buka di Tab Baru
          </a>
        </div>
      </div>

      {/* System Status Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-3.5">
          <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Keselamatan Gateway</span>
            <span className="text-sm font-semibold text-slate-800">100% Zero-Trust</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-3.5">
          <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600">
            <Server className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Pelayan Web</span>
            <span className="text-sm font-semibold text-slate-800">Operasi Lancar</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-3.5">
          <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-600">
            <CheckCircle className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">SLA Bulan Ini</span>
            <span className="text-sm font-semibold text-slate-800">100.00%</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-3.5">
          <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600">
            <CloudLightning className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Latensi Purata</span>
            <span className="text-sm font-semibold text-slate-800">45ms</span>
          </div>
        </div>
      </div>

      {/* Embedded Iframe Container */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col h-[70vh] min-h-[480px] relative">
        {isLoading && (
          <div className="absolute inset-0 bg-slate-50/80 backdrop-blur-sm flex flex-col items-center justify-center z-10 transition-opacity">
            <div className="w-8 h-8 border-2 border-brand-650 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-sm font-medium text-slate-600 animate-pulse">Menghubungkan ke halaman status...</p>
          </div>
        )}
        <iframe
          key={iframeKey}
          src="https://kitabuddy-orbit.betteruptime.com/"
          title="Kitabuddy BetterUptime Status"
          className="w-full h-full border-none"
          onLoad={() => setIsLoading(false)}
          referrerPolicy="no-referrer"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />
      </div>

      {/* Help Note */}
      <div className="text-xs text-slate-400 flex items-center space-x-2">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
        <span>Jika halaman status tidak dipaparkan dengan betul dalam frame, klik butang <b>"Buka di Tab Baru"</b> untuk akses langsung.</span>
      </div>
    </div>
  );
};
