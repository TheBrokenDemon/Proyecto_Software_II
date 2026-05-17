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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Header />
    <PreLogin />
  </StrictMode>,
)
