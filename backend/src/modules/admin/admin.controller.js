import AuditLog from '../audit/audit.model.js';
import { Settings } from './admin.model.js';
import Election from '../election/election.model.js';
import User from '../auth/auth.model.js';
import Vote from '../vote/vote.model.js';
import logger from '../../utils/logger.util.js';

/**
 * @desc    Get dashboard stats
 * @route   GET /api/admin/dashboard
 * @access  Private/Admin
 */
export const getDashboardStats = async (req, res, next) => {
    try {
        const totalElections = await Election.countDocuments();
        const activeElections = await Election.countDocuments({ status: 'active' });
        const totalVoters = await User.countDocuments({ role: 'user' });
        const totalVotes = await Vote.countDocuments();

        // Count unique owners
        const totalOwners = (await Election.distinct('admins.userId', {
            'admins.role': 'owner'
        })).length;

        const recentActivity = await AuditLog.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('actor.userId', 'name email');

        // Get vote history for the last 24 hours (grouped by hour) for the chart
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const voteHistory = await Vote.aggregate([
            { $match: { createdAt: { $gte: twentyFourHoursAgo } } },
            {
                $group: {
                    _id: { $hour: "$createdAt" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        // Format vote history for frontend (ensure all 24 hours are present)
        const currentHour = new Date().getHours();
        const chartData = Array.from({ length: 24 }, (_, i) => {
            const hour = (currentHour - 23 + i + 24) % 24;
            const hourData = voteHistory.find(v => v._id === hour);
            return hourData ? hourData.count : 0;
        });

        res.status(200).json({
            success: true,
            data: {
                stats: { totalElections, activeElections, totalVoters, totalVotes, totalOwners },
                recentActivity,
                chartData
            }
        });
    } catch (error) {
        logger.error('Dashboard Stats Error', error);
        next(error);
    }
};

/**
 * @desc    Get audit logs
 * @route   GET /api/admin/audit-logs
 * @access  Private/Admin
 */
export const getAuditLogs = async (req, res, next) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const logs = await AuditLog.find()
            .populate('actor.userId', 'name email')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await AuditLog.countDocuments();

        res.status(200).json({
            success: true,
            data: {
                logs,
                totalPages: Math.ceil(count / limit),
                currentPage: page,
                totalLogs: count
            }
        });
    } catch (error) {
        logger.error('Audit Logs Error', error);
        next(error);
    }
};

/**
 * @desc    Get system settings
 * @route   GET /api/admin/settings
 * @access  Private/Admin
 */
export const getSettings = async (req, res, next) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) settings = await Settings.create({});
        res.status(200).json({ success: true, data: settings });
    } catch (error) {
        logger.error('Get Settings Error', error);
        next(error);
    }
};

/**
 * @desc    Update system settings
 * @route   POST /api/admin/settings
 * @access  Private/Admin
 */
export const updateSettings = async (req, res, next) => {
    try {
        const settings = await Settings.findOneAndUpdate({}, req.body, { new: true, upsert: true });
        res.status(200).json({ success: true, data: settings });
    } catch (error) {
        logger.error('Update Settings Error', error);
        next(error);
    }
};

export const getElectionResults = async (req, res, next) => {
    try {
        const election = await Election.findById(req.params.id);
        if (!election) return res.status(404).json({ success: false, message: 'Election not found' });

        const totalVotes = await Vote.countDocuments({ electionId: req.params.id });
        const totalVoters = election.participants.length;

        // Aggregate actual votes from DB (by index)
        const voteAggregation = await Vote.aggregate([
            { $match: { electionId: election._id } },
            { $group: { _id: "$candidateId", count: { $sum: 1 } } }
        ]);

        const voteMap = voteAggregation.reduce((acc, curr) => {
            acc[curr._id] = curr.count;
            return acc;
        }, {});

        // Swing Data Calculation (Votes over time)
        const startTime = election.startDate || new Date(Date.now() - 24 * 60 * 60 * 1000);
        const votesOverTime = await Vote.aggregate([
            { $match: { electionId: election._id, createdAt: { $gte: startTime } } },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" },
                        day: { $dayOfMonth: "$createdAt" },
                        hour: { $hour: "$createdAt" }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1, "_id.hour": 1 } }
        ]);

        const swingData = votesOverTime.map(v => ({
            time: `${v._id.hour}:00`,
            votes: v.count
        }));

        const results = {
            title: election.title,
            status: election.status,
            position: election.position,
            votingType: election.votingType,
            resultDate: election.resultTime || election.endDate,
            blockchainIntegrated: election.blockchainIntegrated,
            candidates: election.candidates.map((c, index) => {
                // For Single Choice, use the aggregated count from Vote collection
                // For Ranked Voting or others, the voteCount in the model is more accurate (Borda points)
                const aggregatedVotes = voteMap[index] || 0;
                const modelVotes = c.voteCount || 0;

                return {
                    _id: c._id,
                    name: c.name,
                    partyName: c.partyName || 'Independent',
                    party: c.position || 'N/A',
                    bio: c.bio,
                    votes: election.votingType === 'Single Choice' ? (aggregatedVotes || modelVotes) : modelVotes
                };
            }),
            totalVotes,
            totalVoters,
            swingData
        };

        res.status(200).json({ success: true, data: { results } });
    } catch (error) {
        logger.error('Get Election Results Error', error);
        next(error);
    }
};

