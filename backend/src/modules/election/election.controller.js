import Election from './election.model.js';
import User from '../auth/auth.model.js';
import AuditLoggerService from '../audit/audit.service.js';
import Vote from '../vote/vote.model.js';
import mongoose from 'mongoose';
import { createElectionOnChain } from '../../services/blockchainService.js';
import generateInviteCode from '../../utils/generateInviteCode.js';
import logger from '../../utils/logger.util.js';
import { createNotification } from '../../utils/notification.util.js';
import { hasUserVotedOnChain, findVoteEventsOnChain } from "../../services/blockchainService.js";
import sendEmail from '../../config/mail.js';

/**
 * @desc    Create a new election (Admin only)
 * @route   POST /api/elections
 * @access  Private/Admin
 */
export const createElection = async (req, res, next) => {
    const {
        title,
        description,
        category,
        candidates,
        startDate,
        startTime,
        endDate,
        endTime,
        votingType,
        maxVotes,
        anonymous,
        autoActivate,
        autoClose,
        allowLiveResults,
        liveResultsEnabled,
        publicResultsVisible,
        resultTime
    } = req.body;

    // Admin cannot create elections
    if (req.user.role === 'admin') {
        return res.status(403).json({ success: false, message: 'Admins are not allowed to create elections' });
    }

    if (!title || !startDate || !startTime || !endDate || !endTime || !candidates || candidates.length < 2) {
        return res.status(400).json({ success: false, message: 'Please provide all required details' });
    }

    // 🛡️ MAX VOTES VALIDATION
    if (votingType === 'Multiple Choice' && maxVotes > candidates.length) {
        return res.status(400).json({
            success: false,
            message: `Maximum selections allowed (${maxVotes}) cannot exceed the number of candidates (${candidates.length})`
        });
    }

    try {
        const joinCode = generateInviteCode();

        const fullStart = new Date(`${startDate}T${startTime}`);
        const fullEnd = new Date(`${endDate}T${endTime}`);
        const now = new Date();

        // 🕒 DETERMINISTIC STATUS
        const initialStatus = fullStart > now ? 'scheduled' : 'active';

        const unixStart = Math.floor(fullStart.getTime() / 1000);
        const unixEnd = Math.floor(fullEnd.getTime() / 1000);

        const candidateNames = candidates.map(c => c.name);

        const bcResult = await createElectionOnChain(
            title,
            description || '',
            unixStart - 600, // 🏁 Apply a 10-minute buffer (600s) to robustly ensure the election is "started" on-chain
            unixEnd,
            joinCode,
            candidateNames
        );

        if (!bcResult.blockchainId) {
            throw new Error('Blockchain transaction successful but failed to retrieve election ID from logs.');
        }

        const election = await Election.create({
            title,
            description,
            category,
            joinCode,
            candidates,
            startDate: fullStart,
            endDate: fullEnd,
            startTime,
            endTime,
            votingType,
            maxVotes,
            anonymous,
            autoActivate,
            autoClose,
            allowLiveResults,
            liveResultsEnabled: liveResultsEnabled || allowLiveResults,
            publicResultsVisible: publicResultsVisible || false,
            resultTime: resultTime ? new Date(resultTime) : null,
            status: initialStatus,
            admins: [{ userId: req.user._id, role: 'owner' }],
            blockchainId: bcResult.blockchainId,
            contractAddress: bcResult.txHash,
            blockchainIntegrated: true
        });

        // Audit Logging
        await AuditLoggerService.createLog({
            actionType: 'ELECTION_CREATED',
            message: `Election "${title}" created and secured on blockchain`,
            electionId: election._id,
            status: 'SUCCESS',
            details: { title, blockchainId: bcResult.blockchainId }
        }, req);

        // Notify Creator
        await createNotification(req.user._id, {
            title: 'Election Created',
            message: `Your election "${title}" has been successfully created and secured on the blockchain.`,
            type: 'ELECTION_JOINED', // Reuse ELECTION_JOINED or add ELECTION_CREATED to enum
            electionId: election._id
        });

        res.status(201).json({
            success: true,
            election,
            blockchain: {
                txHash: bcResult.txHash,
                blockchainId: bcResult.blockchainId
            }
        });

    } catch (error) {
        logger.error('Create Election Error', error);
        next(error);
    }
};

/**
 * @desc    Join an election by code
 * @route   POST /api/elections/join
 * @access  Private
 */
