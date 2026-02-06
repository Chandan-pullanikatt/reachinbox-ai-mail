import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { scheduleEmail, getCurrentUser } from '../api';
import {
    ArrowLeft,
    Paperclip,
    Clock,
    Upload,
    ChevronDown,
    Bold,
    Italic,
    Underline,
    AlignLeft,
    AlignCenter,
    AlignRight,
    List,
    Image,
    Smile,
    X
} from 'lucide-react';

export const Compose = ({ onSuccess, onClose }: { onSuccess: () => void; onClose: () => void }) => {
    const { register, handleSubmit, reset, watch, setValue } = useForm();
    const [loading, setLoading] = useState(false);
    const [parsedRecipients, setParsedRecipients] = useState<string[]>([]);
    const [manualRecipientInput, setManualRecipientInput] = useState('');
    const user = getCurrentUser();

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            // Robust regex to extract emails
            const matches = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
            if (matches) {
                setParsedRecipients(prev => [...new Set([...prev, ...matches])]);
            }
        };
        reader.readAsText(file);
    };

    const addManualRecipient = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const email = manualRecipientInput.trim().replace(/,/g, '');
            if (email && email.includes('@')) {
                setParsedRecipients(prev => [...new Set([...prev, email])]);
                setManualRecipientInput('');
            }
        }
    };

    const removeRecipient = (email: string) => {
        setParsedRecipients(prev => prev.filter(e => e !== email));
    };

    const onSubmit = async (data: any) => {
        if (parsedRecipients.length === 0) {
            alert("Please add at least one recipient");
            return;
        }

        setLoading(true);
        try {
            await scheduleEmail({
                senderId: user.email,
                subject: data.subject,
                body: data.body,
                recipients: parsedRecipients,
                startTime: data.startTime ? new Date(data.startTime).toISOString() : new Date().toISOString(),
                delaySeconds: parseInt(data.delaySeconds) || 0,
                hourlyLimit: parseInt(data.hourlyLimit) || 100
            });

            reset();
            setParsedRecipients([]);
            onSuccess();
            onClose(); // Go back to list
            alert(`Awesome! Scheduled ${parsedRecipients.length} emails.`);
        } catch (e: any) {
            alert(e.response?.data?.error || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div className="flex items-center space-x-4">
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h2 className="text-lg font-semibold text-gray-800">Compose New Email</h2>
                </div>
                <div className="flex items-center space-x-3">
                    <button className="text-gray-400 hover:text-gray-600">
                        <Paperclip className="w-5 h-5" />
                    </button>
                    <button className="text-gray-400 hover:text-gray-600">
                        <Clock className="w-5 h-5" />
                    </button>
                    <button
                        onClick={handleSubmit(onSubmit)}
                        disabled={loading}
                        className="px-4 py-2 bg-white text-emerald-600 border border-emerald-600 rounded-md text-sm font-medium hover:bg-emerald-50 transition"
                    >
                        {loading ? 'Sending...' : 'Send Later'}
                    </button>
                </div>
            </div>

            {/* Form Fields */}
            <div className="px-8 py-6 space-y-6 flex-1 overflow-y-auto">
                {/* From */}
                <div className="flex items-center">
                    <label className="w-24 text-sm font-medium text-gray-500">From</label>
                    <div className="flex-1">
                        <div className="inline-flex items-center bg-gray-100 px-3 py-1.5 rounded-md text-sm text-gray-700">
                            {user.email}
                            <ChevronDown className="w-4 h-4 ml-2 text-gray-400" />
                        </div>
                    </div>
                </div>

                {/* To */}
                <div className="flex items-start">
                    <label className="w-24 text-sm font-medium text-gray-500 mt-2">To</label>
                    <div className="flex-1">
                        <div className="flex flex-wrap gap-2 mb-2">
                            {parsedRecipients.map(email => (
                                <span key={email} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-50 text-green-700 border border-green-200">
                                    {email}
                                    <button onClick={() => removeRecipient(email)} className="ml-1 hover:text-green-900"><X className="w-3 h-3" /></button>
                                </span>
                            ))}
                            <input
                                value={manualRecipientInput}
                                onChange={(e) => setManualRecipientInput(e.target.value)}
                                onKeyDown={addManualRecipient}
                                placeholder={parsedRecipients.length === 0 ? "Type email and press Enter" : ""}
                                className="outline-none text-sm py-1.5"
                            />
                        </div>
                        <div className="flex justify-end relative">
                            <input
                                type="file"
                                id="file-upload"
                                className="hidden"
                                onChange={handleFileUpload}
                                accept=".csv,.txt"
                            />
                            <label htmlFor="file-upload" className="text-emerald-500 text-sm font-medium cursor-pointer flex items-center hover:text-emerald-600">
                                <Upload className="w-4 h-4 mr-1" />
                                Upload List
                            </label>
                        </div>
                    </div>
                </div>

                {/* Subject */}
                <div className="flex items-center">
                    <label className="w-24 text-sm font-medium text-gray-500">Subject</label>
                    <input
                        {...register('subject', { required: true })}
                        className="flex-1 outline-none text-gray-800 font-medium placeholder-gray-300"
                        placeholder="Subject"
                    />
                </div>

                {/* Config */}
                {/* Config Row */}
                <div className="flex items-center space-x-6 pt-2">
                    <div className="flex flex-col">
                        <label className="text-xs font-medium text-gray-500 mb-1.5">Start Time</label>
                        <input
                            type="datetime-local"
                            {...register('startTime')}
                            className="border border-gray-200 rounded px-2 py-1.5 text-sm outline-none focus:border-emerald-500 bg-white"
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-xs font-medium text-gray-500 mb-1.5">Delay (sec)</label>
                        <input
                            {...register('delaySeconds')}
                            defaultValue={10}
                            className="w-20 border border-gray-200 rounded px-2 py-1.5 text-sm text-center outline-none focus:border-emerald-500"
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-xs font-medium text-gray-500 mb-1.5">Hourly Limit</label>
                        <input
                            {...register('hourlyLimit')}
                            defaultValue={50}
                            className="w-20 border border-gray-200 rounded px-2 py-1.5 text-sm text-center outline-none focus:border-emerald-500"
                        />
                    </div>
                </div>

                {/* Editor Area */}
                <div className="mt-8 h-64 bg-gray-50 rounded-lg p-4 relative flex flex-col">
                    <textarea
                        {...register('body', { required: true })}
                        className="w-full h-full bg-transparent outline-none resize-none text-gray-700"
                        placeholder="Type Your Reply..."
                    />

                    {/* Fake Toolbar */}
                    <div className="absolute bottom-4 left-4 flex items-center space-x-4 text-gray-400">
                        <button className="hover:text-gray-600"><Bold className="w-4 h-4" /></button>
                        <button className="hover:text-gray-600"><Italic className="w-4 h-4" /></button>
                        <button className="hover:text-gray-600"><Underline className="w-4 h-4" /></button>
                        <div className="h-4 w-px bg-gray-300 mx-2"></div>
                        <button className="hover:text-gray-600"><AlignLeft className="w-4 h-4" /></button>
                        <button className="hover:text-gray-600"><AlignCenter className="w-4 h-4" /></button>
                        <button className="hover:text-gray-600"><AlignRight className="w-4 h-4" /></button>
                        <button className="hover:text-gray-600"><List className="w-4 h-4" /></button>
                        <div className="h-4 w-px bg-gray-300 mx-2"></div>
                        <button className="hover:text-gray-600"><Image className="w-4 h-4" /></button>
                        <button className="hover:text-gray-600"><Smile className="w-4 h-4" /></button>
                    </div>
                </div>
            </div>
        </div>
    );
};
