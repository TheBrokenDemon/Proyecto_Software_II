/**
 * PsychologistPanel.tsx
 *
 * Panel completo para psicólogos de MindCheck ULima.
 * Patrones aplicados en la capa de servicios del componente:
 *   - Singleton  : apiClient (única instancia para llamadas al backend)
 *   - Facade     : psychologistAPI agrupa todos los endpoints del panel
 *   - Observer   : useEffect + estado reactivo para actualizar UI ante cambios
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './css/PsychologistPanel.css';

// ─── Singleton Pattern: cliente HTTP ─────────────────────────────────────────
class ApiClient {
  private static instance: ApiClient;
  private baseUrl: string;

  private constructor() {
    this.baseUrl = 'http://localhost:4000/api';
  }

  static getInstance(): ApiClient {
    if (!ApiClient.instance) ApiClient.instance = new ApiClient();
    return ApiClient.instance;
  }

  private getHeaders(): HeadersInit {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  async get<T>(path: string): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, { headers: this.getHeaders() });
    if (!res.ok) throw new Error((await res.json()).message || 'Error en la solicitud');
    return res.json();
  }

  async post<T>(path: string, body: object): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error((await res.json()).message || 'Error en la solicitud');
    return res.json();
  }
}

// ─── Facade Pattern: API del psicólogo ───────────────────────────────────────
const psychologistAPI = {
  getStudents: () =>
    ApiClient.getInstance().get<{ students: Student[] }>('/psychologist/students'),
  getStudentDetail: (id: string) =>
    ApiClient.getInstance().get<StudentDetail>(`/psychologist/students/${id}`),
  getObservations: (id: string) =>
    ApiClient.getInstance().get<{ observations: Observation[] }>(`/psychologist/students/${id}/observations`),
  addObservation: (id: string, text: string, flag: boolean) =>
    ApiClient.getInstance().post(`/psychologist/students/${id}/observations`, {
      text,
      flag_for_contact: flag,
    }),
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface Student {
  id: string;
  full_name: string;
  email: string;
  age: number | null;
  gender: string | null;
  total_evaluations: number;
  last_evaluation: string | null;
  flagged_for_contact: boolean;
  flagged_at: string | null;
}

interface Answer { question: string; answer: string; order_index: number }
interface EvalResponse {
  id: string;
  completed_at: string;
  evaluation_title: string;
  slug: string;
  answers: Answer[];
}
interface StudentDetail { student: Student; responses: EvalResponse[] }
interface Observation {
  id: string;
  text: string;
  created_at: string;
  psychologist_name: string;
}

type View = 'list' | 'detail';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatDate = (d: string | null) =>
  d ? new Date(d).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const emotionEmoji: Record<string, string> = {
  feliz: '😊', triste: '😢', ansioso: '😰', ansios: '😰',
  cansad: '😴', bien: '🙂', mal: '😞',
};

const getEmoji = (text: string) => {
  const lower = text.toLowerCase();
  return Object.entries(emotionEmoji).find(([k]) => lower.includes(k))?.[1] ?? '📋';
};

// ─── Subcomponentes ───────────────────────────────────────────────────────────

function StatCard({ icon, value, label, accent }: { icon: string; value: string | number; label: string; accent?: boolean }) {
  return (
    <div className={`psych-stat-card ${accent ? 'accent' : ''}`}>
      <span className="psych-stat-icon">{icon}</span>
      <span className="psych-stat-value">{value}</span>
      <span className="psych-stat-label">{label}</span>
    </div>
  );
}

function StudentRow({ student, onClick }: { student: Student; onClick: () => void }) {
  return (
    <div className={`psych-student-row ${student.flagged_for_contact ? 'flagged' : ''}`} onClick={onClick}>
      <div className="psych-student-avatar">
        {student.full_name.charAt(0).toUpperCase()}
      </div>
      <div className="psych-student-info">
        <strong>{student.full_name}</strong>
        <span>{student.email}</span>
      </div>
      <div className="psych-student-meta">
        <span className="psych-badge eval">{student.total_evaluations} evaluaciones</span>
        {student.flagged_for_contact && (
          <span className="psych-badge contact">📞 Contactar</span>
        )}
      </div>
      <div className="psych-student-date">
        <small>Última eval.</small>
        <span>{formatDate(student.last_evaluation)}</span>
      </div>
      <span className="psych-row-arrow">›</span>
    </div>
  );
}

// ─── Vista principal ──────────────────────────────────────────────────────────

export default function PsychologistPanel() {
  const navigate = useNavigate();

  // Auth guard
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const role  = localStorage.getItem('userRole');
    if (!token || role !== 'psicologo') navigate('/login');
  }, [navigate]);

  const psychName = localStorage.getItem('userName') || 'Psicóloga';

  // State
  const [view, setView]               = useState<View>('list');
  const [students, setStudents]       = useState<Student[]>([]);
  const [detail, setDetail]           = useState<StudentDetail | null>(null);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [search, setSearch]           = useState('');
  const [obsText, setObsText]         = useState('');
  const [flagContact, setFlagContact] = useState(false);
  const [obsLoading, setObsLoading]   = useState(false);
  const [obsSuccess, setObsSuccess]   = useState('');
  const [activeEval, setActiveEval]   = useState<EvalResponse | null>(null);

  // Cargar lista de estudiantes
  const loadStudents = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await psychologistAPI.getStudents();
      setStudents(data.students);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadStudents(); }, [loadStudents]);

  // Abrir detalle de estudiante
  const openStudent = async (student: Student) => {
    setLoading(true);
    setError('');
    setActiveEval(null);
    try {
      const [det, obs] = await Promise.all([
        psychologistAPI.getStudentDetail(student.id),
        psychologistAPI.getObservations(student.id),
      ]);
      setDetail(det);
      setObservations(obs.observations);
      setView('detail');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Enviar observación
  const submitObservation = async () => {
    if (!detail || !obsText.trim()) return;
    setObsLoading(true);
    setObsSuccess('');
    try {
      await psychologistAPI.addObservation(detail.student.id, obsText, flagContact);
      const obs = await psychologistAPI.getObservations(detail.student.id);
      setObservations(obs.observations);
      setObsText('');
      setFlagContact(false);
      setObsSuccess('Observación registrada correctamente.');
      setTimeout(() => setObsSuccess(''), 3000);
      if (flagContact) loadStudents(); // refrescar badge
    } catch (e: any) {
      setError(e.message);
    } finally {
      setObsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    navigate('/login');
  };

  // Filtro de búsqueda
  const filtered = students.filter(s =>
    s.full_name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  const flaggedCount = students.filter(s => s.flagged_for_contact).length;
  const totalEvals   = students.reduce((sum, s) => sum + s.total_evaluations, 0);

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="psych-wrapper">
      {/* SIDEBAR */}
      <aside className="psych-sidebar">
        <div className="psych-sidebar-brand">
          <div className="psych-brand-icon">🧠</div>
          <div>
            <strong>MindCheck</strong>
            <small>Panel Psicológico</small>
          </div>
        </div>

        <nav className="psych-nav">
          <button
            className={`psych-nav-item ${view === 'list' ? 'active' : ''}`}
            onClick={() => { setView('list'); setDetail(null); }}
          >
            <span>👥</span> Estudiantes
          </button>
          {detail && (
            <button className={`psych-nav-item ${view === 'detail' ? 'active' : ''}`}>
              <span>📋</span> {detail.student.full_name.split(' ')[0]}
            </button>
          )}
        </nav>

        <div className="psych-sidebar-footer">
          <div className="psych-user-chip">
            <div className="psych-user-avatar">{psychName.charAt(0)}</div>
            <div>
              <strong>{psychName}</strong>
              <small>Psicóloga</small>
            </div>
          </div>
          <button className="psych-logout-btn" onClick={logout}>Cerrar sesión</button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="psych-main">

        {/* ── VISTA: LISTA ── */}
        {view === 'list' && (
          <>
            <header className="psych-header">
              <div>
                <h1>Panel de seguimiento</h1>
                <p>Monitoreo preventivo del bienestar emocional estudiantil</p>
              </div>
              <button className="psych-refresh-btn" onClick={loadStudents}>↻ Actualizar</button>
            </header>

            {/* Stats */}
            <div className="psych-stats-row">
              <StatCard icon="👥" value={students.length} label="Estudiantes registrados" />
              <StatCard icon="📊" value={totalEvals} label="Evaluaciones totales" />
              <StatCard icon="📞" value={flaggedCount} label="Pendientes de contacto" accent={flaggedCount > 0} />
            </div>

            {/* Search */}
            <div className="psych-search-bar">
              <span className="psych-search-icon">🔍</span>
              <input
                type="text"
                placeholder="Buscar estudiante por nombre o correo..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && (
                <button className="psych-search-clear" onClick={() => setSearch('')}>✕</button>
              )}
            </div>

            {/* Error */}
            {error && <div className="psych-alert error">{error}</div>}

            {/* Loading */}
            {loading ? (
              <div className="psych-loading">
                <div className="psych-spinner" />
                <p>Cargando estudiantes...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="psych-empty">
                <span>🔍</span>
                <p>No se encontraron estudiantes{search ? ` con "${search}"` : ''}.</p>
              </div>
            ) : (
              <div className="psych-student-list">
                {filtered.map(s => (
                  <StudentRow key={s.id} student={s} onClick={() => openStudent(s)} />
                ))}
              </div>
            )}
          </>
        )}

        {/* ── VISTA: DETALLE ── */}
        {view === 'detail' && detail && (
          <>
            <header className="psych-header">
              <button className="psych-back-btn" onClick={() => { setView('list'); setDetail(null); }}>
                ← Volver a la lista
              </button>
            </header>

            {error && <div className="psych-alert error">{error}</div>}

            {/* Perfil del estudiante */}
            <div className="psych-student-profile">
              <div className="psych-profile-avatar">
                {detail.student.full_name.charAt(0).toUpperCase()}
              </div>
              <div className="psych-profile-info">
                <h2>{detail.student.full_name}</h2>
                <p>{detail.student.email}</p>
                <div className="psych-profile-tags">
                  {detail.student.age && <span className="psych-tag">{detail.student.age} años</span>}
                  {detail.student.gender && <span className="psych-tag">{detail.student.gender}</span>}
                  <span className="psych-tag eval">{detail.responses.length} evaluaciones</span>
                </div>
              </div>
            </div>

            <div className="psych-detail-grid">
              {/* Historial de evaluaciones */}
              <section className="psych-section">
                <h3 className="psych-section-title">📊 Historial de evaluaciones</h3>
                {detail.responses.length === 0 ? (
                  <div className="psych-empty-sm">Aún no hay evaluaciones registradas.</div>
                ) : (
                  <div className="psych-eval-list">
                    {detail.responses.map(r => (
                      <div
                        key={r.id}
                        className={`psych-eval-card ${activeEval?.id === r.id ? 'expanded' : ''}`}
                        onClick={() => setActiveEval(activeEval?.id === r.id ? null : r)}
                      >
                        <div className="psych-eval-card-header">
                          <span className="psych-eval-emoji">{getEmoji(r.evaluation_title)}</span>
                          <div>
                            <strong>{r.evaluation_title}</strong>
                            <small>{formatDate(r.completed_at)}</small>
                          </div>
                          <span className="psych-eval-toggle">{activeEval?.id === r.id ? '▲' : '▼'}</span>
                        </div>
                        {activeEval?.id === r.id && (
                          <div className="psych-eval-answers">
                            {r.answers.map((a, i) => (
                              <div key={i} className="psych-answer-row">
                                <span className="psych-answer-q">{a.question}</span>
                                <span className="psych-answer-a">{a.answer}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Panel de observaciones + contacto */}
              <section className="psych-section">
                <h3 className="psych-section-title">📝 Observaciones y seguimiento</h3>

                {/* Nueva observación */}
                <div className="psych-obs-form">
                  <textarea
                    placeholder="Escribe una observación sobre el estado emocional del estudiante..."
                    value={obsText}
                    onChange={e => setObsText(e.target.value)}
                    rows={4}
                  />
                  <label className="psych-flag-label">
                    <input
                      type="checkbox"
                      checked={flagContact}
                      onChange={e => setFlagContact(e.target.checked)}
                    />
                    <span>📞 Marcar para contacto preventivo</span>
                  </label>
                  {obsSuccess && <div className="psych-alert success">{obsSuccess}</div>}
                  <button
                    className="psych-obs-submit"
                    onClick={submitObservation}
                    disabled={obsLoading || !obsText.trim()}
                  >
                    {obsLoading ? 'Guardando...' : 'Registrar observación'}
                  </button>
                </div>

                {/* Observaciones previas */}
                <div className="psych-obs-history">
                  {observations.length === 0 ? (
                    <div className="psych-empty-sm">No hay observaciones registradas.</div>
                  ) : (
                    observations.map(o => (
                      <div key={o.id} className="psych-obs-item">
                        <div className="psych-obs-meta">
                          <span>{o.psychologist_name}</span>
                          <small>{formatDate(o.created_at)}</small>
                        </div>
                        <p>{o.text}</p>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
