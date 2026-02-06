import React, { useEffect, useState } from 'react';
import { getEmails, getCurrentUser, toggleStar } from '../api';
import { Star, Filter, RefreshCw, Search, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { clsx } from 'clsx';

export const History = ({ refreshTrigger, filter }: { refreshTrigger: number, filter: 'PENDING' | 'SENT' | 'STARRED' }) => {
    const [emails, setEmails] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [starredFilter, setStarredFilter] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchEmails = async () => {
        try {
            setLoading(true);
            const user = getCurrentUser();
            const res = await getEmails(user.email);
            setEmails(res.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmails();
        const interval = setInterval(fetchEmails, 10000);
        return () => clearInterval(interval);
    }, [refreshTrigger]);

    const handleStarToggle = async (e: React.MouseEvent, id: string, currentStatus: boolean) => {
        e.stopPropagation();
        // Optimistic update
        setEmails(prev => prev.map(email =>
            email.id === id ? { ...email, isStarred: !currentStatus } : email
        ));

        try {
            await toggleStar(id, !currentStatus);
        } catch (err) {
            console.error("Failed to toggle star", err);
            // Revert on failure
            setEmails(prev => prev.map(email =>
                email.id === id ? { ...email, isStarred: currentStatus } : email
            ));
        }
    };

    const filteredEmails = emails.filter(e => {
        const matchesSearch = searchQuery === '' ||
            e.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
            e.recipient.toLowerCase().includes(searchQuery.toLowerCase());

        if (!matchesSearch) return false;

        if (starredFilter) return e.isStarred;
        if (filter === 'PENDING') return e.status === 'PENDING' || e.status === 'Processing' || e.status === 'RESCHEDULED';
        if (filter === 'SENT') return e.status === 'SENT' || e.status === 'FAILED';
        return true;
    });

    useEffect(() => {
        if (filter === 'STARRED') {
            setStarredFilter(true);
        } else {
            setStarredFilter(false);
        }
    }, [filter]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return 'bg-orange-100 text-orange-600';
            case 'SENT': return 'bg-green-100 text-green-600';
            case 'FAILED': return 'bg-red-100 text-red-600';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg text-sm outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                </div>
                <div className="flex items-center space-x-2 text-gray-400">
                    <button onClick={() => setStarredFilter(!starredFilter)} className={clsx("p-2 rounded-full", starredFilter ? "text-yellow-400 bg-yellow-50" : "hover:bg-gray-50")}><Filter className="w-4 h-4" /></button>
                    <button onClick={fetchEmails} className={clsx("p-2 hover:bg-gray-50 rounded-full transition-all", loading && "animate-spin text-emerald-500")}><RefreshCw className="w-4 h-4" /></button>
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
                {filteredEmails.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        {loading ? (
                            <div className="flex flex-col items-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mb-2"></div>
                                <p className="text-xs">Loading...</p>
                            </div>
                        ) : (
                            <>
                                <p className="mb-2">No emails found in {starredFilter ? 'starred' : filter.toLowerCase()} box.</p>
                                {filter === 'PENDING' && (
                                    <p className="text-xs text-indigo-400 cursor-pointer hover:underline">Draft a new campaign?</p>
                                )}
                            </>
                        )}
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {filteredEmails.map((email) => (
                            <div key={email.id} className="group px-6 py-4 hover:bg-gray-50 cursor-pointer transition flex items-start gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center gap-3">
                                            <span className="font-medium text-gray-900">To: {email.recipient}</span>
                                            <span className={clsx("px-2 py-0.5 rounded-full text-xs font-medium border border-transparent", getStatusColor(email.status))}>
                                                {filter === 'SENT' && email.sentAt
                                                    ? format(new Date(email.sentAt), 'MMM d, h:mm a')
                                                    : format(new Date(email.scheduledAt), 'MMM d, h:mm a')}
                                            </span>
                                        </div>
                                        <button
                                            onClick={(e) => handleStarToggle(e, email.id, email.isStarred)}
                                            className={clsx("hover:scale-110 transition-transform", email.isStarred ? "text-yellow-400 fill-yellow-400" : "text-gray-300 hover:text-yellow-400")}
                                        >
                                            <Star className="w-4 h-4" fill={email.isStarred ? "currentColor" : "none"} />
                                        </button>
                                    </div>
                                    <h4 className="text-sm font-medium text-gray-800 mb-1 truncate">{email.subject}</h4>
                                    <p className="text-sm text-gray-500 truncate">{email.body.substring(0, 100)}...</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
