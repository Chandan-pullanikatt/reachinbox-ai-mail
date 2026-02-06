import React, { useEffect, useState } from 'react';
import { getEmails, getCurrentUser } from '../api';
import { Clock, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { clsx } from 'clsx';

export const History = ({ refreshTrigger }: { refreshTrigger: number }) => {
    const [emails, setEmails] = useState<any[]>([]);

    const fetchEmails = async () => {
        try {
            const user = getCurrentUser();
            const res = await getEmails(user.email);
            setEmails(res.data);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchEmails();
        const interval = setInterval(fetchEmails, 5000); // Polling for updates
        return () => clearInterval(interval);
    }, [refreshTrigger]);

    const StatusBadge = ({ status }: { status: string }) => {
        const styles = {
            PENDING: 'bg-yellow-100 text-yellow-800',
            PROCESSING: 'bg-blue-100 text-blue-800',
            SENT: 'bg-green-100 text-green-800',
            FAILED: 'bg-red-100 text-red-800',
            RESCHEDULED: 'bg-purple-100 text-purple-800',
            CANCELLED: 'bg-gray-100 text-gray-800'
        }[status] || 'bg-gray-100 text-gray-800';

        return (
            <span className={clsx("px-2 py-1 rounded-full text-xs font-semibold", styles)}>
                {status}
            </span>
        );
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50">
                <h3 className="font-semibold text-slate-800">Email History & Schedule</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-medium">
                        <tr>
                            <th className="px-6 py-3">Recipient</th>
                            <th className="px-6 py-3">Subject</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Scheduled At</th>
                            <th className="px-6 py-3">Sent At</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {emails.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                                    No emails scheduled yet. Let's get started!
                                </td>
                            </tr>
                        ) : (
                            emails.map((email) => (
                                <tr key={email.id} className="hover:bg-slate-50 transition">
                                    <td className="px-6 py-3 text-sm text-slate-700">{email.recipient}</td>
                                    <td className="px-6 py-3 text-sm text-slate-700 max-w-xs truncate">{email.subject}</td>
                                    <td className="px-6 py-3"><StatusBadge status={email.status} /></td>
                                    <td className="px-6 py-3 text-sm text-slate-500">
                                        {format(new Date(email.scheduledAt), 'MMM d, h:mm a')}
                                    </td>
                                    <td className="px-6 py-3 text-sm text-slate-500">
                                        {email.sentAt ? format(new Date(email.sentAt), 'MMM d, h:mm:ss a') : '-'}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
