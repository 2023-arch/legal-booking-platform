'use client';

import Link from 'next/link';
import { Scale, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const isLoggedIn = false; // TODO: Connect to auth state later

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

                {/* Auth Buttons */}
                <div className="hidden md:flex items-center gap-3">
                    {isLoggedIn ? (
                        <Link href="/dashboard">
                            <Button>Dashboard</Button>
                        </Link>
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
                    <Link href="/auth/login" className="w-full">
                        <Button variant="outline" className="w-full justify-center">Log In</Button>
                    </Link>
                    <Link href="/auth/register" className="w-full">
                        <Button className="w-full justify-center bg-blue-600">Get Started</Button>
                    </Link>
                </div>
            )}
        </nav>
    );
}
