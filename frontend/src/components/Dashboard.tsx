import React, { useState, useEffect } from 'react';
import { Compose } from './Compose';
import { History } from './History';
import { LogOut, User, Send, Clock, Edit3, ChevronDown, Mail } from 'lucide-react';
import { getCurrentUser, getStats } from '../api';
import { clsx } from 'clsx';

export const Dashboard = ({ onLogout }: { onLogout: () => void }) => {
    const [view, setView] = useState<'INBOX' | 'SENT' | 'COMPOSE'>('INBOX');
    const [stats, setStats] = useState({ pending: 0, sent: 0 });
    const user = getCurrentUser();

    const [dropdownOpen, setDropdownOpen] = useState(false);

    // Fetch stats for sidebar counts
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await getStats(user.email);
                setStats(res.data);
            } catch (e) {
                console.error(e);
            }
        };
        fetchStats();
        const interval = setInterval(fetchStats, 10000);
        return () => clearInterval(interval);
    }, []);

    const handleScheduled = () => {
        setView('INBOX');
        // Trigger refresh if needed via context or simple timeout re-fetch
    };

    return (
        <div className="flex h-screen bg-white font-sans text-gray-900">
            {/* Sidebar */}
            <aside className="w-64 border-r border-gray-100 flex flex-col">
                {/* Logo */}
                <div className="h-16 flex items-center px-6 border-b border-gray-100">
                    <span className="font-bold text-2xl tracking-tighter">OMG</span>
                </div>

                {/* User Dropdown */}
                <div className="px-4 py-6 relative">
                    <div
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className="flex items-center justify-between p-2 rounded-lg bg-gray-50 border border-gray-100 cursor-pointer hover:bg-gray-100 transition"
                    >
                        <div className="flex items-center gap-3">
                            {user.picture ? (
                                <img src={user.picture} alt="User" className="w-8 h-8 rounded-full" />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                                    {user.name?.charAt(0)}
                                </div>
                            )}
                            <div className="overflow-hidden">
                                <p className="text-sm font-medium truncate w-24">{user.name}</p>
                                <p className="text-xs text-gray-500 truncate w-24">{user.email}</p>
                            </div>
                        </div>
                        <ChevronDown className={clsx("w-4 h-4 text-gray-400 transition-transform", dropdownOpen && "rotate-180")} />
                    </div>

                    {/* Dropdown Menu */}
                    {dropdownOpen && (
                        <div className="absolute top-24 left-4 right-4 bg-white border border-gray-100 shadow-xl rounded-lg z-50 overflow-hidden animation-fade-in">
                            <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                <User className="w-4 h-4" /> Profile
                            </button>
                            <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                <Mail className="w-4 h-4" /> Integrations
                            </button>
                            <div className="border-t border-gray-100 my-1"></div>
                            <button onClick={onLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                                <LogOut className="w-4 h-4" /> Logout
                            </button>
                        </div>
                    )}
                </div>

                {/* Compose Button */}
                <div className="px-4 mb-6">
                    <button
                        onClick={() => setView('COMPOSE')}
                        className="w-full py-3 flex items-center justify-center gap-2 border-2 border-emerald-500 rounded-full text-emerald-600 font-semibold hover:bg-emerald-50 transition"
                    >
                        <Edit3 className="w-4 h-4" />
                        Compose
                    </button>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-2 space-y-1">
                    <button
                        onClick={() => setView('INBOX')}
                        className={clsx(
                            "w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium rounded-lg transition",
                            view === 'INBOX' ? "bg-emerald-50 text-emerald-700" : "text-gray-600 hover:bg-gray-50"
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <Clock className="w-4 h-4" />
                            Scheduled
                        </div>
                        <span className={clsx("text-xs font-semibold px-2 py-0.5 rounded-full", view === 'INBOX' ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600")}>
                            {stats.pending}
                        </span>
                    </button>

                    <button
                        onClick={() => setView('SENT')}
                        className={clsx(
                            "w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium rounded-lg transition",
                            view === 'SENT' ? "bg-emerald-50 text-emerald-700" : "text-gray-600 hover:bg-gray-50"
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <Send className="w-4 h-4" />
                            Sent
                        </div>
                        <span className={clsx("text-xs font-semibold px-2 py-0.5 rounded-full", view === 'SENT' ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600")}>
                            {stats.sent}
                        </span>
                    </button>
                </nav>


            </aside>

            {/* Main Content */}
            <main className="flex-1 bg-white relative">
                {view === 'COMPOSE' && (
                    <div className="absolute inset-0 z-20">
                        <Compose onSuccess={handleScheduled} onClose={() => setView('INBOX')} />
                    </div>
                )}

                {view !== 'COMPOSE' && (
                    <History
                        refreshTrigger={0}
                        filter={view === 'INBOX' ? 'PENDING' : 'SENT'}
                    />
                )}
            </main>
        </div>
    );
};
