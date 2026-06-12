import { useState, useEffect } from 'react';
import CardHistorial from '../components/CardHistorial';
import { getMyHistory } from '../services/evaluation.service';
import '../estilos/historial.css';

interface HistoryItem {
    id: string;
    title: string;
    completed_at: string;
}

const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('es-PE', {
        day: '2-digit', month: '2-digit', year: 'numeric'
    });

export default function Historial() {
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        getMyHistory()
            .then(setHistory)
            .catch((err: any) => setError(err.message || 'Error al cargar el historial.'))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="history-container">
            <header className="history-header">
                <h1>Mi Historial de Evaluaciones</h1>
                <p>Aquí puedes ver un registro de todas las encuestas que has completado.</p>
            </header>

            <main>
                {loading && <div className="history-message-container">Cargando historial...</div>}
                {error && <div className="history-message-container error">{error}</div>}

                {!loading && !error && (
                    history.length > 0 ? (
                        <div className="history-grid">
                            {history.map(item => (
                                <CardHistorial
                                    key={item.id}
                                    img="/images/dreamy-sunrise.jpg"
                                    estado={item.title}
                                    description="Evaluación completada exitosamente."
                                    fecha={formatDate(item.completed_at)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="history-message-container">
                            Aún no has completado ninguna evaluación.
                        </div>
                    )
                )}
            </main>
        </div>
    );
}