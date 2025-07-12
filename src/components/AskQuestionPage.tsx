
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RichTextEditor } from './RichTextEditor';
import { useAuth, SignedIn, SignedOut } from '@clerk/clerk-react';
import * as apiService from '../services/apiService';

export const AskQuestionPage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { getToken } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    if (!title.trim() || !body.trim() || !tags.trim()) {
      setError('All fields are required.');
      setIsSubmitting(false);
      return;
    }

    const tagList = tags.split(',').map(tag => tag.trim()).filter(Boolean);
    if (tagList.length === 0) {
      setError('Please provide at least one tag.');
      setIsSubmitting(false);
      return;
    }

    try {
      const newQuestion = await apiService.createQuestion(
        { getToken },
        title,
        body,
        tagList
      );
      navigate(`/question/${newQuestion._id}`);
    } catch (err) {
      console.error(err);
      setError('Failed to post question. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-2">Ask a Public Question</h1>
      <div className="bg-gray-800 p-6 rounded-lg mt-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
              Title
            </label>
            <p className="text-xs text-gray-500 mb-2">Be specific and imagine you’re asking a question to another person.</p>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="e.g. How to center a div in CSS?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Body
            </label>
            <p className="text-xs text-gray-500 mb-2">Include all the information someone would need to answer your question.</p>
            <RichTextEditor value={body} onChange={setBody} placeholder="Describe your problem in detail..." />
          </div>

          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-300 mb-2">
              Tags
            </label>
             <p className="text-xs text-gray-500 mb-2">Add up to 5 tags to describe what your question is about. Use comma to separate tags.</p>
            <input
              type="text"
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="e.g. react,typescript,tailwind-css"
            />
          </div>
          
          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="flex justify-end">
             <SignedIn>
                <button
                  type="submit"
                  className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Posting...' : 'Post Your Question'}
                </button>
             </SignedIn>
             <SignedOut>
                <p className="text-yellow-400 text-sm text-right mt-2">You must be logged in to post a question.</p>
             </SignedOut>
          </div>
        </form>
      </div>
    </div>
  );
};
