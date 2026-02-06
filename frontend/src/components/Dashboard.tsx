import React, { useState } from 'react';
import { Stats } from './Stats';
import { Compose } from './Compose';
import { History } from './History';
import { LogOut, User } from 'lucide-react';
import { getCurrentUser } from '../api';

export const Dashboard = ({ onLogout }: { onLogout: () => void }) => {
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const user = getCurrentUser();

    const handleScheduled = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                        Reachinbox AI Mail
                    </h1>

                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            {user.picture ? (
                                <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full" />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                                    {user.name.charAt(0)}
                                </div>
                            )}
                            <div className="hidden md:block text-sm">
                                <p className="font-medium text-slate-700">{user.name}</p>
                                <p className="text-xs text-slate-500">{user.email}</p>
                            </div>
                        </div>
                        <button
                            onClick={onLogout}
                            className="p-2 text-slate-400 hover:text-red-500 transition"
                            title="Logout"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Stats />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1">
                        <Compose onSuccess={handleScheduled} />
                    </div>
                    <div className="lg:col-span-2">
                        <History refreshTrigger={refreshTrigger} />
                    </div>
                </div>
            </main>
        </div>
    );
};
