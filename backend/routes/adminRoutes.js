
import express from 'express';
import { getStats, getUsers } from '../controllers/adminController.js';
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';
import { requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Chain of middleware: first require authentication, then require admin role
const adminChain = [ClerkExpressRequireAuth(), requireAdmin];

router.get('/stats', adminChain, getStats);
router.get('/users', adminChain, getUsers);

export default router;
