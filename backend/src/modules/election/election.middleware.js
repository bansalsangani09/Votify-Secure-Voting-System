import Election from '../election/election.model.js';
import logger from '../../utils/logger.util.js';

/**
 * Middleware to authorize election admins (owner or co-owner)
 */
export const authorizeElectionAdmin = async (req, res, next) => {
    try {
        const electionId = req.params.id || req.params.electionId;
        const election = await Election.findById(electionId);

        if (!election) {
            return res.status(404).json({ success: false, message: 'Election not found' });
        }

        if (req.user.role === 'admin') return next();

        const isElectionAdmin = election.admins.some(
            a => a.userId.toString() === req.user._id.toString()
        );

        if (!isElectionAdmin) {
            return res.status(403).json({ success: false, message: 'Not authorized as election admin' });
        }

        req.election = election; // Attach election to request for optimized controller usage
        next();
    } catch (error) {
        logger.error('Authorize Admin Error', error);
        next(error);
    }
};

/**
 * Middleware to authorize election owners only
 */
export const authorizeElectionOwner = async (req, res, next) => {
    try {
        const electionId = req.params.id || req.params.electionId;
        const election = await Election.findById(electionId);

        if (!election) {
            return res.status(404).json({ success: false, message: 'Election not found' });
        }

        if (req.user.role === 'admin') return next();

        const isOwner = election.admins.some(
            a => a.userId.toString() === req.user._id.toString() && a.role === 'owner'
        );

        if (!isOwner) {
            return res.status(403).json({ success: false, message: 'Only election owner allowed' });
        }

        req.election = election;
        next();
    } catch (error) {
        logger.error('Authorize Owner Error', error);
        next(error);
    }
};
