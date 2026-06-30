import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../estilos/auth.css';

export default function Register() {
  const navigate = useNavigate();
  const { register: registerCtx } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge]           = useState('');
  const [gender, setGender]     = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName || !email || !password) {
      setError('Nombre, correo y contraseña son obligatorios.');
      return;
    }
    if (!email.includes('@')) {
      setError('Correo electrónico inválido.');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener mínimo 6 caracteres.');
      return;
    }
    if (age && (Number(age) < 18 || Number(age) > 100)) {
      setError('La edad debe estar entre 18 y 100 años.');
      return;
    }

    setLoading(true);
    try {
      await registerCtx({
        full_name: fullName,
        email,
        password,
        age: age ? Number(age) : undefined,
        gender: gender || undefined,
        role: 'estudiante',
      });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Error al registrarse. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-layout">
      <div className="auth-panel">
        <Link to="/" className="back-btn">← Volver</Link>

        <div className="auth-header">
          <div className="logo-mark small">✦</div>
          <h2>Crear cuenta</h2>
          <p>Comienza tu camino hacia el bienestar</p>
        </div>

        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          <div className="form-group">
            <label>Nombre completo <span style={{ color: '#c0392b' }}>*</span></label>
            <input
              type="text"
              placeholder="Tu nombre completo"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Correo electrónico <span style={{ color: '#c0392b' }}>*</span></label>
            <input
              type="email"
              placeholder="hola@ejemplo.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Contraseña <span style={{ color: '#c0392b' }}>*</span></label>
            <input
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Edad y Género en la misma fila */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label>Edad</label>
              <input
                type="number"
                placeholder="Ej: 20"
                value={age}
                min={18}
                max={80}
                onChange={e => setAge(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label>Género</label>
              <select
                value={gender}
                onChange={e => setGender(e.target.value)}
                disabled={loading}
              >
                <option value="">Seleccionar</option>
                <option value="masculino">Masculino</option>
                <option value="femenino">Femenino</option>
              </select>
            </div>
          </div>

          {error && (
            <p style={{
              background: '#fee2e2', color: '#991b1b',
              padding: '10px 14px', borderRadius: '10px',
              fontSize: '0.875rem', margin: 0
            }}>
              {error}
            </p>
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
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" style={{ color: '#1b4332', fontWeight: 'bold' }}>
            Inicia sesión
          </Link>
        </p>
      </div>

      <div className="auth-deco">
        <div className="deco-quote">"El autoconocimiento<br />es el principio<br />de toda sabiduría."</div>
        <div className="deco-author">— Aristóteles</div>
      </div>
    </section>
  );
}