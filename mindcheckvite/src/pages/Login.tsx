import "C:/Users/garyg/Desktop/Repositorios/Proyecto_Software_II/mindcheckvite/src/css/variables.css"
import "C:/Users/garyg/Desktop/Repositorios/Proyecto_Software_II/mindcheckvite/src/css/base.css"
import "C:/Users/garyg/Desktop/Repositorios/Proyecto_Software_II/mindcheckvite/src/css/landing.css"
import "C:/Users/garyg/Desktop/Repositorios/Proyecto_Software_II/mindcheckvite/src/css/components.css"
import "C:/Users/garyg/Desktop/Repositorios/Proyecto_Software_II/mindcheckvite/src/css/auth.css"
import "C:/Users/garyg/Desktop/Repositorios/Proyecto_Software_II/mindcheckvite/src/css/responsive.css"
import { Link } from "react-router-dom"

// Comentarios
//  - Hay un bug en onClick que actualiza la pagina cada cierto tiempo

export default function Login() {
    return (
        <nav>
            <title>Login</title>

            <div>
                <section className="auth-layout">

                    <div className="auth-panel">

                        <button className="back-btn">
                            <li>
                                <Link to="/">← Volver</Link>
                            </li>
                        </button>

                        <div className="auth-header">
                            <div className="logo-mark small">✦</div>
                            <h2>Bienvenida de vuelta</h2>
                            <p>Nos alegra verte de nuevo</p>
                        </div>

                        <div className="form-group">
                            <label>Correo electrónico</label>
                            <input
                                type="email"
                                id="login-email"
                                placeholder="hola@ejemplo.com"/>
                        </div>

                        <div className="form-group">
                            <label>Contraseña</label>
                            <input
                                type="password"
                                id="login-pass"
                                placeholder="Tu contraseña"/>
                        </div>

                        <Link to="/recovery">
                            ¿Ha olvidado su contraseña?
                        </Link>

                        <Link to="/Dashboard" className="btn-primary full">
                            Entrar
                        </Link>
                    </div>

                    <div className="auth-deco">
                        <div className="deco-quote">
                            "Cuida tus emociones"
                        </div>
                        <div className="deco-author">
                            — Tu bienestar importa
                        </div>
                    </div>
                </section>
            </div>
        </nav>
    )
}
// window.location.href='index.html'
// <link rel="preconnect" href="https://fonts.googleapis.com"/>
// <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet"/>
// <script type="module" src="../dist/app.js"> </script>
