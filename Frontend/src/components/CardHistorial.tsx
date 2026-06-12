import '../estilos/historial.css';

interface Props {
    img: string;
    estado: string;
    description: string;
    fecha: string;
}

export default function CardHistorial({ img, estado, description, fecha }: Props) {
    return (
        <div className="history-card">
            <img src={img} alt={estado} className="history-card-img" />
            <div className="history-card-body">
                <h3 className="history-card-title">{estado}</h3>
                <p className="history-card-desc">{description}</p>
                <span className="history-card-date">{fecha}</span>
            </div>
        </div>
    );
}