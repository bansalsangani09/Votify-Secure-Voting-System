import User from '../auth/auth.model.js';
import Vote from '../vote/vote.model.js';
import Election from '../election/election.model.js';
import logger from '../../utils/logger.util.js';
import bcrypt from 'bcryptjs';
import { notifyAdmins } from '../../utils/notification.util.js';
import { generateAvatar } from '../../utils/user.util.js';
import { verifyRecaptcha } from '../../middleware/security.middleware.js';

/**
 * @desc    Get all voters with status (Admin)
 * @route   GET /api/users/voters
 * @access  Private/Admin
 */
export const getVoters = async (req, res, next) => {
    try {
        const { search, electionId, page = 1, limit = 10 } = req.query;
        let query = { role: 'user' };

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        // If electionId is provided, get the election to find all its participants
        if (electionId) {
            const election = await Election.findById(electionId).select('participants');
            if (election) {
                const participantIds = election.participants.map(p => p.userId);
                query._id = { $in: participantIds };
            } else {
                // If election not found, return empty
                query._id = { $in: [] };
            }
        }

        const voters = await User.find(query)
            .select('-passwordHash')
            .populate('joinedElections', 'title') // Populate election titles
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const count = await User.countDocuments(query);

        const votersWithStatus = await Promise.all(voters.map(async (voter) => {
            const voteQuery = { userId: voter._id };
            if (electionId) voteQuery.electionId = electionId;

            const vote = await Vote.findOne(voteQuery);
            return {
                ...voter.toObject(),
                electionStatus: vote ? 'Voted' : 'Not Voted',
                accountStatus: voter.status,
                lastActive: voter.updatedAt,
                ip: voter.ip || '127.0.0.1'
            };
        }));

        res.status(200).json({
            success: true,
            data: {
                voters: votersWithStatus,
                totalPages: Math.ceil(count / limit),
                currentPage: page,
                totalVoters: count
            }
        });
    } catch (error) {
        logger.error('Get Voters Error', error);
        next(error);
    }
};

/**
 * @desc    Get all unique owners of elections (Admin)
 * @route   GET /api/users/owners
 * @access  Private/Admin
 */
