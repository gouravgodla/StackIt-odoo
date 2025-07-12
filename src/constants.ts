import { Author, Question } from './types';

export const USERS: Author[] = [
  { id: 'u1', name: 'Alice', avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704d' },
  { id: 'u2', name: 'Bob', avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026705d' },
  { id: 'u3', name: 'Charlie', avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026706d' },
];

export const MOCK_QUESTIONS: Question[] = [
  {
    _id: 'q1',
    title: 'How to join 2 columns in a data set to make a separate column in SQL?',
    body: `<p>I do not know the code for it as I am a beginner. As an example what I need to do is like there is a column 1 containing First name, and column 2 consists of last name I want a column to combine both. For instance:</p><p><strong>Column 1:</strong> John</p><p><strong>Column 2:</strong> Smith</p><p><strong>Desired Result:</strong> John Smith</p><p>Any help would be greatly appreciated!</p>`,
    author: USERS[0],
    tags: ['sql', 'database', 'query'],
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    answers: [
      {
        _id: 'a1',
        author: USERS[1],
        body: `<p>You can use the <code>CONCAT</code> function in most SQL dialects.</p><pre class="ql-syntax" spellcheck="false">SELECT CONCAT(first_name, ' ', last_name) AS full_name FROM your_table;
</pre><p>In SQL Server, you might use the <code>+</code> operator:</p><pre class="ql-syntax" spellcheck="false">SELECT first_name + ' ' + last_name AS full_name FROM your_table;
</pre>`,
        votes: 15,
        voters: {
          up: Array.from({ length: 15 }, (_, i) => `voter-up-${i}`),
          down: [],
        },
        isAccepted: true,
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      },
      {
        _id: 'a2',
        author: USERS[2],
        body: `<p>Another common way, especially in PostgreSQL and Oracle, is using the concatenation operator <code>||</code>.</p><pre class="ql-syntax" spellcheck="false">SELECT first_name || ' ' || last_name AS full_name FROM your_table;
</pre>`,
        votes: 5,
        voters: {
          up: Array.from({ length: 5 }, (_, i) => `voter-up-2-${i}`),
          down: [],
        },
        isAccepted: false,
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      },
    ],
  },
  {
    _id: 'q2',
    title: 'What is the difference between `let`, `const`, and `var` in JavaScript?',
    body: `<p>I'm new to JavaScript (coming from Python) and I'm confused about the different ways to declare variables. I've seen <code>var</code>, <code>let</code>, and <code>const</code> being used. What are the key differences and which one should I use by default?</p>`,
    author: USERS[2],
    tags: ['javascript', 'es6', 'variables'],
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    answers: [
      {
        _id: 'a3',
        author: USERS[0],
        body: `<p>Great question! Here's a breakdown:</p>
        <ul>
            <li><code>var</code>: Function-scoped. It's the old way. Variables declared with <code>var</code> are hoisted to the top of their function scope, which can lead to confusing behavior. Generally, you should avoid using <code>var</code> in modern JS.</li>
            <li><code>let</code>: Block-scoped. This is the new <code>var</code>. It's limited to the block (<code>{...}</code>) it's defined in. It's not hoisted in the same confusing way as <code>var</code>. Use this when you need to reassign a variable.</li>
            <li><code>const</code>: Block-scoped, like <code>let</code>, but its value cannot be reassigned. This doesn't mean the value is immutable (e.g., you can still change properties of a const object), but the variable itself cannot be pointed to a new value.</li>
        </ul>
        <p><strong>Recommendation:</strong> Use <code>const</code> by default. If you know you need to reassign the variable, use <code>let</code>.</p>`,
        votes: 42,
        voters: {
          up: Array.from({ length: 42 }, (_, i) => `voter-up-3-${i}`),
          down: [],
        },
        isAccepted: true,
        createdAt: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(),
      },
    ],
  },
  {
    _id: 'q3',
    title: 'How to center a div in CSS?',
    body: '<p>This feels like a question that has been asked a million times, but I can never remember all the ways. What is the modern, recommended way to center a div both horizontally and vertically?</p>',
    author: USERS[1],
    tags: ['css', 'flexbox', 'grid'],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    answers: [],
  }
];