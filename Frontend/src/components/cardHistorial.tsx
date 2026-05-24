import { useState } from "react";
import "./cssComponents/estadoCard.css"

export default function CardHistorial(props) {
    const [box, setBox] = useState(false);
    console.log();

    const backgroundImage = {
        backgroundImage:
            `url(${props.img})`,
    }

    const displayComment = () => {
        setBox(!box);
    }

    console.log(box)

    return (
        <div className="card">
            <article className="estadoCard" style={backgroundImage}>
                <p className="propFecha">{props.fecha}</p>
                <h3 className="propEstado">{props.estado}</h3>
                <p className="propDescription">{props.description}</p>
                {!props.description && <p className="propDescriptionConditional">No se ha agregado una descripcion</p>}
                <button onClick={displayComment}>Mostrar comentario</button>
            
                {box &&
            
                <div className="newBox">
                        <p>Comentario: {props.comment}</p>
                        <button onClick={displayComment}>Volver</button>
                </div>}
            </article>

        </div>
    )
}