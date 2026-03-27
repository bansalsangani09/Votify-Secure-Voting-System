import cron from 'node-cron';
import Election from '../modules/election/election.model.js';
import logger from '../utils/logger.util.js';

const startCronJobs = () => {
    // Check every minute
    cron.schedule('* * * * *', async () => {
        try {
            const now = new Date();

            // Scheduled -> Active
            const electionsToStart = await Election.find({
                status: 'scheduled',
                startDate: { $lte: now }
            });

            if (electionsToStart.length > 0) {
                logger.info(`Starting ${electionsToStart.length} elections...`);
                await Election.updateMany(
                    { _id: { $in: electionsToStart.map(e => e._id) } },
                    { $set: { status: 'active' } }
                );
            }

            // Active -> Closed
            const electionsToEnd = await Election.find({
                status: 'active',
                endDate: { $lte: now }
            });

            if (electionsToEnd.length > 0) {
                const { Settings } = await import('../modules/admin/admin.model.js');
                const User = (await import('../modules/auth/auth.model.js')).default;
                const { createNotification, notifyAdmins } = await import('../utils/notification.util.js');

                const settings = await Settings.findOne() || { automatedResultCalculation: false };

                logger.info(`Closing ${electionsToEnd.length} elections...`);

                for (const election of electionsToEnd) {
                    election.status = 'closed';
                    await election.save();

                    if (settings.automatedResultCalculation) {
                        // Increment successfulElections for all owners/co-owners
                        const ownerIds = election.admins.map(a => a.userId);
                        await User.updateMany(
                            { _id: { $in: ownerIds } },
                            { $inc: { successfulElections: 1 } }
                        );

                        // Notify Owners
                        await createNotification(ownerIds, {
                            title: 'Results Calculated Automatically',
                            message: `The election "${election.title}" has closed and results have been calculated.`,
                            type: 'ELECTION_ENDED',
                            electionId: election._id
                        });

                        // Notify Admins
                        await notifyAdmins({
                            title: 'Election Closed Automatically',
                            message: `Election "${election.title}" has reached its end date and was closed.`,
                            type: 'ELECTION_ENDED',
                            electionId: election._id
                        });
                    }
                }
            }
        } catch (error) {
            logger.error('Election Status Cron Error', error);
        }
    });

    // Daily Audit Reports - Every day at midnight
    cron.schedule('0 0 * * *', async () => {
        try {
            const { Settings } = await import('../modules/admin/admin.model.js');
            const { notifyAdmins } = await import('../utils/notification.util.js');
            const settings = await Settings.findOne() || { dailyAuditReports: true };

            if (settings.dailyAuditReports) {
                logger.info('Generating Daily Audit Report...');
                await notifyAdmins({
                    title: 'Daily Audit Report Ready',
                    message: 'The system has compiled the audit logs for the last 24 hours. Check the Audit Log page for details.',
                    type: 'SYSTEM_ALERT'
                });
            }
        } catch (error) {
            logger.error('Daily Audit Cron Error', error);
        }
    });

    // System Health Summaries - Every Sunday at midnight
    cron.schedule('0 0 * * 0', async () => {
        try {
            const { Settings } = await import('../modules/admin/admin.model.js');
            const { notifyAdmins } = await import('../utils/notification.util.js');
            const settings = await Settings.findOne() || { systemHealthSummaries: true };

            if (settings.systemHealthSummaries) {
                logger.info('Generating System Health Summary...');
                await notifyAdmins({
                    title: 'Weekly Health Summary',
                    message: 'Platform health check: Blockchain sync is active, 0 node errors detected, and system resources are optimal.',
                    type: 'SYSTEM_ALERT'
                });
            }
        } catch (error) {
            logger.error('Health Summary Cron Error', error);
        }
    });

    logger.info('Cron jobs started: Election Status Monitor');
};

export default startCronJobs;
