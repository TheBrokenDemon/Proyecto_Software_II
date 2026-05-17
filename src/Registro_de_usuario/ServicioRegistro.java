package Registro_de_usuario;

public class ServicioRegistro {
    private ValidarUsuario validador;
    private RepositorioUsuario repositorio;

    public ServicioRegistro(){
        this.validador = new Validar();
        this.repositorio = new Repositorio();
    }

    public void registrarUsuario(String nombre, String correo, String password) {
        Usuario usuario = new Usuario(nombre, correo, password);
        
        if (!validador.validar(usuario)) {
            System.out.println("Error usuario no valido");
        }

        repositorio.guardar(usuario);
        System.out.println("Registro exitoso");
    }
}
