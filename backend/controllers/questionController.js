
import Question from '../models/questionModel.js';
import { clerkClient } from '@clerk/clerk-sdk-node';

// @desc    Get all questions, with optional search and pagination
// @route   GET /api/questions
// @access  Public
export const getQuestions = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 5;
        const searchQuery = req.query.q || '';
        const filter = req.query.filter || 'Newest';

        let query = {};
        
        // Use text index for search if a query is provided
        if (searchQuery) {
            query.$text = { $search: searchQuery };
        }
        
        // Add filter for unanswered questions
        if (filter === 'Unanswered') {
            query.answers = { $size: 0 };
        }

        const count = await Question.countDocuments(query);
        const questions = await Question.find(query)
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip(limit * (page - 1));

        res.status(200).json({
            questions,
            page,
            totalPages: Math.ceil(count / limit),
            totalQuestions: count
        });

    } catch (error) {
        console.error("Error in getQuestions:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get a single question by ID
// @route   GET /api/questions/:id
// @access  Public
export const getQuestionById = async (req, res) => {
    try {
        const question = await Question.findById(req.params.id);
        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }
        res.status(200).json(question);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create a new question
// @route   POST /api/questions
// @access  Private
export const createQuestion = async (req, res) => {
    if (!req.auth.userId) {
        return res.status(401).json({ message: 'Unauthenticated' });
    }

    try {
        const { title, body, tags } = req.body;
        if (!title || !body || !tags) {
            return res.status(400).json({ message: 'Please provide all fields' });
        }
        
        const user = await clerkClient.users.getUser(req.auth.userId);
        
        const author = {
            id: user.id,
            name: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.username || 'Anonymous',
            avatarUrl: user.imageUrl,
        }

        const newQuestion = new Question({
            title,
            body,
            tags,
            author,
        });

        const savedQuestion = await newQuestion.save();
        res.status(201).json(savedQuestion);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create a new answer for a question
// @route   POST /api/questions/:id/answers
// @access  Private
export const createAnswer = async (req, res) => {
     if (!req.auth.userId) {
        return res.status(401).json({ message: 'Unauthenticated' });
    }

    try {
        const { body } = req.body;
        if (!body) {
            return res.status(400).json({ message: 'Answer body cannot be empty' });
        }

        const question = await Question.findById(req.params.id);
        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        const user = await clerkClient.users.getUser(req.auth.userId);
        const author = {
            id: user.id,
            name: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.username || 'Anonymous',
            avatarUrl: user.imageUrl,
        }

        const newAnswer = { body, author };

        question.answers.unshift(newAnswer);
        await question.save();

        res.status(201).json(question);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Vote on an answer
// @route   PATCH /api/questions/:questionId/answers/:answerId/vote
// @access  Private
export const voteOnAnswer = async (req, res) => {
    if (!req.auth.userId) {
        return res.status(401).json({ message: 'Unauthenticated' });
    }
    
    const { voteDirection } = req.body; // 'up' or 'down'
    const userId = req.auth.userId;

    try {
        const question = await Question.findById(req.params.questionId);
        if (!question) return res.status(404).json({ message: 'Question not found' });

        const answer = question.answers.id(req.params.answerId);
        if (!answer) return res.status(404).json({ message: 'Answer not found' });

        const upVoteIndex = answer.voters.up.indexOf(userId);
        const downVoteIndex = answer.voters.down.indexOf(userId);

        if (voteDirection === 'up') {
            if (upVoteIndex > -1) { // User wants to remove upvote
                answer.voters.up.splice(upVoteIndex, 1);
            } else { // User wants to add upvote
                answer.voters.up.push(userId);
                if (downVoteIndex > -1) { // Remove downvote if it exists
                    answer.voters.down.splice(downVoteIndex, 1);
                }
            }
        } else if (voteDirection === 'down') {
            if (downVoteIndex > -1) { // User wants to remove downvote
                 answer.voters.down.splice(downVoteIndex, 1);
            } else { // User wants to add downvote
                answer.voters.down.push(userId);
                if (upVoteIndex > -1) { // Remove upvote if it exists
                    answer.voters.up.splice(upVoteIndex, 1);
                }
            }
        }

        answer.votes = answer.voters.up.length - answer.voters.down.length;
        
        await question.save();
        res.status(200).json(question);

    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Accept an answer
// @route   PATCH /api/questions/:questionId/answers/:answerId/accept
// @access  Private
export const acceptAnswer = async (req, res) => {
    if (!req.auth.userId) {
        return res.status(401).json({ message: 'Unauthenticated' });
    }

    try {
        const question = await Question.findById(req.params.questionId);
        if (!question) return res.status(404).json({ message: 'Question not found' });
        
        // Only the question author can accept an answer
        if (question.author.id !== req.auth.userId) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const answer = question.answers.id(req.params.answerId);
        if (!answer) return res.status(404).json({ message: 'Answer not found' });

        const currentAcceptedStatus = answer.isAccepted;
        
        // Un-accept any previously accepted answer
        question.answers.forEach(ans => ans.isAccepted = false);
        
        // Toggle the selected answer
        answer.isAccepted = !currentAcceptedStatus;

        await question.save();
        res.status(200).json(question);

    } catch(error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete a question
// @route   DELETE /api/questions/:id
// @access  Private/Admin
export const deleteQuestion = async (req, res) => {
    try {
        const question = await Question.findById(req.params.id);
        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        await Question.deleteOne({ _id: req.params.id });

        res.status(200).json({ message: 'Question removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete an answer from a question
// @route   DELETE /api/questions/:questionId/answers/:answerId
// @access  Private/Admin
export const deleteAnswer = async (req, res) => {
    try {
        const question = await Question.findById(req.params.questionId);
        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        const answer = question.answers.id(req.params.answerId);
        if (!answer) {
            return res.status(404).json({ message: 'Answer not found' });
        }

        // Mongoose subdocuments have a remove() method.
        await answer.deleteOne();
        
        await question.save();

        res.status(200).json(question);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
