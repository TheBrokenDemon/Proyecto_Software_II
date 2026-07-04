import { useEffect, useState } from 'react';
import { API_URL, authHeaders } from '../services/api';
import '../estilos/appointmentRequests.css';

interface Req {
    id: string;
    reason: string;
    preferred_date: string | null;
    status: string;
    response_note: string | null;
    confirmed_date: string | null;
    created_at: string;
    student_name: string;
    student_email: string;
    psychologist_name?: string | null;
}

const STATUS: Record<string, { label: string; cls: string }> = {
    solicitada:   { label: 'Solicitada', cls: 'ar-solicitada' },
    confirmada:   { label: 'Confirmada', cls: 'ar-confirmada' },
    reprogramada: { label: 'Reprogramada', cls: 'ar-reprogramada' },
    rechazada:    { label: 'Rechazada', cls: 'ar-rechazada' },
    cancelada:    { label: 'Cancelada', cls: 'ar-cancelada' },
};

const fmt = (d: string | null) =>
    d ? new Date(d + 'T00:00:00').toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' }) : null;

export default function AppointmentRequests() {
    const [requests, setRequests] = useState<Req[] | null>(null);
    const [error, setError] = useState('');
    const [activeId, setActiveId] = useState<string | null>(null);
    const [note, setNote] = useState('');
    const [date, setDate] = useState('');
    const [busy, setBusy] = useState(false);

    const load = async () => {
        try {
            const res = await fetch(`${API_URL}/psychologist/appointment-requests`, { headers: authHeaders() });
            if (!res.ok) throw new Error();
            const data = await res.json();
            setRequests(data.requests);
        } catch {
            setError('No se pudieron cargar las solicitudes.');
        }
    };

    useEffect(() => { load(); }, []);

    const respond = async (id: string, status: 'confirmada' | 'reprogramada' | 'rechazada') => {
        setBusy(true);
        setError('');
        try {
            const res = await fetch(`${API_URL}/psychologist/appointment-requests/${id}`, {
                method: 'PATCH',
                headers: authHeaders(),
                body: JSON.stringify({
                    status,
                    response_note: note || null,
                    confirmed_date: date || null,
                }),
            });
            if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.message || 'No se pudo actualizar la solicitud.'); }
            setActiveId(null);
            setNote('');
            setDate('');
            await load();
        } catch (e: any) {
            setError(e.message);
        } finally {
            setBusy(false);
        }
    };

    const openPanel = (id: string) => {
        setActiveId(activeId === id ? null : id);
        setNote('');
        setDate('');
    };

    return (
        <div className="ar-wrap">
            <header className="psych-header">
                <div>
                    <h1>Solicitudes de cita</h1>
                    <p>Peticiones de acompañamiento enviadas por los estudiantes</p>
                </div>
                <button className="psych-refresh-btn" onClick={load}>↻ Actualizar</button>
            </header>

            {error && <div className="psych-alert error">{error}</div>}

            {!requests ? (
                <div className="psych-loading"><p>Cargando solicitudes...</p></div>
            ) : requests.length === 0 ? (
                <div className="psych-empty"><p>No hay solicitudes de cita por ahora.</p></div>
            ) : (
                <div className="ar-list">
                    {requests.map((r) => (
                        <div key={r.id} className="ar-card">
                            <div className="ar-card-head">
                                <div>
                                    <strong>{r.student_name}</strong>
                                    <small>{r.student_email}</small>
                                </div>
                                <span className={`ar-status ${STATUS[r.status]?.cls || ''}`}>
                                    {STATUS[r.status]?.label || r.status}
                                </span>
                            </div>

                            <p className="ar-reason">{r.reason}</p>
                            {r.preferred_date && <p className="ar-line">📅 Fecha tentativa del estudiante: {fmt(r.preferred_date)}</p>}
                            {r.confirmed_date && <p className="ar-line ok">✅ Fecha propuesta: {fmt(r.confirmed_date)}</p>}
                            {r.response_note && <p className="ar-line"><strong>Respuesta:</strong> {r.response_note}</p>}
                            {r.status !== 'solicitada' && r.psychologist_name && (
                                <p className="ar-answered-by">Respondida por <strong>{r.psychologist_name}</strong></p>
                            )}

                            {r.status === 'solicitada' && (
                                <>
                                    <button className="ar-manage-btn" onClick={() => openPanel(r.id)}>
                                        {activeId === r.id ? 'Cerrar' : 'Responder'}
                                    </button>

                                    {activeId === r.id && (
                                        <div className="ar-actions">
                                            <label>Fecha (para confirmar o reprogramar)</label>
                                            <input
                                                type="date"
                                                value={date}
                                                min={new Date().toISOString().slice(0, 10)}
                                                onChange={(e) => setDate(e.target.value)}
                                            />
                                            <label>Nota para el estudiante (opcional)</label>
                                            <textarea
                                                placeholder="Ej: Te espero el lunes a las 10am en Bienestar."
                                                value={note}
                                                maxLength={500}
                                                onChange={(e) => setNote(e.target.value)}
                                            />
                                            <div className="ar-btn-row">
                                                <button
                                                    className="ar-btn confirm"
                                                    disabled={busy || !date}
                                                    onClick={() => respond(r.id, 'confirmada')}
                                                    title={!date ? 'Elige una fecha' : ''}
                                                >
                                                    Confirmar
                                                </button>
                                                <button
                                                    className="ar-btn reschedule"
                                                    disabled={busy || !date}
                                                    onClick={() => respond(r.id, 'reprogramada')}
                                                >
                                                    Reprogramar
                                                </button>
                                                <button
                                                    className="ar-btn reject"
                                                    disabled={busy}
                                                    onClick={() => respond(r.id, 'rechazada')}
                                                >
                                                    Rechazar
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}