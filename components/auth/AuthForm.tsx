import React, { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Github } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { AuthMode } from '../../types';

interface AuthFormProps {
  mode: AuthMode;
  setMode: (mode: AuthMode) => void;
  onLogin: (name: string, email: string) => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({ mode, setMode, onLogin }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Simulate network request
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (mode === 'login') {
      if (email === 'demo@example.com' && password === 'password') {
        onLogin('Demo User', email);
      } else if (email && password) {
         // Allow any non-empty login for demo purposes if not specific demo creds
         onLogin(name || email.split('@')[0], email);
      } else {
        setError('Invalid credentials. Try demo@example.com / password');
        setIsLoading(false);
      }
    } else if (mode === 'register') {
      if (email && password && name) {
        onLogin(name, email);
      } else {
        setError('Please fill in all fields.');
        setIsLoading(false);
      }
    } else {
      // Forgot password flow
      setIsLoading(false);
      alert('Reset link sent to your email!');
      setMode('login');
    }
  };

  const renderTitle = () => {
    switch (mode) {
      case 'login': return 'Selamat Kembali';
      case 'register': return 'Cipta akaun';
      case 'forgot-password': return 'Tetapkan semula kata laluan';
    }
  };

  const renderSubtitle = () => {
    switch (mode) {
      case 'login': return 'Masukkan butiran anda untuk mengakses ruang kerja anda.';
      case 'register': return 'Mulakan percubaan percuma anda. Tiada kad kredit diperlukan.';
      case 'forgot-password': return 'Kami akan menghantar pautan untuk menetapkan semula kata laluan anda.';
    }
  };

  return (
    <div className="w-full max-w-md mx-auto animate-fade-in">
      <div className="mb-8 text-center sm:text-left">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">{renderTitle()}</h1>
        <p className="text-slate-500 text-sm sm:text-base">{renderSubtitle()}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'register' && (
          <Input
            id="name"
            type="text"
            label="Nama Penuh"
            placeholder="John Doe"
            icon={User}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        )}

        <Input
          id="email"
          type="email"
          label="Alamat Emel"
          placeholder="name@company.com"
          icon={Mail}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {mode !== 'forgot-password' && (
          <div className="space-y-1">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              label="Kata Laluan"
              placeholder="••••••••"
              icon={showPassword ? EyeOff : Eye}
              onIconClick={() => setShowPassword(!showPassword)}
              iconClickable
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={error || undefined}
              required
            />
            {mode === 'login' && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setMode('forgot-password')}
                  className="text-xs font-medium text-brand-600 hover:text-brand-500"
                >
                  Lupa kata laluan?
                </button>
              </div>
            )}
          </div>
        )}

        <div className="pt-2">
          <Button type="submit" fullWidth isLoading={isLoading} size="lg">
            {mode === 'login' && 'Log Masuk'}
            {mode === 'register' && 'Cipta Akaun'}
            {mode === 'forgot-password' && 'Hantar Pautan'}
            {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        </div>
      </form>

      {mode !== 'forgot-password' && (
        <>
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-50 px-2 text-slate-500">ATAU TERUSKAN DENGAN</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" type="button" className="w-full">
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </Button>
            <Button variant="outline" type="button" className="w-full">
              <Github className="mr-2 h-4 w-4" />
              GitHub
            </Button>
          </div>
        </>
      )}

      <div className="mt-8 text-center text-sm">
        {mode === 'login' ? (
          <p className="text-slate-600">
            Tiada akaun?{' '}
            <button
              onClick={() => setMode('register')}
              className="font-medium text-brand-600 hover:text-brand-500"
            >
              Daftar
            </button>
          </p>
        ) : (
          <p className="text-slate-600">
            Sudah mempunyai akaun?{' '}
            <button
              onClick={() => setMode('login')}
              className="font-medium text-brand-600 hover:text-brand-500"
            >
              Log masuk
            </button>
          </p>
        )}
      </div>
    </div>
  );
};