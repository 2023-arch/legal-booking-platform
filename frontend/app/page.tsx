'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Scale, Shield, Users, Star, Clock } from 'lucide-react';

export default function Home() {
    return (
        <div className="min-h-screen">
            {/* Navbar */}
            <nav className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Scale className="h-6 w-6" />
                        <span className="font-bold text-xl">LegalBook</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/search">
                            <Button variant="ghost">Find Lawyers</Button>
                        </Link>
                        <Link href="/auth/login">
                            <Button variant="outline">Login</Button>
                        </Link>
                        <Link href="/auth/register">
                            <Button>Get Started</Button>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="py-20 px-4 bg-gradient-to-b from-blue-50 to-white">
                <div className="container mx-auto max-w-4xl text-center">
                    <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Find Your Perfect Legal Expert
                    </h1>
                    <p className="text-xl text-gray-600 mb-8">
                        Connect with verified lawyers across India. Book consultations instantly.
                    </p>

                    {/* Search Bar */}
                    <div className="flex gap-2 max-w-2xl mx-auto mb-12">
                        <Input
                            placeholder="Search by specialization, location, or name..."
                            className="h-12 text-base"
                        />
                        <Button size="lg" className="h-12 px-8">
                            <Search className="mr-2 h-5 w-5" />
                            Search
                        </Button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
                        <div>
                            <div className="text-3xl font-bold text-blue-600">5000+</div>
                            <div className="text-sm text-gray-600">Verified Lawyers</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-blue-600">50+</div>
                            <div className="text-sm text-gray-600">Specializations</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-blue-600">10k+</div>
                            <div className="text-sm text-gray-600">Happy Clients</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="py-16 px-4">
                <div className="container mx-auto max-w-6xl">
                    <h2 className="text-3xl font-bold text-center mb-12">Why Choose LegalBook?</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <Card>
                            <CardHeader>
                                <Shield className="h-12 w-12 text-blue-600 mb-4" />
                                <CardTitle>Verified Lawyers</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600">
                                    All lawyers are verified with Bar Council certificates and ID proof.
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <Clock className="h-12 w-12 text-blue-600 mb-4" />
                                <CardTitle>Instant Booking</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600">
                                    Book consultations in minutes. Get confirmed within hours.
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <Star className="h-12 w-12 text-blue-600 mb-4" />
                                <CardTitle>Trusted Reviews</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600">
                                    Read genuine reviews from real clients before booking.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* CTA for Lawyers */}
            <section className="py-16 px-4 bg-blue-600 text-white">
                <div className="container mx-auto max-w-4xl text-center">
                    <Users className="h-16 w-16 mx-auto mb-6" />
                    <h2 className="text-3xl font-bold mb-4">Are You a Lawyer?</h2>
                    <p className="text-xl mb-8 text-blue-100">
                        Join our platform and connect with clients across India
                    </p>
                    <Link href="/auth/lawyer-register">
                        <Button size="lg" variant="secondary" className="h-12 px-8">
                            Register as Lawyer
                        </Button>
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t py-8 px-4 bg-gray-50">
                <div className="container mx-auto text-center text-gray-600">
                    <p>&copy; 2026 LegalBook. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
