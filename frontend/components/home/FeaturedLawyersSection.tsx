"use client";

import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Mock data for featured lawyers
const featuredLawyers = [
    {
        id: "1",
        name: "Adv. Priya Sharma",
        specialization: "Corporate Law",
        experience: "12 years",
        rating: 4.9,
        reviews: 124,
        fee: 2500,
        location: "High Court, Delhi",
        languages: ["English", "Hindi"],
    },
    {
        id: "2",
        name: "Adv. Rajesh Kumar",
        specialization: "Criminal Defense",
        experience: "15 years",
        rating: 4.8,
        reviews: 98,
        fee: 1500,
        location: "District Court, Mumbai",
        languages: ["English", "Marathi"],
    },
    {
        id: "3",
        name: "Adv. Anita Desai",
        specialization: "Family Law",
        experience: "8 years",
        rating: 4.9,
        reviews: 156,
        fee: 2000,
        location: "High Court, Bangalore",
        languages: ["English", "Kannada"],
    },
];

export default function FeaturedLawyersSection() {
    return (
        <section className="py-24 bg-slate-50">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                            Top Rated Lawyers
                        </h2>
                        <p className="text-lg text-slate-600">
                            Expert legal professionals with proven track records.
                        </p>
                    </div>
                    <Link href="/search" className="hidden sm:block">
                        <Button
                            variant="ghost"
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                            View All Lawyers <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {featuredLawyers.map((lawyer) => (
                        <Card
                            key={lawyer.id}
                            className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"
                        >
                            <div className="h-48 bg-slate-200 relative mb-4">
                                {/* Placeholder for lawyer image - using colored avatars for now */}
                                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300">
                                    <span className="text-4xl text-slate-400 font-bold">
                                        {lawyer.name.charAt(0)}
                                    </span>
                                </div>
                                <Badge className="absolute top-4 right-4 bg-white/90 text-slate-900 shadow-sm hover:bg-white backdrop-blur">
                                    <Star className="h-3 w-3 text-yellow-500 mr-1 fill-yellow-500" />{" "}
                                    {lawyer.rating}
                                </Badge>
                            </div>
                            <CardContent className="p-6 pt-0">
                                <div className="text-sm text-blue-600 font-semibold mb-2 uppercase tracking-wide">
                                    {lawyer.specialization}
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-1">
                                    {lawyer.name}
                                </h3>
                                <p className="text-slate-500 text-sm mb-4">
                                    {lawyer.location} • {lawyer.experience} exp
                                </p>

                                <div className="flex flex-wrap gap-2 mb-6">
                                    {lawyer.languages.map((lang) => (
                                        <Badge
                                            key={lang}
                                            variant="secondary"
                                            className="bg-slate-100 text-slate-600 font-normal hover:bg-slate-200"
                                        >
                                            {lang}
                                        </Badge>
                                    ))}
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                    <div>
                                        <div className="text-xs text-slate-500">
                                            Consultation Fee
                                        </div>
                                        <div className="font-bold text-slate-900">
                                            ₹{lawyer.fee.toLocaleString()}
                                            <span className="text-xs font-normal text-slate-400">
                                                /consult
                                            </span>
                                        </div>
                                    </div>
                                    <Link href={`/lawyers/${lawyer.id}`}>
                                        <Button
                                            size="sm"
                                            className="bg-slate-900 text-white hover:bg-slate-800"
                                        >
                                            View Profile
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="mt-8 text-center sm:hidden">
                    <Link href="/search">
                        <Button className="w-full" variant="outline">View All Lawyers</Button>
                    </Link>
                </div>
            </div>
        </section>
    );
}
