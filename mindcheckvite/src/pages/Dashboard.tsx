import "C:/Users/garyg/Desktop/Repositorios/Proyecto_Software_II/mindcheckvite/src/css/variables.css"
import "C:/Users/garyg/Desktop/Repositorios/Proyecto_Software_II/mindcheckvite/src/css/base.css"
import "C:/Users/garyg/Desktop/Repositorios/Proyecto_Software_II/mindcheckvite/src/css/landing.css"
import "C:/Users/garyg/Desktop/Repositorios/Proyecto_Software_II/mindcheckvite/src/css/components.css"
import "C:/Users/garyg/Desktop/Repositorios/Proyecto_Software_II/mindcheckvite/src/css/auth.css"
import "C:/Users/garyg/Desktop/Repositorios/Proyecto_Software_II/mindcheckvite/src/css/responsive.css"

export default function Dashboard(){
    return (
        <nav>
            <title>Dashboard</title>
            
            <div>
                <section className="dash-tab">

                    <div className="dashboard-hero">
                        <div className="hero-greeting">
                        <span>Buenos días</span>
                        <h2>Santiago</h2>
                        <p>¿Cómo te sientes hoy?</p>
                        </div>
                    </div>

                    <div className="survey-card-wrapper">
                        <div className="survey-card">
                            <div className="survey-card-icon">
                                🌸
                            </div>
                            <div className="survey-card-content">
                                <h3>Registro emocional</h3>
                                <p>
                                Tómate 2 minutos para conectar contigo.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </nav>
    )
}