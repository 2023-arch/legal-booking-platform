"use client";

import { Calendar, User, ArrowRight, Clock } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const blogPosts = [
    {
        title: "Understanding Section 498A IPC: A Complete Guide",
        excerpt: "Section 498A deals with cruelty by husband or relatives. Learn about its provisions, recent amendments, and how to protect your rights.",
        author: "Adv. Priya Sharma",
        date: "January 25, 2026",
        category: "Criminal Law",
        readTime: "8 min read"
    },
    {
        title: "How to File an FIR Online in India (2026 Guide)",
        excerpt: "Step-by-step guide to filing FIRs online across different states. Know your rights and the process for cyber crimes, theft, and more.",
        author: "Adv. Rajesh Kumar",
        date: "January 20, 2026",
        category: "Legal Procedures",
        readTime: "5 min read"
    },
    {
        title: "Property Registration Process in Maharashtra",
        excerpt: "Complete guide to property registration - documents required, stamp duty rates, online process, and common mistakes to avoid.",
        author: "Adv. Amit Patil",
        date: "January 15, 2026",
        category: "Property Law",
        readTime: "10 min read"
    },
    {
        title: "Divorce Laws in India: Hindu Marriage Act vs Special Marriage Act",
        excerpt: "Understand the differences between divorce procedures under various personal laws and which one applies to your case.",
        author: "Adv. Kavitha Menon",
        date: "January 10, 2026",
        category: "Family Law",
        readTime: "12 min read"
    },
    {
        title: "Consumer Rights: How to File a Complaint in Consumer Court",
        excerpt: "Your complete guide to consumer protection laws, filing complaints online, and getting refunds for defective products or services.",
        author: "Adv. Sunita Rao",
        date: "January 5, 2026",
        category: "Consumer Law",
        readTime: "7 min read"
    },
    {
        title: "Startup Legal Checklist: From Incorporation to Funding",
        excerpt: "Essential legal requirements for startups - business structure, founder agreements, IP protection, and ESOP policies explained.",
        author: "Adv. Vikram Singh",
        date: "December 28, 2025",
        category: "Corporate Law",
        readTime: "15 min read"
    },
    {
        title: "Bail Provisions in India: Types, Procedure, and Rights",
        excerpt: "Learn about regular bail, anticipatory bail, and interim bail. Know when you can apply and what the court considers.",
        author: "Adv. Mohammed Khan",
        date: "December 20, 2025",
        category: "Criminal Law",
        readTime: "9 min read"
    },
    {
        title: "Cyber Crime Reporting: A Step-by-Step Guide",
        excerpt: "From online fraud to social media harassment - learn how to report cyber crimes, preserve evidence, and get legal recourse.",
        author: "Adv. Arjun Reddy",
        date: "December 15, 2025",
        category: "Cyber Law",
        readTime: "6 min read"
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
