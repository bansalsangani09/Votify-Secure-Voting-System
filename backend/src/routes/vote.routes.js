import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import blockchainGuard from '../middleware/blockchainGuard.middleware.js';
import voteController from '../modules/vote/vote.controller.js';

const router = express.Router();

router.post('/', protect, blockchainGuard, voteController.castVote);

export default router;
