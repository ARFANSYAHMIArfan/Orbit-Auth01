import React from 'react';
import { User } from '../types';
import { Button } from './ui/Button';
import { LogOut, Sparkles, MessageSquare } from 'lucide-react';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">Orbit</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:block text-sm text-slate-500">
                Logged in as <span className="font-medium text-slate-900">{user.email}</span>
              </div>
              <Button variant="ghost" onClick={onLogout} className="text-sm">
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-8 md:p-12 text-center">
            <div className="inline-flex items-center justify-center p-2 bg-brand-50 rounded-full mb-6">
              <Sparkles className="h-6 w-6 text-brand-600" />
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Welcome back, {user.name}!
            </h2>
            
            <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8">
              This is a secure dashboard area. The login was successful.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-12">
              {[
                { title: 'Analytics', desc: 'View your performance metrics in real-time.', color: 'bg-blue-50 text-blue-700' },
                { title: 'Projects', desc: 'Manage your active development tasks.', color: 'bg-indigo-50 text-indigo-700' },
                { title: 'Settings', desc: 'Configure your workspace preferences.', color: 'bg-slate-50 text-slate-700' },
              ].map((item, i) => (
                <div key={i} className="p-6 rounded-xl border border-slate-100 hover:border-brand-200 hover:shadow-md transition-all cursor-pointer bg-white group">
                  <div className={`w-10 h-10 rounded-lg ${item.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-slate-500 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};