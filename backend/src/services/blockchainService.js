import { ethers } from "ethers";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { provider, wallet as adminWallet, electionFactoryContract, votingContract, BLOCKCHAIN_MNEMONIC } from "../config/blockchain.js";
import txQueue from "./txQueue.service.js";
import logger from "../utils/logger.util.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 🔑 GET DETERMINISTIC USER WALLET
 * Derives a unique wallet for a user based on their database ID
 * @param {string} userId 
 */
export function getUserWallet(userId) {
    if (!BLOCKCHAIN_MNEMONIC) {
        throw new Error("BLOCKCHAIN_MNEMONIC is not defined in environment variables");
    }

    // Use a deterministic path based on the user's ID
    // convert hex ID (last 8 chars) to a 31-bit safe integer for BIP-31 path index 
    const userIndex = parseInt(userId.toString().slice(-8), 16) & 0x7FFFFFFF;

    // Standard HD Path: m/44'/60'/0'/0/index
    const path = `m/44'/60'/0'/0/${userIndex}`;
    const userWallet = ethers.HDNodeWallet.fromPhrase(BLOCKCHAIN_MNEMONIC, "", path).connect(provider);

    return userWallet;
}

/**
 * 🚀 CREATE ELECTION ON-CHAIN (Admin Wallet)
 */
export async function createElectionOnChain(title, description, startTime, endTime, joinCode, candidates) {
    try {
        logger.info(`Queuing election creation for "${title}"...`);

        const bcResult = await txQueue.enqueue(async () => {
            const tx = await electionFactoryContract.createElection(
                title,
                description || "",
                startTime,
                endTime,
                joinCode,
                candidates
            );
            const receipt = await tx.wait();

            const event = receipt.logs
                .map((log) => {
                    try { return electionFactoryContract.interface.parseLog(log); }
                    catch (e) { return null; }
                })
                .find((e) => e && e.name === "ElectionCreated");

            if (!event) {
                logger.error(`ElectionCreated event not found in tx ${receipt.hash}. Logs count: ${receipt.logs.length}`);
            }

            const blockchainId = event ? event.args.electionId.toString() : null;

            return {
                success: true,
                txHash: receipt.hash,
                blockchainId,
                blockNumber: receipt.blockNumber
            };
        });

        return bcResult;
    } catch (error) {
        logger.error("Create Election Blockchain Error:", error);
        throw error;
    }
}

/**
 * 🗳️ CAST VOTE ON-CHAIN (User-Specific Wallet)
 * @param {string} blockchainId 
 * @param {number} candidateIndex 
 * @param {string} voteHash (0x...)
 * @param {string} userId
 */
export async function castVoteOnChain(blockchainId, candidateIndex, voteHash, userId) {
    try {
        if (!userId) {
            throw new Error("userId is required for deterministic wallet derivation");
        }

        const userWallet = getUserWallet(userId);
        logger.info(`Queuing vote for election ${blockchainId} from user address ${userWallet.address}`);

        // Connect contracts to the user's specific wallet
        const userElectionContract = electionFactoryContract.connect(userWallet);
        const userVotingContract = votingContract.connect(userWallet);

        const bcResult = await txQueue.enqueue(async () => {
            // 0. Auto-fund user wallet if balance is low
            const balance = await provider.getBalance(userWallet.address);
            if (balance < ethers.parseEther("0.01")) { // Less than 0.01 ETH
                logger.info(`User wallet ${userWallet.address} has low balance (${ethers.formatEther(balance)} ETH). Topping up from admin...`);

                const fundTx = await adminWallet.sendTransaction({
                    to: userWallet.address,
                    value: ethers.parseEther("0.1") // Send 0.1 ETH
                });
                await fundTx.wait();
                logger.info(`Funded user wallet ${userWallet.address}. New balance should be sufficient.`);
            }

            // 1. Cast vote on election contract
            const tx1 = await userElectionContract.castVote(
                blockchainId,
                candidateIndex
            );
            await tx1.wait();

            // 2. Store vote hash on Voting contract
            const tx2 = await userVotingContract.storeVoteHash(
                blockchainId,
                voteHash
            );

            const receipt = await tx2.wait();

            return {
                success: true,
                txHash: receipt.hash,
                blockNumber: receipt.blockNumber
            };
        });

        return bcResult;
    } catch (error) {
        logger.error("Vote On-Chain Error:", error);
        throw error;
    }
}