export const joinElection = async (req, res, next) => {
    const { joinCode } = req.body;
    const userId = req.user._id;

    try {
        const election = await Election.findOne({ joinCode });
        if (!election) {
            return res.status(404).json({ success: false, message: 'Invalid Join Code' });
        }

        // 🛡️ BLOCK OWNERS FROM JOINING OWN ELECTION
        const isOwner = election.admins.some(a => a.userId.toString() === userId.toString());
        if (isOwner) {
            return res.status(400).json({
                success: false,
                message: 'Election owners and co-owners cannot join their own election as voters.'
            });
        }

        if (election.status === 'closed') {
            return res.status(400).json({ success: false, message: 'Election is closed' });
        }

        const user = await User.findById(userId);

        // Use robust find logic to handle legacy data
        const existingParticipant = election.participants.find(p =>
            (p.userId?.toString() === userId.toString()) || (p.toString() === userId.toString())
        );

        if (existingParticipant) {
            if (!existingParticipant.isHidden) {
                return res.status(400).json({ success: false, message: 'Already joined this election' });
            }
            // Rejoin logic: mark as not hidden
            existingParticipant.isHidden = false;
        } else {
            election.participants.push({ userId, isHidden: false });
        }

        await election.save();

        if (!user.joinedElections.includes(election._id)) {
            user.joinedElections.push(election._id);
            await user.save();
        }

        // Notify Owners
        const ownerIds = election.admins.map(a => a.userId);
        await createNotification(ownerIds, {
            title: 'New Participant',
            message: `${req.user.name} has joined "${election.title}"`,
            type: 'ELECTION_JOINED',
            electionId: election._id
        });

        // Audit Logging
        await AuditLoggerService.createLog({
            actionType: 'USER_JOINED_ELECTION',
            message: `User ${req.user.name} joined election "${election.title}"`,
            electionId: election._id,
            status: 'SUCCESS'
        }, req);

        res.json({ success: true, message: 'Joined successfully', electionId: election._id });

    } catch (error) {
        logger.error('Join Election Error', error);
        next(error);
    }
};

/**
 * @desc    Get user's joined elections
 * @route   GET /api/elections/my
 * @access  Private
 */
export const getMyElections = async (req, res, next) => {
    try {
        const userId = req.user._id;

        // 1. Elections created by the user (or where they are a co-owner)
        // Only show if not hidden by owner/co-owner
        const created = await Election.find({
            admins: {
                $elemMatch: {
                    userId,
                    isHidden: false
                }
            }
        })
            .populate('admins.userId', 'name email photoUrl')
            .sort({ createdAt: -1 });

        // 2. Elections where the user is a participant and NOT hidden
        const joinedByParticipation = await Election.find({
            participants: {
                $elemMatch: {
                    userId,
                    isHidden: false
                }
            }
        })
            .populate('admins.userId', 'name email photoUrl')
            .sort({ createdAt: -1 });

        // Combine unique elections
        const createdIds = new Set(created.map(e => e._id.toString()));
        const uniqueJoined = joinedByParticipation.filter(e => !createdIds.has(e._id.toString()));

        res.json({
            success: true,
            data: {
                joined: uniqueJoined,
                created: created
            }
        });
    } catch (error) {
        logger.error('Get My Elections Error', error);
        next(error);
    }
};

/**
 * @desc    Get all elections
 * @route   GET /api/elections
 * @access  Private/Admin
 */
export const getAllElections = async (req, res, next) => {
    try {
        const { search, status, ownerId, startDate, endDate } = req.query;
        let query = {};

        // Filters
        if (search) {
            query.title = { $regex: search, $options: 'i' };
        }
        if (status) {
            query.status = status;
        }
        if (ownerId) {
            query['admins.userId'] = ownerId;
            query['admins.role'] = 'owner';
        }
        if (startDate || endDate) {
            query.startDate = {};
            if (startDate) query.startDate.$gte = new Date(startDate);
            if (endDate) query.startDate.$lte = new Date(endDate);
        }

        const elections = await Election.find(query)
            .populate('admins.userId', 'name email')
            .sort({ createdAt: -1 });

        // Get owner stats (Total Elections Created)
        const ownerStats = await Election.aggregate([
            { $unwind: "$admins" },
            { $match: { "admins.role": "owner" } },
            { $group: { _id: "$admins.userId", totalCreated: { $sum: 1 } } }
        ]);

        const statsMap = ownerStats.reduce((acc, stat) => {
            acc[stat._id.toString()] = stat.totalCreated;
            return acc;
        }, {});

        const enrichedElections = elections.map(election => {
            const electionObj = election.toObject();
            const owner = electionObj.admins.find(a => a.role === 'owner');
            if (owner && owner.userId) {
                owner.userId.totalCreated = statsMap[owner.userId._id.toString()] || 0;
            }
            return electionObj;
        });

        res.json({ success: true, data: enrichedElections });
    } catch (error) {
        logger.error('Get All Elections Error', error);
        next(error);
    }
};

