import AuditLoggerService from './audit.service.js';

const getLogs = async (req, res) => {
    try {
        const {
            actionType,
            role,
            status,
            electionId,
            search,
            startDate,
            endDate,
            page = 1,
            limit = 50
        } = req.query;

        const filters = {
            actionType,
            role,
            status,
            electionId,
            search,
            startDate,
            endDate
        };

        const result = await AuditLoggerService.getLogs(filters, { page: parseInt(page), limit: parseInt(limit) });

        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export default {
    getLogs
};