export const getOwners = async (req, res, next) => {
    try {
        const { status, search } = req.query;

        // 1. Identify all unique user IDs that are marked as 'owner' in any election
        const electionAdmins = await Election.distinct('admins.userId', {
            'admins.role': 'owner'
        });

        // 2. Build the query to fetch these users, excluding the current logged-in admin
        let query = {
            _id: { $in: electionAdmins, $ne: req.user._id }
        };

        if (status && status !== 'all') {
            query.ownerStatus = status;
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const owners = await User.find(query).select('name email ownerStatus successfulElections createdAt updatedAt photoUrl');

        const ownersWithStats = await Promise.all(owners.map(async (owner) => {
            const elections = await Election.find({ 'admins.userId': owner._id });
            const totalElections = elections.length;
            const activeElections = elections.filter(e => e.status === 'active').length;
            const successfulElections = elections.filter(e => e.status === 'closed').length;
            const unsuccessfulElections = elections.filter(e => e.status === 'paused').length;

            const sortedElections = elections.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            const lastActivity = sortedElections[0]?.createdAt || null;

            return {
                ...owner.toObject(),
                totalElections,
                activeElections,
                successfulElections,
                unsuccessfulElections,
                lastActivity,
                accountAge: Math.floor((new Date() - new Date(owner.createdAt)) / (1000 * 60 * 60 * 24)) // in days
            };
        }));

        res.status(200).json({ success: true, data: ownersWithStats });
    } catch (error) {
        logger.error('Get Owners Error', error);
        next(error);
    }
};

/**
 * @desc    Update owner status (Admin)
 * @route   PATCH /api/admin/owners/:id/status
 * @access  Private/Admin
 */
export const updateOwnerStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const { id } = req.params;

        if (!['new', 'verified', 'restricted', 'suspended'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const owner = await User.findById(id);
        if (!owner) {
            return res.status(404).json({ success: false, message: 'Owner not found' });
        }

        const previousStatus = owner.ownerStatus;
        owner.ownerStatus = status;

        // Log status change history
        owner.statusHistory.push({
            status: status,
            changedBy: req.user._id,
            timestamp: new Date(),
            previousStatus: previousStatus
        });

        await owner.save();

        res.status(200).json({ success: true, message: `Owner status updated to ${status}`, data: owner });
    } catch (error) {
        logger.error('Update Owner Status Error', error);
        next(error);
    }
};

/**
 * @desc    Get detailed owner profile (Admin)
 * @route   GET /api/admin/owners/:id/profile
 * @access  Private/Admin
 */
export const getOwnerProfile = async (req, res, next) => {
    try {
        const { id } = req.params;
        const owner = await User.findById(id).select('-passwordHash');

        if (!owner) {
            return res.status(404).json({ success: false, message: 'Owner not found' });
        }

        const elections = await Election.find({ 'admins.userId': owner._id });
        const totalElections = elections.length;
        const activeElections = elections.filter(e => e.status === 'active').length;
        const completedElections = elections.filter(e => e.status === 'closed').length;

        // Calculate total voters managed (sum of participants across all their elections)
        const totalVotersManaged = elections.reduce((sum, election) => sum + (election.participants?.length || 0), 0);

        // Find largest election
        const largestElection = elections.reduce((prev, current) => {
            return (prev.participants?.length || 0) > (current.participants?.length || 0) ? prev : current;
        }, { participants: [] });

        const lastElection = elections.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

        res.status(200).json({
            success: true,
            data: {
                ...owner.toObject(),
                stats: {
                    totalElections,
                    activeElections,
                    successfulElections: elections.filter(e => e.status === 'closed').length,
                    unsuccessfulElections: elections.filter(e => e.status === 'paused').length,
                    totalVotersManaged,
                    largestElectionSize: largestElection.participants?.length || 0,
                    lastElectionDate: lastElection?.createdAt || null
                }
            }
        });
    } catch (error) {
        logger.error('Get Owner Profile Error', error);
        next(error);
    }
};

/**
 * @desc    Remove a voter (Admin)
 * @route   DELETE /api/users/voters/:id
 * @access  Private/Admin
 */
export const removeVoter = async (req, res, next) => {
    try {
        const voter = await User.findById(req.params.id);
        if (!voter) return res.status(404).json({ success: false, message: 'Voter not found' });

        await User.findByIdAndDelete(req.params.id);

        res.status(200).json({ success: true, message: 'Voter removed successfully' });
    } catch (error) {
        logger.error('Remove Voter Error', error);
        next(error);
    }
};

/**
 * @desc    Remove an owner (Admin)
 * @route   DELETE /api/admin/owners/:id
 * @access  Private/Admin
 */
export const deleteOwner = async (req, res, next) => {
    try {
        const owner = await User.findById(req.params.id);
        if (!owner) return res.status(404).json({ success: false, message: 'Owner not found' });

        // Remove the user
        await User.findByIdAndDelete(req.params.id);

        res.status(200).json({ success: true, message: 'Owner removed successfully' });
    } catch (error) {
        logger.error('Delete Owner Error', error);
        next(error);
    }
};

/**
 * @desc    Create a new voter (Admin)
 * @route   POST /api/users/voters
 * @access  Private/Admin
 */
export const createVoter = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide name, email and password' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const voter = await User.create({
            name,
            email,
            passwordHash,
            photoUrl: generateAvatar(name),
            role: 'user',
            isVerified: true // Admin-added users are verified by default
        });

        res.status(201).json({
            success: true,
            data: {
                _id: voter._id,
                name: voter.name,
                email: voter.email,
                role: voter.role,
                isVerified: voter.isVerified
            }
        });
    } catch (error) {
        logger.error('Create Voter Error', error);
        next(error);
    }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