/**
 * @desc    Get election by ID
 * @route   GET /api/elections/:id
 * @access  Private
 */
export const getElectionById = async (req, res, next) => {
    try {
        let election = await Election.findById(req.params.id)
            .populate('participants.userId', 'name email photoUrl')
            .populate('admins.userId', 'name email photoUrl');

        if (!election) return res.status(404).json({ success: false, message: 'Election not found' });

        // Fallback for legacy elections without admins array
        if (!election.admins || election.admins.length === 0) {
            // Re-fetch with creatorId if it exists in DB (even if not in schema)
            const rawDoc = await mongoose.connection.db.collection('elections').findOne({ _id: election._id });
            if (rawDoc && rawDoc.creatorId) {
                const creator = await User.findById(rawDoc.creatorId).select('name email');
                if (creator) {
                    election.admins = [{ userId: creator, role: 'owner' }];
                }
            }
        }

        // Check if user has voted
        let vote = await Vote.findOne({ electionId: req.params.id, userId: req.user._id });

        // --- PROACTIVE SYNC: Check blockchain if DB says no vote ---
        if (!vote && election.blockchainIntegrated && election.blockchainId) {
            try {
                const onChainStatus = await hasUserVotedOnChain(election.blockchainId, req.user._id);
                if (onChainStatus) {
                    logger.info(`Proactive Sync Trigger: User ${req.user._id} voted on-chain but missing in DB for election ${election._id}. Repairing...`);
                    const onChainVote = await findVoteEventsOnChain(election.blockchainId, req.user._id);
                    if (onChainVote) {
                        vote = await Vote.create({
                            userId: req.user._id,
                            electionId: election._id,
                            candidateId: onChainVote.candidateIndex,
                            voteHash: onChainVote.voteHash.replace('0x', ''),
                            txHash: onChainVote.txHash,
                            blockNumber: onChainVote.blockNumber,
                            createdAt: new Date(onChainVote.timestamp)
                        });

                        // Increment vote count optimistically if not already done
                        // Note: This is an approximation since we don't know if the count included this vote or not
                        // But for a repair, we assume it's missing from everywhere.
                        if (election.candidates[onChainVote.candidateIndex]) {
                            election.candidates[onChainVote.candidateIndex].voteCount += 1;
                            await election.save();
                        }
                        logger.info(`Proactive Sync Success: Repaired vote record for user ${req.user._id}`);
                    }
                }
            } catch (syncError) {
                logger.error("Proactive Vote Sync Failed", syncError);
            }
        }

        const electionObj = election.toObject();

        // Enrich all admins with their "Total Elections Created" stats
        if (electionObj.admins && electionObj.admins.length > 0) {
            await Promise.all(electionObj.admins.map(async (admin) => {
                if (admin.userId) {
                    const count = await Election.countDocuments({
                        "admins": {
                            $elemMatch: {
                                userId: admin.userId._id,
                                role: 'owner'
                            }
                        }
                    });
                    admin.userId.totalCreated = count;
                }
            }));
        }

        // If owner or admin, enrich participants with voted status
        const isElectionAdmin = election.admins.some(a => a.userId.toString() === req.user._id.toString());
        if (req.user.role === 'admin' || isElectionAdmin) {
            const participantIds = election.participants
                .map(p => p.userId?._id || p.userId || p)
                .filter(id => id);
            const votes = await Vote.find({
                electionId: req.params.id,
                userId: { $in: participantIds }
            });
            const votedUserIds = new Set(votes.map(v => v.userId.toString()));

            electionObj.participants = electionObj.participants.filter(p => p && (p.userId || p._id)).map(p => {
                const u = p.userId || {}; // Fallback if not populated or legacy
                const isLegacy = !p.userId;

                return {
                    ...(isLegacy ? p : u),
                    name: isLegacy ? p.name : u.name,
                    email: isLegacy ? p.email : u.email,
                    voted: votedUserIds.has((u._id || p._id || p).toString()),
                    isHidden: p.isHidden || false
                };
            });
        }


        res.json({
            success: true,
            data: {
                ...electionObj,
                userHasVoted: !!vote,
                voteDetails: vote ? {
                    txHash: vote.txHash,
                    timestamp: vote.createdAt
                } : null
            }
        });
    } catch (error) {
        logger.error('Get Election By ID Error', error);
        next(error);
    }
};

