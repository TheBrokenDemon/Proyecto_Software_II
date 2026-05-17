import logo from "C:/Users/garyg/Desktop/Repositorios/Proyecto_Software_II/mindcheckvite/src/images/MindChecklogo.png"
import "C:/Users/garyg/Desktop/Repositorios/Proyecto_Software_II/mindcheckvite/src/css/header.css"

export default function Header(){
    return (
        <header>
            <nav className="HeaderBackground">
                <img src={logo} className="MindChecklogo"/>
                <h1 className="WrittenHeader1">MindCheck</h1>

                <div className="nav-links">

                    <button className="nav-btn active">
                        Inicio
                    </button>

                    <button className="nav-btn">
                        Historial
                    </button>

                    <button className="nav-btn">
                        Perfil
                    </button>
                </div>

                <button className="nav-logout">
                    Salir
                </button>
                
            </nav>
        </header>
    )
}