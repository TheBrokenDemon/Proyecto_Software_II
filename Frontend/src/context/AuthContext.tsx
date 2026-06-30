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
  userPhoto: string | null;
  login: (credentials: LoginPayload) => Promise<{ role: string }>;
  register: (userData: RegisterPayload) => Promise<any>;
  logout: () => void;
  reloadUser: () => Promise<void>;
  setUserPhoto: (photo: string | null) => void;
}

// ── Contexto ──────────────────────────────────────────────────
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ── Provider ──────────────────────────────────────────────────
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userPhoto, setUserPhoto] = useState<string | null>(null);

  const setSession = useCallback((sessionData: { user: User; token: string } | null) => {
    if (sessionData?.user && sessionData?.token) {
      localStorage.setItem('authToken', sessionData.token);
      setUser(sessionData.user);
    } else {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userName');
      setUser(null);
      setUserPhoto(null);          // ✅ CAMBIO 2: limpia la foto al cerrar sesión
    }
  }, []);

  const loadUserProfile = useCallback(async () => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const data = await getUserProfile();
        setSession({ user: data.user, token });
        // ✅ CAMBIO 3: carga SOLO la foto de este usuario (o null si no tiene)
        setUserPhoto(localStorage.getItem(`userPhoto:${data.user.id}`) || null);
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
    await loadUserProfile();
    return { role: data.user.role };
  };

  // S2-39: Registro
  const handleRegister = async (userData: RegisterPayload) => {
    const data = await registerUser(userData);
    setSession(data);
    await loadUserProfile();
    return data;
  };

  // Logout
  const handleLogout = () => {
    setSession(null);
    window.location.href = '/login';
  };

  const value = useMemo(() => ({
    user,
    userPhoto,
    setUserPhoto,
    isAuthenticated: !!user,
    isLoading,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    reloadUser: loadUserProfile,
  }), [user, userPhoto, isLoading, loadUserProfile]);

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