import { useEffect, useState } from 'react';
import { getMyFollowups, Followup } from '../services/followup.service';
import '../estilos/seguimientos.css';

const STATUS: Record<string, { label: string; cls: string }> = {
    pendiente:      { label: 'Pendiente', cls: 'st-pendiente' },
    en_seguimiento: { label: 'En seguimiento', cls: 'st-seguimiento' },
    cerrado:        { label: 'Cerrado', cls: 'st-cerrado' },
};

const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' });

export default function MisSeguimientos() {
    const [items, setItems] = useState<Followup[] | null>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        getMyFollowups()
            .then((r) => setItems(r.followups))
            .catch(() => setError('No se pudieron cargar tus seguimientos.'));
    }, []);

    return (
        <main className="seg-container">
            <header className="seg-header">
                <h1>Mi seguimiento</h1>
                <p>Notas y recomendaciones que tu psicólogo ha registrado para ti.</p>
            </header>

            {error && <p className="seg-error">{error}</p>}

            {!items ? (
                <p className="seg-loading">Cargando...</p>
            ) : items.length === 0 ? (
                <div className="seg-empty">
                    <span className="seg-empty-icon">🗒️</span>
                    <p>Aún no tienes notas de seguimiento. Cuando tu psicólogo registre una, aparecerá aquí.</p>
                </div>
            ) : (
                <div className="seg-timeline">
                    {items.map((f) => (
                        <div key={f.id} className="seg-item">
                            <div className="seg-dot" />
                            <div className="seg-card">
                                <div className="seg-card-head">
                                    <span className={`seg-status ${STATUS[f.status]?.cls || ''}`}>
                                        {STATUS[f.status]?.label || f.status}
                                    </span>
                                    <small>{formatDate(f.created_at)}</small>
                                </div>
                                <p className="seg-note">{f.notes}</p>
                                {f.psychologist_name && <small className="seg-psy">— {f.psychologist_name}</small>}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
}