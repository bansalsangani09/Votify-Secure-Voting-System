import express from 'express';
import { checkBlockchainHealth } from '../services/blockchainHealth.service.js';

const router = express.Router();

/**
 * @desc    Get system and blockchain health
 * @route   GET /api/health/blockchain
 * @access  Public
 */
router.get('/blockchain', async (req, res) => {
    const health = await checkBlockchainHealth();

    if (health.status === 'disconnected') {
        return res.status(503).json({
            success: false,
            message: 'Blockchain node unavailable',
            data: health
        });
    }

    res.status(200).json({
        success: true,
        data: health
    });
});

export default router;
