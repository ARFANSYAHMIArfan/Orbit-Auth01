import React from 'react';
import { X, Check, Copy, ExternalLink } from 'lucide-react';
import { Button } from './ui/Button';

interface ConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConnectModal: React.FC<ConnectModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // In a real app, we'd show a toast here
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-slate-200 overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="p-6 flex justify-between items-center border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900">Connect to rfnsyhmi-cluster</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Stepper */}
        <div className="px-12 py-6 flex justify-between items-center relative">
          <div className="absolute top-1/2 left-[15%] right-[15%] h-[2px] bg-emerald-500 -translate-y-1/2 z-0"></div>
          
          <div className="relative z-10 flex flex-col items-center space-y-2">
            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white">
              <Check className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-semibold text-emerald-600 uppercase text-center max-w-[80px]">Set up connection security</span>
          </div>

          <div className="relative z-10 flex flex-col items-center space-y-2">
            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white">
              <Check className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-semibold text-emerald-600 uppercase text-center max-w-[80px]">Choose a connection method</span>
          </div>

          <div className="relative z-10 flex flex-col items-center space-y-2">
            <div className="w-8 h-8 rounded-full border-2 border-emerald-500 bg-white flex items-center justify-center text-emerald-600 font-bold">
              3
            </div>
            <span className="text-[10px] font-semibold text-slate-900 uppercase text-center max-w-[80px]">Connect</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8 overflow-y-auto max-h-[70vh]">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Connecting with MongoDB Driver</h3>
            
            {/* Step 1: Select Driver */}
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 flex items-center">1. Select your driver and version</h4>
              <p className="text-sm text-slate-600">We recommend installing and using the latest driver version.</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Driver</label>
                  <select className="w-full p-2 border border-slate-300 rounded text-sm bg-white">
                    <option>Node.js</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Version</label>
                  <select className="w-full p-2 border border-slate-300 rounded text-sm bg-white">
                    <option>6.7 or later</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Step 2: Install Driver */}
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900">2. Install your driver</h4>
              <p className="text-sm text-slate-600">Run the following on the command line</p>
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded p-3 font-mono text-sm group">
                <span className="flex-1 text-slate-800">npm install mongodb</span>
                <button onClick={() => copyToClipboard('npm install mongodb')} className="text-slate-400 hover:text-slate-600 p-1">
                  <Copy className="h-4 w-4" />
                </button>
              </div>
              <a href="#" className="text-xs text-blue-600 hover:underline flex items-center">
                View MongoDB Node.js Driver installation instructions. <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </div>

            {/* Step 3: Connection String */}
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900">3. Add your connection string into your application code</h4>
              <p className="text-sm text-slate-600">Use this connection string in your application</p>
              
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-8 h-4 bg-slate-300 rounded-full relative cursor-pointer">
                  <div className="absolute left-1 top-1 w-2 h-2 bg-white rounded-full"></div>
                </div>
                <span className="text-xs text-slate-600">View full code sample</span>
              </div>

              <div className="flex items-start bg-slate-50 border border-slate-200 rounded p-3 font-mono text-sm break-all group">
                <span className="flex-1 text-slate-800">
                  mongodb+srv://rfnsyhmi_db_user:&lt;db_password&gt;@rfnsyhmi-cluster.qf85bcp.mongodb.net/?appName=rfnsyhmi-cluster
                </span>
                <button onClick={() => copyToClipboard('mongodb+srv://rfnsyhmi_db_user:<db_password>@rfnsyhmi-cluster.qf85bcp.mongodb.net/?appName=rfnsyhmi-cluster')} className="text-slate-400 hover:text-slate-600 p-1 ml-2">
                  <Copy className="h-4 w-4" />
                </button>
              </div>
              <p className="text-xs text-slate-600">
                Replace <span className="text-emerald-600 font-bold">&lt;db_password&gt;</span> with the password for the <span className="text-emerald-600 font-bold">rfnsyhmi_db_user</span> database user. Ensure any option params are <a href="#" className="text-blue-600 hover:underline">URL encoded <ExternalLink className="h-3 w-3 inline" /></a>.
              </p>
            </div>
          </div>

          {/* Resources */}
          <div className="p-6 bg-slate-50/50 rounded-xl border border-slate-100">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Resources</h4>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <a href="#" className="text-blue-600 hover:underline flex items-center">Get started with the Node.js Driver <ExternalLink className="h-3 w-3 ml-1" /></a>
              <a href="#" className="text-blue-600 hover:underline flex items-center">Node.js Starter Sample App <ExternalLink className="h-3 w-3 ml-1" /></a>
              <a href="#" className="text-blue-600 hover:underline flex items-center">Access your Database Users <ExternalLink className="h-3 w-3 ml-1" /></a>
              <a href="#" className="text-blue-600 hover:underline flex items-center">Troubleshoot Connections <ExternalLink className="h-3 w-3 ml-1" /></a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 flex justify-between items-center border-t border-slate-100">
          <Button variant="outline" onClick={onClose} className="px-6">Go Back</Button>
          <Button onClick={onClose} className="bg-[#00684A] hover:bg-[#005a3f] px-8 border-none">Done</Button>
        </div>
      </div>
    </div>
  );
};