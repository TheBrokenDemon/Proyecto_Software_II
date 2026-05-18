import logo from "C:/Users/garyg/Desktop/Repositorios/Proyecto_Software_II/mindcheckvite/src/images/MindChecklogo.png"
import "C:/Users/garyg/Desktop/Repositorios/Proyecto_Software_II/mindcheckvite/src/css/header.css"
import { Link } from "react-router"

export default function Header(){
    return (
        <header>
            <nav className="HeaderBackground">
                <img src={logo} className="MindChecklogo"/>
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