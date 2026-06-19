const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

exports.sendOTPEmail = async (email, otp, type) => {
    let title = 'Verification Code';
    let messageBody = `Please use the code below to complete your verification process.`;

    // Dynamic text selection based on the operation type
    if (type === 'account_verification') {
        title = 'Verify Your New Account';
        messageBody = 'Welcome to Eventora! Use the verification code below to activate your new user account profile.';
    } else if (type === 'event_booking') {
        title = 'Confirm Your Ticket Booking';
        messageBody = 'We received your event registration request. Use the verification code below to secure your ticket slot.';
    }

    // HTML Email layout configuration
    const htmlTemplate = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <h2 style="color: #4F46E5; text-align: center;">${title}</h2>
            <p style="font-size: 16px; color: #333333; line-height: 1.5;">Hello,</p>
            <p style="font-size: 16px; color: #333333; line-height: 1.5;">${messageBody}</p>
            <div style="text-align: center; margin: 30px 0;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #4F46E5; background-color: #F3F4F6; padding: 10px 25px; border-radius: 6px; border: 1px dashed #4F46E5;">
                    ${otp}
                </span>
            </div>
            <p style="font-size: 14px; color: #6B7280; text-align: center;">This code is valid for exactly 5 minutes. Please do not share this OTP with anyone.</p>
            <hr style="border: 0; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
            <p style="font-size: 12px; color: #9CA3AF; text-align: center;">Sent automatically by Eventora Platforms. All rights reserved.</p>
        </div>
    `;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: `[Eventora] ${title}`,
        html: htmlTemplate // 👈 Swapped 'text' out for the parsed template string variable
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`[Email Dispatched] HTML template sent to ${email} successfully.`);
    } catch (error) {
        console.error("[SMTP Server Mail Error]: ", error.message);
    }
};
exports.sendBookingEmail = async (toEmail, eventTitle, userName) => {
    try {
        const subjectTitle = 'Ticket Confirmed! Your Eventora Registration Success';

        const htmlLayout = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; rounded: 8px;">
        <h2 style="color: #10B981; text-align: center;">Registration Confirmed! 🎉</h2>
        <p style="color: #333333; font-size: 16px; line-height: 1.5;">Hi ${userName},</p>
        <p style="color: #333333; font-size: 16px; line-height: 1.5;">Great news! The administrator has reviewed your registration details and marked your invoice status as approved. Your access pass for the following event has been successfully generated and finalized:</p>
        
        <div style="background-color: #F0FDF4; border-left: 4px solid #10B981; padding: 15px; margin: 20px 0;">
          <strong style="color: #065F46; font-size: 18px;">${eventTitle}</strong>
          <p style="margin: 5px 0 0 0; color: #047857; font-size: 14px;">Status: Fully Paid & Confirmed</p>
        </div>

        <p style="color: #333333; font-size: 16px; line-height: 1.5;">You can now navigate directly to your account dashboard profile view block to access your structural digital ticket stub properties.</p>
        <p style="color: #6B7280; font-size: 14px; margin-top: 30px;">Thank you for choosing Eventora!<br/>– The Event Engineering Team</p>
      </div>
    `;

        await transporter.sendMail({
            from: `"Eventora Support" <${process.env.EMAIL_USER}>`,
            to: toEmail,
            subject: subjectTitle,
            html: htmlLayout
        });

        console.log(`Ticket confirmation dispatch cycle completed successfully for target account: ${toEmail}`);
    } catch (error) {
        console.error('Nodemailer document summary notification fault:', error);
        throw new Error('Failed to dispatch transactional booking success receipt email.');
    }
};