const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

/**
 * Envía el correo de recuperación de contraseña.
 */
const sendPasswordResetEmail = async (toEmail, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/htmls/reset-password.html?token=${resetToken}`;

  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to: toEmail,
    subject: 'MindCheck ULima - Recuperación de contraseña',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
        <h2 style="color: #4f46e5;">MindCheck ULima</h2>
        <p>Recibimos una solicitud para restablecer tu contraseña.</p>
        <p>Haz clic en el siguiente enlace para crear una nueva contraseña. 
           Este enlace expira en <strong>15 minutos</strong>.</p>
        <a href="${resetUrl}"
           style="display:inline-block; background:#4f46e5; color:#fff;
                  padding:12px 24px; border-radius:6px; text-decoration:none;">
          Restablecer contraseña
        </a>
        <p style="margin-top:20px; color:#666; font-size:13px;">
          Si no solicitaste este cambio, ignora este correo.
        </p>
      </div>
    `,
  });
};

module.exports = { sendPasswordResetEmail };
