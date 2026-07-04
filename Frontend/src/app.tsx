import { Routes, Route, Link } from 'react-router-dom';

// Layout y guardias
import Layout from './components/Layout';
import PublicRoute from './components/PublicRoute';
import ProtectedRoute from './components/ProtectedRoute';

// Páginas públicas
import PreLogin from './pages/PreLogin';
import Login from './pages/Login';
import Register from './pages/Register';
import Recovery from './pages/Recovery';
import ProfessionalAccess from './pages/ProfessionalAccess';

// Páginas protegidas — estudiante
import Dashboard from './pages/Dashboard';
import Encuesta from './pages/Encuesta';
import Survey from './pages/Survey';
import Historial from './pages/Historial';
import Perfil from './pages/Perfil';
import ModificarPerfil from './pages/ModificarPerfil';
import Tips from './pages/Tips';
import MisSeguimientos from './pages/MisSeguimientos';
import Citas from './pages/Citas';

// Páginas protegidas — psicólogo
import PsychologistPanel from './pages/PsychologistPanel';
import ProfessionalPanel from './pages/ProfessionalPanel';

export default function App() {
    return (
        <Routes>
            {/* ── Rutas públicas ─────────────────────────── */}
            <Route path="/" element={<PublicRoute><PreLogin /></PublicRoute>} />
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
            <Route path="/recovery" element={<PublicRoute><Recovery /></PublicRoute>} />
            <Route path="/professional-access" element={<PublicRoute><ProfessionalAccess /></PublicRoute>} />

            {/* ── Rutas protegidas con Header ─────────────── */}
            <Route element={<Layout />}>
                {/* Estudiante */}
                <Route path="/dashboard" element={
                    <ProtectedRoute allowedRoles={['estudiante']}><Dashboard /></ProtectedRoute>
                } />
                <Route path="/encuestas" element={
                    <ProtectedRoute allowedRoles={['estudiante']}><Encuesta /></ProtectedRoute>
                } />
                <Route path="/survey/:slug" element={
                    <ProtectedRoute allowedRoles={['estudiante']}><Survey /></ProtectedRoute>
                } />
                <Route path="/history" element={
                    <ProtectedRoute allowedRoles={['estudiante']}><Historial /></ProtectedRoute>
                } />
                <Route path="/tips" element={
                    <ProtectedRoute allowedRoles={['estudiante']}><Tips /></ProtectedRoute>
                } />
                <Route path="/seguimientos" element={
                    <ProtectedRoute allowedRoles={['estudiante']}><MisSeguimientos /></ProtectedRoute>
                } />
                <Route path="/citas" element={
                    <ProtectedRoute allowedRoles={['estudiante']}><Citas /></ProtectedRoute>
                } />
                <Route path="/perfil" element={
                    <ProtectedRoute><Perfil /></ProtectedRoute>
                } />
                <Route path="/modificarPerfil" element={
                    <ProtectedRoute><ModificarPerfil /></ProtectedRoute>
                } />

                {/* Psicólogo */}
                <Route path="/psychologist-panel" element={
                    <ProtectedRoute allowedRoles={['psicologo']}><PsychologistPanel /></ProtectedRoute>
                } />
                <Route path="/professional-panel" element={
                    <ProtectedRoute allowedRoles={['psicologo']}><ProfessionalPanel /></ProtectedRoute>
                } />
            </Route>

            {/* ── 404 ────────────────────────────────────── */}
            <Route path="*" element={
                <div style={{ padding: '3rem', textAlign: 'center' }}>
                    <h2>404 — Página no encontrada</h2>
                    <Link to="/">Volver al inicio</Link>
                </div>
            } />
        </Routes>
    );
}