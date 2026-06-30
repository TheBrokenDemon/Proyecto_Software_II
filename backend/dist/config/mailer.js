"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendCitationEmailToStudent = exports.sendPasswordResetEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const transporter = nodemailer_1.default.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
});
const sendPasswordResetEmail = async (to, token) => {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    await transporter.sendMail({
        from: process.env.MAIL_FROM,
        to,
        subject: 'Recuperación de contraseña — MindCheck ULima',
        html: `
      <h2>Recupera tu contraseña</h2>
      <p>Haz clic en el siguiente enlace para restablecer tu contraseña. El enlace expira en 15 minutos.</p>
      <a href="${resetUrl}" style="background:#4f46e5;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;">
        Restablecer contraseña
      </a>
      <p style="margin-top:16px;color:#6b7280;font-size:14px;">
        Si no solicitaste este cambio, ignora este correo.
      </p>
    `,
    });
};
exports.sendPasswordResetEmail = sendPasswordResetEmail;
const sendCitationEmailToStudent = async (student, psychologistName) => {
    await transporter.sendMail({
        from: process.env.MAIL_FROM,
        to: student.email,
        subject: 'Citación psicológica — MindCheck ULima',
        html: `
      <h2>Hola ${student.full_name},</h2>
      <p>El/La psicólogo/a <strong>${psychologistName}</strong> te ha citado para una sesión de acompañamiento.</p>
      <p>Por favor ingresa a la plataforma MindCheck para confirmar o reprogramar tu cita.</p>
      <a href="${process.env.FRONTEND_URL}" style="background:#4f46e5;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;">
        Ir a MindCheck
      </a>
    `,
    });
};
exports.sendCitationEmailToStudent = sendCitationEmailToStudent;
