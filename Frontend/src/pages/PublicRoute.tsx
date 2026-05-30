import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Componente para rutas públicas.
 * Si el usuario ya está autenticado, lo redirige al dashboard.
 * De lo contrario, muestra la página pública solicitada (Login, Register, etc.).
 */
export default function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <div>Cargando...</div>; // Muestra un loader para evitar parpadeos
  }

  if (isAuthenticated) {
    // Redirige al panel correspondiente según el rol del usuario
    const targetPath = user?.role === 'psicologo' ? '/psychologist-panel' : '/dashboard';
    return <Navigate to={targetPath} replace />;
  }

  return <>{children}</>;
}