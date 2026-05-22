import { useForm } from "react-hook-form"
import { useState } from "react";
import "./css/modificarPerfil.css"

// Las funciones de eventDespliegue se repiten, afectando el principio DRY

export default function ModificarPerfil() {
    const {register, handleSubmit, formState: { errors } } = useForm();
    const [isShown1, setIsShown1] = useState(false);
    const [isShown2, setIsShown2] = useState(false);
    const [isShown3, setIsShown3] = useState(false);
    const [isShown4, setIsShown4] = useState(false);
    // data que conectara con el backend
    const onSubmit = data => console.log(data);
    
    const eventMultiple = () => {
        eventDespliegueAdvertencia1();
        eventDespliegueAdvertencia2();
        eventDespliegueAdvertencia3();
        eventDespliegueAdvertencia4();
    }

    const eventDespliegueAdvertencia1 = () => {
        setIsShown1(true);
    }

    const eventDespliegueAdvertencia2 = () => {
        setIsShown2(true);
    }

    const eventDespliegueAdvertencia3 = () => {
        setIsShown3(true);
    }

    const eventDespliegueAdvertencia4 = () => {
        setIsShown4(true);
    }
    // <input defaultValue="test" {...register("example")}/>



    return (
        <>
            <div className="formBox">
                <div>
                    <h1>Modificar perfil del usuario</h1>
                    <p>Ingrese los valores que se desea modificar</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <label className="fname">Nombre: </label><br></br>
                    <input type="text" id="fname" {...register("exampleRequired", {required : true})}/><br></br>
                    <div style={{display: isShown1 ? "block" : "none"}}>
                        {errors.exampleRequired && <p className="fieldRequired1">Se requiere ingresar un nombre</p>}
                    </div>

                    <label className="fgenero">Genero: </label><br></br>
                    <input type="text" id="fgenero" {...register("exampleRequired", {required : true})}/><br></br>
                    <div style={{display: isShown2 ? "block" : "none"}}>
                        {errors.exampleRequired && <p className="fieldRequired2">Se requiere ingresar un genero</p>}
                    </div>

                    <label className="fcorreo">Correo del usuario: </label><br></br>
                    <input type="text" id="fcorreo" {...register("exampleRequired", {required : true})}/><br></br>
                    <div style={{display : isShown3 ? "block" : "none"}}>
                        {errors.exampleRequired && <p className="fieldRequired3">Se requiere ingresar un correo</p>}
                    </div>

                    <label className="fedad">Edad del usuario: </label><br></br>
                    <input type="text" id="fedad" {...register("exampleRequired", {required : true})}/><br></br>
                    <div style={{display : isShown4 ? "block" : "none"}}>
                        {errors.exampleRequired && <p className="fieldRequired4">Se requiere ingresar una edad</p>}
                    </div>

                    <input type="submit" onClick={eventMultiple}/>
                </form>
            </div>
        </>
    )
}