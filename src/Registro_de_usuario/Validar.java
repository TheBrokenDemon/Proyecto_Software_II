package Registro_de_usuario;

public class Validar implements ValidarUsuario {

    @Override
    public boolean validar(Usuario usuario) {
        if(usuario.getNombre() == null || usuario.getNombre().isEmpty()) {
            return false;
        }
        if(usuario.getCorreo() == null || !usuario.getCorreo().contains("@")) {
            return false;
        }
        if(usuario.getPassword().length() < 6) {
            return false;
        }
        return true;
    }

}
