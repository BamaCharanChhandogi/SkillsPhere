import nodemailer from 'nodemailer';

// Create a transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // Your Gmail email
        pass: process.env.EMAIL_PASS  // App Password, not your regular password
    }
});

/**
 * Send verification email to user
 * @param {string} email - Recipient's email address
 * @param {string} verificationToken - Unique verification token
 * @returns {Promise<object>} - Email sending result
 */
export const sendVerificationEmail = async (email, verificationToken) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Verify Your Account',
            html: `
                <h1>Account Verification</h1>
                <p>Click the link below to verify your account:</p>
                <a href="${process.env.FRONTEND_URL}/verify/${verificationToken}">Verify Account</a>
                <p>This link will expire in 1 hour.</p>
            `
        };

        const result = await transporter.sendMail(mailOptions);
        return {
            success: true,
            message: 'Verification email sent successfully',
            result
        };
    } catch (error) {
        console.error('Error sending verification email:', error);
        return {
            success: false,
            message: 'Failed to send verification email',
            error
        };
    }
};