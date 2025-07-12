
import { Question, Answer } from '../types';

const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
    throw new Error("Missing API URL. Please set VITE_API_URL in your .env file.");
}

type ClerkAuth = {
    getToken: (options: { template?: string }) => Promise<string | null>;
};

const getHeaders = async (auth: ClerkAuth) => {
    const token = await auth.getToken({ template: 'default' });
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

// --- Questions API ---

export const getQuestions = async (searchQuery: string = ''): Promise<Question[]> => {
    const response = await fetch(`${API_URL}/questions?q=${encodeURIComponent(searchQuery)}`);
    if (!response.ok) throw new Error('Failed to fetch questions');
    return response.json();
};

export const getQuestion = async (id: string): Promise<Question> => {
    const response = await fetch(`${API_URL}/questions/${id}`);
    if (!response.ok) throw new Error('Failed to fetch question');
    return response.json();
};

export const createQuestion = async (
    auth: ClerkAuth,
    title: string,
    body: string,
    tags: string[]
): Promise<Question> => {
    const response = await fetch(`${API_URL}/questions`, {
        method: 'POST',
        headers: await getHeaders(auth),
        body: JSON.stringify({ title, body, tags })
    });
    if (!response.ok) throw new Error('Failed to create question');
    return response.json();
};

// --- Answers API ---

export const createAnswer = async (
    auth: ClerkAuth,
    questionId: string,
    body: string
): Promise<Question> => {
    const response = await fetch(`${API_URL}/questions/${questionId}/answers`, {
        method: 'POST',
        headers: await getHeaders(auth),
        body: JSON.stringify({ body })
    });
    if (!response.ok) throw new Error('Failed to post answer');
    return response.json();
};

export const voteOnAnswer = async (
    auth: ClerkAuth,
    questionId: string,
    answerId: string,
    voteDirection: 'up' | 'down'
): Promise<Question> => {
    const response = await fetch(`${API_URL}/questions/${questionId}/answers/${answerId}/vote`, {
        method: 'PATCH',
        headers: await getHeaders(auth),
        body: JSON.stringify({ voteDirection })
    });
    if (!response.ok) throw new Error('Failed to vote');
    return response.json();
};

export const acceptAnswer = async (
    auth: ClerkAuth,
    questionId: string,
    answerId: string
): Promise<Question> => {
    const response = await fetch(`${API_URL}/questions/${questionId}/answers/${answerId}/accept`, {
        method: 'PATCH',
        headers: await getHeaders(auth)
    });
    if (!response.ok) throw new Error('Failed to accept answer');
    return response.json();
};