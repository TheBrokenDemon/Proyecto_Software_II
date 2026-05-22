import { Link } from "react-router"
import { useState } from "react";
import './css/perfil.css'

export default function Perfil(props){
    const [usuario, setUsuario] = useState("");


    return (
        <>
            <div className="">
                <div className="boxImage">
                    <img src="./images/userLogo.png" className="profileImage"/>
                </div>
                
                <div className="profileInformation">
                    <h1>Informacion del perfil</h1>
                    <p>Nombre del usuario</p>
                    <p className="username">Nombre de usuario</p>
                    <p>Genero</p>
                    <p className="usergenero">Genero</p>
                    <p>Correo del usuario</p>
                    <p className="usermail">Correo del usuario</p>
                    <p>Edad del usuario</p>
                    <p className="userage">Edad del usuario</p>
                </div>
            </div>

            <div className="userState">
                <div className="estadoUsuario">
                    <p>El estado del usuario es: </p>
                </div>
            </div>

            <div className="buttonModify">
                <div className="Buttons">
                    <Link to="/modificarPerfil" className="modificarButton">
                        Modificar perfil
                    </Link>    
                </div>
            </div>
        </>
    )
}