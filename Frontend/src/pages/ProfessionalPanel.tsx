import { Navigate, Link } from 'react-router-dom';
import '../estilos/professionalAccess.css';

export default function ProfessionalPanel() {
    const hasAccess = localStorage.getItem('professionalAccess') === 'true';
    const professionalName = localStorage.getItem('professionalName');

    if (!hasAccess) return <Navigate to="/professional-access" />;

    return (
        <main className="professional-access-page">
            <section className="professional-access-card">
                <div className="professional-header">
                    <div className="professional-icon">🧠</div>
                    <h1>Panel psicológico</h1>
                    <p>
                        Bienvenido/a {professionalName}. Desde este módulo podrás realizar
                        seguimiento preventivo de las evaluaciones emocionales estudiantiles.
                    </p>
                </div>
                <div className="professional-help">
                    <p>Acceso autorizado correctamente.</p>
                </div>
                <Link to="/dashboard" className="professional-submit">Ir al inicio</Link>
            </section>
        </main>
    );
}