/**
 * @desc    Admin manual integration with blockchain
 * @route   PATCH /api/elections/:id/integrate
 * @access  Private (Admin)
 */
export const integrateElection = async (req, res, next) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const election = await Election.findByIdAndUpdate(req.params.id, {
            blockchainIntegrated: true
        }, { new: true });

        if (!election) {
            return res.status(404).json({ success: false, message: 'Election not found' });
        }

        res.json({ success: true, message: 'Election marked as integrated', data: election });
    } catch (error) {
        logger.error('Integrate Election Error', error);
        next(error);
    }
};

/**
 * @desc    Update an election
 * @route   PATCH /api/elections/:id
 * @access  Private (Creator or Admin)
 */
export const updateElection = async (req, res, next) => {
    try {
        const election = await Election.findById(req.params.id);
        if (!election) {
            return res.status(404).json({ success: false, message: 'Election not found' });
        }

        // Check ownership or admin role
        // Check ownership or admin role
        const isElectionAdmin = election.admins.some(a => a.userId.toString() === req.user._id.toString());
        if (req.user.role !== 'admin' && !isElectionAdmin) {
            return res.status(403).json({ success: false, message: 'Not authorized to update this election' });
        }

        // Optional: restriction to prevent updates if already started
        // if (election.status === 'active' || election.status === 'closed') {
        //     return res.status(400).json({ success: false, message: 'Cannot update an active or closed election' });
        // }

        const updates = req.body;

        // Schedule management is only allowed when PAUSED or in DRAFT
        // EXCEPTION: liveResultsEnabled and publicResultsVisible can be toggled anytime for monitoring
        const scheduleFields = ['startDate', 'startTime', 'endDate', 'endTime', 'resultTime', 'autoActivate', 'autoClose'];
        const visibilityFields = ['liveResultsEnabled', 'publicResultsVisible'];

        const isChangingSchedule = scheduleFields.some(field => updates.hasOwnProperty(field));

        if (isChangingSchedule && election.status !== 'paused' && election.status !== 'draft' && election.status !== 'scheduled') {
            return res.status(400).json({
                success: false,
                message: 'Schedule management is only allowed when the election is PAUSED, DRAFT, or SCHEDULED.'
            });
        }

        // Handle date strings if they are provided
        if (updates.startDate && updates.startTime) {
            updates.startDate = new Date(`${updates.startDate}T${updates.startTime}`);
        }
        if (updates.endDate && updates.endTime) {
            updates.endDate = new Date(`${updates.endDate}T${updates.endTime}`);
        }
        if (updates.resultTime) {
            updates.resultTime = new Date(updates.resultTime);
        }

        // 🛡️ MAX VOTES VALIDATION
        const finalVotingType = updates.votingType || election.votingType;
        const finalMaxVotes = updates.maxVotes || election.maxVotes;
        const finalCandidateCount = updates.candidates ? updates.candidates.length : election.candidates.length;

        if (finalVotingType === 'Multiple Choice' && finalMaxVotes > finalCandidateCount) {
            return res.status(400).json({
                success: false,
                message: `Maximum selections allowed (${finalMaxVotes}) cannot exceed the number of candidates (${finalCandidateCount})`
            });
        }

        const updatedElection = await Election.findByIdAndUpdate(
            req.params.id,
            { $set: updates },
            { new: true, runValidators: true }
        );

        // Notify participants if status changed
        if (updates.status && updates.status !== election.status) {
            const statusMap = {
                'active': { title: 'Election Started', type: 'ELECTION_STARTED' },
                'paused': { title: 'Election Paused', type: 'ELECTION_PAUSED' },
                'closed': { title: 'Election Ended', type: 'ELECTION_ENDED' }
            };

            const notificationData = statusMap[updates.status];
            if (notificationData) {
                await createNotification(election.participants, {
                    ...notificationData,
                    message: `Status of "${election.title}" is now ${updates.status.toUpperCase()}`,
                    electionId: election._id
                });
            }
        }

        // Audit Logging
        await AuditLoggerService.createLog({
            actionType: 'ELECTION_UPDATED',
            message: `Election "${updatedElection.title}" updated by ${req.user.name}`,
            electionId: updatedElection._id,
            status: 'SUCCESS',
            details: { updates: Object.keys(updates) }
        }, req);

        res.json({ success: true, message: 'Election updated successfully', data: updatedElection });
    } catch (error) {
        logger.error('Update Election Error', error);
        next(error);
    }
};

