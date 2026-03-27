import axios from 'axios';
import Election from '../modules/election/election.model.js';
import User from '../modules/auth/auth.model.js';
import logger from '../utils/logger.util.js';

// List of common spam/banned keywords
const SPAM_KEYWORDS = [
    'casino', 'lottery', 'prize', 'winner', 'viagra', 'pharmacy',
    'payout', 'bitcoin', 'crypto', 'investment', 'guaranteed',
    'free money', 'sex', 'nude', 'adult', 'dating', 'inheritance'
];

/**
 * @desc    Verify Google reCAPTCHA v3 token
 */
export const verifyRecaptcha = async (token) => {
    if (!token) return { success: false, message: 'Captcha token missing' };

    try {
        const response = await axios.post(
            `https://www.google.com/recaptcha/api/siteverify`,
            null,
            {
                params: {
                    secret: process.env.RECAPTCHA_SECRET,
                    response: token,
                },
            }
        );
        return response.data;
    } catch (error) {
        logger.error('reCAPTCHA Service Error:', error);
        return { success: false, message: 'Verification service error' };
    }
};

/**
 * @desc    Consolidated Security Middleware for Election Creation
 */
export const validateElectionSecurity = async (req, res, next) => {
    try {
        const { title, description, captchaToken } = req.body;
        const userId = req.user._id;

        // Fetch User and Check Status
        const user = await User.findById(userId);
        if (user.ownerStatus === 'suspended') {
            return res.status(403).json({
                success: false,
                message: 'Your account has been suspended by an administrator.'
            });
        }
        if (user.ownerStatus === 'restricted') {
            return res.status(403).json({
                success: false,
                message: 'Your account has been restricted due to suspicious behavior. Please contact support.'
            });
        }

        // --- Verified Owner Auto-Upgrade Logic ---
        const accountAgeMs = Date.now() - user.createdAt.getTime();
        const accountAgeDays = Math.floor(accountAgeMs / (1000 * 60 * 60 * 24));
        const daysUntilVerified = Math.max(0, 10 - accountAgeDays);

        if (user.ownerStatus === 'new') {
            if (accountAgeDays >= 10 && user.successfulElections >= 2) {
                user.ownerStatus = 'verified';
                await user.save();
                logger.info(`User ${userId} upgraded to Verified Owner.`);
            }
        }

        const isVerified = user.ownerStatus === 'verified';

        // 1. reCAPTCHA Verification
        const recaptchaResult = await verifyRecaptcha(captchaToken);
        if (!recaptchaResult.success || recaptchaResult.score < 0.6 || recaptchaResult.action !== "create_election") {
            logger.warn(`Security Block: reCAPTCHA failed for user ${userId}. Score: ${recaptchaResult.score}, Action: ${recaptchaResult.action}`);

            if (recaptchaResult['error-codes']?.includes("timeout-or-duplicate")) {
                return res.status(400).json({
                    success: false,
                    message: "reCAPTCHA token expired or already used. Please try again."
                });
            }

            return res.status(403).json({
                success: false,
                message: 'Security verification failed (Bot detected or invalid session).'
            });
        }

        // 2. Spam Keyword Filter
        const contentToScan = `${title} ${description}`.toLowerCase();
        const foundSpam = SPAM_KEYWORDS.find(keyword => contentToScan.includes(keyword));

        if (foundSpam) {
            logger.warn(`Security Block: Spam keyword "${foundSpam}" detected in election by user ${userId}`);
            return res.status(400).json({
                success: false,
                message: `Security Block: Your content contains restricted keywords ("${foundSpam}"). Please revise.`
            });
        }

        // 3. Advanced Rate Limiting (FAANG-level)
        const now = new Date();
        const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);
        const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        if (!isVerified) {
            // Check for election in last 10 minutes
            const recentElection = await Election.findOne({
                owner: userId,
                createdAt: { $gte: tenMinutesAgo }
            }).sort({ createdAt: -1 });

            if (recentElection) {
                const waitTimeMs = recentElection.createdAt.getTime() + (10 * 60 * 1000) - now.getTime();
                const waitMinutes = Math.ceil(waitTimeMs / (60 * 1000));

                logger.warn(`Rate Limit: User ${userId} attempting to create elections too fast.`);

                // Suspicious Behavior: If they try > 3 times within an hour to bypass the 10m gap
                // (Using a simple counter or just checking recent logs in a real system)
                // For now, we'll mark as suspicious if they hit this limit 5 times in their history
                // or just keep it simple as requested.

                return res.status(429).json({
                    success: false,
                    message: `Please wait ${waitMinutes} minute${waitMinutes > 1 ? 's' : ''} before creating your next election. Verified owners bypass this limit!`,
                    daysUntilVerified: daysUntilVerified > 0 ? daysUntilVerified : null
                });
            }

            // Check for daily limit (10 elections)
            const electionsTodayCount = await Election.countDocuments({
                owner: userId,
                createdAt: { $gte: twentyFourHoursAgo }
            });

            if (electionsTodayCount >= 10) {
                logger.warn(`Rate Limit: User ${userId} reached daily limit (10).`);

                // Automatic Restriction Trigger: Excessive attempts (FAANG-style)
                if (electionsTodayCount >= 15) {
                    user.ownerStatus = 'restricted';
                    await user.save();
                    return res.status(403).json({
                        success: false,
                        message: 'Security Block: Your account has been restricted due to excessive creation attempts. No admin needed.'
                    });
                }

                return res.status(429).json({
                    success: false,
                    message: 'Daily election creation limit reached (10). Please try again tomorrow. Verified owners have unlimited access!',
                    daysUntilVerified: daysUntilVerified > 0 ? daysUntilVerified : null
                });
            }
        }

        // 4. Duplicate Election Detection (Same Title)
        const duplicate = await Election.findOne({
            owner: userId,
            title: { $regex: new RegExp(`^${title.trim()}$`, 'i') },
            createdAt: { $gte: twentyFourHoursAgo }
        });

        if (duplicate) {
            logger.warn(`Security Block: Duplicate election title detected for user ${userId}`);

            // Suspicious Behavior Trigger: Same title repeated many times
            const duplicateCount = await Election.countDocuments({
                owner: userId,
                title: { $regex: new RegExp(`^${title.trim()}$`, 'i') }
            });

            if (duplicateCount >= 5) {
                user.ownerStatus = 'restricted';
                await user.save();
                return res.status(403).json({
                    success: false,
                    message: 'Security Block: Your account has been restricted for spamming duplicate election titles.'
                });
            }

            return res.status(400).json({
                success: false,
                message: 'Security Block: You have already created an election with this title recently. Please use a unique name.'
            });
        }

        // Attach daysUntilVerified to request if they are new, so controller can return it if needed
        req.securityContext = {
            daysUntilVerified: user.ownerStatus === 'new' ? daysUntilVerified : 0,
            ownerStatus: user.ownerStatus
        };

        next();
    } catch (error) {
        logger.error('Election Security Middleware Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during security validation'
        });
    }
};
