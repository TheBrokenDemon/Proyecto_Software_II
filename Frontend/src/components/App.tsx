import React from 'react';
// 1. Usa rutas relativas. Asumiendo que App.css está en src/
import '../App.css'; 
// 2. El paquete correcto es 'react-router-dom'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

// 3. Usa rutas relativas para tus componentes.
import Login from '../pages/Login';
import PreLogin from '../pages/PreLogin';
import Historial from '../pages/Historial';
import ProfessionalPanel from '../pages/ProfessionalPanel';

function App() {
  return (
    <Router>
      <Routes>
        {/* 4. Es una convención usar rutas en minúsculas (kebab-case) */}
        <Route path="/login" element={<Login />} />
        <Route path="/pre-login" element={<PreLogin />} />
        <Route path="/historial" element={<Historial />} />
        <Route path="/professional-panel" element={<ProfessionalPanel />} />
        {/* Agrega aquí el resto de tus rutas */}
      </Routes>
    </Router>
  );
}

export default App;
