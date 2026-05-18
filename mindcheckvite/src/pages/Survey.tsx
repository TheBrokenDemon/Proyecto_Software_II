import "C:/Users/garyg/Desktop/Repositorios/Proyecto_Software_II/mindcheckvite/src/css/variables.css"
import "C:/Users/garyg/Desktop/Repositorios/Proyecto_Software_II/mindcheckvite/src/css/base.css"
import "C:/Users/garyg/Desktop/Repositorios/Proyecto_Software_II/mindcheckvite/src/css/landing.css"
import "C:/Users/garyg/Desktop/Repositorios/Proyecto_Software_II/mindcheckvite/src/css/components.css"
import "C:/Users/garyg/Desktop/Repositorios/Proyecto_Software_II/mindcheckvite/src/css/auth.css"
import "C:/Users/garyg/Desktop/Repositorios/Proyecto_Software_II/mindcheckvite/src/css/responsive.css"
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