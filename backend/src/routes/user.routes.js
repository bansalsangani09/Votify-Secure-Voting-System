import express from 'express';
import { protect, admin } from '../middleware/auth.middleware.js';
import userController from '../modules/user/user.controller.js';
import upload from '../middleware/upload.middleware.js';

const router = express.Router();

// Admin Routes
router.get('/voters', protect, admin, userController.getVoters);
router.delete('/voters/:id', protect, admin, userController.removeVoter);

// User Profile & Settings Routes
router.get('/me', protect, userController.getMe);
router.put('/profile', protect, upload.single('avatar'), userController.updateProfile);
router.put('/password', protect, userController.changePassword);
router.put('/notifications', protect, userController.updateNotifications);
router.put('/notifications/election/:electionId', protect, userController.updateElectionNotification);

export default router;
