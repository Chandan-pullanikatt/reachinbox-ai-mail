import { useState, useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { saveUser, clearUser, getCurrentUser } from './api';

// In a real app, this would be in .env
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com";

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // Check if user is already logged in from previous session
        const user = getCurrentUser();
        if (user.name !== 'Demo User') {
            setIsAuthenticated(true);
        }
    }, []);

    const handleLogin = (credentialResponse: any) => {
        if (credentialResponse.credential === "demo-token") {
            saveUser({
                name: "Demo User",
                email: "demo@example.com",
                picture: ""
            });
        } else if (credentialResponse.credential) {
            try {
                const decoded: any = jwtDecode(credentialResponse.credential);
                saveUser({
                    name: decoded.name,
                    email: decoded.email,
                    picture: decoded.picture
                });
            } catch (e) {
                console.error("Login decode failed", e);
            }
        }
        setIsAuthenticated(true);
    };

    const handleLogout = () => {
        clearUser();
        setIsAuthenticated(false);
    };

    return (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            {isAuthenticated ? (
                <Dashboard onLogout={handleLogout} />
            ) : (
                <Login onLogin={handleLogin} />
            )}
        </GoogleOAuthProvider>
    );
}

export default App;
