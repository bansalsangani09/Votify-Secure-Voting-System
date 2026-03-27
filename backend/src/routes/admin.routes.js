import express from 'express';
import { protect, admin } from '../middleware/auth.middleware.js';
import adminController from '../modules/admin/admin.controller.js';
import monitoringController from '../modules/admin/monitoring.controller.js';
import blockchainController from '../modules/admin/blockchain.controller.js';
import electionController from '../modules/election/election.controller.js';
import userController from '../modules/user/user.controller.js';
import auditController from '../modules/audit/audit.controller.js';

const router = express.Router();

// Dashboard & Stats
router.get('/dashboard', protect, admin, adminController.getDashboardStats);
router.get('/audit-logs', protect, admin, auditController.getLogs);
router.get('/audit', protect, admin, auditController.getLogs); // New alias

// Monitoring
router.get('/monitoring/live', protect, admin, monitoringController.getLiveMonitoring);
router.get('/monitoring/active-elections', protect, admin, adminController.getActiveMonitoringElections);

// Blockchain
router.get('/blockchain/records', protect, admin, blockchainController.getBlockchainRecords);
router.post('/blockchain/verify', protect, admin, blockchainController.verifyChain);

// Elections Management
router.get('/elections', protect, admin, electionController.getAllElections);
router.get('/elections/:id', protect, admin, electionController.getElectionById);
router.get('/results/:id', protect, admin, adminController.getElectionResults);

// Voters & Owners Management
router.get('/voters', protect, admin, userController.getVoters);
router.post('/voters', protect, admin, userController.createVoter);
router.get('/voters/:id/profile', protect, admin, userController.getVoterProfile);
router.patch('/voters/:id/status', protect, admin, userController.updateVoterStatus);
router.post('/voters/:id/remove-from-election', protect, admin, userController.removeFromElection);

router.get('/owners', protect, admin, userController.getOwners);
router.patch('/owners/:id/status', protect, admin, userController.updateOwnerStatus);
router.get('/owners/:id/profile', protect, admin, userController.getOwnerProfile);
router.delete('/owners/:id', protect, admin, userController.deleteOwner);
router.delete('/voters/:id', protect, admin, userController.removeVoter);

// Settings
router.get('/settings', protect, admin, adminController.getSettings);
router.post('/settings', protect, admin, adminController.updateSettings);
router.post('/transfer-ownership', protect, admin, adminController.transferOwnership);
router.post('/wipe-data', protect, admin, adminController.wipeSystemData);

export default router;
