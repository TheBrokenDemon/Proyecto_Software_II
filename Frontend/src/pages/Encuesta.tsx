import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getEvaluations } from '../ts/encuesta';
import '../estilos/Encuesta.css';

// Definimos el tipo para una evaluación para mayor seguridad
interface Evaluation {
    id: string;
    title: string;
    slug: string;
    description: string;
    icon: string;
}

// Componente para una tarjeta de encuesta individual
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

// Componente principal de la página de encuestas
export default function Encuesta() {
    const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchEvaluations = async () => {
            try {
                // Usamos el nuevo servicio para obtener los datos
                const data = await getEvaluations();
                setEvaluations(data);
            } catch (err: any) {
                setError('No se pudieron cargar las encuestas. Inténtalo de nuevo más tarde.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchEvaluations();
    }, []);

    if (loading) {
        return <div className="encuesta-container"><p className="loading-message">Cargando encuestas...</p></div>;
    }

    if (error) {
        return <div className="encuesta-container"><p className="error-message">{error}</p></div>;
    }

    return (
        <div className="encuesta-container">
            <header className="encuesta-header">
                <h1>Encuestas Disponibles</h1>
                <p>Tu bienestar es nuestra prioridad. Elige una de las siguientes evaluaciones para comenzar a entender mejor tu estado emocional.</p>
            </header>
            <main className="evaluations-grid">
                {evaluations.length > 0 ? (
                    evaluations.map(evaluation => (
                        <EvaluationCard key={evaluation.id} evaluation={evaluation} />
                    ))
                ) : (
                    <div className="no-evaluations-message">
                        <p>No hay encuestas disponibles en este momento. ¡Vuelve a consultar más tarde!</p>
                    </div>
                )}
            </main>
        </div>
    );
}