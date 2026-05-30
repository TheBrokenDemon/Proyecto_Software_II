import { Routes, Route } from 'react-router-dom';

// Layout y Rutas Protegidas/Públicas
import Layout from './components/Layout';
import PublicRoute from './pages/PublicRoute';
import ProtectedRoute from './pages/ProtectedRoute';

// Páginas Públicas
import PreLogin from './pages/PreLogin';
import Login from './pages/Login';
import Register from './pages/Register';
import Recovery from './pages/Recovery';
import ProfessionalAccess from './pages/ProfessionalAccess';

// Páginas Protegidas (Estudiantes)
import Dashboard from './pages/Dashboard';
import Encuesta from './pages/Encuesta';
import Survey from './pages/Survey';
import Historial from './pages/Historial';
import Perfil from './pages/Perfil';
import ModificarPerfil from './pages/modificarPerfil';

// Páginas Protegidas (Psicólogos)
import PsychologistPanel from './pages/PsychologistPanel';
import ProfessionalPanel from './pages/ProfessionalPanel';

export default function App() {
  return (
    <Routes>
      {/* --- Rutas Públicas --- */}
      <Route
        path="/"
        element={
          <PublicRoute>
            <PreLogin />
          </PublicRoute>
        }
      />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />
      <Route
        path="/recovery"
        element={
          <PublicRoute>
            <Recovery />
          </PublicRoute>
        }
      />
      <Route
        path="/professional-access"
        element={
          <PublicRoute>
            <ProfessionalAccess />
          </PublicRoute>
        }
      />

      {/* --- Rutas Protegidas (con Header/Layout) --- */}
      <Route element={<Layout />}>
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={['estudiante']}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/encuestas"
          element={
            <ProtectedRoute allowedRoles={['estudiante']}>
              <Encuesta />
            </ProtectedRoute>
          }
        />
        <Route
          path="/survey/:slug"
          element={
            <ProtectedRoute allowedRoles={['estudiante']}>
              <Survey />
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute allowedRoles={['estudiante']}>
              <Historial />
            </ProtectedRoute>
          }
        />
        <Route
          path="/perfil"
          element={
            <ProtectedRoute>
              <Perfil />
            </ProtectedRoute>
          }
        />
        <Route
          path="/modificarPerfil"
          element={
            <ProtectedRoute>
              <ModificarPerfil />
            </ProtectedRoute>
          }
        />
        <Route
          path="/psychologist-panel"
          element={
            <ProtectedRoute allowedRoles={['psicologo']}>
              <PsychologistPanel />
            </ProtectedRoute>
          }
        />
        <Route
          path="/professional-panel"
          element={
            <ProtectedRoute allowedRoles={['psicologo']}>
              <ProfessionalPanel />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* --- Ruta para página no encontrada --- */}
      <Route path="*" element={<div style={{ padding: '2rem', textAlign: 'center' }}><h2>404: Página no encontrada</h2><Link to="/">Volver al inicio</Link></div>} />
    </Routes>
  );
}