/**
 * @desc    Add candidate to election
 * @route   POST /api/elections/:id/candidates
 * @access  Private (Owner or Admin)
 */
export const addCandidate = async (req, res, next) => {
    try {
        const { name, bio, position, email, partyName } = req.body;
        const election = await Election.findById(req.params.id);

        if (!election) return res.status(404).json({ success: false, message: 'Election not found' });

        // Check ownership or admin role
        const isElectionAdmin = election.admins.some(a => a.userId.toString() === req.user._id.toString());
        if (req.user.role !== 'admin' && !isElectionAdmin) {
            return res.status(403).json({ success: false, message: 'Not authorized to update this election' });
        }

        const photoUrl = req.file ? `/uploads/${req.file.filename}` : req.body.photoUrl;

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

        election.candidates.push({ name, bio, photoUrl, position, email, partyName: partyName || 'Independent' });

        await election.save();

        res.status(201).json({ success: true, message: 'Candidate added successfully', data: election });
    } catch (error) {
        logger.error('Add Candidate Error', error);
        next(error);
    }
};

/**
 * @desc    Update candidate details
 * @route   PUT /api/elections/:id/candidates/:candidateId
 * @access  Private (Owner or Admin)
 */
export const updateCandidate = async (req, res, next) => {
    try {
        const { id, candidateId } = req.params;
        const updates = req.body;
        const election = await Election.findById(id);

        if (!election) return res.status(404).json({ success: false, message: 'Election not found' });

        // Check ownership or admin role
        const isElectionAdmin = election.admins.some(a => a.userId.toString() === req.user._id.toString());
        if (req.user.role !== 'admin' && !isElectionAdmin) {
            return res.status(403).json({ success: false, message: 'Not authorized to update this election' });
        }

        const candidate = election.candidates.id(candidateId);
        if (!candidate) return res.status(404).json({ success: false, message: 'Candidate not found' });

        if (updates.name) candidate.name = updates.name;
        if (updates.bio !== undefined) candidate.bio = updates.bio;
        if (req.file) {
            candidate.photoUrl = `/uploads/${req.file.filename}`;
        } else if (updates.photoUrl !== undefined) {
            candidate.photoUrl = updates.photoUrl;
        }
        if (updates.position !== undefined) candidate.position = updates.position;
        if (updates.partyName !== undefined) candidate.partyName = updates.partyName || 'Independent';

        if (updates.email !== undefined) candidate.email = updates.email;

        await election.save();
        res.status(200).json({ success: true, message: 'Candidate updated successfully', data: election });
    } catch (error) {
        logger.error('Update Candidate Error', error);
        next(error);
    }
};

/**
 * @desc    Remove candidate from election
 * @route   DELETE /api/elections/:id/candidates/:candidateId
 * @access  Private (Owner or Admin)
 */
export const removeCandidate = async (req, res, next) => {
    try {
        const { id, candidateId } = req.params;
        const election = await Election.findById(id);

        if (!election) return res.status(404).json({ success: false, message: 'Election not found' });

        // Check ownership or admin role
        const isElectionAdmin = election.admins.some(a => a.userId.toString() === req.user._id.toString());
        if (req.user.role !== 'admin' && !isElectionAdmin) {
            return res.status(403).json({ success: false, message: 'Not authorized to update this election' });
        }

        // 🛡️ PREVENT INVALIDATING MAX VOTES & MINIMUM CANDIDATES
        if (election.candidates.length <= 2) {
            return res.status(400).json({
                success: false,
                message: 'Cannot remove candidate. An election must have at least 2 candidates.'
            });
        }

        if (election.votingType === 'Multiple Choice' && (election.candidates.length - 1) < election.maxVotes) {
            return res.status(400).json({
                success: false,
                message: `Cannot remove candidate. For a Multiple Choice election with ${election.maxVotes} selections, you must have at least ${election.maxVotes} candidates.`
            });
        }

        election.candidates.pull(candidateId);
        await election.save();

        res.status(200).json({ success: true, message: 'Candidate removed successfully', data: election });
    } catch (error) {
        logger.error('Remove Candidate Error', error);
        next(error);
    }
};

