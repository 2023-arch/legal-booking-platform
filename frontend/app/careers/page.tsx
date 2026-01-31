"use client";

import { Briefcase, MapPin, Clock, ArrowRight, Heart, Users, Zap, Coffee } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const jobOpenings = [
    {
        title: "Senior Full-Stack Developer",
        department: "Engineering",
        location: "Bangalore, India (Hybrid)",
        type: "Full-time",
        description: "Build and scale our legal-tech platform using Next.js, FastAPI, and PostgreSQL. You'll work on AI-powered features, real-time video consultations, and payment integrations.",
        requirements: ["5+ years experience", "React/Next.js expert", "Python/FastAPI", "System design skills"],
        posted: "2 weeks ago"
    },
    {
        title: "Legal Operations Manager",
        department: "Operations",
        location: "Mumbai, India",
        type: "Full-time",
        description: "Oversee lawyer onboarding, verification workflows, and quality assurance. You'll be the bridge between our legal partners and the product team.",
        requirements: ["Law degree (LLB/LLM)", "3+ years in legal ops", "Strong communication", "Process optimization"],
        posted: "1 week ago"
    },
    {
        title: "Customer Support Specialist",
        department: "Support",
        location: "Remote (India)",
        type: "Full-time",
        description: "Be the first point of contact for clients and lawyers. Handle booking issues, refunds, and ensure a world-class support experience.",
        requirements: ["2+ years in support", "Hindi & English fluency", "Empathetic communication", "Problem-solving mindset"],
        posted: "3 days ago"
    },
    {
        title: "Data Analyst",
        department: "Product",
        location: "Bangalore, India",
        type: "Full-time",
        description: "Analyze platform data to drive product decisions. Build dashboards, identify trends, and help us understand our users better.",
        requirements: ["SQL expert", "Python/R for analysis", "Visualization tools", "1-3 years experience"],
        posted: "5 days ago"
    }
];

const perks = [
    { icon: Heart, title: "Health Insurance", desc: "Comprehensive coverage for you and family" },
    { icon: Users, title: "Flexible Work", desc: "Hybrid model with work-from-home days" },
    { icon: Zap, title: "Learning Budget", desc: "₹50,000/year for courses and conferences" },
    { icon: Coffee, title: "Team Offsites", desc: "Quarterly team trips and celebrations" }
];

export default function CareersPage() {
    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-purple-700 via-purple-600 to-indigo-700 text-white py-20">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">
                        Join Our Team
                    </h1>
                    <p className="text-xl text-purple-100 max-w-3xl mx-auto">
                        Help us transform how India accesses legal services.
                        We're building something meaningful, and we want you to be part of it.
                    </p>
                </div>
            </section>

            {/* Culture Section */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">Why Work With Us?</h2>
                        <p className="text-slate-600 max-w-2xl mx-auto">
                            We're a fast-growing startup with a mission to democratize legal access.
                            Our culture values ownership, empathy, and continuous learning.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
                        {perks.map((perk, i) => (
                            <div key={i} className="text-center p-6">
                                <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <perk.icon className="h-7 w-7 text-purple-600" />
                                </div>
                                <h3 className="font-semibold mb-2">{perk.title}</h3>
                                <p className="text-sm text-slate-500">{perk.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Job Openings */}
            <section className="py-20 bg-slate-50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">Open Positions</h2>
                        <p className="text-slate-600">Find your next role at LegalBook</p>
                    </div>
                    <div className="grid gap-6 max-w-4xl mx-auto">
                        {jobOpenings.map((job, index) => (
                            <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <div className="flex flex-wrap items-start justify-between gap-4">
                                        <div>
                                            <CardTitle className="text-xl mb-2">{job.title}</CardTitle>
                                            <div className="flex flex-wrap gap-3 text-sm text-slate-500">
                                                <span className="flex items-center gap-1">
                                                    <Briefcase className="h-4 w-4" />
                                                    {job.department}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="h-4 w-4" />
                                                    {job.location}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-4 w-4" />
                                                    {job.type}
                                                </span>
                                            </div>
                                        </div>
                                        <Badge variant="secondary">{job.posted}</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-slate-600 mb-4">{job.description}</p>
                                    <div className="flex flex-wrap gap-2">
                                        {job.requirements.map((req, i) => (
                                            <span key={i} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                                                {req}
                                            </span>
                                        ))}
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <a
                                        href={`mailto:careers@legalbook.in?subject=Application for ${job.title}`}
                                        className="text-purple-600 hover:text-purple-700 font-medium flex items-center gap-2"
                                    >
                                        Apply Now <ArrowRight className="h-4 w-4" />
                                    </a>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* General Applications */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-2xl font-bold mb-4">Don't See Your Role?</h2>
                    <p className="text-slate-600 mb-8 max-w-2xl mx-auto">
                        We're always looking for talented people. Send us your resume and tell us how you can contribute.
                    </p>
                    <a href="mailto:careers@legalbook.in?subject=General Application">
                        <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
                            Send Your Resume
                        </Button>
                    </a>
                    <p className="text-sm text-slate-500 mt-4">
                        Email: <a href="mailto:careers@legalbook.in" className="text-purple-600 hover:underline">careers@legalbook.in</a>
                    </p>
                </div>
            </section>
        </div>
    );
}
