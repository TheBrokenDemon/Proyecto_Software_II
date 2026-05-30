import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando sesión...</div>;
  }

  if (!isAuthenticated) {
    // Guarda la ubicación a la que el usuario intentaba ir, para redirigirlo después del login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si se especifican roles, verifica que el usuario tenga uno de los roles permitidos
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}