/**
 * @desc    Soft Remove participant from election (Hide)
 * @route   DELETE /api/elections/:id/participants/:userId
 * @access  Private (Owner or Admin)
 */
export const removeParticipant = async (req, res, next) => {
    try {
        const { id, userId } = req.params;
        const election = await Election.findById(id);

        if (!election) return res.status(404).json({ success: false, message: 'Election not found' });

        // Check ownership or admin role
        const isElectionAdmin = election.admins.some(a => a.userId.toString() === req.user._id.toString());
        if (req.user.role !== 'admin' && !isElectionAdmin) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        // Soft delete: set isHidden = true
        const participant = election.participants.find(p =>
            (p.userId?.toString() === userId.toString()) || (p.toString() === userId.toString())
        );
        if (participant) {
            participant.isHidden = true;
            await election.save();
        }

        // Also return the updated election (populated)
        const updatedElection = await Election.findById(id)
            .populate('participants.userId', 'name email')
            .populate('admins.userId', 'name email');

        res.status(200).json({ success: true, message: 'Voter removed (hidden) successfully', data: updatedElection });
    } catch (error) {
        logger.error('Remove Participant Error', error);
        next(error);
    }
};
/**
 * @desc    Remove election from dashboard (Hide)
 * @route   DELETE /api/elections/:id
 * @access  Private (Creator/Co-owner)
 */
export const deleteElection = async (req, res, next) => {
    try {
        const election = await Election.findById(req.params.id);
        if (!election) {
            return res.status(404).json({ success: false, message: 'Election not found' });
        }

        // Check ownership or co-owner role
        const adminEntry = election.admins.find(a => a.userId.toString() === req.user._id.toString());
        if (!adminEntry) {
            return res.status(403).json({ success: false, message: 'Not authorized to remove this election' });
        }

        // 🛡️ BLOCK REMOVAL IF ACTIVE
        if (election.status === 'active') {
            return res.status(400).json({
                success: false,
                message: 'Active elections cannot be removed from the dashboard. Please end the election first.'
            });
        }

        // Use soft-hide logic (leave election)
        adminEntry.isHidden = true;
        await election.save();

        // Audit Logging
        await AuditLoggerService.createLog({
            actionType: 'ELECTION_REMOVED_FROM_DASHBOARD',
            message: `Election "${election.title}" hidden from ${req.user.name}'s dashboard`,
            status: 'SUCCESS',
            details: { title: election.title }
        }, req);

        res.json({ success: true, message: 'Election removed from dashboard' });
    } catch (error) {
        logger.error('Soft Remove Election Error', error);
        next(error);
    }
};

/**
 * @desc    Upload an image (Generic)
 * @route   POST /api/elections/upload
 * @access  Private
 */
export const uploadImage = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Please upload a file' });
        }

        const photoUrl = `/uploads/${req.file.filename}`;
        res.status(200).json({ success: true, data: photoUrl });
    } catch (error) {
        logger.error('Upload Image Error', error);
        next(error);
    }
};

/**
 * @desc    Add a co-owner to the election
 * @route   POST /api/elections/:id/add-owner
 * @access  Private (Owner Only)
 */
