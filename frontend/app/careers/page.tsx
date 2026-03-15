"use client";

import { Button } from "@/components/ui/button";

export default function CareersPage() {
    return (
        <div className="min-h-[calc(100vh-4rem)] bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-2xl mx-auto text-center space-y-8">
                <div className="space-y-4">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900">
                        Join the LegalBook Team
                    </h1>
                    <p className="text-xl text-slate-600 font-medium">
                        We are building the future of legal access in India.
                    </p>
                </div>
                
                <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-slate-200">
                    <p className="text-lg text-slate-600 leading-relaxed mb-8">
                        We do not have open positions listed yet, but we are always looking for talented engineers, designers, and legal operations people. Send your resume to careers@legalbook.in
                    </p>
                    <a href="mailto:careers@legalbook.in">
                        <Button size="lg" className="bg-blue-600 hover:bg-blue-700 h-12 px-8 text-base">
                            Send Your Resume
                        </Button>
                    </a>
                </div>
            </div>
        </div>
    );
}
