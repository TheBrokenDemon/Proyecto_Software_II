import './css/historial.css'
import { useState } from "react";


export default function Historial(){
    const [usuario, setUsuario] = useState([]);
    const [newImage, setNewImage] = useState(false);

    // Si existiese la imagen, setNewImage(true)
    const conditionalSetNewImage = () => {
        setNewImage(true);
    }

    return (
        <>
            <div className="userInformation">
                <img src={newImage ? usuario.imagen : "./images/userLogo.png"} className="userImage"/>
                <h1>Historial de usuario</h1>
                <p>La informacion almacenada es un historial de los estados del usuario</p>

                <h2>Informacion del usuario</h2>
                    <table className="tableInformation">
                        <thead>
                            <tr>
                                <th>Estado</th>
                                <th>Descripcion</th>
                                <th>Fecha</th>
                            </tr>
                        </thead>
                        <tbody id="tablaID">

                        </tbody>
                    </table>
            </div>
        </>
    )
}