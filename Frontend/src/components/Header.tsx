 import { useState, useEffect, useRef } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import '../estilos/Header.css';

const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);

const LogoutIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
);

export default function Header() {
    const { user, logout, userPhoto } = useAuth();
    const { theme, changeTheme } = useTheme();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!user) return null;

    const homeLink = user.role === 'psicologo' ? '/psychologist-panel' : '/dashboard';

    return (
        <header className="main-header">
            <div className="header-content">
                <Link to={homeLink} className="logo">
                    <span>MindCheck</span>
                </Link>

                <nav className="main-nav">
                    <NavLink to={homeLink} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} end>
                        Inicio
                    </NavLink>
                    {user.role !== 'psicologo' && (
                        <>
                            <NavLink to="/encuestas" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                                Encuestas
                            </NavLink>
                            <NavLink to="/history" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                                Historial
                            </NavLink>
                            <NavLink to="/tips" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                                Tips
                            </NavLink>
                        </>
                    )}
                </nav>

                {/* Selector de tema rápido */}
                <div className="theme-switcher">
                    <button
                        className={`theme-btn ${theme === 'institucional' ? 'active' : ''}`}
                        onClick={() => changeTheme('institucional')}
                        title="Tema Institucional"
                    >
                        🏛️
                    </button>
                    <button
                        className={`theme-btn ${theme === 'naturaleza' ? 'active' : ''}`}
                        onClick={() => changeTheme('naturaleza')}
                        title="Naturaleza"
                    >
                        🌿
                    </button>
                    <button
                        className={`theme-btn ${theme === 'descanso' ? 'active' : ''}`}
                        onClick={() => changeTheme('descanso')}
                        title="Modo Descanso"
                    >
                        🌙
                    </button>
                </div>

                <div className="user-menu" ref={dropdownRef}>
                    <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="user-menu-button">
                        <div className="avatar">
                            {userPhoto ? (
                                <img
                                    src={userPhoto}
                                    alt="foto de perfil"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                                />
                            ) : (
                                <span>{user.full_name.charAt(0).toUpperCase()}</span>
                            )}
                        </div>
                        <span className="user-name">{user.full_name.split(' ')[0]}</span>
                        <svg className={`chevron ${isDropdownOpen ? 'open' : ''}`} width="16" height="16"
                            viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <polyline points="6 9 12 15 18 9" />
                        </svg>
                    </button>

                    {isDropdownOpen && (
                        <div className="dropdown-menu">
                            <div className="dropdown-header">
                                <p className="dropdown-user-name">{user.full_name}</p>
                                <p className="dropdown-user-email">{user.email}</p>
                            </div>
                            <Link to="/perfil" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                                <UserIcon />
                                <span>Mi Perfil</span>
                            </Link>
                            <button onClick={logout} className="dropdown-item logout">
                                <LogoutIcon />
                                <span>Cerrar Sesión</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}