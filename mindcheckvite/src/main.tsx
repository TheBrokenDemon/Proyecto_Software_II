import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import App from './App.tsx'
import Header from './components/Header.tsx';
import Login from './pages/Login.tsx'
import PreLogin from './pages/PreLogin'
import Register from './pages/Register.tsx'
import Dashboard from './pages/Dashboard.tsx'
import Survey from './pages/Survey.tsx'
import Recovery from './pages/Recovery.tsx'
import Historial from './pages/Historial.tsx';
import { BrowserRouter, Route, Routes } from 'react-router';

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <Header/>
    <Routes>
      <Route path="/" element={<PreLogin/>}/>
      <Route path="/register" element={<Register/>}/>
      <Route path="/login" element={<Login/>}/>
      <Route path="/dashboard" element={<Dashboard/>}/>
      <Route path="/survey" element={<Survey/>}/>
      <Route path="/recovery" element={<Recovery/>}/>
      <Route path="/history" element={<Historial/>}/>
    </Routes>
  </BrowserRouter>,
)
