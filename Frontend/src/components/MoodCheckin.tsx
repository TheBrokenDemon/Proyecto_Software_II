import { useEffect, useState } from 'react';
import { getMoodHistory, getTodayMood, saveMood, MoodCheckin as Checkin } from '../services/mood.service';
import '../estilos/moodCheckin.css';

const MOODS = [
    { value: 1, emoji: '😢', label: 'Muy mal' },
    { value: 2, emoji: '😟', label: 'Mal' },
    { value: 3, emoji: '😐', label: 'Regular' },
    { value: 4, emoji: '😄', label: 'Bien' },
];

const moodOf = (v: number) => MOODS.find((m) => m.value === v);

const formatDay = (iso: string) => {
    // iso: 'YYYY-MM-DD' → 'dd/mm'
    const [, m, d] = iso.split('-');
    return `${d}/${m}`;
};

export default function MoodCheckin() {
    const [today, setToday] = useState<Checkin | null>(null);
    const [history, setHistory] = useState<Checkin[]>([]);
    const [streak, setStreak] = useState(0);
    const [selected, setSelected] = useState<number | null>(null);
    const [note, setNote] = useState('');
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [thanks, setThanks] = useState(false);

    const load = async () => {
        try {
            const [todayRes, histRes] = await Promise.all([getTodayMood(), getMoodHistory()]);
            setToday(todayRes.checkin);
            setHistory(histRes.history);
            setStreak(histRes.streak);
            if (todayRes.checkin) {
                setSelected(todayRes.checkin.mood);
                setNote(todayRes.checkin.note || '');
            }
        } catch {
            setError('No se pudo cargar tu estado de ánimo.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const handleSave = async () => {
        if (!selected) return;
        setSaving(true);
        setError('');
        try {
            const { checkin } = await saveMood(selected, note.trim() || undefined);
            setToday(checkin);
            setEditing(false);
            setThanks(true);
            setTimeout(() => setThanks(false), 4000);
            const histRes = await getMoodHistory();
            setHistory(histRes.history);
            setStreak(histRes.streak);
        } catch (e: any) {
            setError(e.message || 'No se pudo guardar.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <section className="mood-card"><p className="mood-loading">Cargando tu estado de ánimo...</p></section>;
    }

    const alreadyChecked = today && !editing;

    return (
        <section className="mood-card">
            <div className="mood-head">
                <h3>{alreadyChecked ? 'Tu ánimo de hoy' : '¿Cómo te sientes hoy?'}</h3>
                {streak > 0 && (
                    <span className="mood-streak">🔥 {streak} {streak === 1 ? 'día' : 'días'} seguidos</span>
                )}
            </div>

            {alreadyChecked ? (
                <>
                {thanks && (
                    <p className="mood-thanks">💚 ¡Gracias por registrar tu ánimo! Cada día cuenta.</p>
                )}
                <div className="mood-done">
                    <span className="mood-done-emoji">{moodOf(today!.mood)?.emoji}</span>
                    <div className="mood-done-text">
                        <p className="mood-done-label">Hoy te sientes <strong>{moodOf(today!.mood)?.label}</strong></p>
                        {today!.note && <p className="mood-done-note">"{today!.note}"</p>}
                    </div>
                    <button className="mood-edit-btn" onClick={() => setEditing(true)}>Editar</button>
                </div>
                </>
            ) : (
                <>
                    <div className="mood-faces">
                        {MOODS.map((m) => (
                            <button
                                key={m.value}
                                className={`mood-face ${selected === m.value ? 'selected' : ''}`}
                                onClick={() => setSelected(m.value)}
                                title={m.label}
                            >
                                <span className="mood-face-emoji">{m.emoji}</span>
                                <span className="mood-face-label">{m.label}</span>
                            </button>
                        ))}
                    </div>

                    <textarea
                        className="mood-note"
                        placeholder="¿Quieres añadir una nota? (opcional)"
                        value={note}
                        maxLength={500}
                        onChange={(e) => setNote(e.target.value)}
                    />

                    {error && <p className="mood-error">{error}</p>}

                    <div className="mood-actions">
                        <button className="mood-save-btn" onClick={handleSave} disabled={!selected || saving}>
                            {saving ? 'Guardando...' : 'Guardar'}
                        </button>
                        {editing && (
                            <button className="mood-cancel-btn" onClick={() => { setEditing(false); setError(''); }}>
                                Cancelar
                            </button>
                        )}
                    </div>
                </>
            )}

            {history.length > 0 && (
                <div className="mood-history">
                    <span className="mood-history-label">Últimos días</span>
                    <div className="mood-history-row">
                        {history.slice(0, 7).reverse().map((c) => (
                            <div key={c.id} className="mood-history-item" title={`${moodOf(c.mood)?.label} · ${c.checkin_date}`}>
                                <span className="mood-history-emoji">{moodOf(c.mood)?.emoji}</span>
                                <span className="mood-history-day">{formatDay(c.checkin_date)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
}