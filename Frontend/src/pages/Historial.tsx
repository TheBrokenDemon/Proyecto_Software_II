import './css/historial.css'

import CardHistorial from '../components/cardHistorial';


import dreamySunrise from './images/dreamy-sunrise.jpg'

import { useState } from "react";



export default function Historial(){
    const [usuario, setUsuario] = useState([]);
    const [newImage, setNewImage] = useState(false);

    

    // Si existiese la imagen, setNewImage(true)
    const conditionalSetNewImage = () => {
        setNewImage(true);
    }

    // const comentario = {psicologoID:"ID", psicologoName: "Nombre Apellido", title: "La importancia de ser feliz", comment: "Es bueno sentirse feliz, continue de esa manera"}
    

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
                        {usuario.map((user) => (
                            <tr>
                                <td key={user.id}>{user.estado}</td>
                                <td key={user.id}>{user.description}</td>
                                <td key={user.id}>{user.fecha}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                // Los props se conectaran con la base de datos
                <CardHistorial
                    img={dreamySunrise}
                    estado="Feliz"
                    description="Me he sentido feliz debido a que he mejorado la nota"
                    fecha="26/05/2026"
                    comentario={{psicologoID: "ID"}}
                />
                <CardHistorial
                    img="./images/dusk-calms.jpg"
                    estado="Triste"
                    description="Me he sentido triste debido a una nota de la universidad"
                    fecha="24/05/2026"
                />
                <CardHistorial
                    img="./images/midnight-moon.jpg"
                    estado="Ansioso"
                    description="Me he sentido ansioso debido a un proximo examen"
                    fecha="21/05/2026"
                />
                <CardHistorial
                    img="./images/dreamy-sunrise.jpg"
                    estado="Feliz"
                    description="Me he sentido feliz debido a que estan yendo bien las cosas"
                    fecha="20/05/2026"
                />
            </div>
        </>
    )
}