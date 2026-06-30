import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyHistory } from '../services/evaluation.service';
import '../estilos/perfil.css';

const WELLNESS_TIPS = [
  'Respira hondo 4 segundos, sostén 4 y suelta en 4. Repite tres veces.',
  'Dormir 7–8 horas mejora tu ánimo más que cualquier app. Cuida tu descanso.',
  'Hablar con alguien de confianza alivia. No tienes que poder con todo solo.',
  'Una caminata corta al aire libre baja el estrés y despeja la mente.',
  'Tómate pausas: 5 minutos lejos de la pantalla cada hora ayudan a concentrarte.',
];

export default function Perfil() {
  const { user, isLoading, userPhoto } = useAuth();
  const [history, setHistory] = useState<any[] | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const isStudent = user?.role === 'estudiante';

  useEffect(() => {
    if (isStudent) {
      setLoadingHistory(true);
      getMyHistory()
        .then((h) => setHistory(h))
        .catch(() => setHistory([]))
        .finally(() => setLoadingHistory(false));
    }
  }, [isStudent]);

  if (isLoading) return <div className="profile-container">Cargando perfil...</div>;
  if (!user)     return <div className="profile-container">No se pudo cargar el perfil.</div>;

  const roleLabel = isStudent ? 'Estudiante' : 'Psicólogo';
  const total = history?.length ?? 0;
  const distinct = history ? new Set(history.map((h) => h.slug)).size : 0;
  const last = history && history.length > 0 ? history[0] : null;
  const tip = WELLNESS_TIPS[new Date().getDate() % WELLNESS_TIPS.length];

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="profile-container">
      <div className="perfil-grid">

        {/* Columna izquierda — identidad */}
        <aside className="perfil-side-card">
          <div className="perfil-avatar">
            {userPhoto ? (
              <img src={userPhoto} alt="Foto de perfil" />
            ) : (
              <span>{user.full_name.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <h2 className="perfil-name">{user.full_name}</h2>
          <span className="role-badge">{roleLabel}</span>
          <p className="perfil-email">{user.email}</p>
          <Link to="/modificarPerfil" className="modificarButton">Modificar Perfil</Link>
          <p className="profile-avatar-hint">Cambia tu foto desde "Modificar Perfil"</p>
        </aside>

        {/* Columna derecha — info + actividad + bienestar */}
        <main className="perfil-main">
          <section className="perfil-info-card">
            <h1>Información del Perfil</h1>
            <div className="profile-info-row">
              <span className="profile-info-label">Nombre</span>
              <span className="profile-info-value">{user.full_name}</span>
            </div>
            <div className="profile-info-row">
              <span className="profile-info-label">Correo</span>
              <span className="profile-info-value">{user.email}</span>
            </div>
            <div className="profile-info-row">
              <span className="profile-info-label">Género</span>
              <span className="profile-info-value">{user.gender || 'No especificado'}</span>
            </div>
            <div className="profile-info-row">
              <span className="profile-info-label">Edad</span>
              <span className="profile-info-value">{user.age ? `${user.age} años` : 'No especificada'}</span>
            </div>
          </section>

          {isStudent && (
            <section className="perfil-info-card">
              <h1>Resumen de actividad</h1>
              {loadingHistory ? (
                <p className="activity-loading">Cargando tu actividad...</p>
              ) : (
                <>
                  <div className="activity-grid">
                    <div className="stat-pill">
                      <span className="stat-pill-value">{total}</span>
                      <span className="stat-pill-label"> Evaluaciones realizadas</span>
                    </div>
                    <div className="stat-pill">
                      <span className="stat-pill-value">{distinct}</span>
                      <span className="stat-pill-label"> Tipos de test distintos</span>
                    </div>
                  </div>
                  {last ? (
                    <p className="activity-last">
                      Última evaluación: <strong>{last.title}</strong> · {formatDate(last.completed_at)}
                    </p>
                  ) : (
                    <p className="activity-last">
                      Aún no has registrado evaluaciones.{' '}
                      <Link to="/encuestas" className="activity-link">Hacer la primera →</Link>
                    </p>
                  )}
                </>
              )}
            </section>
          )}

          <section className="tip-card">
            <span className="tip-card-icon">🌿</span>
            <div className="tip-card-text">
              <p className="tip-card-title">Tip de bienestar</p>
              <p className="tip-card-body">{tip}</p>
            </div>
          </section>
        </main>

      </div>
    </div>
  );
}