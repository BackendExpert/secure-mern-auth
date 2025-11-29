const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    service: "gmail",
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
