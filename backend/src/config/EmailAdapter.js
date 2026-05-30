/**
 * PATRÓN: ADAPTER
 * Permite integrar múltiples proveedores de email sin cambiar el código cliente
 * Beneficio: Flexibilidad, fácil de testear, desacoplamiento de proveedores
 */

/**
 * IEmailAdapter - Contrato para proveedores de email
 */
class IEmailAdapter {
  async sendEmail(to, subject, html) {
    throw new Error('sendEmail() debe estar implementado');
  }
}

/**
 * GmailAdapter - Implementación para Gmail (Nodemailer)
 */
class GmailAdapter extends IEmailAdapter {
  constructor(mailer) {
    super();
    this.mailer = mailer;
  }

  async sendEmail(to, subject, html) {
    try {
      const result = await this.mailer.sendMail({
        from: process.env.MAIL_FROM,
        to,
        subject,
        html,
      });
      console.log(`✓ Email enviado a ${to} (ID: ${result.messageId})`);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error(`✗ Error enviando email a ${to}:`, error.message);
      throw new Error(`No se pudo enviar el email: ${error.message}`);
    }
  }
}

/**
 * SendGridAdapter - Implementación para SendGrid (futuro)
 * Mismo contrato, diferente proveedor
 */
class SendGridAdapter extends IEmailAdapter {
  constructor(sgMail) {
    super();
    this.sgMail = sgMail;
  }

  async sendEmail(to, subject, html) {
    try {
      const msg = {
        to,
        from: process.env.SENDGRID_FROM_EMAIL,
        subject,
        html,
      };
      await this.sgMail.send(msg);
      console.log(`✓ Email enviado a ${to} via SendGrid`);
      return { success: true };
    } catch (error) {
      console.error(`✗ Error SendGrid:`, error.message);
      throw new Error(`No se pudo enviar el email: ${error.message}`);
    }
  }
}

/**
 * EmailService - Facade que usa el adapter
 * Permite cambiar de proveedor sin tocar el código que lo usa
 */
class EmailService {
  constructor(emailAdapter) {
    this.adapter = emailAdapter;
  }

  async sendPasswordRecovery(email, resetUrl) {
    const subject = 'MindCheck ULima - Recupera tu contraseña';
    const html = `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2>Recupera tu contraseña</h2>
        <p>Haz clic en el enlace para cambiar tu contraseña:</p>
        <a href="${resetUrl}" style="padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; display: inline-block;">
          Restablecer contraseña
        </a>
        <p style="margin-top: 20px; color: #666; font-size: 12px;">
          Este enlace expira en 1 hora. Si no solicitaste esto, ignora este email.
        </p>
      </div>
    `;
    return this.adapter.sendEmail(email, subject, html);
  }

  async sendWelcomeEmail(email, fullName) {
    const subject = 'Bienvenido a MindCheck ULima';
    const html = `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2>¡Bienvenido, ${fullName}!</h2>
        <p>Tu cuenta ha sido creada exitosamente.</p>
        <p>Ahora puedes acceder a la plataforma de bienestar emocional de Universidad de Lima.</p>
      </div>
    `;
    return this.adapter.sendEmail(email, subject, html);
  }

  async sendContactNotification(psychologistEmail, studentName, studentId) {
    const subject = 'Nuevo estudiante marcado para contacto';
    const html = `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2>Notificación de Seguimiento</h2>
        <p>El estudiante <strong>${studentName}</strong> (ID: ${studentId}) ha sido marcado para contacto.</p>
        <p>Revisa su perfil en el panel de psicólogos.</p>
      </div>
    `;
    return this.adapter.sendEmail(psychologistEmail, subject, html);
  }
}

module.exports = {
  IEmailAdapter,
  GmailAdapter,
  SendGridAdapter,
  EmailService,
};
