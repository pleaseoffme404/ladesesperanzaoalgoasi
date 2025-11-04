const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

function createEmailTemplate(subject, contentHtml) {
    return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body { margin: 0; padding: 0; font-family: 'Lato', Arial, sans-serif; background-color: #fdfcf7; color: #3a3a3a; }
            .container { width: 90%; max-width: 600px; margin: 20px auto; background-color: #ffffff; border: 1px solid #f0ebe5; border-radius: 8px; overflow: hidden; }
            .header { background-color: #8B4513; padding: 30px; text-align: center; }
            .header h1 { color: #ffffff; margin: 0; font-size: 24px; }
            .content { padding: 35px 30px; }
            .content h2 { color: #8B4513; margin-top: 0; }
            .content p { font-size: 16px; line-height: 1.6; color: #5c5c5c; }
            .footer { background-color: #f0ebe5; padding: 20px 30px; text-align: center; font-size: 12px; color: #5c5c5c; }
            .footer p { margin: 5px 0; }
            .footer a { color: #8B4513; text-decoration: none; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>La Desesperanza</h1>
            </div>
            <div class="content">
                <h2>${subject}</h2>
                ${contentHtml}
            </div>
            <div class="footer">
                <p>&copy; 2025 La Desesperanza. Todos los derechos reservados.</p>
                <p>Email: <a href="mailto:soporte@desesperanza.bullnodes.com">soporte@desesperanza.bullnodes.com</a> | Tel: 55 6969 6969</p>
            </div>
        </div>
    </body>
    </html>
    `;
}

const sendEmail = async (to, subject, contentHtml) => {
    try {
        const finalHtml = createEmailTemplate(subject, contentHtml);

        const mailOptions = {
            from: `"La Desesperanza" <${process.env.EMAIL_FROM}>`,
            to: to,
            subject: subject,
            html: finalHtml
        };

        await transporter.sendMail(mailOptions);
        console.log(`[EmailService] Correo enviado a ${to} con asunto "${subject}"`);
        return true;
    } catch (error) {
        console.error(`[EmailService] Error al enviar correo a ${to}:`, error);
        return false;
    }
};

module.exports = {
    sendEmail
};