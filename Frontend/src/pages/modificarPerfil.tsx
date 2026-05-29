import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { getUserProfile, updateUserProfile } from "../services/usuarioServices";
import "./css/modificarPerfil.css";

// Definimos el tipo de datos para el formulario
type FormValues = {
    full_name: string;
    gender: string;
    email: string; // El email no se puede modificar, lo mostraremos como solo lectura
    age: number;
};

export default function ModificarPerfil() {
    const { register, handleSubmit, formState: { errors }, setValue } = useForm<FormValues>();
    const [serverMessage, setServerMessage] = useState('');

    // 1. Cargar datos del usuario al montar el componente
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const profile = await getUserProfile();
                // Usamos setValue para poblar el formulario con los datos del backend
                setValue("full_name", profile.full_name);
                setValue("gender", profile.gender);
                setValue("email", profile.email);
                setValue("age", profile.age);
            } catch (error) {
                setServerMessage("Error al cargar el perfil.");
            }
        };
        fetchProfile();
    }, [setValue]);

    // 2. Función que se ejecuta al enviar el formulario
    const onSubmit: SubmitHandler<FormValues> = async (data) => {
        try {
            // No enviamos el email porque no es modificable
            const { email, ...updateData } = data;
            await updateUserProfile(updateData);
            setServerMessage("¡Perfil actualizado con éxito!");
        } catch (error: any) {
            setServerMessage(error.message || "Error al actualizar.");
        }
    };

    return (
        <>
            <div className="formBox">
                <div>
                    <h1>Modificar perfil del usuario</h1>
                    <p>Modifica los campos que desees y guarda los cambios.</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <label className="fname">Nombre: </label><br></br>
                    <input type="text" id="fname" {...register("full_name", { required: "Se requiere ingresar un nombre" })} /><br></br>
                    {errors.full_name && <p className="fieldRequired">{errors.full_name.message}</p>}

                    <label className="fgenero">Género: </label><br></br>
                    <input type="text" id="fgenero" {...register("gender", { required: "Se requiere ingresar un género" })} /><br></br>
                    {errors.gender && <p className="fieldRequired">{errors.gender.message}</p>}

                    <label className="fcorreo">Correo del usuario: </label><br></br>
                    <input type="text" id="fcorreo" {...register("email")} readOnly disabled /><br></br>
                    <small>El correo electrónico no se puede modificar.</small><br></br>

                    <label className="fedad">Edad del usuario: </label><br></br>
                    <input type="number" id="fedad" {...register("age", { required: "Se requiere ingresar una edad", valueAsNumber: true })} /><br></br>
                    {errors.age && <p className="fieldRequired">{errors.age.message}</p>}

                    <input type="submit" value="Guardar Cambios" />

                    {serverMessage && <p className="serverMessage">{serverMessage}</p>}
                </form>
            </div>
        </>
    )
}