import { StrictMode, useContext } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { AuthProvider, useAuth } from './context/AuthContext'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import Header from './components/Header.tsx'
import Login from './pages/Login.tsx'
import PreLogin from './pages/PreLogin'
import Register from './pages/Register.tsx'
import Dashboard from './pages/Dashboard.tsx'
import Survey from './pages/Survey.tsx'
import Recovery from './pages/Recovery.tsx'
import Historial from './pages/Historial.tsx'
import Perfil from './pages/Perfil.tsx'
import ModificarPerfil from './pages/modificarPerfil.tsx'
import ProfessionalAccess from './pages/ProfessionalAccess.tsx'
import PsychologistPanel from './pages/PsychologistPanel.tsx'

// Componente para rutas públicas que redirigen si el usuario ya está autenticado
function PublicRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Cargando...</div>; // Muestra un loader para evitar parpadeos
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />; // Si está logueado, va al dashboard
  }

  return children; // Si no, muestra la página pública (Login, Register, etc.)
}

// Componente para proteger rutas que requieren autenticación
function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    // Muestra un loader mientras se verifica la autenticación
    return <div>Cargando...</div>;
  }

  if (!isAuthenticated) {
    // Si no está autenticado, redirige al login
    return <Navigate to="/login" replace />;
  }

  // Si está autenticado, renderiza el componente con su layout
  return <><Header />{children}</>;
}

// Componente principal que define las rutas
function App() {
  return (
    <Routes>
      {/* Rutas Públicas */}
      {/* Usamos PublicRoute para manejar la redirección si ya está logueado */}
      <Route path="/" element={<PublicRoute><PreLogin /></PublicRoute>} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/recovery" element={<PublicRoute><Recovery /></PublicRoute>} />
      <Route path="/professional-access" element={<PublicRoute><ProfessionalAccess /></PublicRoute>} />

      {/* Rutas Protegidas */}
      {/* ProtectedRoute se encarga de verificar la autenticación Y de renderizar el Header */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/survey" element={<ProtectedRoute><Survey /></ProtectedRoute>} />
      <Route path="/history" element={<ProtectedRoute><Historial /></ProtectedRoute>} />
      <Route path="/perfil" element={<ProtectedRoute><Perfil /></ProtectedRoute>} />
      <Route path="/modificarPerfil" element={<ProtectedRoute><ModificarPerfil /></ProtectedRoute>} />

      {/* Panel psicólogo: layout propio */}
      {/* Asumimos que esta ruta también debe ser protegida */}
      <Route path="/psychologist-panel" element={<ProtectedRoute><PsychologistPanel /></ProtectedRoute>} />
      
      {/* Redirección de rutas inválidas */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      {/* El AuthProvider envuelve a toda la aplicación */}
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
