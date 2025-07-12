
import React, { useRef, useState, useEffect } from 'react';
import { Routes, Route, Link, NavLink, useNavigate } from 'react-router-dom';
import { HomePage } from './components/HomePage';
import { QuestionPage } from './components/QuestionPage';
import { AskQuestionPage } from './components/AskQuestionPage';
import { AdminPage } from './components/AdminPage'; // Import AdminPage
import { LogoIcon, BellIcon, SearchIcon, ShieldCheckIcon } from './components/icons';
import { SignInButton, SignedIn, SignedOut, UserButton, useUser } from '@clerk/clerk-react';
import { Notification } from './types';

const Header: React.FC = () => {
    const navigate = useNavigate();
    const { isSignedIn, user } = useUser();
    const isAdmin = (user?.publicMetadata as { role?: string })?.role === 'admin';
    const [headerSearchQuery, setHeaderSearchQuery] = useState('');
    const [isNotificationsOpen, setNotificationsOpen] = useState(false);
    const notificationsRef = useRef<HTMLDivElement>(null);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const unreadCount = notifications.filter(n => !n.read).length;

    const handleHeaderSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (headerSearchQuery.trim()) {
            navigate(`/?q=${encodeURIComponent(headerSearchQuery.trim())}`);
            setHeaderSearchQuery('');
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
                setNotificationsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    
    // In a real app, notifications would be fetched from the backend
    useEffect(() => {
      if (!isSignedIn) {
        setNotifications([]);
      }
    }, [isSignedIn]);

    return (
        <header className="bg-gray-800/80 backdrop-blur-md border-b border-gray-700 sticky top-0 z-40">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center space-x-4">
                        <Link to="/" className="flex items-center gap-2 text-white">
                            <LogoIcon className="h-8 w-8 text-sky-500"/>
                            <span className="text-xl font-bold">StackIt</span>
                        </Link>
                        <NavLink to="/" className={({isActive}) => `px-3 py-2 rounded-md text-sm font-medium ${isActive ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}>Home</NavLink>
                    </div>
                    
                    <div className="flex-1 max-w-lg mx-4">
                        <form onSubmit={handleHeaderSearch} className="relative">
                            <input
                                type="text"
                                placeholder="Search..."
                                value={headerSearchQuery}
                                onChange={(e) => setHeaderSearchQuery(e.target.value)}
                                className="w-full bg-gray-700/50 border border-transparent rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                            />
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"/>
                        </form>
                    </div>

                    <div className="flex items-center space-x-4">
                        <SignedIn>
                            {isAdmin && (
                                <Link to="/admin" className="p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-sky-400 transition-colors" title="Admin Panel">
                                    <ShieldCheckIcon className="h-6 w-6" />
                                </Link>
                            )}
                            <div className="relative" ref={notificationsRef}>
                                <button onClick={() => setNotificationsOpen(!isNotificationsOpen)} className="p-2 rounded-full hover:bg-gray-700 relative">
                                    <BellIcon className="h-6 w-6 text-gray-400"/>
                                    {unreadCount > 0 && <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-gray-800"></span>}
                                </button>
                                {isNotificationsOpen && (
                                    <div className="absolute right-0 mt-2 w-80 bg-gray-800 rounded-lg shadow-lg border border-gray-700">
                                       <div className="p-3 font-bold border-b border-gray-700">Notifications</div>
                                       <div className="py-1 max-h-96 overflow-y-auto">
                                           {notifications.length > 0 ? notifications.map(n => (
                                               <Link key={n.id} to={n.link} onClick={() => setNotificationsOpen(false)} className={`block px-4 py-2 text-sm ${n.read ? 'text-gray-400' : 'text-white'} hover:bg-gray-700`}>{n.message}</Link>
                                           )) : <div className="px-4 py-3 text-sm text-gray-400">No notifications yet.</div>}
                                       </div>
                                    </div>
                                )}
                            </div>
                            <UserButton afterSignOutUrl='/' />
                        </SignedIn>
                        <SignedOut>
                          <SignInButton mode="modal">
                            <button className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors">
                              Login
                            </button>
                          </SignInButton>
                        </SignedOut>
                    </div>
                </div>
            </nav>
        </header>
    );
};

const App: React.FC = () => {
    const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  
    if (!PUBLISHABLE_KEY) {
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4" role="alert">
            <p className="font-bold">Configuration Error</p>
            <p>Clerk publishable key is missing. Please set <code className="font-mono bg-yellow-200 px-1 rounded">VITE_CLERK_PUBLISHABLE_KEY</code> in your .env file.</p>
          </div>
        </div>
      );
    }
    
    return (
      <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/ask" element={<AskQuestionPage />} />
              <Route path="/question/:id" element={<QuestionPage />} />
              <Route path="/admin" element={<AdminPage />} />
            </Routes>
          </main>
      </div>
    );
};

export default App;
