
import express from 'express';
import {
    getQuestions,
    getQuestionById,
    createQuestion,
    createAnswer,
    voteOnAnswer,
    acceptAnswer,
    deleteQuestion,
    deleteAnswer,
} from '../controllers/questionController.js';
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';
import { requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.route('/').get(getQuestions);
router.route('/:id').get(getQuestionById);

// Protected routes
router.route('/').post(ClerkExpressRequireAuth(), createQuestion);
router.route('/:id/answers').post(ClerkExpressRequireAuth(), createAnswer);
router.route('/:questionId/answers/:answerId/vote').patch(ClerkExpressRequireAuth(), voteOnAnswer);
router.route('/:questionId/answers/:answerId/accept').patch(ClerkExpressRequireAuth(), acceptAnswer);

// Admin routes
router.route('/:id').delete(ClerkExpressRequireAuth(), requireAdmin, deleteQuestion);
router.route('/:questionId/answers/:answerId').delete(ClerkExpressRequireAuth(), requireAdmin, deleteAnswer);


export default router;
