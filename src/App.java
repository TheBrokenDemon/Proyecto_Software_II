
import Registro_de_usuario.ServicioRegistro;

public class App {
    public static void main(String[] args) {
        ServicioRegistro servicio = new ServicioRegistro();
        servicio.registrarUsuario("Gustavo", "gustavo@example.com", "password123");
    }
}
