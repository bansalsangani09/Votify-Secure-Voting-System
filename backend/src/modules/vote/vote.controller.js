import Vote from "./vote.model.js";
import Election from "../election/election.model.js";
import User from "../auth/auth.model.js";
import AuditLoggerService from "../audit/audit.service.js";
import { castVoteOnChain } from "../../services/blockchainService.js";
import crypto from "crypto";
import logger from "../../utils/logger.util.js";
import sendEmail from "../../config/mail.js";
import { createNotification, notifyAdmins } from "../../utils/notification.util.js";
import { findVoteEventsOnChain } from "../../services/blockchainService.js";


import { verifyRecaptcha } from "../../middleware/security.middleware.js";

/**
 * @desc    Cast a vote
 * @route   POST /api/votes
 * @access  Private (User)
 */
export const castVote = async (req, res, next) => {
    try {
        const { electionId, candidateId, rankedCandidateIds, selectedCandidateIds, captchaToken } = req.body; // candidateId is the index in the candidates array
        const userId = req.user._id;

        // --- reCAPTCHA VERIFICATION (0.7) ---
        const recaptchaResult = await verifyRecaptcha(captchaToken);
        if (!recaptchaResult.success || recaptchaResult.score < 0.7 || recaptchaResult.action !== "vote_submit") {
            logger.warn(`Vote Security: CAPTCHA failed for user ${req.user._id}. Score: ${recaptchaResult.score}, Action: ${recaptchaResult.action}`);
            return res.status(403).json({
                success: false,
                message: 'Security verification failed (Bot detected). Please try again.'
            });
        }

        // NEW: Check Global Maintenance Mode (Pause Election)
        const { Settings } = await import('../admin/admin.model.js');
        const settings = await Settings.findOne() || { maintenanceMode: false };
        if (settings.maintenanceMode) {
            return res.status(503).json({ success: false, message: "System is in MAINTENANCE MODE. All voting activities are temporarily PAUSED." });
        }

        // 0. Check User Status (Global and Election-specific)
        const user = await User.findById(userId);
        if (user.status === 'Inactive') {
            return res.status(403).json({ success: false, message: "Your account is INACTIVE. Please contact the administrator." });
        }
        if (user.status === 'Suspended' && user.suspendedElections && user.suspendedElections.includes(electionId)) {
            return res.status(403).json({ success: false, message: "You have been SUSPENDED from this specific election. Please contact the administrator." });
        }

        // 1. Check election active and within time bounds
        const election = await Election.findById(electionId);
        if (!election) {
            return res.status(404).json({ success: false, message: "Election not found" });
        }

        const now = new Date();
        const start = new Date(election.startDate);
        const end = new Date(election.endDate);

        // 1a. Handle Explicit Statuses
        if (election.status === 'paused') {
            return res.status(400).json({ success: false, message: "Election is currently PAUSED by the owner. Voting is temporarily suspended." });
        }
        if (election.status === 'closed') {
            return res.status(400).json({ success: false, message: "Election is CLOSED. Voting is no longer permitted." });
        }

        // 1b. Handle Time Bounds (Only if Active)
        if (election.status === 'active') {
            if (now < start) {
                return res.status(400).json({ success: false, message: "Election has not started yet." });
            }
            if (now > end) {
                return res.status(400).json({ success: false, message: "Election has already ended." });
            }
        } else {
            // draft or scheduled (already handled by 'paused' and 'closed' above, but just in case)
            return res.status(400).json({ success: false, message: "Election is not currently accepting votes." });
        }

        // 2. Check user not voted
        const alreadyVoted = await Vote.findOne({ electionId, userId });
        if (alreadyVoted) {
            return res.status(400).json({ success: false, message: "Already voted" });
        }

        const isRanked = election.votingType === 'Ranked Voting' && Array.isArray(rankedCandidateIds) && rankedCandidateIds.length > 0;
        const isMultiple = election.votingType === 'Multiple Choice' && Array.isArray(selectedCandidateIds) && selectedCandidateIds.length > 0;

        // Use either the first ranked candidate or the first selected candidate or the single provided candidate for blockchain submission 
        const primaryCandidateId = isRanked ? rankedCandidateIds[0] : (isMultiple ? selectedCandidateIds[0] : candidateId);

        if (primaryCandidateId === undefined || primaryCandidateId === null) {
            return res.status(400).json({ success: false, message: "No candidate selected" });
        }

        if (isMultiple && selectedCandidateIds.length !== election.maxVotes) {
            return res.status(400).json({ success: false, message: `You must select exactly ${election.maxVotes} candidates.` });
        }

        // 3. Generate voteHash for blockchain recording (0x + sha256)
        let voteIdentifier = primaryCandidateId.toString();
        if (isRanked) {
            voteIdentifier = rankedCandidateIds.join(',');
        } else if (isMultiple) {
            voteIdentifier = selectedCandidateIds.sort((a, b) => a - b).join(',');
        }

        const voteHashValue = userId.toString() + electionId.toString() + voteIdentifier + Date.now().toString();
        const voteHashHex = crypto.createHash("sha256").update(voteHashValue).digest("hex");
        const voteHash = "0x" + voteHashHex;

        // 4. Cast vote on blockchain
        if (!election.blockchainIntegrated || !election.blockchainId) {
            logger.error(`Vote failed: Election ${electionId} is not blockchain integrated`);
            return res.status(400).json({
                success: false,
                message: "This election is not yet integrated with the blockchain. Please contact the administrator."
            });
        }
        const blockchainId = election.blockchainId;

        logger.info(`Casting vote on blockchain for election ${blockchainId}, primary candidate index ${primaryCandidateId}`);

        const bcResult = await castVoteOnChain(
            blockchainId,
            primaryCandidateId,
            voteHash,
            userId
        );

        // 5. Save in DB
        const newVote = await Vote.create({
            userId,
            electionId,
            candidateId: primaryCandidateId,
            rankedCandidateIds: isRanked ? rankedCandidateIds : undefined,
            selectedCandidateIds: isMultiple ? selectedCandidateIds : undefined,
            voteHash: voteHashHex,
            txHash: bcResult.txHash,
            blockNumber: bcResult.blockNumber
        });

        // 6. Update election candidate count in DB (Optimistic update)
        let candidateName = 'Multiple Candidates';
        if (isRanked) {
            // Borda Count: first choice gets N points, second gets N-1, etc.
            const N = election.candidates.length;
            rankedCandidateIds.forEach((id, index) => {
                if (election.candidates[id]) {
                    const points = N - index;
                    election.candidates[id].voteCount = (election.candidates[id].voteCount || 0) + points;
                }
            });
            candidateName = 'Ranked: ' + rankedCandidateIds.map(id => election.candidates[id]?.name).join(', ');
            await election.save();
        } else if (isMultiple) {
            selectedCandidateIds.forEach(id => {
                if (election.candidates[id]) {
                    election.candidates[id].voteCount = (election.candidates[id].voteCount || 0) + 1;
                }
            });
            candidateName = 'Group: ' + selectedCandidateIds.map(id => election.candidates[id]?.name).join(', ');
            await election.save();
        } else {
            if (election.candidates[primaryCandidateId]) {
                candidateName = election.candidates[primaryCandidateId].name;
                election.candidates[primaryCandidateId].voteCount += 1;
                await election.save();
            }
        }

        // 7. Send Email Confirmation
        try {
            const formattedTime = new Intl.DateTimeFormat('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            }).format(newVote.createdAt);

            const emailHtml = `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
                    <h2 style="color: #4f46e5;">Vote Successful</h2>
                    <p>Hello ${req.user.name},</p>
                    <p>You have successfully voted in:</p>
                    <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p style="margin: 5px 0;"><strong>Election:</strong> ${election.title}</p>
                        <p style="margin: 5px 0;"><strong>Candidate:</strong> ${candidateName}</p>
                        <p style="margin: 5px 0;"><strong>Time:</strong> ${formattedTime}</p>
                    </div>
                    <p><strong>Transaction Hash:</strong></p>
                    <p style="font-family: monospace; word-break: break-all; background-color: #f1f5f9; padding: 10px; border-radius: 4px;">${bcResult.txHash}</p>
                    <p style="color: #64748b; font-size: 14px; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
                        This vote is secured by blockchain and cannot be changed.
                    </p>
                </div>
            `;

            await sendEmail({
                email: req.user.email,
                subject: 'Your Vote Has Been Successfully Recorded',
                message: `Hello ${req.user.name},\n\nYou have successfully voted in:\n\nElection: ${election.title}\nCandidate: ${candidateName}\nTime: ${formattedTime}\n\nTransaction Hash:\n${bcResult.txHash}\n\nThis vote cannot be changed.`,
                html: emailHtml
            });
        } catch (emailError) {
            logger.error("Failed to send vote confirmation email", emailError);
            // Don't fail the vote if email fails
        }

        // Notify User of Successful Vote
        await createNotification(userId, {
            title: 'Vote Recorded Successfully',
            message: `Your vote for "${candidateName}" in "${election.title}" has been safely recorded on the blockchain.`,
            type: 'VOTE_SUCCESS',
            electionId: election._id
        });


        // Audit Logging (Privacy Safe: No candidateId logged in metadata)
        await AuditLoggerService.createLog({
            actionType: 'VOTE_CAST',
            message: `User ${req.user.name} cast a ballot in "${election.title}"`,
            electionId: election._id,
            status: 'SUCCESS',
            details: {
                txHash: bcResult.txHash,
                votingType: election.votingType
            }
        }, req);

        // Notify Admins of Activity
        await notifyAdmins({
            title: 'Vote Cast Successfully',
            message: `User ${req.user.name} has cast their vote in "${election.title}".`,
            type: 'VOTE_CAST',
            electionId: election._id
        });

        res.status(201).json({
            success: true,
            message: "Vote recorded successfully",
            data: {
                txHash: bcResult.txHash,
                blockNumber: bcResult.blockNumber,
                voteHash: voteHashHex
            }
        });

    } catch (error) {
        const { electionId } = req.body; // Redefine for catch scope
        logger.error("Cast Vote Error", error);

        // Check for specific blockchain revert reasons

        const userId = req.user._id;
        if (error.message.includes("Already voted") || (error.info?.error?.message && error.info.error.message.includes("Already voted"))) {
            logger.info(`Sync Trigger: User ${userId} already voted on-chain for election ${electionId}. Attempting recovery...`);

            try {
                const election = await Election.findById(electionId);
                if (election && election.blockchainId) {
                    const onChainVote = await findVoteEventsOnChain(election.blockchainId, userId);

                    if (onChainVote) {
                        // Create missing DB record
                        const recoveredVote = await Vote.create({
                            userId,
                            electionId,
                            candidateId: onChainVote.candidateIndex,
                            voteHash: onChainVote.voteHash.replace('0x', ''),
                            txHash: onChainVote.txHash,
                            blockNumber: onChainVote.blockNumber,
                            createdAt: new Date(onChainVote.timestamp)
                        });

                        // Update optimistic count if not already counted (this part is tricky, but let's assume we need to for sync)
                        if (election.candidates[onChainVote.candidateIndex]) {
                            election.candidates[onChainVote.candidateIndex].voteCount += 1;
                            await election.save();
                        }

                        logger.info(`Sync Success: Recovered vote record for user ${userId} in election ${electionId}`);

                        return res.status(201).json({
                            success: true,
                            message: "Vote synchronization successful. Your previous vote has been recovered.",
                            data: {
                                txHash: recoveredVote.txHash,
                                blockNumber: recoveredVote.blockNumber,
                                voteHash: recoveredVote.voteHash
                            }
                        });
                    }
                }
            } catch (syncError) {
                logger.error("Vote Sync Recovery Failed", syncError);
            }

            return res.status(400).json({ success: false, message: "Blockchain confirms: You have already voted in this election." });
        }

        // Audit Logging for failure
        await AuditLoggerService.createLog({
            actionType: 'VOTE_FAILED',
            message: `Vote failed for user ${req.user.name} in election ID ${electionId}`,
            status: 'FAILED',
            details: { error: error.message, electionId }
        }, req);

        res.status(500).json({ success: false, message: `Vote failed: ${error.message}` });
    }
};

export default { castVote };