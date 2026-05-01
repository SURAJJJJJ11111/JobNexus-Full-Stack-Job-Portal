import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { login as apiLogin, register as apiRegister, getMe } from '../services/api';
import toast from 'react-hot-toast';

interface User {
    _id: string;
    name: string;
    email: string;
    role: 'seeker' | 'employer' | 'admin';
    avatar?: string;
    bio?: string;
    location?: string;
    skills?: string[];
    company?: { name: string; website: string; description: string; logo: string };
    resume?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (data: object) => Promise<void>;
    logout: () => void;
    updateUser: (data: Partial<User>) => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('jp_token'));
    const [loading, setLoading] = useState(true);

    // Re-hydrate user from token on mount
    useEffect(() => {
        const initAuth = async () => {
            if (token) {
                try {
                    const { data } = await getMe();
                    setUser(data.user);
                } catch {
                    localStorage.removeItem('jp_token');
                    setToken(null);
                }
            }
            setLoading(false);
        };
        initAuth();
    }, [token]);

    const login = async (email: string, password: string) => {
        const { data } = await apiLogin({ email, password });
        localStorage.setItem('jp_token', data.token);
        setToken(data.token);
        setUser(data.user);
        toast.success(`Welcome back, ${data.user.name}!`);
    };

    const register = async (formData: object) => {
        const { data } = await apiRegister(formData);
        localStorage.setItem('jp_token', data.token);
        setToken(data.token);
        setUser(data.user);
        toast.success(`Account created! Welcome, ${data.user.name}!`);
    };

    const logout = () => {
        localStorage.removeItem('jp_token');
        setToken(null);
        setUser(null);
        toast.success('Logged out successfully', { duration: 2000 });
    };

    const updateUser = (data: Partial<User>) => {
        setUser((prev) => prev ? { ...prev, ...data } : prev);
    };

    return (
        <AuthContext.Provider value={{
            user, token, loading, login, register, logout, updateUser,
            isAuthenticated: !!user,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};
