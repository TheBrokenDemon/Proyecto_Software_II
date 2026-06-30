import { useState, useEffect } from 'react';
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

const formatHour = (dateStr: string) =>
  new Date(dateStr).toLocaleTimeString('es-PE', {
    hour: '2-digit', minute: '2-digit'
  });

const iconMap: Record<string, string> = {
  'Bienestar emocional': '💚',
  'Estrés académico':    '📚',
  'Ansiedad':            '🧘',
  'Calidad de sueño':    '🌙',
};

export default function Historial() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

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
        <p>Registro de todas las encuestas que has completado</p>
      </header>

      {loading && (
        <div className="history-empty">
          <span>⏳</span>
          <p>Cargando historial...</p>
        </div>
      )}

      {error && (
        <div className="history-empty">
          <span>⚠️</span>
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && history.length === 0 && (
        <div className="history-empty">
          <span>📋</span>
          <p>Aún no has completado ninguna evaluación.</p>
        </div>
      )}

      {!loading && !error && history.length > 0 && (
        <div className="history-list">
          {history.map((item, index) => (
            <div key={item.id} className="history-item">
              <div className="history-item-icon">
                {iconMap[item.title] || '📝'}
              </div>
              <div className="history-item-info">
                <h3>{item.title}</h3>
                <span>Completada exitosamente</span>
              </div>
              <div className="history-item-meta">
                <span className="history-item-date">{formatDate(item.completed_at)}</span>
                <span className="history-item-hour">{formatHour(item.completed_at)}</span>
              </div>
              <div className="history-item-badge">
                #{index + 1}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}