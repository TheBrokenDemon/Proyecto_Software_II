import "../estilos/estadoCard.css";

interface CardHistorialProps {
    img: string;
    fecha: string;
    estado: string;
    description?: string; // Opcional
}

export default function CardHistorial(props: CardHistorialProps) {
    return (
        <div className="card">
            <div 
                className="card-image-container" 
                style={{ backgroundImage: `url(${props.img})` }}
            >
                {/* El contenido de la imagen ahora se maneja con CSS */}
            </div>
            <div className="card-content">
                <p className="propFecha">{props.fecha}</p>
                <h3 className="propEstado">{props.estado}</h3>
                {props.description ? (
                    <p className="propDescription">{props.description}</p>
                ) : (
                    <p className="propDescriptionConditional">No se ha agregado una descripción.</p>
                )}
            </div>
        </div>
    )
}