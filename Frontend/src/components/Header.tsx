import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink } from "react-router-dom"
import { useAuth } from '../context/AuthContext';
import '../estilos/Header.css'; // Archivo de estilos mejorado

// --- Iconos para el menú desplegable ---
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
const LogoutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>;

export default function Header(){
    const { user, logout } = useAuth();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Hook para cerrar el menú si se hace clic fuera de él
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Si el contexto aún está cargando o no hay usuario, no mostramos nada.
    // ProtectedRoute ya se encarga de la lógica de carga y redirección.
    if (!user) return null;

    return (
        <header className="main-header">
            <div className="header-content">
                <Link to={user.role === 'psicologo' ? '/psychologist-panel' : '/dashboard'} className="logo-link">
                    <img src={"/images/MindChecklogo.png"} alt="MindCheck Logo" className="logo-img"/>
                    <span>MindCheck</span>
                </Link>
                
              <nav className="main-nav">
                    <NavLink 
                        to={user.role === 'psicologo' ? '/psychologist-panel' : '/dashboard'} 
                        className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
                        end // 'end' asegura que solo esté activo en la ruta exacta
                    >
                        Inicio
                    </NavLink>
                    {user.role !== 'psicologo' && (
                                                     <>
                                                <NavLink to="/encuestas" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                                                     Encuestas
                                            </NavLink>
                                <NavLink to="/history" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                                    Historial
                                </NavLink>
                            </>
                        )}
</nav>

                <div className="user-menu" ref={dropdownRef}>
                    <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="user-menu-button">
                        <div className="avatar">
                            <span>{user.full_name.charAt(0).toUpperCase()}</span>
                        </div>
                        <span className="user-name">{user.full_name.split(' ')[0]}</span>
                        <svg className={`chevron ${isDropdownOpen ? 'open' : ''}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </button>

                    {isDropdownOpen && (
                        <div className="dropdown-menu">
                            <div className="dropdown-header">
                                <p className="dropdown-user-name">{user.full_name}</p>
                                <p className="dropdown-user-email">{user.email}</p>
                            </div>
                            <Link 
                                to="/modificarPerfil" 
                                className="dropdown-item" 
                                onClick={() => setIsDropdownOpen(false)}
                            >
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
    )
}