import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PublicRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading, user } = useAuth();

    if (isLoading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando...</div>;

    if (isAuthenticated) {
        const target = user?.role === 'psicologo' ? '/psychologist-panel' : '/dashboard';
        return <Navigate to={target} replace />;
    }

    return <>{children}</>;
}