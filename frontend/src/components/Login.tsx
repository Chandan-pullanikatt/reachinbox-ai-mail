import React from 'react';
import { GoogleLogin } from '@react-oauth/google';

export const Login = ({ onLogin }: { onLogin: (credentialResponse: any) => void }) => {

    const handleDemoLogin = () => {
        onLogin({ credential: "demo-token" });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
                <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                </div>

                <h2 className="text-2xl font-bold text-slate-800 mb-2">Reachinbox AI Mail</h2>
                <p className="text-slate-500 mb-8">Efficient, automated, and powerful email scheduling at your fingertips.</p>

                <div className="flex flex-col gap-4 justify-center items-center">
                    <GoogleLogin
                        onSuccess={onLogin}
                        onError={() => {
                            console.log('Login Failed');
                        }}
                        useOneTap
                    />

                    <div className="relative w-full">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-slate-200" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-2 text-slate-500">Or</span>
                        </div>
                    </div>

                    <button
                        onClick={handleDemoLogin}
                        className="w-full py-2.5 px-4 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
                    >
                        Continue with Demo Account
                    </button>
                </div>
            </div>
        </div>
    );
};
