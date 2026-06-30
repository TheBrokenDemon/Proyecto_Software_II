import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getEvaluations } from '../services/evaluation.service';
import '../estilos/Encuesta.css';

interface Evaluation {
    id: string;
    title: string;
    slug: string;
    description: string;
    icon: string;
}

const EvaluationCard = ({ evaluation }: { evaluation: Evaluation }) => (
    <Link to={`/survey/${evaluation.slug}`} className="evaluation-card">
        <div className="evaluation-icon">{evaluation.icon || '❓'}</div>
        <div className="evaluation-content">
            <h3>{evaluation.title}</h3>
            <p>{evaluation.description}</p>
        </div>
        <div className="evaluation-arrow">→</div>
    </Link>
);

export default function Encuesta() {
    const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getEvaluations()
            .then(setEvaluations)
            .catch(() => setError('No se pudieron cargar las encuestas.'))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="encuesta-container"><p className="loading-message">Cargando encuestas...</p></div>;
    if (error) return <div className="encuesta-container"><p className="error-message">{error}</p></div>;

    return (
        <div className="encuesta-container">
            <header className="encuesta-header">
                <h1>Encuestas Disponibles</h1>
                <p>Tu bienestar es nuestra prioridad. Elige una evaluación para comenzar.</p>
            </header>
            <main className="evaluations-grid">
                {evaluations.length > 0 ? (
                    evaluations.map(ev => <EvaluationCard key={ev.id} evaluation={ev} />)
                ) : (
                    <p>No hay encuestas disponibles en este momento.</p>
                )}
            </main>
        </div>
    );
}