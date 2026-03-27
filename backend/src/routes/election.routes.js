import express from 'express';
import { protect, admin } from '../middleware/auth.middleware.js';
import { validateElectionSecurity } from '../middleware/security.middleware.js';
import blockchainGuard from '../middleware/blockchainGuard.middleware.js';
import electionController from '../modules/election/election.controller.js';

import electionAdminController from '../modules/election/election.admin.controller.js';
import upload from '../middleware/upload.middleware.js';

const router = express.Router();

// User & Basic Admin Routes
router.post('/', protect, validateElectionSecurity, blockchainGuard, electionController.createElection);
router.get('/', protect, admin, electionController.getAllElections);
router.post('/upload', protect, upload.single('image'), electionController.uploadImage);
router.post('/join', protect, electionController.joinElection);

router.get('/my', protect, electionController.getMyElections);
router.post('/rejoin/:id', protect, electionController.rejoinElection);
router.post('/:id/leave', protect, electionController.leaveElection);
router.get('/:id', protect, electionController.getElectionById);
router.patch('/:id/integrate', protect, admin, electionController.integrateElection);
router.patch('/:id', protect, electionController.updateElection);
router.post('/:id/candidates', protect, upload.single('image'), electionController.addCandidate);
router.put('/:id/candidates/:candidateId', protect, upload.single('image'), electionController.updateCandidate);
router.delete('/:id/candidates/:candidateId', protect, electionController.removeCandidate);
router.delete('/:id/participants/:userId', protect, electionController.removeParticipant);
router.delete('/:id', protect, electionController.deleteElection);
router.post('/:id/add-owner', protect, electionController.addAdmin);
router.post('/:id/invite-voter', protect, electionController.inviteVoter);

// Advanced Admin (Election Wizard)
router.post('/draft', protect, admin, electionAdminController.createDraft);
router.post('/:id/candidates', protect, admin, upload.single('image'), electionAdminController.addCandidate);
router.put('/:id/candidates/:candidateId', protect, admin, upload.single('image'), electionAdminController.updateCandidate);
router.delete('/:id/candidates/:candidateId', protect, admin, electionAdminController.removeCandidate);
router.put('/:id/publish', protect, admin, electionAdminController.publishElection);
router.patch('/:id/status', protect, admin, electionAdminController.updateStatus);
router.delete('/:id', protect, admin, electionAdminController.deleteElection);

export default router;
