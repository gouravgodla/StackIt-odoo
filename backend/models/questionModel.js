
import mongoose from 'mongoose';

const AuthorSchema = new mongoose.Schema({
    id: { type: String, required: true }, // Clerk User ID
    name: { type: String, required: true },
    avatarUrl: { type: String, required: true }
}, { _id: false });

const AnswerSchema = new mongoose.Schema({
  body: { type: String, required: true },
  author: { type: AuthorSchema, required: true },
  votes: { type: Number, default: 0 },
  voters: {
      up: [{ type: String }],
      down: [{ type: String }]
  },
  isAccepted: { type: Boolean, default: false },
}, { timestamps: true });

const QuestionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  body: { type: String, required: true },
  tags: [{ type: String, required: true }],
  author: { type: AuthorSchema, required: true },
  answers: [AnswerSchema],
}, { timestamps: true });

// Create a text index for efficient searching on title, body, and tags
QuestionSchema.index({
    title: 'text',
    body: 'text',
    tags: 'text'
});


const Question = mongoose.model('Question', QuestionSchema);

export default Question;