/**
 * @desc    Transfer ownership (Admin role) to another user
 * @route   POST /api/admin/transfer-ownership
 * @access  Private/Admin
 */
export const transferOwnership = async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ success: false, message: 'Target user email is required' });

        const targetUser = await User.findOne({ email });
        if (!targetUser) return res.status(404).json({ success: false, message: 'User not found with this email' });

        if (targetUser.role === 'admin') {
            return res.status(400).json({ success: false, message: 'User is already an admin' });
        }

        // Current user (must be the admin)
        const currentUser = await User.findById(req.user._id);

        // Perform the transfer
        targetUser.role = 'admin';
        currentUser.role = 'user'; // Demote current admin to user

        await targetUser.save();
        await currentUser.save();

        res.status(200).json({
            success: true,
            message: `Ownership successfully transferred to ${email}. You have been demoted to a regular user.`
        });
    } catch (error) {
        logger.error('Transfer Ownership Error', error);
        next(error);
    }
};

/**
 * @desc    Get all active elections for monitoring
 * @route   GET /api/admin/monitoring/active-elections
 * @access  Private/Admin
 */
export const getActiveMonitoringElections = async (req, res, next) => {
    try {
        const elections = await Election.find({ status: { $in: ['active', 'paused'] } })
            .select('title status liveResultsEnabled publicResultsVisible startDate endDate candidates participants')
            .sort({ createdAt: -1 });

        // Enrich with vote counts
        const enrichedElections = await Promise.all(elections.map(async (e) => {
            const totalVotes = await Vote.countDocuments({ electionId: e._id });
            const obj = e.toObject();

            // Map voteCount to votes for frontend consistency
            if (obj.candidates) {
                obj.candidates = obj.candidates.map(c => ({
                    ...c,
                    votes: c.voteCount || 0
                }));
            }

            obj.totalVotes = totalVotes;
            obj.turnout = e.participants.length > 0 ? (totalVotes / e.participants.length) * 100 : 0;
            return obj;
        }));

        res.status(200).json({ success: true, data: enrichedElections });
    } catch (error) {
        logger.error('Get Active Monitoring Elections Error', error);
        next(error);
    }
};

/**
 * @desc    Wipe system data (Votes, Audit Logs, Reset Election Counts)
 * @route   POST /api/admin/wipe-data
 * @access  Private/Admin
 */
export const wipeSystemData = async (req, res, next) => {
    try {
        logger.warn(`User ${req.user.name} initiated a SYSTEM WIPE`);

        // 1. Delete all votes
        await Vote.deleteMany({});

        // 2. Delete all audit logs
        await AuditLog.deleteMany({});

        // 3. Reset candidate vote counts in all elections
        const elections = await Election.find({});
        for (const election of elections) {
            election.candidates.forEach(c => {
                c.voteCount = 0;
            });
            await election.save();
        }

        // Log the wipe action itself (new log after deletion)
        await AuditLog.create({
            actionType: 'SYSTEM_WIPE',
            message: `System data wiped by ${req.user.name}`,
            actor: {
                userId: req.user._id,
                role: req.user.role
            },
            status: 'SUCCESS'
        });

        res.status(200).json({
            success: true,
            message: "System data (Votes, Audit Logs, and Election Counts) has been successfully wiped."
        });
    } catch (error) {
        logger.error('Wipe System Data Error', error);
        next(error);
    }
};

export default {
    getDashboardStats,
    getAuditLogs,
    getSettings,
    updateSettings,
    getElectionResults,
    getActiveMonitoringElections,
    transferOwnership,
    wipeSystemData
};
