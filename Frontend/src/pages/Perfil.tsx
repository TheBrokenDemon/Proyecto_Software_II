import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../estilos/perfil.css";

export default function Perfil() {
    // Usamos el hook useAuth para obtener la información del usuario actual
    const { user, isLoading } = useAuth();

    // Si está cargando, mostramos un mensaje
    if (isLoading) {
        return <div className="profile-container">Cargando perfil...</div>;
    }

    // Si no hay usuario (por algún error), mostramos un mensaje
    if (!user) {
        return <div className="profile-container">No se pudo cargar la información del perfil.</div>;
    }

    return (
        <div className="profile-container">
            <div className="boxImage">
                <img src="/images/userLogo.png" className="profileImage" alt="Avatar de usuario"/>
            </div>
            
            <div className="profileInformation">
                <h1>Información del Perfil</h1>
                <p>Nombre del usuario</p>
                <p className="username">{user.full_name}</p>
                <p>Género</p>
                <p className="usergenero">{user.gender || 'No especificado'}</p>
                <p>Correo del usuario</p>
                <p className="usermail">{user.email}</p>
                <p>Edad del usuario</p>
                <p className="userage">{user.age || 'No especificada'}</p>
            </div>

            <div className="buttonModify">
                <Link to="/modificarPerfil" className="modificarButton">
                    Modificar Perfil
                </Link>    
            </div>
        </div>
    )
}