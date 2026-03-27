import { electionFactoryContract, votingContract } from '../config/blockchain.js';
import Election from '../modules/election/election.model.js';
import Vote from '../modules/vote/vote.model.js';
import logger from '../utils/logger.util.js';

export const startBlockchainListeners = () => {
    logger.info('Initializing Blockchain Event Listeners...');

    // 1. Listen for Election Created
    electionFactoryContract.on('ElectionCreated', async (electionId, title, creator, event) => {
        logger.info(`[Blockchain Event] ElectionCreated: ID ${electionId}, Title: ${title}`);

        try {
            // Reconcile with DB if needed (e.g. update status or blockchainId)
            const election = await Election.findOne({ title: title });
            if (election && !election.blockchainId) {
                election.blockchainId = electionId.toString();
                await election.save();
                logger.info(`Reconciled election ${title} with blockchainId ${electionId}`);
            }
        } catch (error) {
            logger.error('Error handling ElectionCreated event', error);
        }
    });

    // 2. Listen for Vote Cast
    electionFactoryContract.on('VoteCast', async (electionId, voter, candidateIndex, event) => {
        logger.info(`[Blockchain Event] VoteCast: Election ${electionId}, Voter ${voter}`);
    });

    // 3. Listen for Vote Hash Stored
    votingContract.on('VoteHashStored', async (electionId, voteHash, event) => {
        logger.info(`[Blockchain Event] VoteHashStored: Election ${electionId}, Hash ${voteHash}`);

        try {
            // Find vote in DB by hash and mark as verified on-chain
            const vote = await Vote.findOne({ voteHash: voteHash.replace('0x', '') });
            if (vote) {
                // In a real system, you might set a 'verifiedOnChain' flag
                logger.info(`Vote hash ${voteHash} verified in database.`);
            }
        } catch (error) {
            logger.error('Error handling VoteHashStored event', error);
        }
    });
};

export default startBlockchainListeners;
