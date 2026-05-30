import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerUser } from '../services/usuarioServices'
import '../estilos/variables.css'
import '../estilos/base.css'
import '../estilos/landing.css'
import '../estilos/components.css'
import '../estilos/auth.css'
import '../estilos/responsive.css'

export default function Register() {
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validaciones básicas
    if (!fullName || !email || !password) {
      setError('Completa todos los campos.')
      return
    }

    if (password.length < 6) {
      setError('La contraseña debe tener mínimo 6 caracteres.')
      return
    }

    if (!email.includes('@')) {
      setError('Correo electrónico inválido.')
      return
    }

    setLoading(true)
    try {
      // Llamar al servicio de registro
      const data = await registerUser({ 
        full_name: fullName, 
        email, 
        password,
        role: 'estudiante' // Por defecto, estudiantes
      })

      // Guardar token
      if (data.token) localStorage.setItem('authToken', data.token)
      if (data.user?.role) localStorage.setItem('userRole', data.user.role)
      if (data.user?.full_name) localStorage.setItem('userName', data.user.full_name)

      // Redirigir al dashboard
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Error al registrarse. Intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <nav>
      <title>Registro – MindCheck</title>
      <div>
        <section className="auth-layout">
          <div className="auth-panel">
            <Link to="/" className="back-btn">
              ← Volver
            </Link>

            <div className="auth-header">
              <div className="logo-mark small">✦</div>
              <h2>Crear cuenta</h2>
              <p>Comienza tu camino hacia el bienestar</p>
            </div>

            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label>Nombre completo</label>
                <input
                  type="text"
                  placeholder="Tu nombre"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label>Correo electrónico</label>
                <input
                  type="email"
                  placeholder="hola@ejemplo.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label>Contraseña</label>
                <input
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  disabled={loading}
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
                {loading ? 'Registrando...' : 'Registrarme'}
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: '12px', fontSize: '0.875rem' }}>
              ¿Ya tienes cuenta? <Link to="/login" style={{ color: '#1b7a3f', fontWeight: 'bold' }}>Inicia sesión</Link>
            </p>
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