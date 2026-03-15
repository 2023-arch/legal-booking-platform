"use client";

import { Star, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const STATIC_FALLBACKS = [
    {
        user_name: "Rajesh Malhotra",
        role: "Business Owner", // Legacy field just in case
        comment: "I matched with an amazing corporate lawyer within minutes. The video consultation saved me a trip to the high court. Highly recommended for quick legal advice!",
        rating: 5,
        initials: "RM",
        lawyer_name: "Adv. Sanjay Verma",
        created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
        user_name: "Sneha Kapoor",
        role: "Software Engineer",
        comment: "Dealing with a property dispute was stressful until I found LegalBook. My lawyer explained everything clearly and the documentation support was excellent.",
        rating: 5,
        initials: "SK",
        lawyer_name: "Adv. Priya Sharma",
        created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
        user_name: "Amit Verma",
        role: "Freelancer",
        comment: "Great platform! The fee structure is transparent, and the AI summary feature helped me explain my complex case to the lawyer effectively.",
        rating: 4,
        initials: "AV",
        lawyer_name: "Adv. Rajesh Kumar",
        created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
    }
];

import { useState, useEffect } from "react";

export default function TestimonialsSection() {
    const [reviews, setReviews] = useState<any[]>([]);

    useEffect(() => {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
        fetch(`${apiUrl}/reviews?limit=6&sort=top`)
            .then(r => r.json())
            .then(data => {
                // Determine if backend returns data.data or directly the array
                const reviewsArray = data.data?.reviews || data.data || data.reviews || data;
                if (Array.isArray(reviewsArray)) {
                    setReviews(reviewsArray);
                }
            })
            .catch(() => {}); // silently keep static fallback if API fails
    }, []);

    const displayReviews = reviews.length > 0 ? reviews : STATIC_FALLBACKS;

    return (
        <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        What Our Clients Say
                    </h2>
                    <p className="text-lg text-slate-400">
                        Thousands of people have found the right legal help through us.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {displayReviews.map((t, i) => {
                        const displayName = t.user_name || t.name || 'Anonymous User';
                        const reviewText = t.comment || t.content || '';
                        const parsedDate = t.created_at ? new Date(t.created_at).toLocaleDateString() : '';
                        const avatarInitials = t.initials || displayName.substring(0, 2).toUpperCase();

                        return (
                            <Card key={i} className="bg-slate-800/50 border-slate-700 backdrop-blur text-slate-200">
                                <CardContent className="p-8 h-full flex flex-col justify-between">
                                    <div>
                                        <Quote className="h-8 w-8 text-blue-500 mb-6 opacity-50" />
                                        <p className="mb-6 leading-relaxed text-slate-300">"{reviewText}"</p>
                                    </div>
                                    <div>
                                        {t.lawyer_name && (
                                            <div className="text-sm text-blue-400 mb-4 pb-4 border-b border-slate-700/50">
                                                Consulted with <span className="font-semibold">{t.lawyer_name}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-4">
                                            <Avatar>
                                                <AvatarFallback className="bg-blue-600 text-white">{avatarInitials}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-bold text-white">{displayName}</div>
                                                <div className="text-xs text-slate-500">{parsedDate || t.role}</div>
                                            </div>
                                            <div className="ml-auto flex gap-1">
                                                {[...Array(5)].map((_, j) => (
                                                    <Star
                                                        key={j}
                                                        className={`h-4 w-4 ${j < (t.rating || 5) ? "text-yellow-500 fill-yellow-500" : "text-slate-600"}`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
