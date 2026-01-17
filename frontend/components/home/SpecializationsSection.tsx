"use client";

import Link from "next/link";
import { Gavel, Heart, Briefcase, Users, Home, ShieldAlert, FileText, Globe } from "lucide-react";
import { Card } from "@/components/ui/card";

const specializations = [
    { icon: Gavel, name: "Criminal Defense", count: 120 },
    { icon: Heart, name: "Family & Divorce", count: 85 },
    { icon: Home, name: "Property Dispute", count: 92 },
    { icon: Briefcase, name: "Corporate Law", count: 64 },
    { icon: ShieldAlert, name: "Cyber Crime", count: 45 },
    { icon: Users, name: "Labor & Employment", count: 58 },
    { icon: FileText, name: "Civil Litigation", count: 150 },
    { icon: Globe, name: "Immigration", count: 32 },
];

export default function SpecializationsSection() {
    return (
        <section className="py-24 bg-white">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                        Find Experts by Category
                    </h2>
                    <p className="text-lg text-slate-600">
                        Select a specialization to find the right lawyer for your specific needs.
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {specializations.map((spec, i) => (
                        <Link key={i} href={`/search?q=${spec.name}`}>
                            <Card className="h-full hover:border-blue-500 hover:shadow-lg transition-all duration-300 cursor-pointer group p-6 text-center bg-slate-50 hover:bg-white">
                                <div className="w-12 h-12 mx-auto bg-white rounded-full shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 group-hover:text-blue-600 transition-all text-slate-500">
                                    <spec.icon className="h-6 w-6" />
                                </div>
                                <h3 className="font-semibold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">
                                    {spec.name}
                                </h3>
                                <p className="text-sm text-slate-500">
                                    {spec.count} lawyers
                                </p>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
