"use client";

import { Star, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const testimonials = [
    {
        name: "Rajesh Malhotra",
        role: "Business Owner",
        content: "I matched with an amazing corporate lawyer within minutes. The video consultation saved me a trip to the high court. Highly recommended for quick legal advice!",
        rating: 5,
        initials: "RM"
    },
    {
        name: "Sneha Kapoor",
        role: "Software Engineer",
        content: "Dealing with a property dispute was stressful until I found LegalBook. My lawyer explained everything clearly and the documentation support was excellent.",
        rating: 5,
        initials: "SK"
    },
    {
        name: "Amit Verma",
        role: "Freelancer",
        content: "Great platform! The fee structure is transparent, and the AI summary feature helped me explain my complex case to the lawyer effectively.",
        rating: 4,
        initials: "AV"
    }
];

export default function TestimonialsSection() {
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
                    {testimonials.map((t, i) => (
                        <Card key={i} className="bg-slate-800/50 border-slate-700 backdrop-blur text-slate-200">
                            <CardContent className="p-8">
                                <Quote className="h-8 w-8 text-blue-500 mb-6 opacity-50" />
                                <p className="mb-6 leading-relaxed text-slate-300">"{t.content}"</p>
                                <div className="flex items-center gap-4">
                                    <Avatar>
                                        <AvatarFallback className="bg-blue-600 text-white">{t.initials}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="font-bold text-white">{t.name}</div>
                                        <div className="text-xs text-slate-500">{t.role}</div>
                                    </div>
                                    <div className="ml-auto flex gap-1">
                                        {[...Array(5)].map((_, j) => (
                                            <Star
                                                key={j}
                                                className={`h-4 w-4 ${j < t.rating ? "text-yellow-500 fill-yellow-500" : "text-slate-600"}`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
