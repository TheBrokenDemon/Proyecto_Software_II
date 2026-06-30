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

  useEffect(() => {
    document.body.classList.remove('theme-institucional', 'theme-naturaleza', 'theme-descanso');
    document.body.classList.add(`theme-${theme}`);
  }, [theme]);

  useEffect(() => {
    if (user) {
      const savedTheme = (localStorage.getItem('theme') as Theme) || 'institucional';
      setTheme(savedTheme);
      document.body.classList.add(`theme-${savedTheme}`);
    }
  }, [user]);

  const changeTheme = async (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.body.classList.add(`theme-${newTheme}`);
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
