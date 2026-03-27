import Notification from '../modules/notification/notification.model.js';
import AuditLoggerService from '../modules/audit/audit.service.js';
import { getIO } from './socket.util.js';
import logger from './logger.util.js';

/**
 * Create notifications for multiple users and emit real-time events
 * @param {Array<string>} userIds - Array of user IDs or single ID
 * @param {Object} data - Notification data (title, message, type, electionId)
 */
export const createNotification = async (userIds, data) => {
    try {
        const ids = Array.isArray(userIds) ? userIds : [userIds];

        if (ids.length === 0) return;

        const notifications = ids.map(userId => ({
            userId,
            ...data
        }));

        const savedNotifications = await Notification.insertMany(notifications);

        const io = getIO();

        savedNotifications.forEach(notification => {
            io.to(notification.userId.toString()).emit('newNotification', {
                _id: notification._id,
                title: notification.title,
                message: notification.message,
                type: notification.type,
                electionId: notification.electionId,
                isRead: notification.isRead,
                createdAt: notification.createdAt
            });
        });


        // Audit Logging
        await AuditLoggerService.createLog({
            actionType: 'SYSTEM_NOTIFICATION',
            message: `System sent notification: "${data.title}" to ${ids.length} users`,
            status: 'SUCCESS',
            details: { ...data, userCount: ids.length }
        });

        logger.info(`Notifications created and emitted for ${ids.length} users`);
    } catch (error) {
        logger.error('Create Notification Error', error);
    }
};
/**
 * Send a notification to all admin users
 * @param {Object} data - Notification data
 */
export const notifyAdmins = async (data) => {
    try {
        const User = (await import('../modules/auth/auth.model.js')).default;
        const admins = await User.find({ role: 'admin' }).select('_id');
        const adminIds = admins.map(admin => admin._id);

        if (adminIds.length > 0) {
            await createNotification(adminIds, data);
        }
    } catch (error) {
        logger.error('Notify Admins Error', error);
    }
};
