import React, { createContext, useState, useEffect, useCallback, useMemo, ReactNode, useContext } from 'react';
import { loginUser, registerUser, LoginPayload, RegisterPayload } from '../services/auth.service';
import { getUserProfile } from '../services/user.service';

// ── Tipos ─────────────────────────────────────────────────────
export interface User {
  id: string;
  full_name: string;
  email: string;
  age: number | null;
  gender: string | null;
  role: 'estudiante' | 'psicologo';
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginPayload) => Promise<{ role: string }>;
  register: (userData: RegisterPayload) => Promise<any>;
  logout: () => void;
  reloadUser: () => Promise<void>;
}

// ── Contexto ──────────────────────────────────────────────────
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ── Provider ──────────────────────────────────────────────────
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const setSession = useCallback((sessionData: { user: User; token: string } | null) => {
    if (sessionData?.user && sessionData?.token) {
      localStorage.setItem('authToken', sessionData.token);
      setUser(sessionData.user);
    } else {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userName');
      setUser(null);
    }
  }, []);

  const loadUserProfile = useCallback(async () => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const data = await getUserProfile();
        setSession({ user: data.user, token });
      } catch {
        setSession(null);
      }
    }
    setIsLoading(false);
  }, [setSession]);

  useEffect(() => {
    loadUserProfile();
  }, [loadUserProfile]);

  // S2-40: Login
  const handleLogin = async (credentials: LoginPayload) => {
    const data = await loginUser(credentials);
    setSession(data);
    localStorage.setItem('userRole', data.user.role);
    localStorage.setItem('userName', data.user.full_name);
    return { role: data.user.role };
  };

  // S2-39: Registro
  const handleRegister = async (userData: RegisterPayload) => {
    const data = await registerUser(userData);
    setSession(data);
    return data;
  };

  // Logout
  const handleLogout = () => {
    setSession(null);
    window.location.href = '/login';
  };

  const value = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    isLoading,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    reloadUser: loadUserProfile,
  }), [user, isLoading, loadUserProfile]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// ── Hook ──────────────────────────────────────────────────────
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
};