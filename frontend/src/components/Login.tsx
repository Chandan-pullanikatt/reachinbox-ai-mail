import { GoogleLogin } from '@react-oauth/google';

export const Login = ({ onLogin }: { onLogin: (credentialResponse: any) => void }) => {

    const handleDemoLogin = () => {
        onLogin({ credential: "demo-token" });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-white p-4">
            <div className="w-full max-w-sm">

                <div className="text-center mb-12">
                    {/* Logo or Title if needed, screenshot shows just 'Login' */}
                </div>

                <div className="bg-white rounded-lg border border-gray-100 p-8 shadow-sm">
                    <h2 className="text-2xl font-semibold text-center text-gray-900 mb-8">Login</h2>

                    <div className="space-y-4">
                        <div className="flex justify-center">
                            <GoogleLogin
                                onSuccess={onLogin}
                                onError={() => console.log('Login Failed')}
                                shape="pill"
                                width="320"
                            />
                        </div>

                        <div className="relative py-2">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-100"></div>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase text-gray-400 bg-white px-2">
                                or sign up through email
                            </div>
                        </div>

                        <div className="space-y-3">
                            <input
                                type="email"
                                placeholder="Email ID"
                                className="w-full bg-gray-50 border-none rounded-md px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-emerald-500 placeholder-gray-400 text-gray-700"
                            />
                            <input
                                type="password"
                                placeholder="Password"
                                className="w-full bg-gray-50 border-none rounded-md px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-emerald-500 placeholder-gray-400 text-gray-700"
                            />
                        </div>

                        <button
                            onClick={handleDemoLogin}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 rounded-md transition text-sm shadow-sm mt-4"
                        >
                            Login
                        </button>
                        <p className="text-center text-xs text-gray-400 mt-4">
                            (Click Login to use Demo Account)
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
