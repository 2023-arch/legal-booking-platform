"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import api from '@/lib/api';

interface User {
    id: string;
    name: string;
    email: string;
    phone: string;
    user_type: 'user' | 'lawyer' | 'admin';
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email_or_phone: string, password: string, redirectUrl?: string | null) => Promise<void>;
    register: (data: any) => Promise<string>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper functions for cookie management
const setCookie = (name: string, value: string, days: number = 7) => {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
};

const deleteCookie = (name: string) => {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
};

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    // Initial auth check
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const token = localStorage.getItem('access_token');
            if (token) {
                const { data } = await api.getMe();
                if (data && data.success) {
                    setUser(data.data);
                } else if (data && !data.success) {
                    // Token might be valid but backend returned failure for some reason
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    setUser(null);
                } else {
                    // Fallback for different API structure
                    setUser(data);
                }
            }
        } catch (error) {
            //   console.error('Auth check failed:', error);
            // Silent fail on initial load is expected if not logged in
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            deleteCookie('token');
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email_or_phone: string, password: string, redirectUrl?: string | null) => {
        try {
            const { data } = await api.login(email_or_phone, password);

            const accessToken = data.data?.access_token || data.access_token;
            const refreshToken = data.data?.refresh_token || data.refresh_token;
            const userData = data.data?.user || data.user;

            if (!accessToken) throw new Error("No access token received");

            localStorage.setItem('access_token', accessToken);
            if (refreshToken) localStorage.setItem('refresh_token', refreshToken);

            // Also set cookie for middleware authentication
            setCookie('token', accessToken, 7);

            setUser(userData);

            // Redirect based on user type
            const redirectMap: any = {
                admin: '/admin/dashboard',
                lawyer: '/dashboard/lawyer', // Updated to match actual path
                user: '/dashboard',
            };

            const redirect = redirectUrl || redirectMap[userData.user_type] || '/dashboard';
            router.push(redirect);
        } catch (error: any) {
            console.error("Login failed", error);
            throw new Error(error.response?.data?.detail || 'Login failed');
        }
    };

    const register = async (registerData: any) => {
        try {
            const { data } = await api.register(registerData);

            const accessToken = data.data?.access_token || data.access_token;
            const refreshToken = data.data?.refresh_token || data.refresh_token;
            const userId = data.data?.user_id || data.user_id || data.id;

            if (accessToken) {
                localStorage.setItem('access_token', accessToken);
                if (refreshToken) localStorage.setItem('refresh_token', refreshToken);
                // Also set cookie for middleware authentication
                setCookie('token', accessToken, 7);
                // If registration auto-logs in, fetch user data
                await checkAuth();
            }

            return userId;
        } catch (error: any) {
            throw new Error(error.response?.data?.detail || 'Registration failed');
        }
    };

    const logout = async () => {
        try {
            await api.logout();
        } catch (error) {
            // Ignore logout errors (e.g. token already invalid)
        } finally {
            localStorage.clear();
            deleteCookie('token');
            setUser(null);
            router.push('/');
        }
    };

    const refreshUser = async () => {
        await checkAuth();
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            login,
            register,
            logout,
            refreshUser,
            isAuthenticated: !!user
        }}>
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
