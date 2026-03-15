'use client';

import Link from 'next/link';
import { Scale, Menu, X, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import api from '@/lib/api';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from 'date-fns';

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { user } = useAuth();
    const isLoggedIn = !!user;
    
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotifications = async () => {
        if (!isLoggedIn) return;
        try {
            const res = await api.get('/notifications');
            const data = res.data;
            setNotifications(data);
            setUnreadCount(data.filter((n: any) => !n.is_read).length);
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Setup polling every minute to keep it fresh
        const intervalId = setInterval(fetchNotifications, 60000);
        return () => clearInterval(intervalId);
    }, [isLoggedIn]);

    const handleOpenChange = async (open: boolean) => {
        if (open && unreadCount > 0) {
            try {
                // Optimistically clear badge immediately
                setUnreadCount(0);
                await api.patch('/notifications/read-all');
                // Refresh full state gracefully in background
                fetchNotifications();
            } catch (error) {
                console.error("Failed to mark notifications read:", error);
            }
        }
    };

    return (
        <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">

                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                    <div className="bg-blue-600 p-1.5 rounded-lg">
                        <Scale className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-bold text-xl bg-gradient-to-r from-blue-700 to-blue-900 bg-clip-text text-transparent">
                        LegalBook
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-8">
                    <Link href="/search" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
                        Find Lawyers
                    </Link>
                    <Link href="/how-it-works" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
                        How it Works
                    </Link>
                    <Link href="/for-lawyers" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
                        For Lawyers
                    </Link>
                </div>

                {/* Auth Buttons & Notifications */}
                <div className="hidden md:flex items-center gap-3">
                    {isLoggedIn ? (
                        <div className="flex items-center gap-4">
                            <DropdownMenu onOpenChange={handleOpenChange}>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="relative">
                                        <Bell className="h-5 w-5 text-gray-600 hover:text-blue-600 transition-colors" />
                                        {unreadCount > 0 && (
                                            <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                                        )}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
                                    <div className="flex items-center justify-between px-4 py-2 border-b">
                                        <span className="font-semibold text-sm">Notifications</span>
                                    </div>
                                    <div className="py-2">
                                        {notifications.length === 0 ? (
                                            <div className="px-4 py-4 text-center text-sm text-gray-500">
                                                No new notifications
                                            </div>
                                        ) : (
                                            notifications.map((notif) => (
                                                <DropdownMenuItem key={notif.id} className="cursor-default flex flex-col items-start px-4 py-3 focus:bg-slate-50 border-b last:border-0">
                                                    <div className="flex justify-between w-full items-start mb-1">
                                                        <span className={`font-medium text-sm ${!notif.is_read ? 'text-blue-700' : 'text-slate-800'}`}>
                                                            {notif.title}
                                                        </span>
                                                        <span className="text-xs text-slate-400 shrink-0 ml-2">
                                                            {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                                                        </span>
                                                    </div>
                                                    <span className="text-sm text-slate-600 break-words line-clamp-2">
                                                        {notif.message}
                                                    </span>
                                                </DropdownMenuItem>
                                            ))
                                        )}
                                    </div>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <Link href="/dashboard">
                                <Button>Dashboard</Button>
                            </Link>
                        </div>
                    ) : (
                        <>
                            <Link href="/auth/login">
                                <Button variant="ghost" className="text-gray-600 hover:text-blue-600">
                                    Log In
                                </Button>
                            </Link>
                            <Link href="/auth/register">
                                <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200">
                                    Get Started
                                </Button>
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    className="md:hidden p-2 text-gray-600"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden absolute top-16 left-0 w-full bg-white border-b shadow-lg p-4 flex flex-col gap-4 animate-in slide-in-from-top-5">
                    <Link href="/search" className="text-sm font-medium text-gray-600 py-2">
                        Find Lawyers
                    </Link>
                    <Link href="/how-it-works" className="text-sm font-medium text-gray-600 py-2">
                        How it Works
                    </Link>
                    <hr />
                    {isLoggedIn ? (
                        <Link href="/dashboard" className="w-full">
                            <Button className="w-full justify-center">Dashboard</Button>
                        </Link>
                    ) : (
                        <>
                            <Link href="/auth/login" className="w-full">
                                <Button variant="outline" className="w-full justify-center">Log In</Button>
                            </Link>
                            <Link href="/auth/register" className="w-full">
                                <Button className="w-full justify-center bg-blue-600">Get Started</Button>
                            </Link>
                        </>
                    )}
                </div>
            )}
        </nav>
    );
}
