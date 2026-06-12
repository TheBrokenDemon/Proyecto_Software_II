import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyHistory } from '../services/evaluation.service';
import '../estilos/dashboard.css';

interface HistoryItem {
    id: string;
    title: string;
    completed_at: string;
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
    }, []);

    return (
        <main className="dashboard-container">
            <section className="dashboard-greeting">
                <span>Buenos días,</span>
                <h2>{user?.full_name?.split(' ')[0] || 'Estudiante'}</h2>
                <p>¿Cómo te sientes hoy? Estamos aquí para ayudarte.</p>
            </section>

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