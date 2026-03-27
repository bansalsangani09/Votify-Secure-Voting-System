import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import notificationController from '../modules/notification/notification.controller.js';

const router = express.Router();

router.get('/', protect, notificationController.getNotifications);
router.get('/unread-count', protect, notificationController.getUnreadCount);
router.patch('/read-all', protect, notificationController.markAllRead);
router.patch('/:id/read', protect, notificationController.markRead);

export default router;
