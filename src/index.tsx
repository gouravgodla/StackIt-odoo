import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import 'react-quill/dist/quill.snow.css';
import { ClerkProvider } from '@clerk/clerk-react';
import { HashRouter, useNavigate } from 'react-router-dom';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key. Please set VITE_CLERK_PUBLISHABLE_KEY in your .env file.");
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const ClerkProviderWithNavigate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const navigate = useNavigate();
    return (
        <ClerkProvider
            routerPush={(to) => navigate(to)}
            routerReplace={(to) => navigate(to, { replace: true })}
            publishableKey={PUBLISHABLE_KEY}
        >
            {children}
        </ClerkProvider>
    );
};

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
      <HashRouter>
          <ClerkProviderWithNavigate>
              <App />
          </ClerkProviderWithNavigate>
      </HashRouter>
  </React.StrictMode>
);
