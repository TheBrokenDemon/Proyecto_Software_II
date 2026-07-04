import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { updateTheme } from '../services/user.service';

type Theme = 'institucional' | 'naturaleza' | 'descanso';

interface ThemeContextType {
  theme: Theme;
  changeTheme: (theme: Theme) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [theme, setTheme] = useState<Theme>(
    (localStorage.getItem('theme') as Theme) || 'institucional'
  );

  // Aplica el tema al <body> SOLO si hay sesión iniciada.
  // Si no hay usuario (login, registro, recuperar/restablecer),
  // se quitan todas las clases de tema para no "contaminar" esas pantallas.
  useEffect(() => {
    document.body.classList.remove('theme-institucional', 'theme-naturaleza', 'theme-descanso');
    if (user) {
      document.body.classList.add(`theme-${theme}`);
    }
  }, [theme, user]);

  // Al iniciar sesión, carga el tema guardado del usuario
  useEffect(() => {
    if (user) {
      const savedTheme = (localStorage.getItem('theme') as Theme) || 'institucional';
      setTheme(savedTheme);
    }
  }, [user]);

  const changeTheme = async (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    // La clase la aplica el useEffect de arriba (solo si hay sesión)
    await updateTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, changeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme debe usarse dentro de ThemeProvider');
  return context;
};