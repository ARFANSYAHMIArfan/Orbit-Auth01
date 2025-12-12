export interface User {
  id: string;
  name: string;
  email: string;
}

export type AuthMode = 'login' | 'register' | 'forgot-password';

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}