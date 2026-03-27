import Election from './election.model.js';
import User from '../auth/auth.model.js';
import Vote from '../vote/vote.model.js';
import AuditLoggerService from '../audit/audit.service.js';
import crypto from 'crypto';
import logger from '../../utils/logger.util.js';
import { createNotification, notifyAdmins } from '../../utils/notification.util.js';

/**
 * @desc    Create a draft election
 * @route   POST /api/admin/election/draft
 * @access  Private/Admin
 */
export const createDraft = async (req, res, next) => {
    try {
        const { title, description, type, startDate, endDate, maxVotes, allowRevote, requireApproval } = req.body;

        if (!title || !startDate || !endDate) {
            return res.status(400).json({ success: false, message: 'Title, Start Date and End Date are required' });
        }

        const electionData = {
            title, description, type, startDate, endDate, maxVotes, allowRevote, requireApproval,
            status: 'draft',
            admins: [{ userId: req.user._id, role: 'owner' }]
        };

        if (type === 'private') {
            electionData.joinCode = crypto.randomBytes(3).toString('hex').toUpperCase();
        }

        const election = await Election.create(electionData);

        // Audit Logging
        await AuditLoggerService.createLog({
            actionType: 'ELECTION_DRAFT_CREATED',
            message: `Draft election "${title}" created by ${req.user.name}`,
            electionId: election._id,
            status: 'SUCCESS'
        }, req);

        res.status(201).json({ success: true, data: election });
    } catch (error) {
        logger.error('Create Draft Error', error);
        next(error);
    }
};

/**
 * @desc    Add candidate to election
 */
export const addCandidate = async (req, res, next) => {
    try {
        const { name, bio, position, email } = req.body;
        const election = await Election.findById(req.params.id);

        if (!election) return res.status(404).json({ success: false, message: 'Election not found' });

        const photoUrl = req.file ? `/uploads/${req.file.filename}` : req.body.photoUrl;
        const { partyName } = req.body;

        // 🛡️ PREVENT DUPLICATE CANDIDATES
        const isDuplicate = election.candidates.some(c =>
            c.name.toLowerCase() === name.toLowerCase() &&
            (c.partyName || "").toLowerCase() === (partyName || "").toLowerCase() &&
            (c.bio || "").toLowerCase() === (bio || "").toLowerCase()
        );

        if (isDuplicate) {
            return res.status(400).json({
                success: false,
                message: 'A candidate with the same name, party, and bio already exists in this election.'
            });
        }

        election.candidates.push({ name, bio, photoUrl, position, email, partyName: partyName || "" });

        await election.save();

        res.status(201).json({ success: true, data: election.candidates });
    } catch (error) {
        logger.error('Add Candidate Error', error);
        next(error);
    }
};

/**
 * @desc    Publish a draft election
 */
export const publishElection = async (req, res, next) => {
    try {
        const election = await Election.findById(req.params.id);
        if (!election) return res.status(404).json({ success: false, message: 'Election not found' });

        if (election.candidates.length < 2) {
            return res.status(400).json({ success: false, message: 'Election must have at least 2 candidates' });
        }

        election.status = 'active';
        await election.save();

        // Audit Logging
        await AuditLoggerService.createLog({
            actionType: 'ELECTION_PUBLISHED',
            message: `Election "${election.title}" published and activated`,
            electionId: election._id,
            status: 'SUCCESS'
        }, req);

        res.status(200).json({ success: true, message: 'Election published successfully' });
    } catch (error) {
        logger.error('Publish Election Error', error);
        next(error);
    }
};

/**
 * @desc    Update candidate details
 */
