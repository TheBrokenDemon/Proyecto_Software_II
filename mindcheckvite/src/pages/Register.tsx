import "C:/Users/garyg/Desktop/Repositorios/Proyecto_Software_II/mindcheckvite/src/css/variables.css"
import "C:/Users/garyg/Desktop/Repositorios/Proyecto_Software_II/mindcheckvite/src/css/base.css"
import "C:/Users/garyg/Desktop/Repositorios/Proyecto_Software_II/mindcheckvite/src/css/landing.css"
import "C:/Users/garyg/Desktop/Repositorios/Proyecto_Software_II/mindcheckvite/src/css/components.css"
import "C:/Users/garyg/Desktop/Repositorios/Proyecto_Software_II/mindcheckvite/src/css/auth.css"
import "C:/Users/garyg/Desktop/Repositorios/Proyecto_Software_II/mindcheckvite/src/css/responsive.css"

export default function Register(){
    return (
        <nav>
            <title>Registro</title>

            <div>
                <section className="auth-layout">

                    <div className="auth-panel">

                        <button className="back-btn">
                            ← Volver
                        </button>

                        <div className="auth-header">
                            <div className="logo-mark small">✦</div>
                            <h2>Crear cuenta</h2>
                            <p>Comienza tu camino hacia el bienestar</p>
                        </div>

                        <div className="form-group">
                            <label>Nombre completo</label>
                            <input
                                type="text"
                                id="reg-name"
                                placeholder="Tu nombre"/>
                        </div>

                        <div className="form-group">
                            <label>Correo electrónico</label>
                            <input
                                type="email"
                                id="reg-email"
                                placeholder="hola@ejemplo.com"/>
                        </div>

                        <div className="form-group">

                            <label>Contraseña</label>
                            <input
                                type="password"
                                id="reg-pass"
                                placeholder="Mínimo 6 caracteres"/>
                        </div>

                        <button className="btn-primary full">
                            Registrarme
                        </button>

                    </div>

                </section>
            </div>
        </nav>
    )
}