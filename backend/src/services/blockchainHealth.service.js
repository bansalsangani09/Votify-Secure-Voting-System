import { ethers } from 'ethers';
import { provider, wallet } from '../config/blockchain.js';
import logger from '../utils/logger.util.js';

let isNodeHealthy = true;
let lastCheckTime = null;

/**
 * Perform a real-time check of the blockchain connection
 */
export const checkBlockchainHealth = async () => {
    try {
        const [blockNumber, balance, network] = await Promise.all([
            provider.getBlockNumber(),
            provider.getBalance(wallet.address),
            provider.getNetwork()
        ]);

        isNodeHealthy = true;
        lastCheckTime = new Date();

        return {
            status: 'connected',
            blockNumber,
            walletBalance: ethers.formatEther(balance),
            network: {
                name: network.name,
                chainId: network.chainId.toString()
            },
            timestamp: lastCheckTime
        };
    } catch (error) {
        isNodeHealthy = false;
        logger.error('Blockchain Health Check Failed', error);
        return {
            status: 'disconnected',
            error: error.message,
            timestamp: new Date()
        };
    }
};

/**
 * Returns the cached health status
 */
export const getBlockchainStatus = () => ({
    isHealthy: isNodeHealthy,
    lastCheck: lastCheckTime
});

/**
 * Start background monitoring of blockchain health
 * @param {number} intervalMs - Check interval in milliseconds
 */
export const startBlockchainMonitoring = (intervalMs = 30000) => {
    logger.info(`Starting blockchain health monitoring every ${intervalMs}ms`);

    // Initial check
    checkBlockchainHealth();

    setInterval(async () => {
        await checkBlockchainHealth();
    }, intervalMs);
};

export default { checkBlockchainHealth, getBlockchainStatus, startBlockchainMonitoring };
