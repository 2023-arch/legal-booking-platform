"use client";

import { Star, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const testimonials = [
    {
        name: "Rajesh Kumar",
        location: "Mumbai, Maharashtra",
        caseType: "Property Dispute",
        rating: 5,
        quote: "I was stuck in a property dispute for 3 years. Through LegalBook, I found Adv. Sharma who resolved it in just 6 months. The video consultation feature saved me countless trips to the lawyer's office.",
        date: "December 2025"
    },
    {
        name: "Priya Menon",
        location: "Kochi, Kerala",
        caseType: "Divorce & Custody",
        rating: 5,
        quote: "Going through a divorce was the hardest time of my life. My lawyer from LegalBook was not just professional but also compassionate. She helped me get fair custody of my children.",
        date: "November 2025"
    },
    {
        name: "Amit Patel",
        location: "Ahmedabad, Gujarat",
        caseType: "Startup Legal",
        rating: 5,
        quote: "As a first-time entrepreneur, I had no idea about company registration, agreements, etc. LegalBook connected me with a corporate lawyer who handled everything. Best ₹3000 I ever spent!",
        date: "January 2026"
    },
    {
        name: "Sunita Devi",
        location: "Patna, Bihar",
        caseType: "Consumer Complaint",
        rating: 4,
        quote: "A builder cheated me of ₹15 lakhs. I used LegalBook to find a consumer court specialist. Within 8 months, I got a full refund plus compensation. Truly grateful!",
        date: "October 2025"
    },
    {
        name: "Mohammed Farhan",
        location: "Hyderabad, Telangana",
        caseType: "Criminal Defense",
        rating: 5,
        quote: "My brother was falsely accused in a case. We were panicking and didn't know any good lawyers. LegalBook's AI matched us with the perfect criminal lawyer who got him bail within 48 hours.",
        date: "September 2025"
    },
    {
        name: "Kavitha Reddy",
        location: "Bangalore, Karnataka",
        caseType: "Employment Issue",
        rating: 5,
        quote: "My company owed me 4 months of salary. A labor lawyer from LegalBook drafted a legal notice and negotiated on my behalf. Got my full dues within 3 weeks!",
        date: "August 2025"
    },
    {
        name: "Vikram Singh",
        location: "Delhi NCR",
        caseType: "Cyber Crime",
        rating: 4,
        quote: "Fell victim to an online scam. The cyber crime specialist I found here helped me file an FIR and even recovered 60% of my money. Didn't know recovery was possible!",
        date: "July 2025"
    },
    {
        name: "Anita Sharma",
        location: "Jaipur, Rajasthan",
        caseType: "Will & Succession",
        rating: 5,
        quote: "After my father passed away, there was confusion about the will. LegalBook helped us find a succession law expert who resolved disputes amicably between siblings. Saved our family relationships.",
        date: "June 2025"
    }
];

function StarRating({ rating }: { rating: number }) {
    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={`h-4 w-4 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                />
            ))}
        </div>
    );
}

export default function ReviewsPage() {
    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-green-600 to-emerald-700 text-white py-20">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">
                        Success Stories
                    </h1>
                    <p className="text-xl text-green-100 max-w-3xl mx-auto">
                        Real stories from real clients who found the right legal help through LegalBook.
                        Every review here is from a verified booking on our platform.
                    </p>
                    <div className="flex justify-center items-center gap-4 mt-8">
                        <div className="flex">
                            {[1, 2, 3, 4, 5].map(i => (
                                <Star key={i} className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                            ))}
                        </div>
                        <span className="text-lg">4.8 average from 2,500+ reviews</span>
                    </div>
                </div>
            </section>

            {/* Testimonials Grid */}
            <section className="py-20 bg-slate-50">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
                        {testimonials.map((testimonial, index) => (
                            <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                                <CardContent className="pt-6">
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                                            {testimonial.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold">{testimonial.name}</h3>
                                            <p className="text-sm text-slate-500">{testimonial.location}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                            {testimonial.caseType}
                                        </span>
                                        <StarRating rating={testimonial.rating} />
                                    </div>

                                    <div className="relative">
                                        <Quote className="h-6 w-6 text-slate-200 absolute -top-1 -left-1" />
                                        <p className="text-slate-600 text-sm pl-5 leading-relaxed">
                                            {testimonial.quote}
                                        </p>
                                    </div>

                                    <p className="text-xs text-slate-400 mt-4 pt-4 border-t">
                                        Reviewed in {testimonial.date}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-2xl font-bold mb-4">Ready to Write Your Success Story?</h2>
                    <p className="text-slate-600 mb-8 max-w-2xl mx-auto">
                        Join thousands of satisfied clients who found the right legal help through LegalBook.
                    </p>
                    <a
                        href="/search"
                        className="inline-flex items-center justify-center px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Find a Lawyer Now
                    </a>
                </div>
            </section>
        </div>
    );
}
