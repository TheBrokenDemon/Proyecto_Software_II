import { useState } from "react";
import defaultUserImage from "C:/Users/garyg/Desktop/Repositorios/Proyecto_Software_II/mindcheckvite/src/images/userLogo.png"


export default function Historial(){
    const [usuario, setUsuario] = useState([]);
    const [newImage, setNewImage] = useState(false);

    // Si existiese la imagen, setNewImage(true)
    const conditionalSetNewImage = () => {
        
    }

    return (
        <>
            <div className="userInformation">
                <img src={newImage ? usuario.imagen : defaultUserImage} className="userImage"/>
                <h1>Nombre del usuario</h1>
                <p>{usuario.nombre}</p>

                <h2>Informacion del usuario</h2>
                <p>{usuario.correo}</p>
                <p>{usuario.edad}</p>
                <p>{usuario.direccion}</p>
            </div>

            <div className="userHistory">
                <h1>Estados del usuario</h1>
                <ul>
                    {usuario.map(user => (
                        <li key={user.id}>{user.estado}</li>
                    ))}
                </ul>
            </div>
        </>
    )
}