
export interface Author {
  id: string; // This will be the Clerk User ID
  name: string;
  avatarUrl: string;
}

export interface Answer {
  _id: string;
  author: Author;
  body: string;
  votes: number;
  voters: {
    up: string[];
    down: string[];
  };
  isAccepted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  _id: string;
  title: string;
  body: string;
  author: Author;
  tags: string[];
  answers: Answer[];
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  message: string;
  read: boolean;
  link: string;
}

export enum VoteDirection {
  UP = 'up',
  DOWN = 'down',
  NONE = 'none'
}

export interface AdminStats {
  totalUsers: number;
  totalQuestions: number;
  totalAnswers: number;
}

// Represents the detailed user object from Clerk's backend API
export interface ClerkUser {
  id: string;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string;
  publicMetadata: {
    role?: 'admin';
  };
  emailAddresses: {
    id: string;
    emailAddress: string;
  }[];
  createdAt: number; // timestamp
}
