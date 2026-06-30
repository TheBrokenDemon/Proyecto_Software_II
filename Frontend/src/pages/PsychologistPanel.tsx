import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_URL, authHeaders } from '../services/api';
import '../estilos/PsychologistPanel.css';

// ── Tipos ─────────────────────────────────────────────────────
interface Student {
    id: string;
    full_name: string;
    email: string;
    age: number | null;
    gender: string | null;
    total_evaluations: number;
    last_evaluation: string | null;
    risk_level?: 'alto' | 'medio' | 'bajo' | 'sin_datos';
}

const RISK = {
    alto:      { color: '#dc2626', label: 'Riesgo alto' },
    medio:     { color: '#d97706', label: 'Riesgo medio' },
    bajo:      { color: '#16a34a', label: 'Riesgo bajo' },
    sin_datos: { color: '#9ca3af', label: 'Sin datos' },
} as const;

interface Answer { question: string; answer: string; order_index: number; }
interface EvalResponse {
    id: string;
    completed_at: string;
    evaluation_title: string;
    slug: string;
    answers: Answer[];
}
interface MoodCheckin { mood: number; note: string | null; checkin_date: string; }
interface StudentDetail { student: Student; responses: EvalResponse[]; moodCheckins?: MoodCheckin[]; }

const MOODS: Record<number, { emoji: string; label: string }> = {
    1: { emoji: '😢', label: 'Muy mal' },
    2: { emoji: '😟', label: 'Mal' },
    3: { emoji: '😐', label: 'Regular' },
    4: { emoji: '😄', label: 'Bien' },
};

type View = 'list' | 'detail';

const formatDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

// ── Helpers de API ────────────────────────────────────────────
const api = {
    getStudents: async () => {
        const res = await fetch(`${API_URL}/psychologist/students`, { headers: authHeaders() });
        if (!res.ok) throw new Error('No se pudieron cargar los estudiantes.');
        return res.json();
    },
    getStudentDetail: async (id: string) => {
        const res = await fetch(`${API_URL}/psychologist/students/${id}`, { headers: authHeaders() });
        if (!res.ok) throw new Error('No se pudo cargar el detalle del estudiante.');
        return res.json();
    },
    sendCitation: async (studentId: string) => {
        const res = await fetch(`${API_URL}/psychologist/students/${studentId}/citation`, {
            method: 'POST',
            headers: authHeaders(),
        });
        if (!res.ok) throw new Error('No se pudo enviar la citación.');
        return res.json();
    },
};

