import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import { BrowserRouter, Route, Routes } from 'react-router-dom'
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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Rutas con Header compartido */}
        <Route path="/" element={<><Header /><PreLogin /></>} />
        <Route path="/register" element={<><Header /><Register /></>} />
        <Route path="/login" element={<><Header /><Login /></>} />
        <Route path="/professional-access" element={<><Header /><ProfessionalAccess /></>} />
        <Route path="/dashboard" element={<><Header /><Dashboard /></>} />
        <Route path="/survey" element={<><Header /><Survey /></>} />
        <Route path="/recovery" element={<><Header /><Recovery /></>} />
        <Route path="/history" element={<><Header /><Historial /></>} />
        <Route path="/perfil" element={<><Header /><Perfil /></>} />
        <Route path="/modificarPerfil" element={<><Header /><ModificarPerfil /></>} />

        {/* Panel psicólogo: layout propio, sin header global */}
        <Route path="/psychologist-panel" element={<PsychologistPanel />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
