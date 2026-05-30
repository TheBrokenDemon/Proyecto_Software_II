const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

const sendPasswordResetEmail = async (toEmail, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/htmls/reset-password.html?token=${resetToken}`;

  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to: toEmail,
    subject: 'MindCheck ULima - Recuperacion de contrasena',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
        <h2 style="color: #4f46e5;">MindCheck ULima</h2>
        <p>Recibimos una solicitud para restablecer tu contrasena.</p>
        <p>Haz clic en el siguiente enlace para crear una nueva contrasena. Este enlace expira en <strong>15 minutos</strong>.</p>
        <a href="${resetUrl}"
           style="display:inline-block; padding:12px 24px; background:#4f46e5; color:#fff; border-radius:6px; text-decoration:none;">
          Restablecer contrasena
        </a>
        <p style="margin-top:20px; color:#666; font-size:13px;">
          Si no solicitaste este cambio, ignora este correo. Tu contrasena no sera modificada.
        </p>
      </div>
    `,
  });

  const sendCitationEmailToStudent = async (student, psychologistName) => {
  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to: student.email,
    subject: 'MindCheck ULima - Citación con psicólogo',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
        <h2 style="color: #4f46e5;">MindCheck ULima</h2>
        <p>Hola <strong>${student.full_name}</strong>,</p>
        <p>El área de psicología de la Universidad de Lima te ha enviado una citación.</p>
        <p>El psicólogo <strong>${psychologistName}</strong> ha revisado tus evaluaciones emocionales y considera importante tener una conversación contigo.</p>
        <div style="background:#f3f4f6; padding:16px; border-radius:8px; margin:20px 0;">
          <p style="margin:0; color:#374151;">Por favor comunícate con el área de Bienestar Universitario para coordinar tu cita.</p>
        </div>
        <p style="color:#6b7280; font-size:13px;">Este mensaje fue generado automáticamente por MindCheck ULima.</p>
      </div>
    `,
  });

  
};

};

module.exports = { sendPasswordResetEmail, sendCitationEmailToStudent };
