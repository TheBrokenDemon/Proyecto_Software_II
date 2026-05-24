import { useState } from "react";
import "./cssComponents/estadoCard.css"

/*
{setComment &&
            <div className="newBox">
                    <p>Comentario: {props.comentario.comment}</p>
                    <button onClick={displayComment}>Volver</button>
            </div>}
*/

export default function CardHistorial(props) {
    const [comment, setComment] = useState(false);
    console.log();

    const backgroundImage = {
        backgroundImage:
            `url(${props.img})`,
    }

    const displayComment = () => {
        setComment(!setComment);
    }

    return (
        <div>
            <article className="estadoCard" style={backgroundImage}>
                <p className="propFecha">{props.fecha}</p>
                <h3 className="propEstado">{props.estado}</h3>
                <p className="propDescription">{props.description}</p>
                {!props.description && <p className="propDescriptionConditional">No se ha agregado una descripcion</p>}
                <button onClick={displayComment}>Mostrar comentario</button>

                
            </article>
            
        </div>
    )
}