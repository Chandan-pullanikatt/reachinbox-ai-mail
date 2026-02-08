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
    const trans = await getTransporter();

    const info = await trans.sendMail({
        from: '"Email Scheduler" <scheduler@example.com>', // sender address
        to, // list of receivers
        subject, // Subject line
        text: html.replace(/<[^>]*>?/gm, ''), // plain text body
        html, // html body
    });

    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

    return info;
};
