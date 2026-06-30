import { useEffect, useState, useRef } from 'react';
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
  const [messageType, setMessageType]     = useState<'success' | 'error'>('error');
  const [loading, setLoading]             = useState(false);
  const { user, isLoading, reloadUser, userPhoto, setUserPhoto } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setValue('full_name', user.full_name);
      setValue('gender', user.gender || '');
      setValue('email', user.email);
      setValue('age', user.age || 0);
    }
  }, [user, setValue]);

  const handleFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      alert('Solo se permiten imágenes JPG, PNG o WEBP.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('La imagen no puede superar los 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setUserPhoto(result);
      localStorage.setItem(`userPhoto:${user.id}`, result);
    };
    reader.readAsDataURL(file);
  };

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    try {
      setLoading(true);
      setServerMessage('');
      const { email, ...updateData } = data;
      await updateUserProfile({ ...updateData, age: Number(updateData.age) });
      await reloadUser();
      setServerMessage('¡Perfil actualizado con éxito!');
      setMessageType('success');
    } catch (err: any) {
      setServerMessage(err.message || 'Error al actualizar el perfil.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
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

          {/* Avatar con selector de foto */}
          <div
            className="avatar-placeholder"
            onClick={() => inputRef.current?.click()}
            title="Haz clic para cambiar tu foto"
            style={{ cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
          >
            {userPhoto ? (
              <img
                src={userPhoto}
                alt="Foto de perfil"
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
              />
            ) : (
              <span>{user.full_name.charAt(0).toUpperCase()}</span>
            )}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'rgba(0,0,0,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: 0, transition: 'opacity 0.2s',
              fontSize: '1.4rem', borderRadius: '50%'
            }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '0')}
            >
              📷
            </div>
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            style={{ display: 'none' }}
            onChange={handleFoto}
          />
          <p style={{ fontSize: '0.8rem', color: '#9CA3AF', marginTop: '6px' }}>
            Haz clic en la imagen para cambiarla
          </p>

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
                  required: 'La edad es obligatoria',
                  valueAsNumber: true,
                  min: { value: 18, message: 'Debes ser mayor de edad (mínimo 18 años).' },
                  max: { value: 80, message: 'La edad no puede superar los 80 años.' }
                })} />
              {errors.age && <p className="error-text">{errors.age.message}</p>}
            </div>
            <div className="form-group">
              <label htmlFor="gender">Género</label>
              <select id="gender" {...register('gender')}>
                <option value="">Selecciona una opción</option>
                <option value="masculino">Masculino</option>
                <option value="femenino">Femenino</option>
              </select>
            </div>
          </div>

          {serverMessage && (
            <p className={`server-message ${messageType}`}>{serverMessage}</p>
          )}

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </form>
      </div>
    </div>
  );
}