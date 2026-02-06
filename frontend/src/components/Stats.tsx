import React, { useEffect, useState } from 'react';
import { getStats, getCurrentUser } from '../api';
import { Clock, Send, AlertTriangle } from 'lucide-react';

export const Stats = () => {
    const [stats, setStats] = useState({ pending: 0, sent: 0, failed: 0 });

    const fetchStats = async () => {
        try {
            const user = getCurrentUser();
            const res = await getStats(user.email);
            setStats(res.data);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchStats();
        const interval = setInterval(fetchStats, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center">
                <div className="p-3 bg-blue-50 rounded-lg mr-4">
                    <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                    <p className="text-sm text-slate-500 font-medium">Scheduled</p>
                    <p className="text-2xl font-bold text-slate-800">{stats.pending}</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center">
                <div className="p-3 bg-green-50 rounded-lg mr-4">
                    <Send className="w-6 h-6 text-green-600" />
                </div>
                <div>
                    <p className="text-sm text-slate-500 font-medium">Sent</p>
                    <p className="text-2xl font-bold text-slate-800">{stats.sent}</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center">
                <div className="p-3 bg-red-50 rounded-lg mr-4">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                    <p className="text-sm text-slate-500 font-medium">Failed</p>
                    <p className="text-2xl font-bold text-slate-800">{stats.failed}</p>
                </div>
            </div>
        </div>
    );
};
