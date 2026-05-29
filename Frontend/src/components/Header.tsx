import './cssComponents/header.css'
import './cssComponents/dashboard.css'
// El componente Link viene de 'react-router-dom'
import { Link } from "react-router-dom"

export default function Header(){
    return (
        <header>
            <nav className="HeaderBackground">
                <img src={"./images/MindChecklogo.png"} className="MindChecklogo"/>
                <h1 className="WrittenHeader1">MindCheck</h1>

                <div className="nav-links">

                    <Link to="/dashboard" className="nav-btn active">
                        Inicio
                    </Link>

                    <Link to="/history" className="nav-btn">
                        Historial
                    </Link>

                    <Link to="/perfil" className="nav-btn">
                        Perfil
                    </Link>
                </div>

                <Link to="/" className="nav-logout">
                    Salir
                </Link>
            </nav>
        </header>
    )
}