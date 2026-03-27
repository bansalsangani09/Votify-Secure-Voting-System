import express from 'express';
import authController from '../modules/auth/auth.controller.js';
import authRateLimiter from '../middleware/rateLimit.middleware.js';

const router = express.Router();

router.post('/login', authRateLimiter, authController.login);
router.post('/register', authRateLimiter, authController.register);
router.get('/verify-login', authRateLimiter, authController.verifyLogin);
router.post('/google-login', authRateLimiter, authController.googleLogin);
router.post('/forgot-password', authRateLimiter, authController.forgotPassword);
router.post('/reset-password', authRateLimiter, authController.resetPassword);

export default router;
