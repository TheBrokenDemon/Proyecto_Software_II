import { useState, FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { resetPassword } from '../services/auth.service';
import '../estilos/auth.css';

export default function ResetPassword() {
    const [params] = useSearchParams();
    const token = params.get('token') || '';

    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [done, setDone] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');

        if (!token) { setError('El enlace no es válido o está incompleto.'); return; }
        if (password.length < 8) { setError('La contraseña debe tener al menos 8 caracteres.'); return; }
        if (password !== confirm) { setError('Las contraseñas no coinciden.'); return; }

        setLoading(true);
        try {
            await resetPassword(token, password);
            setDone(true);
        } catch (err: any) {
            setError(err.message || 'No se pudo restablecer la contraseña. El enlace pudo haber expirado.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div id="screen-reset" className="screen active">
            <div className="auth-layout">
                <div className="auth-panel">
                    <Link to="/login" className="back-btn">← Volver</Link>

                    <div className="auth-header">
                        <div className="logo-mark small">✦</div>
                        <h2>Nueva contraseña</h2>
                        <p>Elige una contraseña nueva para tu cuenta</p>
                    </div>

                    {!token ? (
                        <div className="server-error" style={{ textAlign: 'center' }}>
                            <p>El enlace no es válido o está incompleto.</p>
                            <Link to="/recovery" className="btn-ghost">Solicitar un nuevo enlace</Link>
                        </div>
                    ) : !done ? (
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div className="form-group">
                                <label htmlFor="new-password">Nueva contraseña</label>
                                <input
                                    type="password"
                                    id="new-password"
                                    placeholder="Mínimo 8 caracteres"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    disabled={loading}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="confirm-password">Confirmar contraseña</label>
                                <input
                                    type="password"
                                    id="confirm-password"
                                    placeholder="Repite la contraseña"
                                    value={confirm}
                                    onChange={e => setConfirm(e.target.value)}
                                    disabled={loading}
                                />
                            </div>
                            {error && <p className="server-error">{error}</p>}
                            <button type="submit" className="btn-primary full" disabled={loading}>
                                {loading ? 'Guardando...' : 'Restablecer contraseña'}
                            </button>
                        </form>
                    ) : (
                        <div className="success-box">
                            <div className="success-icon">✅</div>
                            <h3>¡Contraseña actualizada!</h3>
                            <p>Ya puedes iniciar sesión con tu nueva contraseña.</p>
                            <Link to="/login" className="btn-ghost">Ir a iniciar sesión</Link>
                        </div>
                    )}
                </div>

                <div className="auth-deco">
                    <div className="deco-quote">"Un nuevo comienzo<br />empieza con<br />un pequeño paso."</div>
                    <div className="deco-author">— MindCheck</div>
                </div>
            </div>
        </div>
    );
}