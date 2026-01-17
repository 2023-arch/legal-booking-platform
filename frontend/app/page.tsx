'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Star, Shield, Clock, ArrowRight, Gavel, Scale, Users, MessageSquare } from 'lucide-react';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [locationQuery, setLocationQuery] = useState('');

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (searchQuery) params.set('q', searchQuery);
        if (locationQuery) params.set('location', locationQuery);

        router.push(`/search?${params.toString()}`);
    };

    return (
        <div className="flex flex-col min-h-screen">

            {/* 1. HERO SECTION */}
            <section className="relative py-20 lg:py-32 overflow-hidden bg-white">
                {/* Background Gradients */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                    <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-100 rounded-full blur-3xl opacity-50" />
                    <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-purple-100 rounded-full blur-3xl opacity-50" />
                </div>

                <div className="container relative z-10 mx-auto px-4 text-center">
                    <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm font-medium bg-blue-50 text-blue-700 border-blue-100">
                        Trusted by 10,000+ Clients
                    </Badge>

                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 mb-6">
                        Find the Right Lawyer, <br />
                        <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Right Now.
                        </span>
                    </h1>

                    <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                        Connect with verified legal experts across India for consultation, documentation, and representation. Secure, confidential, and instant.
                    </p>

                    {/* Search Bar */}
                    <div className="bg-white p-2 rounded-2xl shadow-xl shadow-slate-200/50 max-w-3xl mx-auto border border-slate-100 flex flex-col md:flex-row gap-2 mb-12">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                            <Input
                                placeholder="Search by specialization (e.g. Divorce, Property)"
                                className="pl-12 h-12 border-none shadow-none text-base focus-visible:ring-0 bg-transparent"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                        </div>
                        <div className="hidden md:block w-px bg-slate-200 my-2" />
                        <div className="relative flex-1">
                            <MapPin className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                            <Input
                                placeholder="City or Pincode"
                                className="pl-12 h-12 border-none shadow-none text-base focus-visible:ring-0 bg-transparent"
                                value={locationQuery}
                                onChange={(e) => setLocationQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                        </div>
                        <Button
                            size="lg"
                            className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-200"
                            onClick={handleSearch}
                        >
                            Find Lawyers
                        </Button>
                    </div>

                    {/* Specialization Tags */}
                    <div className="flex flex-wrap justify-center gap-3 text-sm text-slate-600">
                        <span>Popular:</span>
                        {['Divorce', 'Property Dispute', 'Criminal Defense', 'Corporate', 'Startup'].map((tag) => (
                            <Link key={tag} href={`/search?q=${tag}`} className="hover:text-blue-600 underline decoration-slate-300 hover:decoration-blue-600 underline-offset-4 transition-all">
                                {tag}
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* 2. STATS BAR */}
            <section className="border-y border-slate-100 bg-slate-50/50 py-12">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-slate-200/50">
                        {[
                            { label: 'Verified Lawyers', value: '5,000+' },
                            { label: 'Happy Clients', value: '10k+' },
                            { label: 'Consultations', value: '50k+' },
                            { label: 'districts covered', value: '500+' },
                        ].map((stat, i) => (
                            <div key={i} className={i % 2 !== 0 ? "border-l border-slate-200/50 pl-8" : ""}>
                                <div className="text-3xl md:text-4xl font-bold text-slate-900 mb-1">{stat.value}</div>
                                <div className="text-sm font-medium text-slate-500 uppercase tracking-wide">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 3. HOW IT WORKS */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Legal Help Simplified</h2>
                        <p className="text-lg text-slate-600">Get legal advice from the comfort of your home in 4 easy steps.</p>
                    </div>

                    <div className="grid md:grid-cols-4 gap-8">
                        {[
                            { icon: Search, title: 'Search', desc: 'Find lawyers by specialization, location, or experience.' },
                            { icon: Scale, title: 'Choose', desc: 'Compare profiles, fees, and client reviews to pick the best match.' },
                            { icon: Clock, title: 'Book', desc: 'Schedule a video or audio consultation at your convenient time.' },
                            { icon: MessageSquare, title: 'Consult', desc: 'Connect securely and get expert legal advice instantly.' },
                        ].map((step, i) => (
                            <div key={i} className="relative group">
                                <div className="absolute -inset-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="relative p-6 text-center">
                                    <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                                        <step.icon className="h-8 w-8 text-blue-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h3>
                                    <p className="text-slate-600 leading-relaxed">{step.desc}</p>
                                </div>
                                {i < 3 && (
                                    <div className="hidden md:block absolute top-14 left-1/2 w-full h-[2px] bg-slate-100 -z-10">
                                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-slate-200 rounded-full" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 4. FEATURED LAWYERS (Placeholder for now) */}
            <section className="py-24 bg-slate-50">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-end mb-12">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Top Rated Lawyers</h2>
                            <p className="text-lg text-slate-600">Expert legal professionals with proven track records.</p>
                        </div>
                        <Link href="/search">
                            <Button variant="ghost" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                                View All Lawyers <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[1, 2, 3].map((i) => (
                            <Card key={i} className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300">
                                <div className="h-48 bg-slate-200 relative mb-4">
                                    {/* Placeholder for lawyer image */}
                                    <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                                        [Lawyer Photo]
                                    </div>
                                    <Badge className="absolute top-4 right-4 bg-white/90 text-slate-900 shadow-sm hover:bg-white">
                                        <Star className="h-3 w-3 text-yellow-500 mr-1 fill-yellow-500" /> 4.9
                                    </Badge>
                                </div>
                                <CardContent>
                                    <div className="text-sm text-blue-600 font-semibold mb-2">Corporate Law</div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-1">Adv. Priya Sharma</h3>
                                    <p className="text-slate-500 text-sm mb-4">High Court, Delhi • 12 years exp</p>

                                    <div className="flex flex-wrap gap-2 mb-6">
                                        <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-normal">English</Badge>
                                        <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-normal">Hindi</Badge>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                        <div>
                                            <div className="text-xs text-slate-500">Consultation Fee</div>
                                            <div className="font-bold text-slate-900">₹2,500<span className="text-xs font-normal text-slate-400">/30min</span></div>
                                        </div>
                                        <Button size="sm" className="bg-slate-900 text-white hover:bg-slate-800">Book Now</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* 5. CTA SECTION */}
            <section className="py-24 bg-slate-900 text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-3xl" />

                <div className="container relative z-10 mx-auto px-4 text-center max-w-4xl">
                    <Gavel className="h-16 w-16 mx-auto mb-8 text-blue-500" />
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">Are You a Qualified Lawyer?</h2>
                    <p className="text-xl text-slate-300 mb-10 leading-relaxed">
                        Join India's fastest-growing legal platform. Connect with clients, manage your practice digitally, and grow your reputation.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link href="/auth/lawyer-register">
                            <Button size="lg" className="h-14 px-8 text-lg bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto">
                                <Shield className="mr-2 h-5 w-5" />
                                Register as Lawyer
                            </Button>
                        </Link>
                        <Link href="/for-lawyers">
                            <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-slate-600 text-slate-200 hover:bg-slate-800 hover:text-white w-full sm:w-auto">
                                Learn More
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
