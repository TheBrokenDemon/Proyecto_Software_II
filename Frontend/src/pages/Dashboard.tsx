import './css/variables.css'
import './css/base.css'
import './css/landing.css'
import './css/components.css'
import './css/auth.css'
import './css/responsive.css'
import './css/dashboard.css'
import Header from "../components/Header"
import { Link } from "react-router"

export default function Dashboard(){
    <Header/>
    return (
        
        <nav>
            <title>Dashboard</title>
            
            <div>
                <section className="dash-tab">

                    <div className="dashboard-greeting-modify">
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

                    <div>
                        <Link to="/survey" className="surveyLink">
                            Tomar una encuesta
                        </Link>
                    </div>

                </section>
            </div>
        </nav>
    )
}