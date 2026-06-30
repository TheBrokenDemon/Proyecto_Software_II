import { NavLink } from 'react-router-dom';
import '../estilos/landing.css';
import '../estilos/auth.css';

export default function PreLogin() {
    return (
        <section id="screen-landing">
            <div className="landing-bg">
                <div className="blob blob-1"></div>
                <div className="blob blob-2"></div>
                <div className="blob blob-3"></div>
            </div>
            <div className="landing-content">
                <div className="logo-mark">✦</div>
                <h1 className="landing-title">MindCheck</h1>
                <p className="landing-sub">Tu espacio emocional</p>
                <div className="landing-actions">
                    <NavLink to="/login" className="btn-primary">Iniciar sesión</NavLink>
                    <NavLink to="/register" className="btn-ghost">Crear cuenta</NavLink>
                </div>
            </div>
        </section>
    );
}