export const updateProfile = async (req, res, next) => {
    try {
        const { name, email, publicProfile } = req.body;
        const user = await User.findById(req.user._id);

        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        if (name) user.name = name;
        if (email) {
            const emailExists = await User.findOne({ email, _id: { $ne: req.user._id } });
            if (emailExists) return res.status(400).json({ success: false, message: 'Email already in use' });
            user.email = email;
        }
        if (publicProfile !== undefined) user.publicProfile = publicProfile;

        if (req.file) {
            user.photoUrl = `/uploads/${req.file.filename}`;
        }

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                photoUrl: user.photoUrl,
                publicProfile: user.publicProfile
            }
        });
    } catch (error) {
        logger.error('Update Profile Error', error);
        next(error);
    }
};

/**
 * @desc    Change user password
 * @route   PUT /api/users/password
 * @access  Private
 */
export const changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword, captchaToken } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: 'Please provide current and new passwords' });
        }

        // reCAPTCHA verification
        const recaptchaResult = await verifyRecaptcha(captchaToken);
        if (!recaptchaResult.success || recaptchaResult.score < 0.5 || recaptchaResult.action !== "reset_password") {
            logger.warn(`Password Security: CAPTCHA failed for user ${req.user._id}. Score: ${recaptchaResult.score}, Action: ${recaptchaResult.action}`);
            return res.status(403).json({
                success: false,
                message: 'Security verification failed. Please try again.'
            });
        }

        const user = await User.findById(req.user._id);
        const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);

        if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid current password' });

        const salt = await bcrypt.genSalt(10);
        user.passwordHash = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.status(200).json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
        logger.error('Change Password Error', error);
        next(error);
    }
};

/**
 * @desc    Update notification settings
 * @route   PUT /api/users/notifications
 * @access  Private
 */
export const updateNotifications = async (req, res, next) => {
    try {
        const { notifyNewElections, notifyResultsReady, notifyVoteConfirmations } = req.body;
        const user = await User.findById(req.user._id);

        if (notifyNewElections !== undefined) user.settings.notifyNewElections = notifyNewElections;
        if (notifyResultsReady !== undefined) user.settings.notifyResultsReady = notifyResultsReady;
        if (notifyVoteConfirmations !== undefined) user.settings.notifyVoteConfirmations = notifyVoteConfirmations;

        await user.save();
        res.status(200).json({ success: true, message: 'Notification settings updated', settings: user.settings });
    } catch (error) {
        logger.error('Update Notifications Error', error);
        next(error);
    }
};

/**
 * @desc    Update election-specific notification settings
 * @route   PUT /api/users/notifications/election/:electionId
 * @access  Private
 */
export const updateElectionNotification = async (req, res, next) => {
    try {
        const { electionId } = req.params;
        const { enabled } = req.body;
        const user = await User.findById(req.user._id);

        const index = user.settings.electionNotifications.findIndex(n => n.electionId.toString() === electionId);

        if (index > -1) {
            user.settings.electionNotifications[index].enabled = enabled;
        } else {
            user.settings.electionNotifications.push({ electionId, enabled });
        }

        await user.save();
        res.status(200).json({ success: true, message: 'Election notification updated', settings: user.settings });
    } catch (error) {
        logger.error('Update Election Notification Error', error);
        next(error);
    }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/users/me
 * @access  Private
 */
export const getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).select('-passwordHash');
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        res.status(200).json({ success: true, data: user });
    } catch (error) {
        logger.error('Get Me Error', error);
        next(error);
    }
};

/**
 * @desc    Get detailed voter profile (Admin)
 * @route   GET /api/admin/voters/:id/profile
 * @access  Private/Admin
 */
