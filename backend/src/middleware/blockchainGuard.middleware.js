import { getBlockchainStatus } from '../services/blockchainHealth.service.js';
import logger from '../utils/logger.util.js';

/**
 * Middleware to ensure blockchain is healthy before proceeding with write operations.
 */
export const blockchainGuard = async (req, res, next) => {
    const { isHealthy } = getBlockchainStatus();

    if (!isHealthy) {
        logger.warn(`Rejected ${req.method} ${req.originalUrl} due to blockchain unhealthiness`);
        return res.status(503).json({
            success: false,
            message: 'Blockchain services are currently unavailable. Please try again later.',
            error: 'Service Unavailable'
        });
    }

    next();
};

export default blockchainGuard;
