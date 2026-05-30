import React, { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../estilos/Login.css'; // Asegúrate de tener estilos para esta página

type FormValues = {
  email: string;
  password: string;
};

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>();
  const [serverError, setServerError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    try {
      setServerError(''); // Limpia errores previos
      const { role } = await login(data);
      
      // Redirige al panel correspondiente según el rol del usuario
      const targetPath = role === 'psicologo' ? '/psychologist-panel' : '/dashboard';
      // `replace: true` evita que el usuario pueda volver a la página de login con el botón "atrás"
      navigate(targetPath, { replace: true });
    } catch (error: any) {
      console.error("Error en el inicio de sesión:", error);
      setServerError(error.message || 'Error al iniciar sesión. Por favor, verifica tus credenciales.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <Link to="/" className="back-link">
          ← Volver
        </Link>

        <div className="login-header">
          <h1>Bienvenido de vuelta</h1>
          <p>Inicia sesión para continuar en MindCheck</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label htmlFor="email">Correo Electrónico</label>
            <input 
              id="email" 
              type="email" 
              {...register("email", { required: "El correo es obligatorio" })} 
            />
            {errors.email && <p className="error-text">{errors.email.message}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input 
              id="password" 
              type="password" 
              {...register("password", { required: "La contraseña es obligatoria" })} 
            />
            {errors.password && <p className="error-text">{errors.password.message}</p>}
          </div>

          {serverError && <p className="server-error">{serverError}</p>}

          <button type="submit" className="submit-button">Iniciar Sesión</button>

          <div className="login-footer">
            <p>¿No tienes una cuenta? <Link to="/register">Regístrate</Link></p>
            <Link to="/recovery">¿Olvidaste tu contraseña?</Link>
          </div>
        </form>
      </div>
    </div>
  );
}