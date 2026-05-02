import { Resend } from 'resend';
import { RESEND_API_KEY, FRONTEND_URL, DEVELOPER_DOMAIN } from '../core/settings.js';
import { getLogger } from "../observability/logger.js";

const logger = getLogger("email.js");

const resend = new Resend(RESEND_API_KEY);

async function sendVerificationEmail(user_registration_email, token) {
    const verificationUrl = `${FRONTEND_URL}/auth/verify-email?token=${token}`;
    try {
        logger.info({ registered_email: user_registration_email, sent_to: user_registration_email }, "Verification email redirected to developer inbox")
        const response = await resend.emails.send({
            from: `Plant Shopping <onboarding@${DEVELOPER_DOMAIN}>`,
            to: user_registration_email,
            subject: "Verify your email",
            html: `
        <div style="font-family: Arial, sans-serif; background:#f4f4f4; padding:40px">
            <div style="max-width:500px;margin:auto;background:white;padding:30px;border-radius:8px;text-align:center">
                
                <h2 style="color:#333">Verify Your Email</h2>

                <p style="color:#555">
                Thank you for registering. Please verify your email to activate your account.
                </p>

                <a href="${verificationUrl}"
                style="
                display:inline-block;
                margin-top:20px;
                padding:12px 25px;
                background:#4CAF50;
                color:white;
                text-decoration:none;
                border-radius:5px;
                font-weight:bold;
                ">
                Verify Email
                </a>

                <p style="margin-top:30px;color:#888;font-size:12px">
                If you did not create this account, you can ignore this email.
                </p>

            </div>
        </div>
      `
        });
        console.log("RESEND RAW RESPONSE:", response);
        logger.info({ user_registration_email, response }, "Verification email sent");
    } catch (err) {
        logger.error("Email send error:", err);
        throw err;
    }
};

export { sendVerificationEmail };