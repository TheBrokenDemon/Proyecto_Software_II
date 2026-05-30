import { useState, useEffect } from "react";
import CardHistorial from '../components/cardHistorial';
import '../estilos/historial.css';

const API_URL = "http://localhost:3000/api";
const getToken = () => localStorage.getItem('authToken');

// --- Tipos para los datos del historial ---
interface HistoryItem {
  id: string;
  title: string;
  completed_at: string;
}

export default function Historial() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(`${API_URL}/evaluations/history`, {
          headers: { 'Authorization': `Bearer ${getToken()}` }
        });

        if (!res.ok) {
          throw new Error('No se pudo obtener el historial. Inténtalo de nuevo.');
        }

        const data = await res.json();
        setHistory(data.history || []);
      } catch (err: any) {
        setError(err.message || 'Ocurrió un error inesperado.');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-PE', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  };

  return (
    <div className="history-container">
      <header className="history-header">
        <h1>Mi Historial de Evaluaciones</h1>
        <p>Aquí puedes ver un registro de todas las encuestas que has completado.</p>
      </header>

      <main>
        {loading && (
          <div className="history-message-container">Cargando historial...</div>
        )}

        {error && (
          <div className="history-message-container error">{error}</div>
        )}

        {!loading && !error && (
          history.length > 0 ? (
            <div className="history-grid">
              {history.map((item) => (
                <CardHistorial
                  key={item.id}
                  img="/images/dreamy-sunrise.jpg" // Usamos la ruta absoluta desde la carpeta 'public'
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