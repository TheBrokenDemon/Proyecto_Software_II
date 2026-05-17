import "C:/Users/garyg/Desktop/Repositorios/Proyecto_Software_II/mindcheckvite/src/css/variables.css"
import "C:/Users/garyg/Desktop/Repositorios/Proyecto_Software_II/mindcheckvite/src/css/base.css"
import "C:/Users/garyg/Desktop/Repositorios/Proyecto_Software_II/mindcheckvite/src/css/landing.css"
import "C:/Users/garyg/Desktop/Repositorios/Proyecto_Software_II/mindcheckvite/src/css/components.css"
import "C:/Users/garyg/Desktop/Repositorios/Proyecto_Software_II/mindcheckvite/src/css/auth.css"
import "C:/Users/garyg/Desktop/Repositorios/Proyecto_Software_II/mindcheckvite/src/css/responsive.css"

export default function Recovery(){
    return (
        <nav>
            <title>Recuperar acceso - Sentir</title>

            <div id="screen-recovery" className="screen active">

                <div className="auth-layout">

                    <div className="auth-panel">

                        <button className="back-btn">
                            ← Volver
                        </button>

                        <div className="auth-header">

                            <div className="logo-mark small">
                                ✦
                            </div>

                            <h2>
                                Recuperar acceso
                            </h2>

                            <p>
                                Te enviaremos un enlace a tu correo
                            </p>

                        </div>

                        <div id="recovery-form">

                            <div className="form-group">

                                <label>
                                Correo electrónico
                                </label>

                                <input
                                type="email"
                                id="recovery-email"
                                placeholder="hola@ejemplo.com"
                                />

                            </div>

                            <button className="btn-primary full">
                                Enviar enlace
                            </button>
                        </div>

                        <div id="recovery-success" className="hidden">

                            <div className="success-box">

                                <div className="success-icon">
                                ✉️
                                </div>

                                <h3>
                                ¡Correo enviado!
                                </h3>

                                <p>
                                Revisa tu bandeja de entrada y sigue las instrucciones
                                para restablecer tu contraseña.
                                </p>

                                <button className="btn-ghost">
                                Volver al inicio
                                </button>

                            </div>

                        </div>

                    </div>

                    <div className="auth-deco">
                        <div className="deco-quote">
                        "Todos merecemos<br />
                        una segunda<br />
                        oportunidad."
                        </div>

                        <div className="deco-author">
                        — Sentir
                        </div>

                    </div>

                </div>

            </div>
        </nav>
    )
}