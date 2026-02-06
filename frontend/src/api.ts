import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/api',
});

export interface UserProfile {
    name: string;
    email: string;
    picture?: string;
}

const USER_KEY = 'email_scheduler_user';

export const saveUser = (user: UserProfile) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearUser = () => {
    localStorage.removeItem(USER_KEY);
};

export const getCurrentUser = (): UserProfile => {
    const stored = localStorage.getItem(USER_KEY);
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch (e) {
            console.error("Failed to parse user", e);
        }
    }
    return { email: 'user@example.com', name: 'Demo User' };
};

export const scheduleEmail = (data: any) => api.post('/schedule', data);
export const getEmails = (senderId: string) => api.get(`/emails?senderId=${senderId}`);
export const getStats = (senderId: string) => api.get(`/stats?senderId=${senderId}`);

export const toggleStar = (id: string, isStarred: boolean) => api.patch(`/emails/${id}/star`, { isStarred });

export default api;
