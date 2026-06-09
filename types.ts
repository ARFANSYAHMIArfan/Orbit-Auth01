export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role?: string;
  department?: string;
  lastActive?: string;
  ipAddress?: string;
  status?: string;
}

export type AuthMode = 'login' | 'register' | 'forgot-password';

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}