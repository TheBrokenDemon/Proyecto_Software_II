import { useState } from "react";
import { Link, useNavigate } from "react-router";
import "./css/variables.css";
import "./css/base.css";
import "./css/components.css";
import "./css/auth.css";
import "./css/responsive.css";
import "./css/ProfessionalAcces.css";

type FormData = {
  nombres: string;
  correo: string;
  codigoAutorizacion: string;
  especialidad: string;
};

export default function ProfessionalAccess() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormData>({
    nombres: "",
    correo: "",
    codigoAutorizacion: "",
    especialidad: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });

    setError("");
    setSuccess("");
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const { nombres, correo, codigoAutorizacion, especialidad } = formData;

    if (!nombres || !correo || !codigoAutorizacion || !especialidad) {
      setError("Debes completar todos los campos obligatorios.");
      return;
    }

    if (!correo.endsWith("@ulima.edu.pe") && !correo.endsWith("@aloe.ulima.edu.pe")) {
      setError("El correo debe pertenecer al dominio institucional de la Universidad de Lima.");
      return;
    }

    if (codigoAutorizacion !== "PSICO-ULIMA-2026") {
      setError("No cuentas con permisos válidos para acceder al panel psicológico.");
      return;
    }

    localStorage.setItem("professionalAccess", "true");
    localStorage.setItem("professionalName", nombres);

    setSuccess("Acceso autorizado. Redirigiendo al panel psicológico...");

    setTimeout(() => {
      navigate("/professional-panel");
    }, 1200);
  };

  return (
    <main className="professional-access-page">
      <section className="professional-access-card">
        <Link to="/login" className="professional-back">
          ← Volver al login
        </Link>

        <div className="professional-header">
          <div className="professional-icon">🧠</div>
          <h1>Acceso profesional</h1>
          <p>
            Completa tus datos para validar el acceso al panel de seguimiento
            psicológico estudiantil.
          </p>
        </div>

        <form className="professional-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nombres y apellidos</label>
            <input
              type="text"
              name="nombres"
              value={formData.nombres}
              onChange={handleChange}
              placeholder="Ejemplo: María López Ramírez"
            />
          </div>

          <div className="form-group">
            <label>Correo institucional</label>
            <input
              type="email"
              name="correo"
              value={formData.correo}
              onChange={handleChange}
              placeholder="profesional@ulima.edu.pe"
            />
          </div>

          <div className="form-group">
            <label>Especialidad</label>
            <select
              name="especialidad"
              value={formData.especialidad}
              onChange={handleChange}
            >
              <option value="">Selecciona una especialidad</option>
              <option value="psicologia-clinica">Psicología clínica</option>
              <option value="psicologia-educativa">Psicología educativa</option>
              <option value="bienestar-universitario">Bienestar universitario</option>
              <option value="orientacion-psicologica">Orientación psicológica</option>
            </select>
          </div>

          <div className="form-group">
            <label>Código de autorización</label>
            <input
              type="password"
              name="codigoAutorizacion"
              value={formData.codigoAutorizacion}
              onChange={handleChange}
              placeholder="Ingresa tu código de acceso"
            />
          </div>

          {error && <p className="professional-error">{error}</p>}
          {success && <p className="professional-success">{success}</p>}

          <button type="submit" className="professional-submit">
            Validar acceso
          </button>
        </form>

        <div className="professional-help">
          <p>
            Para la demostración del MVP, el código autorizado es:
            <strong> PSICO-ULIMA-2026</strong>
          </p>
        </div>
      </section>
    </main>
  );
}