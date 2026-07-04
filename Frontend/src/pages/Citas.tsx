import { useEffect, useState } from 'react';
import {
    createAppointmentRequest,
    getMyAppointmentRequests,
    cancelAppointmentRequest,
    AppointmentRequest,
} from '../services/appointment.service';
import '../estilos/citas.css';

const STATUS: Record<string, { label: string; cls: string }> = {
    solicitada:   { label: 'Solicitada', cls: 'st-solicitada' },
    confirmada:   { label: 'Confirmada', cls: 'st-confirmada' },
    reprogramada: { label: 'Reprogramada', cls: 'st-reprogramada' },
    rechazada:    { label: 'Rechazada', cls: 'st-rechazada' },
    cancelada:    { label: 'Cancelada', cls: 'st-cancelada' },
};

const formatDate = (d: string | null) =>
    d ? new Date(d + 'T00:00:00').toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' }) : null;

export default function Citas() {
    const [requests, setRequests] = useState<AppointmentRequest[] | null>(null);
    const [reason, setReason] = useState('');
    const [preferredDate, setPreferredDate] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [ok, setOk] = useState('');

    const load = async () => {
        try {
            const { requests } = await getMyAppointmentRequests();
            setRequests(requests);
        } catch {
            setError('No se pudieron cargar tus solicitudes.');
        }
    };

    useEffect(() => { load(); }, []);

    const handleSubmit = async () => {
        if (!reason.trim()) return;
        setSaving(true);
        setError('');
        setOk('');
        try {
            await createAppointmentRequest(reason.trim(), preferredDate || undefined);
            setReason('');
            setPreferredDate('');
            setOk('¡Solicitud enviada! Un psicólogo la revisará pronto.');
            await load();
        } catch (e: any) {
            setError(e.message || 'No se pudo enviar la solicitud.');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = async (id: string) => {
        try {
            await cancelAppointmentRequest(id);
            await load();
        } catch (e: any) {
            setError(e.message || 'No se pudo cancelar.');
        }
    };

    const today = new Date().toISOString().slice(0, 10);

    return (
        <main className="citas-container">
            <header className="citas-header">
                <h1>Solicitar una cita</h1>
                <p>Pide una cita de acompañamiento. Un psicólogo la confirmará o te propondrá otra fecha.</p>
            </header>

            <section className="citas-form">
                <label className="citas-label">Motivo de la cita *</label>
                <textarea
                    className="citas-textarea"
                    placeholder="Cuéntanos brevemente por qué quieres la cita..."
                    value={reason}
                    maxLength={1000}
                    onChange={(e) => setReason(e.target.value)}
                />
                <label className="citas-label">Fecha tentativa (opcional)</label>
                <input
                    type="date"
                    className="citas-date"
                    min={today}
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                />

                {error && <p className="citas-error">{error}</p>}
                {ok && <p className="citas-ok">{ok}</p>}

                <button className="citas-submit" onClick={handleSubmit} disabled={!reason.trim() || saving}>
                    {saving ? 'Enviando...' : 'Enviar solicitud'}
                </button>
            </section>

            <section className="citas-list-section">
                <h2>Mis solicitudes</h2>
                {!requests ? (
                    <p className="citas-loading">Cargando...</p>
                ) : requests.length === 0 ? (
                    <div className="citas-empty">Aún no has solicitado ninguna cita.</div>
                ) : (
                    <div className="citas-list">
                        {requests.map((r) => (
                            <div key={r.id} className="cita-card">
                                <div className="cita-card-head">
                                    <span className={`cita-status ${STATUS[r.status]?.cls || ''}`}>
                                        {STATUS[r.status]?.label || r.status}
                                    </span>
                                    <small>Solicitada el {new Date(r.created_at).toLocaleDateString('es-PE')}</small>
                                </div>
                                <p className="cita-reason">{r.reason}</p>
                                {r.preferred_date && (
                                    <p className="cita-line">📅 Fecha tentativa: {formatDate(r.preferred_date)}</p>
                                )}
                                {r.confirmed_date && (
                                    <p className="cita-line confirmed">✅ Fecha propuesta: {formatDate(r.confirmed_date)}</p>
                                )}
                                {r.response_note && (
                                    <p className="cita-response">
                                        <strong>Respuesta{r.psychologist_name ? ` de ${r.psychologist_name}` : ''}:</strong> {r.response_note}
                                    </p>
                                )}
                                {r.status === 'solicitada' && (
                                    <button className="cita-cancel" onClick={() => handleCancel(r.id)}>Cancelar solicitud</button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}