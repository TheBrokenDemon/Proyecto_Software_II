import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import "./estilos/index.css"
import { AuthProvider } from '../context/AuthContext'
import { BrowserRouter } from 'react-router-dom'
import App from '../App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)