import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../services/auth.service';
import '../estilos/auth.css';

export default function Recovery() {
    const [email, setEmail] = useState('');
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        if (!email || !email.includes('@')) { setError('Ingresa un correo válido.'); return; }

        setLoading(true);
        try {
            await forgotPassword(email);
            setSent(true);
        } catch (err: any) {
            setError(err.message || 'Error al enviar el correo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div id="screen-recovery" className="screen active">
            <div className="auth-layout">
                <div className="auth-panel">
                    <Link to="/login" className="back-btn">← Volver</Link>

                    <div className="auth-header">
                        <div className="logo-mark small">✦</div>
                        <h2>Recuperar acceso</h2>
                        <p>Te enviaremos un enlace a tu correo</p>
                    </div>

                    {!sent ? (
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div className="form-group">
                                <label htmlFor="recovery-email">Correo electrónico</label>
                                <input
                                    type="email"
                                    id="recovery-email"
                                    placeholder="hola@ejemplo.com"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    disabled={loading}
                                />
                            </div>
                            {error && <p className="server-error">{error}</p>}
                            <button type="submit" className="btn-primary full" disabled={loading}>
                                {loading ? 'Enviando...' : 'Enviar enlace'}
                            </button>
                        </form>
                    ) : (
                        <div className="success-box">
                            <div className="success-icon">✉️</div>
                            <h3>¡Correo enviado!</h3>
                            <p>Revisa tu bandeja de entrada y sigue las instrucciones para restablecer tu contraseña.</p>
                            <Link to="/login" className="btn-ghost">Volver al inicio de sesión</Link>
                        </div>
                    )}
                </div>

                <div className="auth-deco">
                    <div className="deco-quote">"Todos merecemos<br />una segunda<br />oportunidad."</div>
                    <div className="deco-author">— MindCheck</div>
                </div>
            </div>
        </div>
    );
}