export const updateCandidate = async (req, res, next) => {
    try {
        const { id, candidateId } = req.params;
        const updates = req.body;
        const election = await Election.findById(id);

        if (!election) return res.status(404).json({ success: false, message: 'Election not found' });

        const candidate = election.candidates.id(candidateId);
        if (!candidate) return res.status(404).json({ success: false, message: 'Candidate not found' });

        if (updates.name) candidate.name = updates.name;
        if (updates.bio) candidate.bio = updates.bio;
        if (req.file) {
            candidate.photoUrl = `/uploads/${req.file.filename}`;
        } else if (updates.photoUrl) {
            candidate.photoUrl = updates.photoUrl;
        }
        if (updates.position) candidate.position = updates.position;
        if (updates.email) candidate.email = updates.email;


        await election.save();
        res.status(200).json({ success: true, data: election.candidates });
    } catch (error) {
        logger.error('Update Candidate Error', error);
        next(error);
    }
};

/**
 * @desc    Remove candidate from election
 */
export const removeCandidate = async (req, res, next) => {
    try {
        const { id, candidateId } = req.params;
        const election = await Election.findById(id);

        if (!election) return res.status(404).json({ success: false, message: 'Election not found' });

        election.candidates.pull(candidateId);
        await election.save();

        res.status(200).json({ success: true, data: election.candidates });
    } catch (error) {
        logger.error('Remove Candidate Error', error);
        next(error);
    }
};

/**
 * @desc    Update election status (active, paused, closed)
 */
export const updateStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const election = await Election.findById(req.params.id);

        if (!election) return res.status(404).json({ success: false, message: 'Election not found' });

        election.status = status;
        await election.save();

        // Notify participants
        const statusMap = {
            'active': { title: 'Election Started', type: 'ELECTION_STARTED' },
            'paused': { title: 'Election Paused', type: 'ELECTION_PAUSED' },
            'closed': { title: 'Election Ended', type: 'ELECTION_ENDED' }
        };

        const notificationData = statusMap[status];
        if (notificationData) {
            const payload = {
                ...notificationData,
                message: `Status of "${election.title}" is now ${status.toUpperCase()}`,
                electionId: election._id
            };
            await createNotification(election.participants, payload);
            await notifyAdmins(payload); // Also notify admins
        }

        // Audit Logging
        await AuditLoggerService.createLog({
            actionType: 'ELECTION_STATUS_CHANGED',
            message: `Election "${election.title}" status changed to ${status.toUpperCase()}`,
            electionId: election._id,
            status: 'SUCCESS',
            details: { newStatus: status }
        }, req);

        res.status(200).json({ success: true, message: `Election status updated to ${status}`, data: election });
    } catch (error) {
        logger.error('Update Status Error', error);
        next(error);
    }
};

/**
 * @desc    Permanently Delete an election (Admin Only)
 */
export const deleteElection = async (req, res, next) => {
    try {
        const electionId = req.params.id;
        const election = await Election.findById(electionId);
        if (!election) return res.status(404).json({ success: false, message: 'Election not found' });

        // 1. Remove election from User documents (joinedElections, votedElections, notifications)
        await User.updateMany(
            {},
            {
                $pull: {
                    joinedElections: electionId,
                    votedElections: electionId,
                    'settings.electionNotifications': { electionId: electionId }
                }
            }
        );

        // 2. Delete all associated Vote documents
        await Vote.deleteMany({ electionId: electionId });

        // 3. Delete the Election document itself
        await Election.findByIdAndDelete(electionId);

        // Audit Logging
        await AuditLoggerService.createLog({
            actionType: 'ELECTION_PERMANENTLY_DELETED',
            message: `Election "${election.title}" permanently deleted by Admin ${req.user.name}`,
            status: 'SUCCESS',
            details: { title: election.title }
        }, req);

        res.status(200).json({ success: true, message: 'Election permanently deleted and all associated data cleared' });
    } catch (error) {
        logger.error('Admin Delete Election Error', error);
        next(error);
    }
};

export default {
    createDraft,
    addCandidate,
    publishElection,
    updateCandidate,
    removeCandidate,
    updateStatus,
    deleteElection
};
