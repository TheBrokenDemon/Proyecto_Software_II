import React from 'react';
import 'C:/Users/garyg/Desktop/Repositorios/Proyecto_Software_II/mindcheck/src/App.css';
import {BrowserRouter as Router, Route, Routes} from 'react-router'

import Login from "C:/Users/garyg/Desktop/Repositorios/Proyecto_Software_II/mindcheckvite/src/pages/Login.tsx"
import PreLogin from "C:/Users/garyg/Desktop/Repositorios/Proyecto_Software_II/mindcheckvite/src/pages/PreLogin.tsx"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/Login" element={<Login/>}/>
        <Route path="/PreLogin" element={<PreLogin/>}/>
      </Routes>
    </Router>
  );
}

export default App;
