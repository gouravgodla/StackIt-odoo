import express from 'express';
import {
    getQuestions,
    getQuestionById,
    createQuestion,
    createAnswer,
    voteOnAnswer,
    acceptAnswer,
} from '../controllers/questionController.js';
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';

const router = express.Router();

// Public routes
router.route('/').get(getQuestions);
router.route('/:id').get(getQuestionById);

// Protected routes
router.route('/').post(ClerkExpressRequireAuth(), createQuestion);
router.route('/:id/answers').post(ClerkExpressRequireAuth(), createAnswer);
router.route('/:questionId/answers/:answerId/vote').patch(ClerkExpressRequireAuth(), voteOnAnswer);
router.route('/:questionId/answers/:answerId/accept').patch(ClerkExpressRequireAuth(), acceptAnswer);


export default router;
