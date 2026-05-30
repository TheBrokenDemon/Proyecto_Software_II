import { useForm, type SubmitHandler } from 'react-hook-form';
import { useEffect, useState, useTransition } from 'react';
import { updateUserProfile } from "../services/usuarioServices";
import { useAuth } from "../context/AuthContext";
import "./css/modificarPerfil.css";

// --- Tipos y Componentes Auxiliares ---
// Definimos el tipo de datos para el formulario
type FormValues = {
    full_name: string;
    gender: string;
    email: string; // El email no se puede modificar, lo mostraremos como solo lectura
    age: number;
};

// Un componente simple para mostrar un estado de carga
const LoadingSpinner = () => (
    <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando perfil...</p>
    </div>
);

// --- Componente Principal ---
export default function ModificarPerfil() {
    const { register, handleSubmit, formState: { errors }, setValue } = useForm<FormValues>();
    const [serverMessage, setServerMessage] = useState('');
    const [messageType, setMessageType] = useState<'success' | 'error'>('error');
    const [isPending, startTransition] = useTransition(); // Hook para transiciones de estado no urgentes

    // Usamos el AuthContext para obtener el usuario y el estado de carga
    const { user, isLoading: isAuthLoading, reloadUser } = useAuth();

    // 1. Cargar datos del usuario al montar el componente
    useEffect(() => {
        if (user) {
            // Usamos setValue para poblar el formulario con los datos del contexto
            setValue("full_name", user.full_name);
            setValue("gender", user.gender || '');
            setValue("email", user.email);
            setValue("age", user.age || 0);
        }
    }, [user, setValue]);

    // 2. Función que se ejecuta al enviar el formulario
    const onSubmit: SubmitHandler<FormValues> = async (data) => {
        startTransition(async () => {
            try {
                setServerMessage(''); // Limpiar mensaje previo
                // No enviamos el email porque no es modificable
                const { email, ...updateData } = data;
                
                // Convertimos la edad a número explícitamente
                const payload = { ...updateData, age: Number(updateData.age) };
                
                await updateUserProfile(payload);
                
                // Refrescamos los datos del usuario en el contexto global
                await reloadUser();
                setServerMessage("¡Perfil actualizado con éxito!");
                setMessageType('success');
            } catch (error: any) {
                setServerMessage(error.message || "Error al actualizar el perfil.");
                setMessageType('error');
            }
        });
    };

    // Si el contexto aún está cargando el usuario, mostramos un spinner
    if (isAuthLoading) {
        return <LoadingSpinner />;
    }

    // Si no hay usuario después de cargar, mostramos un error
    if (!user) {
        return (
            <div className="profile-container">
                <div className="error-message">
                    <h2>Error de Autenticación</h2>
                    <p>No se pudo cargar la información del perfil. Por favor, intenta iniciar sesión de nuevo.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-container">
            <div className="profile-card">
                <div className="profile-header">
                    {/* Placeholder para el Avatar */}
                    <div className="avatar-placeholder">
                        <span>{user.full_name.charAt(0).toUpperCase()}</span>
                    </div>
                    <h1>{user.full_name}</h1>
                    <p>Modifica los campos que desees y guarda los cambios.</p>
                </div>

                <form className="profile-form" onSubmit={handleSubmit(onSubmit)}>
                    <div className="form-group">
                        <label htmlFor="full_name">Nombre Completo</label>
                        <input id="full_name" type="text" {...register("full_name", { required: "El nombre es obligatorio" })} />
                        {errors.full_name && <p className="error-text">{errors.full_name.message}</p>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Correo Electrónico</label>
                        <input id="email" type="email" {...register("email")} readOnly disabled />
                        <small>El correo electrónico no se puede modificar.</small>
                    </div>

                    <div className="form-group-inline">
                        <div className="form-group">
                            <label htmlFor="age">Edad</label>
                            <input id="age" type="number" {...register("age", { required: "La edad es obligatoria", valueAsNumber: true, min: { value: 1, message: "La edad no es válida" } })} />
                            {errors.age && <p className="error-text">{errors.age.message}</p>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="gender">Género</label>
                            <input id="gender" type="text" {...register("gender")} />
                        </div>
                    </div>

                    {serverMessage && <p className={`server-message ${messageType}`}>{serverMessage}</p>}

                    <button type="submit" className="submit-button" disabled={isPending}>
                        {isPending ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </form>
            </div>
        </div>
    )
}