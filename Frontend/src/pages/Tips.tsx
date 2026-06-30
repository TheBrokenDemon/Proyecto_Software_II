import { useState } from 'react';
import '../estilos/tips.css';

interface Category {
    id: string;
    label: string;
    icon: string;
    tips: string[];
}

const CATEGORIES: Category[] = [
    {
        id: 'estudio',
        label: 'Estudio y organización',
        icon: '📚',
        tips: [
            'Divide las tareas grandes en pasos pequeños y empieza por el más urgente, no por el más fácil.',
            'Usa la técnica Pomodoro: 25 minutos de estudio concentrado y 5 de descanso.',
            'Planifica tu semana: anota entregas y exámenes en un calendario visible.',
            'Estudia siempre en un lugar fijo, ordenado y sin distracciones.',
            'Repasa en voz alta o explicándole el tema a alguien; recuerdas mucho más.',
        ],
    },
    {
        id: 'sueno',
        label: 'Descanso y sueño',
        icon: '🌙',
        tips: [
            'Evita las pantallas 30–60 minutos antes de dormir; la luz azul retrasa el sueño.',
            'Acuéstate y levántate a la misma hora, incluso los fines de semana.',
            'Evita el café y las bebidas energéticas por la tarde.',
            'Mantén tu cuarto oscuro, fresco y en silencio para descansar mejor.',
            'Si no logras dormir en 20 minutos, levántate y haz algo tranquilo hasta que te dé sueño.',
        ],
    },
    {
        id: 'ansiedad',
        label: 'Relajación y meditación',
        icon: '🧘',
        tips: [
            'Respiración 4-4-4: inhala 4s, sostén 4s y exhala 4s. Repite varias veces.',
            'Dedica 5 minutos a una meditación guiada al despertar o antes de dormir.',
            'Técnica 5-4-3-2-1: nombra 5 cosas que ves, 4 que tocas, 3 que oyes, 2 que hueles y 1 que saboreas.',
            'Estira el cuerpo y suelta los hombros cuando notes tensión.',
            'Reduce el consumo de noticias y redes sociales si sientes que te aceleran.',
        ],
    },
    {
        id: 'bienestar',
        label: 'Hábitos y bienestar',
        icon: '🌱',
        tips: [
            'Camina al menos 10 minutos al día; el movimiento mejora el ánimo.',
            'Habla con alguien de confianza cuando algo te pese; compartirlo alivia.',
            'Tómate pausas reales sin pantallas a lo largo del día.',
            'Hidrátate y trata de comer a horas regulares.',
            'Anota una cosa buena de tu día; entrena a tu mente a notar lo positivo.',
        ],
    },
];

export default function Tips() {
    const [active, setActive] = useState<string>('todos');
    const visible = active === 'todos'
        ? CATEGORIES
        : CATEGORIES.filter((c) => c.id === active);

    return (
        <main className="tips-container">
            <header className="tips-header">
                <h1>Tips y consejos</h1>
                <p>Recursos rápidos para cuidar tu bienestar, estudiar mejor y descansar.</p>
            </header>

            <div className="tips-filters">
                <button
                    className={`tips-chip ${active === 'todos' ? 'active' : ''}`}
                    onClick={() => setActive('todos')}
                >
                    Todos
                </button>
                {CATEGORIES.map((c) => (
                    <button
                        key={c.id}
                        className={`tips-chip ${active === c.id ? 'active' : ''}`}
                        onClick={() => setActive(c.id)}
                    >
                        {c.icon} {c.label}
                    </button>
                ))}
            </div>

            {visible.map((cat) => (
                <section key={cat.id} className="tips-section">
                    <h2 className="tips-section-title">
                        <span>{cat.icon}</span> {cat.label}
                    </h2>
                    <div className="tips-grid">
                        {cat.tips.map((tip, i) => (
                            <div key={i} className="tip-card">
                                <span className="tip-bullet">💡</span>
                                <p>{tip}</p>
                            </div>
                        ))}
                    </div>
                </section>
            ))}
        </main>
    );
}