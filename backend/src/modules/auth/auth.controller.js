import authService from './auth.service.js';
import AuditLoggerService from '../audit/audit.service.js';
import logger from '../../utils/logger.util.js';
import { notifyAdmins } from '../../utils/notification.util.js';

/**
 * @desc    Request login magic link
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req, res, next) => {
    try {
        const { email, password, recaptchaToken } = req.body;

        if (!email || !password || !recaptchaToken) {
            return res.status(400).json({ success: false, message: 'Please provide email, password, and complete the CAPTCHA.' });
        }

        // Verify reCAPTCHA token
        try {
            const recaptchaVerifyResponse = await fetch("https://www.google.com/recaptcha/api/siteverify", {
                method: 'POST',
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({
                    secret: process.env.RECAPTCHA_SECRET,
                    response: recaptchaToken,
                }),
            });
            const recaptchaData = await recaptchaVerifyResponse.json();

            // verifyRecaptcha(recaptchaToken) call would be cleaner but keeping existing fetch for minimal impact
            if (!recaptchaData.success || recaptchaData.score < 0.4 || recaptchaData.action !== 'login') {
                logger.warn(`Login Security: CAPTCHA failed. Score: ${recaptchaData.score}, Action: ${recaptchaData.action}`);
                return res.status(400).json({ success: false, message: 'Security verification failed. Please try again.' });
            }
        } catch (captchaError) {
            logger.error('CAPTCHA Verification Error', captchaError);
            return res.status(500).json({ success: false, message: 'Error verifying security CAPTCHA.' });
        }

        const result = await authService.login(
            email,
            password,
            req.ip,
            req.headers['user-agent']
        );

        if (!result.success) {
            await AuditLoggerService.createLog({
                actionType: 'LOGIN_FAILED',
                message: `Failed login attempt for email: ${email}`,
                status: 'FAILED',
                details: { email, reason: result.message }
            }, req);
            return res.status(401).json({ success: false, message: result.message });
        }

        if (result.user) {
            await AuditLoggerService.createLog({
                actionType: 'USER_LOGIN',
                message: `User ${result.user.name} logged in successfully`,
                status: 'SUCCESS',
                actor: {
                    userId: result.user._id,
                    name: result.user.name,
                    role: result.user.role
                }
            }, req);
        } else {
            await AuditLoggerService.createLog({
                actionType: 'MAGIC_LINK_SENT',
                message: `Magic link sent to email: ${email}`,
                status: 'SUCCESS',
                details: { email }
            }, req);
        }

        res.status(200).json({
            success: true,
            message: result.message,
            user: result.user,
            token: result.token
        });
    } catch (error) {
        logger.error('Login Error', error);
        next(error);
    }
};

/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide all required fields' });
        }

        const result = await authService.register({ name, email, password });

        if (!result.success) {
            await AuditLoggerService.createLog({
                actionType: 'REGISTRATION_FAILED',
                message: `Failed registration attempt for email: ${email}`,
                status: 'FAILED',
                details: { email, reason: result.message }
            }, req);
            return res.status(400).json({ success: false, message: result.message });
        }

        await AuditLoggerService.createLog({
            actionType: 'USER_REGISTERED',
            message: `New user ${name} registered successfully`,
            status: 'SUCCESS',
            actor: {
                userId: result.user._id,
                name: result.user.name,
                role: result.user.role
            }
        }, req);

        // Notify Admins (if enabled)
        const { Settings } = await import('../admin/admin.model.js');
        const settings = await Settings.findOne() || { voterRegistrationUpdates: false };

        if (settings.voterRegistrationUpdates) {
            await notifyAdmins({
                title: 'New Voter Registered',
                message: `${name} (${email}) has joined the platform.`,
                type: 'USER_REGISTERED'
            });
        }

        res.status(201).json({
            success: true,
            user: result.user,
            token: result.token,
            message: 'Registration successful'
        });
    } catch (error) {
        logger.error('Registration Error', error);
        next(error);
    }
};

/**
 * @desc    Verify magic link token and issue JWT
 * @route   GET /api/auth/verify-login
 * @access  Public
 */
export const verifyLogin = async (req, res, next) => {
    try {
        const { token } = req.query;

        if (!token) {
            return res.status(400).json({ success: false, message: 'Invalid or missing token' });
        }

        const result = await authService.verifyLogin(token);

        if (!result.success) {
            // Consistent secure error message for all verification failures
            return res.status(401).json({ success: false, message: 'This login link is invalid or expired.' });
        }

        await AuditLoggerService.createLog({
            actionType: 'USER_LOGIN',
            message: `User ${result.user.name} logged in successfully via magic link`,
            status: 'SUCCESS',
            actor: {
                userId: result.user._id,
                name: result.user.name,
                role: result.user.role
            }
        }, req);

        res.status(200).json({
            success: true,
            user: result.user,
            token: result.token
        });
    } catch (error) {
        logger.error('Verify Login Error', error);
        next(error);
    }
};

/**
 * @desc    Google login
 * @route   POST /api/auth/google-login
 * @access  Public
 */
export const googleLogin = async (req, res, next) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ success: false, message: 'Google token is required' });
        }

        const result = await authService.googleLogin(token);

        if (!result.success) {
            await AuditLoggerService.createLog({
                actionType: 'LOGIN_FAILED',
                message: `Failed Google login attempt`,
                status: 'FAILED',
                details: { reason: result.message }
            }, req);
            return res.status(401).json({ success: false, message: result.message });
        }

        await AuditLoggerService.createLog({
            actionType: 'USER_LOGIN',
            message: `User ${result.user.name} logged in via Google successfully`,
            status: 'SUCCESS',
            actor: {
                userId: result.user._id,
                name: result.user.name,
                role: result.user.role
            },
            details: { method: 'google' }
        }, req);

        res.status(200).json({
            success: true,
            message: result.message,
            user: result.user,
            token: result.token
        });
    } catch (error) {
        logger.error('Google Login Error', error);
        next(error);
    }
};

/**
 * @desc    Handle forgot password request
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
export const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }

        const result = await authService.forgotPassword(email);

        res.status(200).json(result);
    } catch (error) {
        logger.error('Forgot Password Error', error);
        next(error);
    }
};

/**
 * @desc    Handle password reset
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
export const resetPassword = async (req, res, next) => {
    try {
        const { token, password } = req.body;
        if (!token || !password) {
            return res.status(400).json({ success: false, message: 'Token and password are required' });
        }

        const result = await authService.resetPassword(token, password);

        if (!result.success) {
            return res.status(400).json(result);
        }

        res.status(200).json(result);
    } catch (error) {
        logger.error('Reset Password Error', error);
        next(error);
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
