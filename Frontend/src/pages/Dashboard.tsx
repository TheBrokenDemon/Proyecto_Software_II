import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyHistory, getRecommendations } from '../services/evaluation.service';
import MoodCheckin from '../components/MoodCheckin';
import '../estilos/dashboard.css';

interface HistoryItem {
    id: string;
    title: string;
    completed_at: string;
}

interface Recommendation {
    icon: string;
    title: string;
    text: string;
}

interface RecsResponse {
    hasHistory: boolean;
    basedOn?: {
        evaluation: string;
        slug: string;
        label: string;
        level: 'bajo' | 'medio' | 'alto';
        score: number;
        completed_at: string;
    };
    recommendations: Recommendation[];
}

const StatCard = ({ icon, value, label, subLabel }: {
    icon: string; value: string; label: string; subLabel?: string;
}) => (
    <div className="stat-card">
        <div className="stat-card-header">
            <span className="stat-card-icon">{icon}</span>
            <span>{label}</span>
        </div>
        <p className="stat-card-value">{value}</p>
        {subLabel && <p className="stat-card-label">{subLabel}</p>}
    </div>
);

export default function Dashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState({ total: 0, lastDate: 'Nunca' });
    const [loading, setLoading] = useState(true);
    const [recs, setRecs] = useState<RecsResponse | null>(null);

    useEffect(() => {
        getMyHistory()
            .then((history: HistoryItem[]) => {
                const total = history.length;
                const lastDate = total > 0
                    ? new Date(history[0].completed_at).toLocaleDateString('es-PE', {
                        day: '2-digit', month: 'short', year: 'numeric'
                    })
                    : 'Nunca';
                setStats({ total, lastDate });
            })
            .catch(console.error)
            .finally(() => setLoading(false));

        getRecommendations()
            .then(setRecs)
            .catch(console.error);
    }, []);

    return (
        <main className="dashboard-container">
            <section className="dashboard-greeting">
                <span>Buenos días,</span>
                <h2>{user?.full_name?.split(' ')[0] || 'Estudiante'}</h2>
                <p>¿Cómo te sientes hoy? Estamos aquí para ayudarte.</p>
            </section>

            {/* Check-in diario de ánimo */}
            <MoodCheckin />

            {/* R2: Recomendaciones — solo si hay historial */}
            {recs?.hasHistory && recs.basedOn && (
                <section className="recommendations">
                    <div className="recommendations-head">
                        <h3>Recomendaciones para ti</h3>
                        <p>
                            Según tu evaluación de <strong>{recs.basedOn.evaluation}</strong>
                            <span className={`level-badge level-${recs.basedOn.level}`}>
                                nivel {recs.basedOn.level}
                            </span>
                        </p>
                    </div>
                    <div className="recommendations-grid">
                        {recs.recommendations.map((r, i) => (
                            <div key={i} className="recommendation-card">
                                <span className="recommendation-icon">{r.icon}</span>
                                <h4 className="recommendation-title">{r.title}</h4>
                                <p className="recommendation-text">{r.text}</p>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            <section className="dashboard-stats">
                <StatCard icon="📊" label="Evaluaciones"
                    value={loading ? '...' : stats.total.toString()}
                    subLabel="Total completadas" />
                <StatCard icon="🗓️" label="Última vez"
                    value={loading ? '...' : stats.lastDate}
                    subLabel="Última evaluación" />
            </section>

            <section className="dashboard-main-action">
                <h3>Comienza una nueva evaluación</h3>
                <p>
                    Selecciona una de nuestras encuestas para obtener una visión clara de tu
                    estado emocional actual. Es un paso valiente hacia tu bienestar.
                </p>
                <Link to="/encuestas" className="btn-primary">Ver Encuestas</Link>
            </section>
        </main>
    );
}