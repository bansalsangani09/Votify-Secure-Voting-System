import { verifyAccessToken } from '../utils/jwt.util.js';
import User from '../modules/auth/auth.model.js';

export const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = verifyAccessToken(token);

            // Get user from the token
            req.user = await User.findById(decoded.id).select('-passwordHash');

            if (!req.user) {
                return res.status(401).json({ success: false, message: 'User not found' });
            }

            // Session Timeout Logic (Admin Only)
            if (req.user.role === 'admin') {
                const { Settings } = await import('../modules/admin/admin.model.js');
                const settings = await Settings.findOne() || { sessionTimeout: 30 };

                // Initialize lastActive if missing (Migration path)
                if (!req.user.lastActive) {
                    req.user.lastActive = new Date();
                    await req.user.save();
                    console.log(`[Auth] Initialized lastActive for user: ${req.user.email}`);
                }

                const lastActive = req.user.lastActive;
                const timeoutMs = (settings.sessionTimeout || 30) * 60 * 1000;

                if (Date.now() - new Date(lastActive).getTime() > timeoutMs) {
                    console.log(`[Auth] Session timed out for: ${req.user.email}. Last active: ${lastActive}, Timeout: ${settings.sessionTimeout}m`);
                    return res.status(401).json({ success: false, message: 'Session expired. Please login again.' });
                }

                // Update lastActive to keep session alive (only once per minute)
                const oneMinute = 60 * 1000;
                if (Date.now() - new Date(lastActive).getTime() > oneMinute) {
                    req.user.lastActive = new Date();
                    await req.user.save();
                }
            }

            return next();
        } catch (error) {
            console.error('[Auth Error]', error.message);
            return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }
};

export const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ success: false, message: 'Not authorized as an admin' });
    }
};

export default { protect, admin };
