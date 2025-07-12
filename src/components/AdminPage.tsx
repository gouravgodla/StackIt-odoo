
import React, { useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { AdminStats, ClerkUser } from '../types';
import * as apiService from '../services/apiService';
import { UsersIcon, FileQuestionIcon, MessageSquareIcon } from './icons';

type Tab = 'dashboard' | 'users';

const StatCard: React.FC<{ title: string; value: number | string; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-gray-800 p-6 rounded-lg flex items-center gap-4">
        <div className="bg-gray-700 p-3 rounded-full">
            {icon}
        </div>
        <div>
            <p className="text-gray-400 text-sm font-medium">{title}</p>
            <p className="text-3xl font-bold text-white">{value}</p>
        </div>
    </div>
);

const AdminDashboard: React.FC<{ stats: AdminStats | null }> = ({ stats }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
            title="Total Users" 
            value={stats?.totalUsers ?? '...'} 
            icon={<UsersIcon className="w-6 h-6 text-sky-400"/>}
        />
        <StatCard 
            title="Total Questions" 
            value={stats?.totalQuestions ?? '...'}
            icon={<FileQuestionIcon className="w-6 h-6 text-green-400"/>}
        />
        <StatCard 
            title="Total Answers" 
            value={stats?.totalAnswers ?? '...'}
            icon={<MessageSquareIcon className="w-6 h-6 text-yellow-400"/>}
        />
    </div>
);

const UserManagement: React.FC<{ users: ClerkUser[]; loading: boolean }> = ({ users, loading }) => {
    const renderTableBody = () => {
        if (loading) {
            return Array.from({ length: 5 }).map((_, index) => (
                <tr key={index} className="border-b border-gray-700 animate-pulse">
                    <td className="px-6 py-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-700"></div>
                        <div>
                            <div className="h-4 w-24 bg-gray-700 rounded"></div>
                            <div className="h-3 w-32 bg-gray-700 rounded mt-2"></div>
                        </div>
                    </td>
                    <td className="px-6 py-4">
                        <div className="h-5 w-16 bg-gray-700 rounded-full"></div>
                    </td>
                    <td className="px-6 py-4">
                        <div className="h-4 w-20 bg-gray-700 rounded"></div>
                    </td>
                </tr>
            ));
        }

        if (users.length === 0) {
            return (
                <tr>
                    <td colSpan={3} className="text-center py-10 text-gray-400">
                        No users found.
                    </td>
                </tr>
            );
        }

        return users.map(user => (
            <tr key={user.id} className="border-b border-gray-700 hover:bg-gray-700/40">
                <td className="px-6 py-4 font-medium text-white flex items-center gap-3">
                    <img src={user.imageUrl} alt={user.firstName || user.username || ''} className="w-10 h-10 rounded-full" />
                    <div>
                        <div>{user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : (user.username || 'N/A')}</div>
                        <div className="text-gray-400 text-xs">{user.emailAddresses[0]?.emailAddress || 'No email'}</div>
                    </div>
                </td>
                <td className="px-6 py-4">
                    {user.publicMetadata.role === 'admin' ? (
                        <span className="bg-sky-500/20 text-sky-300 text-xs font-medium px-2.5 py-0.5 rounded-full">Admin</span>
                    ) : (
                        <span className="bg-gray-600/50 text-gray-300 text-xs font-medium px-2.5 py-0.5 rounded-full">User</span>
                    )}
                </td>
                <td className="px-6 py-4">
                    {new Date(user.createdAt).toLocaleDateString()}
                </td>
            </tr>
        ));
    };

    return (
        <div className="bg-gray-800 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left text-gray-300">
                    <thead className="bg-gray-700/50 text-xs text-gray-400 uppercase">
                        <tr>
                            <th scope="col" className="px-6 py-3">User</th>
                            <th scope="col" className="px-6 py-3">Role</th>
                            <th scope="col" className="px-6 py-3">Joined</th>
                        </tr>
                    </thead>
                    <tbody>
                        {renderTableBody()}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export const AdminPage: React.FC = () => {
    const { getToken } = useAuth();
    const { user } = useUser();
    const isAdmin = (user?.publicMetadata as { role?: string })?.role === 'admin';
    const [activeTab, setActiveTab] = useState<Tab>('dashboard');
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [users, setUsers] = useState<ClerkUser[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isAdmin) return;

        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                if (activeTab === 'dashboard') {
                    if (!stats) { // fetch only if not already loaded
                       const statsData = await apiService.getAdminStats({ getToken });
                       setStats(statsData);
                    }
                } else if (activeTab === 'users') {
                    if (users.length === 0) { // fetch only if not already loaded
                        const usersData = await apiService.getAdminUsers({ getToken });
                        setUsers(usersData);
                    }
                }
            } catch (err: any) {
                setError(err.message || 'Failed to fetch admin data.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [isAdmin, getToken, activeTab, stats, users]);

    if (!isAdmin) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8 text-center">
                <h1 className="text-3xl font-bold text-red-500">Access Denied</h1>
                <p className="text-gray-400 mt-2">You do not have permission to view this page.</p>
            </div>
        );
    }
    
    const renderContent = () => {
        if (loading && activeTab === 'dashboard' && !stats) return <div className="text-center py-10">Loading...</div>;
        if (error) return <div className="text-center py-10 bg-red-900/20 text-red-300 rounded-lg p-4">{error}</div>;

        switch(activeTab) {
            case 'dashboard':
                return <AdminDashboard stats={stats} />;
            case 'users':
                return <UserManagement users={users} loading={loading} />;
            default:
                return null;
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-white mb-6">Admin Control Panel</h1>

            <div className="mb-6 border-b border-gray-700">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab('dashboard')}
                        className={`${
                            activeTab === 'dashboard'
                                ? 'border-sky-500 text-sky-400'
                                : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                    >
                        Dashboard
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`${
                            activeTab === 'users'
                                ? 'border-sky-500 text-sky-400'
                                : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                    >
                        Users
                    </button>
                </nav>
            </div>

            <div>{renderContent()}</div>
        </div>
    );
};