import { useEffect, useState, useTransition } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { updateUserProfile } from '../services/user.service';
import '../estilos/modificarPerfil.css';

type FormValues = {
    full_name: string;
    gender: string;
    email: string;
    age: number;
};

const LoadingSpinner = () => (
    <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando perfil...</p>
    </div>
);

export default function ModificarPerfil() {
    const { register, handleSubmit, formState: { errors }, setValue } = useForm<FormValues>();
    const [serverMessage, setServerMessage] = useState('');
    const [messageType, setMessageType] = useState<'success' | 'error'>('error');
    const [isPending, startTransition] = useTransition();
    const { user, isLoading, reloadUser } = useAuth();

    useEffect(() => {
        if (user) {
            setValue('full_name', user.full_name);
            setValue('gender', user.gender || '');
            setValue('email', user.email);
            setValue('age', user.age || 0);
        }
    }, [user, setValue]);

    const onSubmit: SubmitHandler<FormValues> = async (data) => {
        startTransition(async () => {
            try {
                setServerMessage('');
                const { email, ...updateData } = data;
                await updateUserProfile({ ...updateData, age: Number(updateData.age) });
                await reloadUser();
                setServerMessage('¡Perfil actualizado con éxito!');
                setMessageType('success');
            } catch (err: any) {
                setServerMessage(err.message || 'Error al actualizar el perfil.');
                setMessageType('error');
            }
        });
    };

    if (isLoading) return <LoadingSpinner />;
    if (!user) return (
        <div className="profile-container">
            <div className="error-message">
                <h2>Error de Autenticación</h2>
                <p>No se pudo cargar la información del perfil.</p>
            </div>
        </div>
    );

    return (
        <div className="profile-container">
            <div className="profile-card">
                <div className="profile-header">
                    <div className="avatar-placeholder">
                        <span>{user.full_name.charAt(0).toUpperCase()}</span>
                    </div>
                    <h1>{user.full_name}</h1>
                    <p>Modifica los campos que desees y guarda los cambios.</p>
                </div>

                <form className="profile-form" onSubmit={handleSubmit(onSubmit)}>
                    <div className="form-group">
                        <label htmlFor="full_name">Nombre Completo</label>
                        <input id="full_name" type="text"
                            {...register('full_name', { required: 'El nombre es obligatorio' })} />
                        {errors.full_name && <p className="error-text">{errors.full_name.message}</p>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Correo Electrónico</label>
                        <input id="email" type="email" {...register('email')} readOnly disabled />
                        <small>El correo electrónico no se puede modificar.</small>
                    </div>

                    <div className="form-group-inline">
                        <div className="form-group">
                            <label htmlFor="age">Edad</label>
                            <input id="age" type="number"
                                {...register('age', {
                                    required: 'La edad es obligatoria', valueAsNumber: true,
                                    min: { value: 1, message: 'La edad no es válida' }
                                })} />
                            {errors.age && <p className="error-text">{errors.age.message}</p>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="gender">Género</label>
                            <input id="gender" type="text" {...register('gender')} />
                        </div>
                    </div>

                    {serverMessage && (
                        <p className={`server-message ${messageType}`}>{serverMessage}</p>
                    )}

                    <button type="submit" className="submit-button" disabled={isPending}>
                        {isPending ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </form>
            </div>
        </div>
    );
}