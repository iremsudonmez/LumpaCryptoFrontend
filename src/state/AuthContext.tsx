import { createContext, useContext, useState, type ReactNode } from 'react';
import * as authApi from '../api/auth';
import type { AuthResponse, LoginRequest, RegisterRequest } from '../api/types';
import { getToken } from '../api/client';

// what any component can ask from the auth context
interface AuthContextValue {
  user: AuthResponse | null;
  isLoggedIn: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  // user info lives in react state -> ui re-renders when it changes
  const [user, setUser] = useState<AuthResponse | null>(null);

  const login = async (data: LoginRequest) => {
    const res = await authApi.login(data);
    setUser(res);
  };

  const register = async (data: RegisterRequest) => {
    const res = await authApi.register(data);
    setUser(res);
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
  };

  // token in storage but no user object -> page was refreshed mid-session
  const isLoggedIn = user !== null || getToken() !== null;

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// small hook so pages write useAuth() instead of useContext(AuthContext)
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}