export const addAdmin = async (req, res, next) => {
    try {
        const { userEmail } = req.body;
        const electionId = req.params.id;

        if (!userEmail) {
            return res.status(400).json({ success: false, message: 'Please provide user email' });
        }

        const election = await Election.findById(electionId);
        if (!election) {
            return res.status(404).json({ success: false, message: 'Election not found' });
        }

        // Only owner can add co-owners
        const isOwner = election.admins.some(
            a => a.userId.toString() === req.user._id.toString() && a.role === 'owner'
        );

        if (req.user.role !== 'admin' && !isOwner) {
            return res.status(403).json({ success: false, message: 'Only owner can add co-owners' });
        }

        const userToAdd = await User.findOne({ email: userEmail });
        if (!userToAdd) {
            return res.status(404).json({ success: false, message: 'User not found with this email' });
        }

        // Check if already an admin
        const alreadyAdmin = election.admins.some(
            a => a.userId.toString() === userToAdd._id.toString()
        );

        if (alreadyAdmin) {
            return res.status(400).json({ success: false, message: 'User is already an admin of this election' });
        }

        election.admins.push({
            userId: userToAdd._id,
            role: 'co-owner'
        });

        await election.save();

        // Notify the new co-owner
        await createNotification(userToAdd._id, {
            title: 'New Admin Role',
            message: `You have been added as a co-owner of "${election.title}"`,
            type: 'ADMIN_ADDED',
            electionId: election._id
        });

        // Send Email Notification
        try {
            await sendEmail({
                email: userToAdd.email,
                subject: `New Admin Role: ${election.title}`,
                html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                        <h2 style="color: #4f46e5;">New Admin Role</h2>
                        <p>Hello <strong>${userToAdd.name}</strong>,</p>
                        <p>You have been added as a <strong>co-owner</strong> of the election: <strong>"${election.title}"</strong>.</p>
                        <p>You can now manage candidates, voters, and monitor the election status from your dashboard.</p>
                        <div style="margin: 30px 0;">
                            <a href="${process.env.APP_URL}/admin" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; rounded-md: 5px; font-weight: bold;">Go to Dashboard</a>
                        </div>
                        <p style="color: #666; font-size: 12px;">If you didn't expect this, please contact the election owner.</p>
                    </div>
                `
            });
        } catch (emailError) {
            logger.error('Failed to send co-owner invitation email', emailError);
            // Non-blocking error
        }

        // Audit Logging
        await AuditLoggerService.createLog({
            actionType: 'ADMIN_ADDED',
            message: `User ${userEmail} added as co-owner to "${election.title}"`,
            electionId: election._id,
            status: 'SUCCESS',
            details: { userEmail }
        }, req);

        res.json({
            success: true,
            message: 'Co-owner added successfully',
            data: election
        });
    } catch (error) {
        logger.error('Add Admin Error', error);
        next(error);
    }
};

/**
 * @desc    Invite a voter to the election
 * @route   POST /api/elections/:id/invite-voter
 * @access  Private (Owner or Admin)
 */
export const inviteVoter = async (req, res, next) => {
    try {
        const { email } = req.body;
        const electionId = req.params.id;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Please provide voter email' });
        }

        const election = await Election.findById(electionId);
        if (!election) {
            return res.status(404).json({ success: false, message: 'Election not found' });
        }

        // Check ownership or admin role
        const isElectionAdmin = election.admins.some(a => a.userId.toString() === req.user._id.toString());
        if (req.user.role !== 'admin' && !isElectionAdmin) {
            return res.status(403).json({ success: false, message: 'Not authorized to invite voters' });
        }

        // 🛡️ PREVENT OWNER FROM INVITING THEMSELVES
        if (req.user.email.toLowerCase() === email.toLowerCase()) {
            return res.status(400).json({
                success: false,
                message: 'You cannot invite yourself as a voter to your own election.'
            });
        }

        const userToInvite = await User.findOne({ email });
        if (!userToInvite) {
            return res.status(404).json({ success: false, message: 'User not found with this email' });
        }

        // 🛡️ PREVENT ANY ADMIN (OWNER/CO-OWNER) FROM BEING INVITED AS A VOTER
        const isAlreadyAdmin = election.admins.some(a => a.userId.toString() === userToInvite._id.toString());
        if (isAlreadyAdmin) {
            return res.status(400).json({
                success: false,
                message: 'This user is an administrator (owner or co-owner) of this election and cannot be added as a voter.'
            });
        }

        // Check if already a participant
        const existingParticipant = election.participants.find(p =>
            (p.userId?.toString() === userToInvite._id.toString()) || (p.toString() === userToInvite._id.toString())
        );
        if (existingParticipant) {
            if (!existingParticipant.isHidden) {
                return res.status(400).json({ success: false, message: 'User is already a participant of this election' });
            }
            // If hidden, rejoin
            existingParticipant.isHidden = false;
        } else {
            election.participants.push({ userId: userToInvite._id, isHidden: false });
        }
        await election.save();

        // Sync voter dashboard: push election to user's joined list (Robust with $addToSet)
        await User.findByIdAndUpdate(userToInvite._id, {
            $addToSet: { joinedElections: election._id }
        });

        // Notify the invited voter
        await createNotification(userToInvite._id, {
            title: 'Election Invitation',
            message: `You have been invited to participate in "${election.title}"`,
            type: 'ELECTION_JOINED',
            electionId: election._id
        });

        // Send Email Notification
        try {
            await sendEmail({
                email: userToInvite.email,
                subject: `Election Invitation: ${election.title}`,
                html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                        <h2 style="color: #4f46e5;">Election Invitation</h2>
                        <p>Hello <strong>${userToInvite.name}</strong>,</p>
                        <p>You have been invited to participate in the election: <strong>"${election.title}"</strong>.</p>
                        <p>Log in to your dashboard to view the candidates and cast your vote when the election starts.</p>
                        <div style="margin: 30px 0;">
                            <a href="${process.env.APP_URL}/dashboard" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; rounded-md: 5px; font-weight: bold;">Go to Dashboard</a>
                        </div>
                        <p style="color: #666; font-size: 12px;">If you already have an account, simply log in to see the new election.</p>
                    </div>
                `
            });
        } catch (emailError) {
            logger.error('Failed to send voter invitation email', emailError);
            // Non-blocking error
        }

        // Audit Logging
        await AuditLoggerService.createLog({
            actionType: 'VOTER_INVITED',
            message: `User ${email} invited to "${election.title}"`,
            electionId: election._id,
            status: 'SUCCESS',
            details: { email }
        }, req);

        const updatedElection = await Election.findById(electionId)
            .populate('participants', 'name email')
            .populate('admins.userId', 'name email');

        res.json({
            success: true,
            message: 'Voter invited successfully',
            data: updatedElection
        });
    } catch (error) {
        logger.error('Invite Voter Error', error);
        next(error);
    }
};

