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

const sendEmail = async (to, subject, html) => {
    try {
        const mailOptions = {
            from: `"La Desesperanza" <${process.env.EMAIL_FROM}>`,
            to: to,
            subject: subject,
            html: html
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