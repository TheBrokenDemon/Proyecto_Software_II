package Registro_de_usuario;

public class Repositorio implements RepositorioUsuario{
    
    @Override
    public void guardar(Usuario usuario) {
        System.out.println("Usuario guardado: "+usuario.getNombre());
        System.out.println("Correo: "+usuario.getCorreo());
    }
}
