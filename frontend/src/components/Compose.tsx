import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { scheduleEmail, getCurrentUser } from '../api';
import { Upload, Clock, Zap, Settings } from 'lucide-react';

export const Compose = ({ onSuccess }: { onSuccess: () => void }) => {
    const { register, handleSubmit, reset } = useForm();
    const [loading, setLoading] = useState(false);
    const [parsedRecipients, setParsedRecipients] = useState<string[]>([]);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            // Robust regex to extract emails
            const matches = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
            setParsedRecipients(matches || []);
        };
        reader.readAsText(file);
    };

    const onSubmit = async (data: any) => {
        setLoading(true);
        try {
            const user = getCurrentUser();

            // Extract emails from manual input using same regex
            const manualText = data.manualRecipients || "";
            const manualEmails = manualText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];

            const allRecipients = [...new Set([...parsedRecipients, ...manualEmails])];

            if (allRecipients.length === 0) {
                alert("Please add at least one recipient");
                setLoading(false);
                return;
            }

            await scheduleEmail({
                senderId: user.email,
                subject: data.subject,
                body: data.body,
                recipients: allRecipients,
                startTime: data.startTime ? new Date(data.startTime).toISOString() : new Date().toISOString(),
                delaySeconds: parseInt(data.delaySeconds) || 0,
                hourlyLimit: parseInt(data.hourlyLimit) || 100
            });

            reset();
            setParsedRecipients([]);
            onSuccess();
            alert(`Awesome! We've scheduled ${allRecipients.length} emails for you.`);
        } catch (e) {
            alert("Oops! Something went wrong while scheduling. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h2 className="text-xl font-semibold mb-4 text-slate-800">Compose New Campaign</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                {/* Subject */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                    <input
                        {...register('subject', { required: true })}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                        placeholder="Enter email subject"
                    />
                </div>

                {/* Body */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Content</label>
                    <textarea
                        {...register('body', { required: true })}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg h-32 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                        placeholder="Write your email content..."
                    />
                </div>

                {/* Recipients */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Recipients (Text)</label>
                        <textarea
                            {...register('manualRecipients')}
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg h-24 focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="chandan@example.com, alice@example.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Upload list (CSV/TXT)</label>
                        <div className="border-2 border-dashed border-slate-200 rounded-lg h-24 flex flex-col items-center justify-center text-slate-400 hover:border-indigo-400 cursor-pointer transition relative">
                            <input type="file" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                            <Upload className="w-5 h-5 mb-1" />
                            <span className="text-xs">
                                {parsedRecipients.length > 0 ? `${parsedRecipients.length} emails loaded` : "Drop or Click to Upload"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Settings */}
                <div className="bg-slate-50 p-4 rounded-lg space-y-4">
                    <div className="flex items-center text-slate-800 font-medium text-sm mb-2">
                        <Settings className="w-4 h-4 mr-2" />
                        Scheduling Configuration
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Start Time</label>
                            <input
                                type="datetime-local"
                                {...register('startTime', { required: true })}
                                className="w-full px-2 py-2 text-sm border border-slate-200 rounded-md"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Hourly Limit / Sender</label>
                            <input
                                type="number"
                                {...register('hourlyLimit')}
                                defaultValue={50}
                                className="w-full px-2 py-2 text-sm border border-slate-200 rounded-md"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Min Delay (Seconds)</label>
                            <input
                                type="number"
                                {...register('delaySeconds')}
                                defaultValue={10}
                                className="w-full px-2 py-2 text-sm border border-slate-200 rounded-md"
                            />
                        </div>
                    </div>
                </div>

                <button
                    disabled={loading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg shadow-md transition flex justify-center items-center"
                >
                    {loading ? 'Scheduling...' : 'Schedule Campaign'}
                </button>

            </form>
        </div>
    );
};