/**
 * @desc    Leave an election
 * @route   POST /api/elections/:id/leave
 * @access  Private
 */
export const leaveElection = async (req, res, next) => {
    try {
        const electionId = req.params.id;
        const userId = req.user._id;

        const election = await Election.findById(electionId);
        if (!election) {
            return res.status(404).json({ success: false, message: 'Election not found' });
        }

        // Check if user is owner (Owners cannot leave, they must delete)
        const isOwner = election.admins.some(
            a => a.userId.toString() === userId.toString() && a.role === 'owner'
        );
        if (isOwner) {
            return res.status(400).json({ success: false, message: 'Owner cannot leave the election. Use delete instead.' });
        }

        // Soft Remove (Hide)
        const participant = election.participants.find(p =>
            (p.userId?.toString() === userId.toString()) || (p.toString() === userId.toString())
        );
        if (participant) {
            participant.isHidden = true;
        }

        // Also hide if they are a co-owner
        const adminEntry = election.admins.find(a => a.userId.toString() === userId.toString());
        if (adminEntry) {
            adminEntry.isHidden = true;
        }

        await election.save();

        res.json({ success: true, message: 'Election hidden from dashboard' });
    } catch (error) {
        logger.error('Leave Election Error', error);
        next(error);
    }
};

/**
 * @desc    Rejoin an election
 * @route   POST /api/elections/:id/rejoin
 * @access  Private
 */
export const rejoinElection = async (req, res, next) => {
    try {
        const electionId = req.params.id;
        const userId = req.user._id;

        const election = await Election.findById(electionId);
        if (!election) {
            return res.status(404).json({ success: false, message: 'Election not found' });
        }

        let updated = false;

        // Restore participant visibility
        const participant = election.participants.find(p =>
            (p.userId?.toString() === userId.toString()) || (p.toString() === userId.toString())
        );
        if (participant && participant.isHidden) {
            participant.isHidden = false;
            updated = true;
        }

        // Restore admin visibility
        const adminEntry = election.admins.find(a => a.userId.toString() === userId.toString());
        if (adminEntry && adminEntry.isHidden) {
            adminEntry.isHidden = false;
            updated = true;
        }

        if (!updated) {
            return res.status(400).json({ success: false, message: 'Already visible or not joined' });
        }

        await election.save();

        res.json({ success: true, message: 'Rejoined successfully' });
    } catch (error) {
        logger.error('Rejoin Election Error', error);
        next(error);
    }
};

export default {
    createElection,
    joinElection,
    getMyElections,
    getAllElections,
    getElectionById,
    integrateElection,
    updateElection,
    addCandidate,
    updateCandidate,
    removeCandidate,
    removeParticipant,
    deleteElection,
    uploadImage,
    addAdmin,
    inviteVoter,
    leaveElection,
    rejoinElection
};

