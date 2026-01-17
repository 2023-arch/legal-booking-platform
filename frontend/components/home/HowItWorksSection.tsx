"use client";

import { Search, Scale, Clock, MessageSquare } from "lucide-react";

const steps = [
    {
        icon: Search,
        title: "Search",
        desc: "Find lawyers by specialization, location, or experience.",
    },
    {
        icon: Scale,
        title: "Choose",
        desc: "Compare profiles, fees, and client reviews to pick the best match.",
    },
    {
        icon: Clock,
        title: "Book",
        desc: "Schedule a video or audio consultation at your convenient time.",
    },
    {
        icon: MessageSquare,
        title: "Consult",
        desc: "Connect securely and get expert legal advice instantly.",
    },
];

export default function HowItWorksSection() {
    return (
        <section className="py-24 bg-white">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                        Legal Help Simplified
                    </h2>
                    <p className="text-lg text-slate-600">
                        Get legal advice from the comfort of your home in 4 easy steps.
                    </p>
                </div>

                <div className="grid md:grid-cols-4 gap-8">
                    {steps.map((step, i) => (
                        <div key={i} className="relative group">
                            <div className="absolute -inset-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="relative p-6 text-center">
                                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <step.icon className="h-8 w-8 text-blue-600" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">
                                    {step.title}
                                </h3>
                                <p className="text-slate-600 leading-relaxed">
                                    {step.desc}
                                </p>
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
    );
}
