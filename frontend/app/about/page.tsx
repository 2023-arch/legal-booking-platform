"use client";

import { Scale, Shield, Users, Award, CheckCircle2, Building2, Clock, Globe } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function AboutPage() {
    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 text-white py-20">
                <div className="container mx-auto px-4 text-center">
                    <div className="flex justify-center mb-6">
                        <div className="bg-blue-600 p-4 rounded-2xl">
                            <Scale className="h-12 w-12" />
                        </div>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">
                        About LegalBook
                    </h1>
                    <p className="text-xl text-slate-300 max-w-3xl mx-auto">
                        India's leading platform connecting clients with verified legal professionals. 
                        We're making legal help accessible, affordable, and trustworthy for everyone.
                    </p>
                </div>
            </section>

            {/* Mission & Vision */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 text-blue-600 font-semibold">
                                <Globe className="h-5 w-5" />
                                Our Mission
                            </div>
                            <h2 className="text-3xl font-bold">
                                Democratizing Access to Justice
                            </h2>
                            <p className="text-slate-600 leading-relaxed">
                                We believe everyone deserves quality legal representation, regardless of their location or background. 
                                Our mission is to bridge the gap between clients seeking legal help and verified, 
                                experienced lawyers across India.
                            </p>
                        </div>
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 text-green-600 font-semibold">
                                <Award className="h-5 w-5" />
                                Our Vision
                            </div>
                            <h2 className="text-3xl font-bold">
                                A World Where Legal Help is One Click Away
                            </h2>
                            <p className="text-slate-600 leading-relaxed">
                                We envision a future where finding the right lawyer is as easy as ordering food online. 
                                Transparent pricing, verified credentials, and instant consultations – 
                                that's the future we're building.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Trust Indicators */}
            <section className="py-16 bg-slate-50">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        <div>
                            <div className="text-4xl font-bold text-blue-600 mb-2">500+</div>
                            <div className="text-slate-600">Verified Lawyers</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-green-600 mb-2">10,000+</div>
                            <div className="text-slate-600">Consultations Completed</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-purple-600 mb-2">28</div>
                            <div className="text-slate-600">States Covered</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-orange-600 mb-2">4.8★</div>
                            <div className="text-slate-600">Average Rating</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Trust Us */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">Why Trust LegalBook?</h2>
                        <p className="text-slate-600 max-w-2xl mx-auto">
                            We've built robust systems to ensure quality, security, and reliability at every step.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        <Card className="border-0 shadow-lg">
                            <CardContent className="pt-8 text-center">
                                <div className="bg-blue-100 text-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                    <Shield className="h-8 w-8" />
                                </div>
                                <h3 className="font-bold text-xl mb-3">Verified Credentials</h3>
                                <p className="text-slate-600">
                                    Every lawyer's Bar Council registration, ID proofs, and qualifications 
                                    are manually verified by our team before approval.
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="border-0 shadow-lg">
                            <CardContent className="pt-8 text-center">
                                <div className="bg-green-100 text-green-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle2 className="h-8 w-8" />
                                </div>
                                <h3 className="font-bold text-xl mb-3">Secure Payments</h3>
                                <p className="text-slate-600">
                                    Your payments are held in escrow until your consultation is complete. 
                                    Full refund if the lawyer cancels.
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="border-0 shadow-lg">
                            <CardContent className="pt-8 text-center">
                                <div className="bg-purple-100 text-purple-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                    <Clock className="h-8 w-8" />
                                </div>
                                <h3 className="font-bold text-xl mb-3">24/7 Support</h3>
                                <p className="text-slate-600">
                                    Our dedicated support team is available round the clock to help you 
                                    with booking issues, refunds, or any queries.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Our Team */}
            <section className="py-20 bg-slate-50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">Leadership Team</h2>
                        <p className="text-slate-600 max-w-2xl mx-auto">
                            A passionate team of legal tech enthusiasts working to transform how India accesses legal services.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                        {[
                            { name: "Arun Mehta", role: "Founder & CEO", desc: "Former legal consultant with 15+ years of experience" },
                            { name: "Priya Venkatesh", role: "Chief Legal Officer", desc: "Ex-Supreme Court advocate and legal policy expert" },
                            { name: "Rahul Sharma", role: "CTO", desc: "Tech veteran from IIT Delhi with passion for legaltech" }
                        ].map((member, i) => (
                            <div key={i} className="text-center">
                                <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold">
                                    {member.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <h3 className="font-bold text-lg">{member.name}</h3>
                                <p className="text-blue-600 font-medium mb-2">{member.role}</p>
                                <p className="text-slate-600 text-sm">{member.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Office Info */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4 text-center">
                    <div className="flex items-center justify-center gap-2 text-slate-600 mb-4">
                        <Building2 className="h-5 w-5" />
                        <span>Headquarters</span>
                    </div>
                    <p className="text-lg">
                        Tech Park, Outer Ring Road, Bangalore, Karnataka 560103, India
                    </p>
                    <p className="text-slate-500 mt-2">
                        CIN: U74999KA2024PTC123456
                    </p>
                </div>
            </section>
        </div>
    );
}
