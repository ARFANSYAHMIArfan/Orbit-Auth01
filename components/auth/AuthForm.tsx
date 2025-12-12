import React, { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Github, CheckCircle, ArrowLeft } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { AuthMode } from '../../types';
import { loginUser, registerUser, resetPasswordRequest, loginWithSocial } from '../../services/authService';

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
  const [resetSent, setResetSent] = useState(false);

  const handleModeSwitch = (newMode: AuthMode) => {
    setMode(newMode);
    setError(null);
    setResetSent(false);
    setPassword('');
  };

  const handleSocialLogin = async (provider: 'Google' | 'GitHub' | 'Facebook') => {
    setIsLoading(true);
    setError(null);
    
    try {
        const user = await loginWithSocial(provider);
        onLogin(user.name, user.email);
    } catch (err: any) {
        setError(err.message || 'Login failed');
        setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
        if (mode === 'login') {
            const user = await loginUser(email, password);
            onLogin(user.name, user.email);
        } else if (mode === 'register') {
            const user = await registerUser(name, email, password);
            onLogin(user.name, user.email);
        } else {
            // Forgot password flow
            await resetPasswordRequest(email);
            setIsLoading(false);
            setResetSent(true);
        }
    } catch (err: any) {
        setError(err.message || 'Something went wrong');
        setIsLoading(false);
    }
  };

  // Success view for Forgot Password
  if (mode === 'forgot-password' && resetSent) {
    return (
        <div className="w-full max-w-md mx-auto animate-fade-in text-center">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-slide-up">
                <CheckCircle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Check your email</h2>
            <p className="text-slate-600 mb-8">
                We've sent a password reset link to <span className="font-medium text-slate-900">{email}</span>.
            </p>
            <Button onClick={() => handleModeSwitch('login')} fullWidth>
                Back to Sign in
            </Button>
            <button 
              onClick={() => setResetSent(false)} 
              className="mt-6 text-sm text-slate-500 hover:text-slate-700 font-medium"
            >
                Didn't receive the email? Click to resend
            </button>
        </div>
    );
  }

  const renderTitle = () => {
    switch (mode) {
      case 'login': return 'Welcome back';
      case 'register': return 'Create an account';
      case 'forgot-password': return 'Reset password';
    }
  };

  const renderSubtitle = () => {
    switch (mode) {
      case 'login': return 'Enter your details to access your workspace.';
      case 'register': return 'Start your 30-day free trial. No credit card required.';
      case 'forgot-password': return 'Enter your email and we’ll send you a reset link.';
    }
  };

  return (
    <div className="w-full max-w-md mx-auto animate-fade-in">
      {mode === 'forgot-password' && (
        <button 
            onClick={() => handleModeSwitch('login')}
            className="flex items-center text-sm text-slate-500 hover:text-slate-900 mb-6 transition-colors group"
        >
            <ArrowLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
            Back to Login
        </button>
      )}

      <div className="mb-8 text-center sm:text-left">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">{renderTitle()}</h1>
        <p className="text-slate-500 text-sm sm:text-base">{renderSubtitle()}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'register' && (
          <Input
            id="name"
            type="text"
            label="Full Name"
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
          label="Email Address"
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
              label="Password"
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
                  onClick={() => handleModeSwitch('forgot-password')}
                  className="text-xs font-medium text-brand-600 hover:text-brand-500"
                >
                  Forgot password?
                </button>
              </div>
            )}
          </div>
        )}

        <div className="pt-2">
          <Button type="submit" fullWidth isLoading={isLoading} size="lg">
            {mode === 'login' && 'Sign In'}
            {mode === 'register' && 'Create Account'}
            {mode === 'forgot-password' && 'Send Reset Link'}
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
              <span className="bg-slate-50 px-2 text-slate-500">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Button 
                variant="outline" 
                type="button" 
                className="w-full px-0" 
                onClick={() => handleSocialLogin('Google')}
                title="Sign in with Google"
                disabled={isLoading}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
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
            </Button>
            <Button 
                variant="outline" 
                type="button" 
                className="w-full px-0" 
                onClick={() => handleSocialLogin('Facebook')}
                title="Sign in with Facebook"
                disabled={isLoading}
            >
               <svg className="h-5 w-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                 <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 2.848-6.32 6.191-6.32 1.602 0 3.183.123 3.183.123v3.472h-1.792c-1.815 0-2.38.835-2.38 2.015v1.29h3.896l-.626 3.667h-3.27v7.98h-5.2z" />
               </svg>
            </Button>
            <Button 
                variant="outline" 
                type="button" 
                className="w-full px-0" 
                onClick={() => handleSocialLogin('GitHub')}
                title="Sign in with GitHub"
                disabled={isLoading}
            >
              <Github className="h-5 w-5" />
            </Button>
          </div>
        </>
      )}

      <div className="mt-8 text-center text-sm">
        {mode === 'login' ? (
          <p className="text-slate-600">
            Don't have an account?{' '}
            <button
              onClick={() => handleModeSwitch('register')}
              className="font-medium text-brand-600 hover:text-brand-500"
            >
              Sign up
            </button>
          </p>
        ) : mode === 'register' ? (
          <p className="text-slate-600">
            Already have an account?{' '}
            <button
              onClick={() => handleModeSwitch('login')}
              className="font-medium text-brand-600 hover:text-brand-500"
            >
              Sign in
            </button>
          </p>
        ) : null}
      </div>
    </div>
  );
};