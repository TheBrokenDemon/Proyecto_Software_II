/**
 * Login.tsx
 * Inicio de sesión – conectado al backend real.
 * Redirige según rol: psicologo → /psychologist-panel | estudiante → /dashboard
 */
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loginUser } from '../services/usuarioServices'
import './css/variables.css'
import './css/base.css'
import './css/landing.css'
import './css/components.css'
import './css/auth.css'
import './css/responsive.css'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Completa todos los campos.')
      return
    }

    setLoading(true)
    try {
      const data = await loginUser({ email, password })
      // Guardar datos de sesión
      if (data.token) localStorage.setItem('authToken', data.token)
      if (data.user?.role) localStorage.setItem('userRole', data.user.role)
      if (data.user?.full_name) localStorage.setItem('userName', data.user.full_name)

      // Redirigir según rol
      if (data.user?.role === 'psicologo') {
        navigate('/psychologist-panel')
      } else {
        navigate('/dashboard')
      }
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <nav>
      <title>Login – MindCheck</title>
      <div>
        <section className="auth-layout">
          <div className="auth-panel">
            <button className="back-btn">
              <li><Link to="/">← Volver</Link></li>
            </button>

            <div className="auth-header">
              <div className="logo-mark small">✦</div>
              <h2>Bienvenida de vuelta</h2>
              <p>Nos alegra verte de nuevo</p>
            </div>

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label>Correo electrónico</label>
                <input
                  type="email"
                  placeholder="hola@ejemplo.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Contraseña</label>
                <input
                  type="password"
                  placeholder="Tu contraseña"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>

              {error && (
                <p style={{
                  background: '#fee2e2', color: '#991b1b',
                  padding: '10px 14px', borderRadius: '10px',
                  fontSize: '0.875rem', margin: 0
                }}>{error}</p>
              )}

              <button
                type="submit"
                className="btn-primary full"
                disabled={loading}
                style={{ opacity: loading ? 0.7 : 1 }}
              >
                {loading ? 'Ingresando...' : 'Entrar'}
              </button>
            </form>

            <Link to="/recovery" style={{ display: 'block', marginTop: '12px', fontSize: '0.875rem' }}>
              ¿Olvidaste tu contraseña?
            </Link>

            <Link to="/professional-access" className="professional-login-link">
              Acceso para profesionales de psicología
            </Link>
          </div>

          <div className="auth-deco">
            <div className="deco-quote">"Cuida tus emociones"</div>
            <div className="deco-author">— Tu bienestar importa</div>
          </div>
        </section>
      </div>
    </nav>
  )
}
