import React, { useState, useEffect, useRef } from 'react';
import { ShieldAlert, Clock, RefreshCw, LogOut, ShieldCheck, AlertTriangle } from 'lucide-react';
import { Button } from './ui/Button';

interface SessionManagerProps {
  children: React.ReactNode;
  onLogout: () => void;
}

const SESSION_DURATION = 300; // 5 minutes in seconds
const WARNING_THRESHOLD = 60; // 1 minute warning in seconds

export const SessionManager: React.FC<SessionManagerProps> = ({ children, onLogout }) => {
  const [timeLeft, setTimeLeft] = useState(SESSION_DURATION);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const onLogoutRef = useRef(onLogout);
  
  // Track changing onLogout callback
  useEffect(() => {
    onLogoutRef.current = onLogout;
  }, [onLogout]);

  // Initialize and tick down timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          onLogoutRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Determine whether warning modal should show up based on time left
  useEffect(() => {
    if (timeLeft <= WARNING_THRESHOLD && timeLeft > 0) {
      setShowWarningModal(true);
    } else {
      setShowWarningModal(false);
    }
  }, [timeLeft]);

  const handleExtendSession = () => {
    setTimeLeft(SESSION_DURATION);
    setShowWarningModal(false);
  };

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  // Percentage for subtle circular or line progress indicators
  const percentLeft = (timeLeft / SESSION_DURATION) * 100;

  return (
    <div className="relative min-h-screen">
      {/* Prime content goes here */}
      {children}

      {/* Floating Modern Session Pill */}
      <div className="fixed bottom-4 right-4 z-40 animate-fade-in pointer-events-auto">
        <div className={`p-3 rounded-2xl border backdrop-blur-md shadow-lg flex items-center gap-3 transition-colors ${
          timeLeft <= WARNING_THRESHOLD 
            ? 'bg-rose-50/90 border-rose-200 text-rose-800' 
            : 'bg-white/90 border-slate-250 text-slate-700'
        }`}>
          <div className="relative flex items-center justify-center">
            <Clock className={`h-4.5 w-4.5 shrink-0 ${timeLeft <= WARNING_THRESHOLD ? 'text-rose-600 animate-pulse' : 'text-slate-500'}`} />
            <span className="sr-only">Timer</span>
          </div>

          <div className="text-xs">
            <span className="block text-[8px] font-bold uppercase tracking-wider text-slate-400">Sesi Selamat (SAML)</span>
            <span className="font-mono text-xs font-bold leading-none">{formatTime(timeLeft)}</span>
          </div>

          <button
            type="button"
            onClick={handleExtendSession}
            className={`p-1.5 rounded-lg transition-all ${
              timeLeft <= WARNING_THRESHOLD 
                ? 'bg-rose-500 hover:bg-rose-600 text-white' 
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
            title="Lanjutkan Sesi"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Warning Alert Modal Notification */}
      {showWarningModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-rose-100 overflow-hidden animate-slide-up flex flex-col">
            
            {/* Red alert glow stripe */}
            <div className="h-1.5 w-full bg-rose-600"></div>

            <div className="p-6 text-center space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 animate-bounce">
                <AlertTriangle className="h-6 w-6" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900">Amaran Tempoh Sesi Hampir Tamat</h3>
                <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                  Sesi kawalan akses Zero Trust anda di portal Kitabuddy akan tamat secara automatik demi menjaga keutuhan data.
                </p>
              </div>

              {/* Countdown circle styling */}
              <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-4 flex flex-col items-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Masa Berbaki</span>
                <span className="font-mono text-3xl font-extrabold text-rose-600 tracking-wider">
                  {formatTime(timeLeft)}
                </span>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-3 max-w-xs">
                  <div 
                    className="bg-rose-600 h-full transition-all duration-1000 ease-linear" 
                    style={{ width: `${percentLeft}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <Button 
                  onClick={handleExtendSession} 
                  className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Kekalkan & Lanjutkan Sesi
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={onLogout} 
                  className="w-full py-2.5 border-slate-200 text-slate-650 hover:bg-slate-50"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Log Keluar Sekarang
                </Button>
              </div>
            </div>

            {/* Shield Footer */}
            <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[10px] text-slate-450 font-medium">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>Sistem Akses Diperakui Polisi SAML Zero Trust</span>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