export const getVoterProfile = async (req, res, next) => {
    try {
        const { id } = req.params;
        const voter = await User.findById(id).select('-passwordHash');

        if (!voter) {
            return res.status(404).json({ success: false, message: 'Voter not found' });
        }

        // Stats calculation
        const accountAge = Math.floor((new Date() - new Date(voter.createdAt)) / (1000 * 60 * 60 * 24));

        const assignments = await Election.find({ participants: id });
        const totalElectionsAssigned = assignments.length;

        const votes = await Vote.find({ userId: id });
        const electionsVotedCount = votes.length;

        const votedElectionsList = await Promise.all(votes.map(async (v) => {
            const electron = await Election.findById(v.electionId).select('title');
            return {
                electionId: v.electionId,
                title: electron?.title || 'Unknown Election',
                votedAt: v.createdAt
            };
        }));

        const pendingElections = assignments.filter(a => !votes.some(v => v.electionId.toString() === a._id.toString()));

        res.status(200).json({
            success: true,
            data: {
                ...voter.toObject(),
                stats: {
                    accountAge,
                    totalElectionsAssigned,
                    electionsVotedCount,
                    electionsPendingCount: pendingElections.length,
                    votedElectionsList,
                    pendingElections: pendingElections.map(e => ({ electionId: e._id, title: e.title }))
                }
            }
        });
    } catch (error) {
        logger.error('Get Voter Profile Error', error);
        next(error);
    }
};

/**
 * @desc    Update voter status (Admin)
 * @route   PATCH /api/admin/voters/:id/status
 * @access  Private/Admin
 */
export const updateVoterStatus = async (req, res, next) => {
    try {
        const { status, electionId } = req.body;
        const { id } = req.params;

        if (!['Active', 'Inactive', 'Suspended'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const voter = await User.findById(id);
        if (!voter) {
            return res.status(404).json({ success: false, message: 'Voter not found' });
        }

        const previousStatus = voter.status;
        voter.status = status;
        voter.statusChangedAt = new Date();

        if (status === 'Suspended') {
            voter.suspendedAt = new Date();
            if (electionId && !voter.suspendedElections.includes(electionId)) {
                voter.suspendedElections.push(electionId);
            }
        }

        if (status === 'Inactive') {
            voter.inactiveAt = new Date();
        }

        if (status === 'Active') {
            if (electionId) {
                // If moving to Active for a specific election, just remove from suspension list
                voter.suspendedElections = voter.suspendedElections.filter(eid => eid.toString() !== electionId.toString());
                // If no more suspensions, we can potentially keep global status as Active
            } else {
                // Global active clears all suspensions
                voter.suspendedElections = [];
            }
        }

        // Log status change history
        voter.statusHistory.push({
            status: status,
            changedBy: req.user._id,
            timestamp: new Date(),
            previousStatus: previousStatus,
            electionId: electionId // Store which election caused this if applicable
        });

        await voter.save();

        // Notify Admins
        await notifyAdmins({
            title: 'Voter Status Updated',
            message: `Status of voter ${voter.name} changed from ${previousStatus} to ${status}${electionId ? ' for a specific election' : ''}.`,
            type: 'USER_STATUS_UPDATED',
            electionId: electionId
        });

        res.status(200).json({ success: true, message: `Voter status updated to ${status}`, data: voter });
    } catch (error) {
        logger.error('Update Voter Status Error', error);
        next(error);
    }
};

/**
 * @desc    Remove voter from a specific election (Admin)
 * @route   POST /api/admin/voters/:id/remove-from-election
 * @access  Private/Admin
 */
export const removeFromElection = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { electionId } = req.body;

        if (!electionId) {
            return res.status(400).json({ success: false, message: 'Election ID is required' });
        }

        const election = await Election.findById(electionId);
        if (!election) {
            return res.status(404).json({ success: false, message: 'Election not found' });
        }

        // Remove from election participants
        election.participants = election.participants.filter(p => p.toString() !== id);
        await election.save();

        res.status(200).json({ success: true, message: 'Voter removed from election successfully' });
    } catch (error) {
        logger.error('Remove Voter From Election Error', error);
        next(error);
    }
};

export default {
    getVoters,
    getOwners,
    removeVoter,
    createVoter,
    getMe,
    updateProfile,
    changePassword,
    updateOwnerStatus,
    getOwnerProfile,
    deleteOwner,
    updateNotifications,
    updateElectionNotification,
    getVoterProfile,
    updateVoterStatus,
    removeFromElection
};
