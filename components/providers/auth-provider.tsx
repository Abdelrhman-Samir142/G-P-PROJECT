'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '@/lib/api';

interface User {
    id: number;
    user: {
        id: number;
        username: string;
        email: string;
        first_name: string;
        last_name: string;
        is_staff: boolean;
    };
    phone: string;
    city: string;
    trust_score: number;
    is_verified: boolean;
    avatar: string | null;
    wallet_balance: string;
    total_sales: number;
    seller_rating: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const loadUser = async () => {
        try {
            const currentUser = await authAPI.getCurrentUser();
            setUser(currentUser);
        } catch (error: unknown) {
            const err = error as { response?: { status?: number } };
            if (err.response?.status === 401) {
                // User is not authenticated, clear any stale tokens
                authAPI.logout();
            }
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUser();
    }, []);

    const login = async (username: string, password: string) => {
        await authAPI.login(username, password);
        await loadUser();
    };

    const logout = () => {
        authAPI.logout();
        // Full page reload to '/' — no need to setUser(null) here.
        // Setting state before navigation causes protected pages (dashboard etc.)
        // to see user=null and race-redirect to /login before the browser lands on '/'.
        window.location.href = '/';
    };

    const refreshUser = async () => {
        await loadUser();
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
