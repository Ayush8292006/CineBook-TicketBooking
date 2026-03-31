import 'dotenv/config';
import sendEmail from './configs/nodeMailer.js';

const testEmail = async () => {
    try {
        console.log("📧 Sending test email...");
        console.log("SMTP User:", process.env.SMTP_USER);
        console.log("Sender Email:", process.env.SENDER_EMAIL);
        
        const result = await sendEmail({
            to: 'aksrivastav0825@gmail.com',
            subject: 'Test Email from CineBook',
            html: '<h1>✅ Test Successful!</h1><p>If you see this, email is working!</p>',
            text: 'Test Successful! Email is working.'
        });
        
        console.log("✅ Email sent:", result);
    } catch (error) {
        console.error("❌ Email error:", error);
    }
};

testEmail();