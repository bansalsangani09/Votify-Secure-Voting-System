import MagicLinkToken from './token.model.js';
import { generateRandomToken, hashToken } from '../../utils/crypto.util.js';
import sendEmail from '../../config/mail.js';
import { MAGIC_LINK_TOKEN_EXPIRE, APP_URL } from '../../config/env.js';

/**
 * Generate a magic link token, hash it, save to DB, and send email.
 */
export const generateAndSendToken = async (user, ipAddress, userAgent) => {
    // 1. Delete old tokens for this user
    await MagicLinkToken.deleteMany({ userId: user._id });

    // 2. Generate raw token
    const rawToken = generateRandomToken();

    // 3. Hash token
    const tokenHash = hashToken(rawToken);

    // 4. Save to DB
    await MagicLinkToken.create({
        userId: user._id,
        tokenHash,
        expiresAt: new Date(Date.now() + MAGIC_LINK_TOKEN_EXPIRE),
        ipAddress,
        userAgent
    });

    // 5. Send Email
    const verifyUrl = `${APP_URL}/auth/verify-login?token=${rawToken}`;
    const message = `Welcome back to Votify\nClick the secure link below to access your dashboard:\n\n${verifyUrl}\n\nNote: This temporary link is valid for 30 minutes. Please do not share this link with anyone.\n\nIf you did not request this, please ignore this email.`;
    const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto;">
    <h2 style="color: #333;">Welcome back to Votify</h2>
    <p style="font-size: 16px; color: #555;">
        Click the button below to securely access your dashboard:
    </p>

    <div style="text-align: center; margin: 30px 0;">
        <a href="${verifyUrl}"
           style="background-color: #4f46e5;
                  color: #ffffff;
                  padding: 14px 28px;
                  text-decoration: none;
                  border-radius: 8px;
                  font-weight: bold;
                  font-size: 16px;
                  display: inline-block;">
            Login to Votify
        </a>
    </div>

    <p style="font-size: 14px; color: #555;">
        Or copy and paste this link into your browser:
    </p>

    <p style="word-break: break-all; font-size: 13px; color: #1a73e8;">
        ${verifyUrl}
    </p>

    <hr style="margin: 25px 0;">

    <p style="font-size: 14px; color: #110f0fff;">
        This link is valid for 30 minutes. Do not share it with anyone.
    </p>
</div>
`;

    await sendEmail({
        email: user.email,
        subject: 'Temporary login link for your profile',
        message,
        html
    });
};

/**
 * Verify a raw magic link token.
 */
export const verifyToken = async (rawToken) => {
    const hashed = hashToken(rawToken);

    const tokenDoc = await MagicLinkToken.findOne({
        tokenHash: hashed,
        expiresAt: { $gt: new Date() }
    });

    return tokenDoc;
};

export default {
    generateAndSendToken,
    verifyToken
};