/**
 * 🔍 VERIFY VOTE ON-CHAIN
 * @param {string} blockchainId 
 * @param {string} voteHash 
 */
export async function verifyVoteOnChain(blockchainId, voteHash) {
    try {
        const isRecorded = await votingContract.verifyVote(blockchainId, voteHash);
        return isRecorded;
    } catch (error) {
        logger.error("Verify Vote On-Chain Error:", error);
        throw error;
    }
}

/**
 * 🔍 CHECK IF USER HAS VOTED ON-CHAIN
 * Efficiently checks the mapping on the smart contract
 * @param {string} blockchainId 
 * @param {string} userId 
 */
export async function hasUserVotedOnChain(blockchainId, userId) {
    try {

        const userWallet = await getUserWallet(userId);

        if (!userWallet || !userWallet.address) {
            throw new Error("User wallet not found");
        }

        const hasVoted = await electionFactoryContract.hasVoted(
            BigInt(blockchainId),
            userWallet.address
        );

        return hasVoted;

    } catch (error) {

        logger.error("Has User Voted On-Chain Error:", error);

        throw error; // do not hide blockchain errors
    }
}

/**
 * 🔍 FIND VOTE EVENTS ON-CHAIN
 * Scans the blockchain for VoteCast and VoteHashStored events for a specific user
 * @param {string} blockchainId 
 * @param {string} userId
 */
export async function findVoteEventsOnChain(blockchainId, userId) {
    try {
        const userWallet = getUserWallet(userId);
        const userAddress = userWallet.address;
        const bId = ethers.getBigInt(blockchainId);

        logger.info(`Scanning blockchain for existing votes for user ${userAddress} in election ${blockchainId}...`);

        const currentBlock = await provider.getBlockNumber();
        const startBlock = Math.max(0, currentBlock - 10000);

        // 1. Find VoteCast event on ElectionFactory
        const castFilter = electionFactoryContract.filters.VoteCast(bId, userAddress);
        const castEvents = await electionFactoryContract.queryFilter(castFilter, startBlock);

        if (castEvents.length === 0) {
            logger.warn(`No VoteCast event found for user ${userAddress} in election ${blockchainId}`);
            return null;
        }

        // Get the latest one
        const lastCast = castEvents[castEvents.length - 1];
        const { candidateIndex, timestamp } = lastCast.args;

        // 2. Find VoteHashStored event on Voting contract
        // Note: VoteHashStored only indexes electionId and voteHash, not the sender.
        // We can filter by electionId, but we might get many results.
        const hashFilter = votingContract.filters.VoteHashStored(bId);
        const hashEvents = await votingContract.queryFilter(hashFilter, startBlock);

        // Since we don't have the hash indexed by user, we have to look for the tx that happened around the same time
        // or just find the one with the same tx hash if they were in the same tx (unlikely with txQueue)
        // Actually, our castVoteOnChain does TWO transactions (tx1.wait, then tx2.wait).
        // So they are different transactions.

        // Let's try to match by block number or proximity if possible, 
        // but better: our castVoteOnChain is sequential.

        let voteHash = "Unknown";
        // Attempt to find a hash event in the same or subsequent blocks
        const matchingHashEvent = hashEvents.find(e => e.blockNumber >= lastCast.blockNumber && e.blockNumber <= lastCast.blockNumber + 10);
        if (matchingHashEvent) {
            voteHash = matchingHashEvent.args.voteHash;
        }

        return {
            success: true,
            candidateIndex: Number(candidateIndex),
            timestamp: Number(timestamp) * 1000, // Convert to ms
            txHash: lastCast.transactionHash,
            blockNumber: lastCast.blockNumber,
            voteHash: voteHash
        };

    } catch (error) {
        logger.error("Find Vote Events On-Chain Error:", error);
        throw error;
    }
}

export default {
    createElectionOnChain,
    castVoteOnChain,
    verifyVoteOnChain,
    hasUserVotedOnChain,
    findVoteEventsOnChain
};