import React, { createContext, useState, useEffect, useCallback, useMemo, ReactNode, useContext } from 'react';
import { registerUser, loginUser, getUserProfile } from '../services/usuarioServices';

// --- 1. Definición de Tipos (TypeScript) ---
export interface User {
  id: string;
  full_name: string;
  email: string;
  age: number | null;
  gender: string | null;
  role: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: any) => Promise<{ role: string }>; // Devolvemos el rol para la redirección
  register: (userData: any) => Promise<any>;
  logout: () => void;
  reloadUser: () => Promise<void>;
}

// --- 2. Creación del Contexto ---
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- 3. Creación del Proveedor del Contexto ---
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Función centralizada para manejar el estado de la sesión
  const setSession = useCallback((sessionData: { user: User, token: string } | null) => {
    if (sessionData?.user && sessionData?.token) {
      localStorage.setItem('authToken', sessionData.token);
      setUser(sessionData.user);
    } else {
      localStorage.removeItem('authToken');
      setUser(null);
    }
  }, []);

  // Carga y valida la sesión del usuario al iniciar la app
  const loadUserProfile = useCallback(async () => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const data = await getUserProfile(); // API devuelve { user: {...} }
        setSession({ user: data.user, token });
      } catch (error) {
        console.error("Sesión inválida o expirada.", error);
        setSession(null); // Limpia la sesión si el token es inválido
      }
    }
    setIsLoading(false);
  }, [setSession]);

  useEffect(() => {
    loadUserProfile();
  }, [loadUserProfile]);

  // Función de Login
const handleLogin = async (credentials: any) => {
  try {
    const data = await loginUser(credentials);
    setSession(data);
    // Guardamos datos que podrían ser útiles en otras partes de la app
    localStorage.setItem('userRole', data.user.role);
    localStorage.setItem('userName', data.user.full_name);
    return { role: data.user.role }; // Devolvemos solo el rol
  } catch (error) {
    setSession(null);
    throw error;
  }
};
  // Función de Registro
  const handleRegister = async (userData: any) => {
    try {
      const data = await registerUser(userData);
      setSession(data);
      return data;
    } catch (error) {
      setSession(null);
      throw error;
    }
  };

  // Función de Logout
  const handleLogout = () => {
    setSession(null);
    // Limpiamos cualquier otro dato de sesión que hayamos guardado
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    // Redirige para una mejor UX, asegurando que el estado de la app se reinicie
    window.location.href = '/login';
  };

  // `useMemo` optimiza el rendimiento, evitando re-renderizados innecesarios
  const authContextValue = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    isLoading,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    reloadUser: loadUserProfile,
  }), [user, isLoading, loadUserProfile]);

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// --- 4. Hook Personalizado para consumir el Contexto ---
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};