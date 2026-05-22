import { Link } from "react-router"
import { useState } from "react";
import './css/perfil.css'

export default function Perfil(props){
    const [usuario, setUsuario] = useState("");


    return (
        <>
            <div className="Banner">
                <img src="" className="bannerImage"/>
            </div>

            <div className="boxImage">
                <img src="./images/userLogo.png" className="profileImage"/>
                
            </div>
            
            <div className="profileInformation">
                <h1>Informacion del perfil</h1>
                <p className="username">El nombre del usuario es: </p>
                <p className="usermail">El correo del usuario es: </p>
                <p className="userage">La edad del usuario es: </p>
            </div>
            
            <div className="estadoUsuario">
                <p>El estado del usuario es: </p>
            </div>

            <div className="Buttons">
                <Link to="/modificarPerfil" className="modificarButton">
                    Modificar perfil
                </Link>    
            </div>
        </>
    )
}