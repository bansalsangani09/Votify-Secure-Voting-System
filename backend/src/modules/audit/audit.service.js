import AuditLog from './audit.model.js';
import logger from '../../utils/logger.util.js';

class AuditLoggerService {
    /**
     * Create a new audit log entry
     * @param {Object} data - Log data (actionType, message, actor, electionId, status)
     * @param {Object} req - (Optional) Express request object for metadata extraction
     */
    static async createLog(data, req = null) {
        try {
            const logData = {
                actionType: data.actionType,
                message: data.message,
                status: data.status || 'SUCCESS',
                electionId: data.electionId,
                metadata: {}
            };

            // Extract actor information
            if (data.actor) {
                logData.actor = data.actor;
            } else if (req && req.user) {
                logData.actor = {
                    userId: req.user._id || req.user.id,
                    name: req.user.name,
                    role: req.user.role
                };
            }

            // Extract request metadata
            if (req) {
                logData.metadata.ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            }

            const log = new AuditLog(logData);
            await log.save();

            // Also log to the system terminal logger for visibility
            const logMsg = `[AUDIT] ${logData.actionType} - ${logData.message} (${logData.status})`;
            if (logData.status === 'FAILED') logger.error(logMsg);
            else if (logData.status === 'WARNING') logger.warn(logMsg);
            else logger.info(logMsg);

            return log;
        } catch (error) {
            // Silently fail to not interrupt main business flow, but log the error
            logger.error(`Failed to create audit log: ${error.message}`);
        }
    }

    /**
     * Get logs with filtering and pagination
     */
    static async getLogs(filters = {}, options = {}) {
        const { page = 1, limit = 50 } = options;
        const skip = (page - 1) * limit;

        const query = {};
        if (filters.actionType) query.actionType = filters.actionType;
        if (filters.role) query['actor.role'] = filters.role;
        if (filters.status) query.status = filters.status;
        if (filters.electionId) query.electionId = filters.electionId;

        if (filters.search) {
            query.$or = [
                { message: { $regex: filters.search, $options: 'i' } },
                { 'actor.name': { $regex: filters.search, $options: 'i' } }
            ];
        }

        if (filters.startDate || filters.endDate) {
            query.createdAt = {};
            if (filters.startDate) query.createdAt.$gte = new Date(filters.startDate);
            if (filters.endDate) query.createdAt.$lte = new Date(filters.endDate);
        }

        const logs = await AuditLog.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('electionId', 'title');

        const total = await AuditLog.countDocuments(query);

        return {
            logs,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        };
    }
}

export default AuditLoggerService;
