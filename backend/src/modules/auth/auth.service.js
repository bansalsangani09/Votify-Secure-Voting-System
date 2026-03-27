import User from './auth.model.js';
import bcrypt from 'bcryptjs';
import magiclinkService from './magiclink.service.js';
import { generateAccessToken } from '../../utils/jwt.util.js';
import MagicLinkToken from './token.model.js';
import { Settings } from '../admin/admin.model.js';
import { OAuth2Client } from 'google-auth-library';
import axios from 'axios';
import { generateAvatar } from '../../utils/user.util.js';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Handle initial login request (email/password).
 */
export const login = async (email, password, ipAddress, userAgent) => {
    const user = await User.findOne({ email });

    if (!user) {
        console.log(`[Login] User not found: ${email}`);
        return { success: false, message: 'Invalid credentials' };
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
        console.log(`[Login] Password mismatch for: ${email}`);
        return { success: false, message: 'Invalid credentials' };
    }

    // Role-based 2FA (Magic Link) Logic
    if (user.role === 'admin') {
        const settings = await Settings.findOne() || { twoFactorAuthentication: true };

        // If 2FA is OFF for admin, login directly
        if (!settings.twoFactorAuthentication) {
            user.lastLogin = new Date();
            user.lastActive = new Date();
            await user.save();

            const token = generateAccessToken(user);
            return {
                success: true,
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    ownerStatus: user.ownerStatus,
                    successfulElections: user.successfulElections,
                    createdAt: user.createdAt,
                    lastLogin: user.lastLogin
                },
                token,
                message: "Admin login successful"
            };
        }
    }

    // Generate magic link (Always for normal users, or for admins if 2FA is ON)
    await magiclinkService.generateAndSendToken(user, ipAddress, userAgent);

    return {
        success: true,
        message: "Magic login link sent to your email."
    };
};

export const register = async (userData) => {
    const { name, email, password } = userData;

    // 1. Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return { success: false, message: 'User with this email already exists' };
    }

    // 2. Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 3. Create user
    const user = await User.create({
        name,
        email,
        passwordHash,
        photoUrl: generateAvatar(name),
        role: 'user' // Default to voter
    });

    // 4. Generate JWT
    const token = generateAccessToken(user);

    return {
        success: true,
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            ownerStatus: user.ownerStatus,
            successfulElections: user.successfulElections,
            createdAt: user.createdAt
        },
        token
    };
};

export const verifyLogin = async (rawToken) => {
    const tokenDoc = await magiclinkService.verifyToken(rawToken);

    if (!tokenDoc) {
        return { success: false, message: 'This login link is invalid or expired.' };
    }

    const user = await User.findById(tokenDoc.userId);
    if (!user) {
        return { success: false, message: 'User not found' };
    }

    // Generate JWT
    const accessToken = generateAccessToken(user);

    // Delete token after use
    await MagicLinkToken.deleteOne({ _id: tokenDoc._id });

    // Update last login
    user.lastLogin = new Date();
    user.lastActive = new Date();
    await user.save();

    return {
        success: true,
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            ownerStatus: user.ownerStatus,
            successfulElections: user.successfulElections,
            createdAt: user.createdAt,
            lastLogin: user.lastLogin,
            lastActive: user.lastActive
        },
        token: accessToken
    };
};

/**
 * Handle Forgot Password request.
 */
