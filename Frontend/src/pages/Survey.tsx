import './css/variables.css'
import './css/base.css'
import './css/landing.css'
import './css/components.css'
import './css/auth.css'
import './css/responsive.css'
import { Link } from "react-router"

export default function Survey(){
    return (
        <nav>
            <title>Encuesta</title>

            <section id="screen-survey">
                <div className="survey-layout">
                    <Link to="/dashboard" className="back-btn light">
                        ← Volver
                    </Link>

                    <div className="survey-header">
                        <h2>¿Cómo te sientes hoy?</h2>
                        <p>No hay respuestas correctas</p>
                    </div>

                    <div className="emotion-grid">
                        <button className="emotion-btn">
                            😊 Feliz
                        </button>

                        <button className="emotion-btn">
                            😰 Ansiosa
                        </button>

                        <button className="emotion-btn">
                            😢 Triste
                        </button>

                        <button className="emotion-btn">
                            😴 Cansada
                        </button>
                    </div>

                </div>

            </section>
        </nav>
    )
}