// ── Componente ────────────────────────────────────────────────
export default function PsychologistPanel() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user && user.role !== 'psicologo') navigate('/dashboard');
    }, [user, navigate]);

    const [view, setView] = useState<View>('list');
    const [students, setStudents] = useState<Student[]>([]);
    const [detail, setDetail] = useState<StudentDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [activeEval, setActiveEval] = useState<EvalResponse | null>(null);
    const [citationSent, setCitationSent] = useState<string | null>(null);
    const [citationLoading, setCitationLoading] = useState(false);

    const loadStudents = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const data = await api.getStudents();
            setStudents(data.students);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadStudents(); }, [loadStudents]);

    const openStudent = async (student: Student) => {
        setLoading(true);
        setError('');
        setActiveEval(null);
        try {
            const det = await api.getStudentDetail(student.id);
            setDetail(det);
            setView('detail');
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCitation = async (studentId: string) => {
        setCitationLoading(true);
        try {
            await api.sendCitation(studentId);
            setCitationSent(studentId);
            setTimeout(() => setCitationSent(null), 5000);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setCitationLoading(false);
        }
    };

    const filtered = students.filter(s =>
        s.full_name.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase())
    );
    const totalEvals = students.reduce((sum, s) => sum + s.total_evaluations, 0);

    const isCritical = (responses: EvalResponse[]): boolean => {
        if (responses.length === 0) return false;
        const last = responses[0];
        const criticalCount = last.answers.filter(
            a => a.answer === 'Siempre' || a.answer === 'Casi siempre'
        ).length;
        return last.answers.length > 0 && criticalCount / last.answers.length >= 0.6;
    };

    if (!user) return <div className="psych-loading"><p>Cargando...</p></div>;

    return (
        <div className="psych-wrapper">
            {/* SIDEBAR */}
            <aside className="psych-sidebar">
                <div className="psych-sidebar-brand">
                <div>
                <strong>Panel Psicológico</strong>
                <small>Modo profesional</small>
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
                        <div className="psych-user-avatar">{user.full_name.charAt(0)}</div>
                        <div>
                            <strong>{user.full_name}</strong>
                            <small>Psicólogo</small>
                        </div>
                    </div>
                    <button className="psych-logout-btn" onClick={logout}>Cerrar sesión</button>
                </div>
            </aside>

            {/* MAIN */}
            <main className="psych-main">

                {/* VISTA: LISTA */}
                {view === 'list' && (
                    <>
                        <header className="psych-header">
                            <div>
                                <h1>Panel de seguimiento</h1>
                                <p>Monitoreo preventivo del bienestar emocional estudiantil</p>
                            </div>
                            <button className="psych-refresh-btn" onClick={loadStudents}>↻ Actualizar</button>
                        </header>

                        <div className="psych-stats-row">
                            <div className="psych-stat-card">
                                <span className="psych-stat-icon">👥</span>
                                <span className="psych-stat-value">{students.length}</span>
                                <span className="psych-stat-label">Estudiantes registrados</span>
                            </div>
                            <div className="psych-stat-card">
                                <span className="psych-stat-icon">📊</span>
                                <span className="psych-stat-value">{totalEvals}</span>
                                <span className="psych-stat-label">Evaluaciones totales</span>
                            </div>
                        </div>

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

                        {error && <div className="psych-alert error">{error}</div>}

                        {loading ? (
                            <div className="psych-loading"><p>Cargando estudiantes...</p></div>
                        ) : filtered.length === 0 ? (
                            <div className="psych-empty">
                                <p>No se encontraron estudiantes{search ? ` con "${search}"` : ''}.</p>
                            </div>
                        ) : (
                            <div className="psych-student-list">
                                {filtered.map(s => (
                                        <div key={s.id} className={`psych-student-row risk-${s.risk_level || 'sin_datos'}`} onClick={() => openStudent(s)}>
                                        <div className="psych-student-avatar">{s.full_name.charAt(0).toUpperCase()}</div>
                                        <div className="psych-student-info">
                                            <strong>{s.full_name}</strong>
                                            <span>{s.email}</span>
                                        </div>
                                        <div className="psych-student-meta">
                                            <span
                                                className="psych-risk-dot"
                                                style={{ background: RISK[s.risk_level || 'sin_datos'].color }}
                                                title={RISK[s.risk_level || 'sin_datos'].label}
                                            />
                                            <span className="psych-risk-label" style={{ color: RISK[s.risk_level || 'sin_datos'].color }}>
                                                {RISK[s.risk_level || 'sin_datos'].label}
                                            </span>
                                            <span className="psych-badge eval">{s.total_evaluations} evaluaciones</span>
                                        </div>
                                        <div className="psych-student-date">
                                            <small>Última eval.</small>
                                            <span>{formatDate(s.last_evaluation)}</span>
                                        </div>
                                        <span className="psych-row-arrow">›</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* VISTA: DETALLE */}
                {view === 'detail' && detail && (
                    <>
                        <header className="psych-header">
                            <button className="psych-back-btn" onClick={() => { setView('list'); setDetail(null); }}>
                                ← Volver a la lista
                            </button>
                        </header>

                        {error && <div className="psych-alert error">{error}</div>}

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

                        {isCritical(detail.responses) && (
                            <div className="psych-critical-alert">
                                <div>
                                    <strong>⚠️ Nivel crítico detectado</strong>
                                    <p>Las respuestas indican un nivel de estrés o ansiedad elevado.</p>
                                </div>
                                {citationSent === detail.student.id ? (
                                    <span className="psych-citation-sent">✓ Citación enviada</span>
                                ) : (
                                    <button
                                        className="psych-citate-btn"
                                        onClick={() => handleCitation(detail.student.id)}
                                        disabled={citationLoading}
                                    >
                                        {citationLoading ? 'Enviando...' : '📧 Citar estudiante'}
                                    </button>
                                )}
                            </div>
                        )}

                        <section className="psych-section">
                            <h3 className="psych-section-title">🙂 Estado de ánimo diario</h3>
                            {!detail.moodCheckins || detail.moodCheckins.length === 0 ? (
                                <div className="psych-empty-sm">Este estudiante aún no ha registrado su ánimo.</div>
                            ) : (
                                <div className="psych-mood-list">
                                    {detail.moodCheckins.map((m, i) => (
                                        <div key={i} className="psych-mood-item">
                                            <span className="psych-mood-emoji">{MOODS[m.mood]?.emoji}</span>
                                            <div className="psych-mood-info">
                                                <strong>{MOODS[m.mood]?.label}</strong>
                                                <small>{formatDate(m.checkin_date)}</small>
                                                {m.note && <p className="psych-mood-note">"{m.note}"</p>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

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
                    </>
                )}
            </main>
        </div>
    );
}