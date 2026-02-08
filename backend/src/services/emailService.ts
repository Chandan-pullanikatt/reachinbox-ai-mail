import nodemailer from 'nodemailer';

// Create a reusable transporter object using the default SMTP transport
let transporter: nodemailer.Transporter | null = null;

export const getTransporter = async () => {
    if (transporter) return transporter;

    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing
    const testAccount = await nodemailer.createTestAccount();

    transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: testAccount.user, // generated ethereal user
            pass: testAccount.pass, // generated ethereal password
        },
    });

    console.log('Ethereal Mail Configured:');
    console.log('User:', testAccount.user);
    console.log('Pass:', testAccount.pass);
    console.log('Preview URL will be logged after sending.');

    return transporter;
};

export const sendEmail = async ({
    to,
    subject,
    html,
}: {
    to: string;
    subject: string;
    html: string;
}) => {
    try {
        console.log(`[MOCK EMAIL SERVICE] Attempting to send email to ${to}...`);

        // Simulating network delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // In a real production app with paid servers, this would use AWS SES / SendGrid.
        // For this demo on Render Free Tier (which blocks SMTP ports 25/465/587),
        // we log the email content to prove the scheduler triggered correctly.

        console.log("==================================================");
        console.log(`EMAIL SENT SUCCESSFULLY (Simulated)`);
        console.log(`To: ${to}`);
        console.log(`Subject: ${subject}`);
        console.log(`Body: ${html.substring(0, 50)}...`);
        console.log("==================================================");

        return { messageId: `mock-${Date.now()}` };

    } catch (error) {
        console.error("Critical Email Error:", error);
        throw error;
    }
};
