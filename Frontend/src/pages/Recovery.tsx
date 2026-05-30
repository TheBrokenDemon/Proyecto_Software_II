import '../estilos/variables.css'
import '../estilos/base.css'
import '../estilos/landing.css'
import '../estilos/components.css'
import '../estilos/auth.css'
import '../estilos/responsive.css'
// CORRECCIÓN: Se importa 'Link' desde 'react-router-dom'
import { Link } from "react-router-dom" 
import { useState, FormEvent } from "react"

export default function Recovery(){
    const [isShown, setIsShown] = useState(false);

    const eventRecovery = () => {
        setIsShown(true);
    }

    // MEJORA: Usar un manejador de submit para el formulario
    const handleRecoverySubmit = (e: FormEvent) => {
        e.preventDefault(); // Evita que la página se recargue
        // Aquí iría la lógica para llamar a la API y enviar el correo
        console.log("Enviando enlace de recuperación...");
        setIsShown(true); // Muestra el mensaje de éxito
    }
        
    return (
        // MEJORA: Usar un div o fragmento en lugar de <nav> como contenedor principal
        <div id="screen-recovery" className="screen active">

            {/* MEJORA: El <title> debe estar en el <head> del HTML, no en el JSX. 
                Se puede manejar con react-helmet-async si se necesita un título por página. */}

            <div className="auth-layout">

                <div className="auth-panel">

                    <Link to="/login" className="back-btn">
                        ← Volver
                    </Link>

                    <div className="auth-header">
                        <div className="logo-mark small">✦</div>
                        <h2>Recuperar acceso</h2>
                        <p>Te enviaremos un enlace a tu correo</p>
                    </div>

                    {/* MEJORA: Usar la etiqueta <form> para el formulario */}
                    <form id="recovery-form" onSubmit={handleRecoverySubmit}>
                        <div className="form-group">
                            <label htmlFor="recovery-email">Correo electrónico</label>
                            <input
                                type="email"
                                id="recovery-email"
                                placeholder="hola@ejemplo.com"
                                required // Añadimos validación básica
                            />
                        </div>
                        <button type="submit" className="btn-primary full">
                            Enviar enlace
                        </button>
                    </form>

                    {/* MEJORA: Usar renderizado condicional de React en lugar de CSS para mostrar/ocultar */}
                    {isShown && (
                        <div id="recovery-success">
                            <div className="success-box">
                                <div className="success-icon">✉️</div>
                                <h3>¡Correo enviado!</h3>
                                <p>Revisa tu bandeja de entrada y sigue las instrucciones para restablecer tu contraseña.</p>
                                <Link to="/login" className="btn-ghost">
                                    Volver a inicio de sesión
                                </Link>
                            </div>
                        </div>
                    )}
                    </div>

                <div className="auth-deco">
                    <div className="deco-quote">
                    "Todos merecemos<br />una segunda<br />oportunidad."
                    </div>
                    <div className="deco-author">— MindCheck</div>
                </div>
            </div>
        </div>
    )
}