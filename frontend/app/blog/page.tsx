"use client";

import { Calendar, User, ArrowRight, Clock } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const blogPosts = [
    {
        title: "How AI is Changing Legal Consultations in India",
        excerpt: "LegalBook uses Gemini AI to summarize your legal problem before every consultation, saving lawyers and clients valuable time...",
        author: "LegalBook Team",
        date: "March 2026",
        category: "Legal Tech",
        readTime: "4 min read"
    },
    {
        title: "Understanding Your Rights: A Guide for First-Time Legal Consultation Users",
        excerpt: "If you have never consulted a lawyer before, here is everything you need to know to prepare...",
        author: "LegalBook Team",
        date: "February 2026",
        category: "Guide",
        readTime: "5 min read"
    },
    {
        title: "Why Escrow Payments Protect Both Clients and Lawyers",
        excerpt: "LegalBook holds your payment in escrow until the consultation is complete. Here is how that protects you...",
        author: "LegalBook Team",
        date: "January 2026",
        category: "Trust & Safety",
        readTime: "3 min read"
    }
];

const categories = ["All", "Criminal Law", "Family Law", "Property Law", "Corporate Law", "Cyber Law", "Consumer Law"];

export default function BlogPage() {
    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-blue-700 to-indigo-800 text-white py-20">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">
                        Legal Blog
                    </h1>
                    <p className="text-xl text-blue-100 max-w-3xl mx-auto">
                        Expert legal insights, guides, and updates from verified lawyers.
                        Stay informed about your rights and the Indian legal system.
                    </p>
                </div>
            </section>

            {/* Category Filter */}
            <section className="py-8 bg-white border-b">
                <div className="container mx-auto px-4">
                    <div className="flex flex-wrap gap-2 justify-center">
                        {categories.map((cat, i) => (
                            <Badge
                                key={i}
                                variant={i === 0 ? "default" : "outline"}
                                className={`cursor-pointer px-4 py-2 ${i === 0 ? "bg-blue-600" : "hover:bg-slate-100"}`}
                            >
                                {cat}
                            </Badge>
                        ))}
                    </div>
                </div>
            </section>

            {/* Blog Posts Grid */}
            <section className="py-16 bg-slate-50">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
                        {blogPosts.map((post, index) => (
                            <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-all hover:-translate-y-1 group">
                                {/* Placeholder Image */}
                                <div className="h-48 bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                                    <span className="text-slate-400 text-sm">Featured Image</span>
                                </div>
                                <CardContent className="pt-6">
                                    <Badge className="mb-3 bg-blue-100 text-blue-700 hover:bg-blue-100">
                                        {post.category}
                                    </Badge>
                                    <h3 className="font-bold text-lg mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                                        {post.title}
                                    </h3>
                                    <p className="text-slate-600 text-sm line-clamp-3 mb-4">
                                        {post.excerpt}
                                    </p>
                                    <div className="flex items-center gap-4 text-xs text-slate-500">
                                        <span className="flex items-center gap-1">
                                            <User className="h-3 w-3" />
                                            {post.author}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {post.readTime}
                                        </span>
                                    </div>
                                </CardContent>
                                <CardFooter className="pt-0 flex justify-between items-center">
                                    <span className="text-xs text-slate-400 flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        {post.date}
                                    </span>
                                    <button
                                        className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                                        onClick={() => alert("Blog posts coming soon! We're working on bringing you detailed legal guides.")}
                                    >
                                        Read More <ArrowRight className="h-4 w-4" />
                                    </button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Coming Soon Notice */}
            <section className="py-12 bg-white">
                <div className="container mx-auto px-4 text-center">
                    <div className="bg-blue-50 rounded-2xl p-8 max-w-2xl mx-auto">
                        <h3 className="text-xl font-bold mb-2">📝 More Articles Coming Soon!</h3>
                        <p className="text-slate-600 mb-4">
                            Our team of legal experts is working on detailed guides and updates.
                            Subscribe to get notified when new articles are published.
                        </p>
                        <div className="flex gap-2 max-w-md mx-auto">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                Subscribe
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
