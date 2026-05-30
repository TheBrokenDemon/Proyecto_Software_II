import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import '../estilos/dashboard.css';

// --- Tipos ---
interface HistoryItem {
  id: string;
  title: string;
  completed_at: string;
}

// --- Helper Components ---
const StatCard = ({ icon, value, label, subLabel }: { icon: string, value: string, label: string, subLabel?: string }) => (
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
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchHistoryStats = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const res = await fetch(`http://localhost:3000/api/evaluations/history`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          const history: HistoryItem[] = data.history || [];
          const total = history.length;
          const lastDate = total > 0 
            ? new Date(history[0].completed_at).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })
            : 'Nunca';
          setStats({ total, lastDate });
        }
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchHistoryStats();
  }, []);

  return (
    <main className="dashboard-container">
      <section className="dashboard-greeting">
        <span>Buenos días,</span>
        <h2>{user?.full_name?.split(' ')[0] || 'Estudiante'}</h2>
        <p>¿Cómo te sientes hoy? Estamos aquí para ayudarte.</p>
      </section>

      <section className="dashboard-stats">
        <StatCard 
          icon="📊" 
          label="Evaluaciones"
          value={loadingStats ? '...' : stats.total.toString()}
          subLabel="Total completadas"
        />
        <StatCard 
          icon="🗓️" 
          label="Última vez"
          value={loadingStats ? '...' : stats.lastDate}
          subLabel="Última evaluación"
        />
      </section>
      
      <section className="dashboard-main-action">
        <h3>Comienza una nueva evaluación</h3>
        <p>
          Selecciona una de nuestras encuestas para obtener una visión
          clara de tu estado emocional actual. Es un paso valiente hacia tu bienestar.
        </p>
        <Link to="/encuestas" className="btn-primary">Ver Encuestas</Link>
      </section>
    </main>
  );
}