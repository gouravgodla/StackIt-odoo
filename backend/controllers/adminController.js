import Question from '../models/questionModel.js';
import { clerkClient } from '@clerk/clerk-sdk-node';

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Admin
export const getStats = async (req, res) => {
    try {
        const totalUsers = await clerkClient.users.getCount();
        const totalQuestions = await Question.countDocuments();
        
        // To count all answers, we must aggregate them from all questions
        const answerStats = await Question.aggregate([
            { $project: { answerCount: { $size: "$answers" } } },
            { $group: { _id: null, totalAnswers: { $sum: "$answerCount" } } }
        ]);
        
        const totalAnswers = answerStats.length > 0 ? answerStats[0].totalAnswers : 0;
        
        res.status(200).json({ totalUsers, totalQuestions, totalAnswers });
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Admin
export const getUsers = async (req, res) => {
    try {
        // Fetch users sorted by creation date
        const userList = await clerkClient.users.getUserList({ orderBy: '-created_at' });
        // In Clerk SDK v5, getUserList returns a paginated response object. The array is in the .data property.
        res.status(200).json(userList.data);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};