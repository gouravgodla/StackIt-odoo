
import React, { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Question } from '../types';
import { SearchIcon, PlusIcon } from './icons';
import * as apiService from '../services/apiService';

interface QuestionListItemProps {
  question: Question;
}

const QuestionListItem: React.FC<QuestionListItemProps> = ({ question }) => {
  const timeAgo = (dateStr: string): string => {
    const date = new Date(dateStr);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
  };
  
  const bodySnippet = question.body.replace(/<[^>]*>?/gm, '').substring(0, 150) + '...';

  return (
    <div className="bg-gray-800 p-4 rounded-lg flex flex-col sm:flex-row gap-4">
      <div className="text-center flex-shrink-0 w-full sm:w-20 sm:order-first order-last mt-2 sm:mt-0">
          <div className="text-2xl font-bold">{question.answers.length}</div>
          <div className="text-sm text-gray-400">answers</div>
      </div>
      <div className="flex-grow">
        <Link to={`/question/${question._id}`} className="text-lg text-sky-400 hover:text-sky-300 transition-colors">
          {question.title}
        </Link>
        <p className="text-gray-400 mt-1 text-sm">{bodySnippet}</p>
        <div className="mt-3 flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div className="flex gap-2 flex-wrap">
            {question.tags.map(tag => (
              <span key={tag} className="bg-gray-700 text-sky-300 text-xs font-semibold px-2.5 py-0.5 rounded-full">{tag}</span>
            ))}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 flex-shrink-0 mt-2 sm:mt-0">
            <img src={question.author.avatarUrl} alt={question.author.name} className="w-6 h-6 rounded-full" />
            <span>{question.author.name}</span>
            <span>asked {timeAgo(question.createdAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};


export const HomePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('Newest');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [currentPage, setCurrentPage] = useState(1);
  const questionsPerPage = 5;
  
  useEffect(() => {
    const query = searchParams.get('q') || '';
    setSearchQuery(query);
    setLoading(true);
    apiService.getQuestions(query)
      .then(data => {
        setQuestions(data);
        setError(null);
      })
      .catch(err => {
        console.error(err);
        setError('Failed to load questions. Please try again later.');
      })
      .finally(() => setLoading(false));
  }, [searchParams]);

  const filteredQuestions = useMemo(() => {
    let sorted = [...questions];
    if (filter === 'Newest') {
      sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (filter === 'Unanswered') {
      sorted = sorted.filter(q => q.answers.length === 0);
    }
    // Search is now handled by the backend, but we can keep client-side search as a fallback if needed
    return sorted;
  }, [questions, filter]);
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  const handleSearchSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (searchQuery) {
          setSearchParams({ q: searchQuery }, { replace: true });
      } else {
          setSearchParams({}, { replace: true });
      }
  }


  const paginatedQuestions = useMemo(() => {
    const startIndex = (currentPage - 1) * questionsPerPage;
    return filteredQuestions.slice(startIndex, startIndex + questionsPerPage);
  }, [filteredQuestions, currentPage]);

  const totalPages = Math.ceil(filteredQuestions.length / questionsPerPage);

  const renderContent = () => {
    if (loading) {
      return Array.from({length: 3}).map((_, i) => (
        <div key={i} className="bg-gray-800 p-4 rounded-lg flex gap-4 animate-pulse">
          <div className="flex-shrink-0 w-20">
              <div className="h-8 w-12 bg-gray-700 rounded"></div>
              <div className="h-4 w-16 bg-gray-700 rounded mt-1"></div>
          </div>
          <div className="flex-grow">
              <div className="h-6 w-3/4 bg-gray-700 rounded"></div>
              <div className="h-4 w-full bg-gray-700 rounded mt-2"></div>
              <div className="h-4 w-1/2 bg-gray-700 rounded mt-1"></div>
          </div>
        </div>
      ));
    }

    if (error) {
      return <div className="text-center py-10 bg-red-900/20 text-red-300 rounded-lg">{error}</div>;
    }

    if (paginatedQuestions.length > 0) {
      return paginatedQuestions.map(q => <QuestionListItem key={q._id} question={q} />);
    }

    return (
      <div className="text-center py-10 bg-gray-800 rounded-lg">
        <h2 className="text-xl font-semibold">No Questions Found</h2>
        <p className="text-gray-400 mt-2">Try adjusting your search or filters, or be the first to ask!</p>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-white">All Questions</h1>
        <Link to="/ask" className="w-full md:w-auto bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors">
          <PlusIcon className="w-5 h-5" />
          Ask Question
        </Link>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex gap-2 border border-gray-700 rounded-lg p-1">
          {['Newest', 'Unanswered'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1 rounded-md text-sm font-medium transition-colors ${filter === f ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-800'}`}
            >
              {f}
            </button>
          ))}
        </div>
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Search questions..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        </form>
      </div>

      <div className="space-y-4">
        {renderContent()}
      </div>

      {totalPages > 1 && !loading && !error && (
        <div className="mt-8 flex justify-center items-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${currentPage === page ? 'bg-sky-500 text-white' : 'bg-gray-800 hover:bg-gray-700 text-gray-300'}`}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
