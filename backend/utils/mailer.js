const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    // host: process.env.MAIL_HOST,
    // port: Number(process.env.MAIL_PORT || 587),
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

async function sendMail({ to, subject, text, html }) {
    const info = await transporter.sendMail({
        from: process.env.MAIL_FROM,
        to, subject, text, html
    });
    return info;
}

module.exports = { sendMail };
