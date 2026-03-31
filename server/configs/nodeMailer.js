import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendEmail = async ({ to, subject, html, text }) => {
    try {
        const response = await transporter.sendMail({
            from: process.env.SENDER_EMAIL,
            to,
            subject,
            html: html,  // HTML version (styling)
            text: text || html?.replace(/<[^>]*>/g, '') // Plain text fallback
        });
        
        console.log(`✅ Email sent to ${to}`);
        return response;
    } catch (error) {
        console.error("❌ Email error:", error);
        throw error;
    }
};

export default sendEmail;