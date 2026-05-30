import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';

// Importa los componentes de ruta y layout
import PublicRoute from '../pages/PublicRoute'; // Confirmando la ruta correcta
import ProtectedRoute from '../pages/ProtectedRoute'; // Confirmando la ruta correcta
import Header from './Header';

// Importa las páginas
import Login from '../pages/Login';
import PreLogin from '../pages/PreLogin';
import Register from '../pages/Register';
import Recovery from '../pages/Recovery';
import ProfessionalAccess from '../pages/ProfessionalAccess';
import Dashboard from '../pages/Dashboard';
import Survey from '../pages/Survey';
import Historial from '../pages/Historial';
import Perfil from '../pages/Perfil';
import ModificarPerfil from '../pages/modificarPerfil';
import PsychologistPanel from '../pages/PsychologistPanel';
import Encuesta from '../pages/Encuesta'; // Importamos la nueva página

// Layout para las rutas protegidas que usan el Header estándar
const ProtectedLayout = ({ children }: { children: React.ReactNode }) => (
  <>
    <Header />
    {children}
  </>
);

function App() {
  return (
    <Routes>
      {/* Rutas Públicas */}
      <Route path="/" element={<PublicRoute><PreLogin /></PublicRoute>} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/recovery" element={<PublicRoute><Recovery /></PublicRoute>} />
      <Route path="/professional-access" element={<PublicRoute><ProfessionalAccess /></PublicRoute>} />

      {/* Rutas Protegidas con Layout (Header + Página) */}
      <Route path="/dashboard" element={<ProtectedRoute><ProtectedLayout><Dashboard /></ProtectedLayout></ProtectedRoute>} />
      <Route path="/encuestas" element={<ProtectedRoute><ProtectedLayout><Encuesta /></ProtectedLayout></ProtectedRoute>} />
      <Route path="/survey/:slug" element={<ProtectedRoute><ProtectedLayout><Survey /></ProtectedLayout></ProtectedRoute>} />
      <Route path="/history" element={<ProtectedRoute><ProtectedLayout><Historial /></ProtectedLayout></ProtectedRoute>} />
      <Route path="/perfil" element={<ProtectedRoute><ProtectedLayout><Perfil /></ProtectedLayout></ProtectedRoute>} />
      <Route path="/modificarPerfil" element={<ProtectedRoute><ProtectedLayout><ModificarPerfil /></ProtectedLayout></ProtectedRoute>} />
      <Route path="/psychologist-panel" element={<ProtectedRoute><ProtectedLayout><PsychologistPanel /></ProtectedLayout></ProtectedRoute>} />
      
      {/* Redirección para rutas no encontradas */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;