export const forgotPassword = async (email) => {
    const user = await User.findOne({ email });

    if (!user) {
        // For security, don't reveal if user exists. 
        // But for a voting app, generic "If account exists, email sent" is standard.
        return { success: true, message: "If an account with that email exists, a password reset link has been sent." };
    }

    // Reuse MagicLinkToken for password reset as well
    // 1. Delete old tokens for this user
    await MagicLinkToken.deleteMany({ userId: user._id });

    // 2. Generate raw token (generic utility in magiclinkService usually handles this, but we'll do it via magiclinkService logic pattern)
    const rawToken = (await import('../../utils/crypto.util.js')).generateRandomToken();
    const tokenHash = (await import('../../utils/crypto.util.js')).hashToken(rawToken);

    // 3. Save to DB
    await MagicLinkToken.create({
        userId: user._id,
        tokenHash,
        expiresAt: new Date(Date.now() + 3600000), // 1 hour for password reset
    });

    // 4. Send Email
    const resetUrl = `${process.env.APP_URL}/reset-password/${rawToken}`;
    const message = `You requested a password reset for your Votify account.\nClick the link below to set a new password:\n\n${resetUrl}\n\nNote: This link is valid for 1 hour. If you did not request this, please ignore this email.`;
    const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto;">
        <h2 style="color: #333 text-align: center;">Reset Your Password</h2>
        <p style="font-size: 16px; color: #555;">
            We received a request to reset the password for your Votify account. Click the button below to proceed:
        </p>
        <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #4f46e5; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
                Reset Password
            </a>
        </div>
        <p style="font-size: 14px; color: #777;">
            If you did not request this, you can safely ignore this email.
        </p>
    </div>
    `;

    await (await import('../../config/mail.js')).default({
        email: user.email,
        subject: 'Password Reset Request',
        message,
        html
    });

    return { success: true, message: "If an account with that email exists, a password reset link has been sent." };
};

/**
 * Handle Reset Password logic.
 */
export const resetPassword = async (token, newPassword) => {
    const tokenHash = (await import('../../utils/crypto.util.js')).hashToken(token);

    const tokenDoc = await MagicLinkToken.findOne({
        tokenHash,
        expiresAt: { $gt: new Date() }
    });

    if (!tokenDoc) {
        return { success: false, message: "Invalid or expired reset token." };
    }

    const user = await User.findById(tokenDoc.userId);
    if (!user) {
        return { success: false, message: "User no longer exists." };
    }

    // Update password
    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);

    // Ensure 'local' is in authProviders if not already
    if (!user.authProviders.includes('local')) {
        user.authProviders.push('local');
    }

    await user.save();

    // Delete token after use
    await MagicLinkToken.deleteOne({ _id: tokenDoc._id });

    return { success: true, message: "Password reset successful. You can now login." };
};

/**
 * Handle Google Login.
 */
export const googleLogin = async (token) => {
    try {
        let payload;

        try {
            // Verify Google ID Token
            const ticket = await googleClient.verifyIdToken({
                idToken: token,
                audience: process.env.GOOGLE_CLIENT_ID
            });

            payload = ticket.getPayload();
            if (payload.iss !== "https://accounts.google.com") {
                throw new Error("Invalid token issuer");
            }
        } catch (error) {
            // If token is access token
            const { data } = await axios.get(
                "https://www.googleapis.com/oauth2/v3/userinfo",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            payload = data;
        }

        const {
            sub: googleId,
            email,
            name,
            picture,
            email_verified
        } = payload;

        // Security check
        if (email_verified === false) {
            return {
                success: false,
                message: "Google email not verified"
            };
        }


        let user = await User.findOne({ email });

        if (!user) {
            user = await User.create({
                email,
                name,
                googleId,
                photoUrl: picture || generateAvatar(name),
                authProviders: ["google"],
                role: "user",
                lastLogin: new Date(),
                lastActive: new Date()
            });
        } else {
            if (!user.googleId) user.googleId = googleId;

            if (!user.authProviders.includes("google")) {
                user.authProviders.push("google");
            }

            user.lastLogin = new Date();
            user.lastActive = new Date();

            await user.save();
        }
        if (user && user.googleId && user.googleId !== googleId) {
            return { success: false, message: "Account conflict detected" }
        }
        const accessToken = generateAccessToken(user);

        return {
            success: true,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                photoUrl: user.photoUrl,
                ownerStatus: user.ownerStatus,
                successfulElections: user.successfulElections,
                createdAt: user.createdAt,
                lastLogin: user.lastLogin
            },
            token: accessToken,
            message: "Google login successful"
        };

    } catch (error) {
        console.error("[Google Login Error]", error);

        return {
            success: false,
            message: "Google authentication failed"
        };
    }
};

export default {
    login,
    register,
    verifyLogin,
    googleLogin,
    forgotPassword,
    resetPassword
};
