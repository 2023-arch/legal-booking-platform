"use client";

import Link from "next/link";
import { Gavel, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CTASection() {
    return (
        <section className="py-24 bg-slate-900 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-3xl" />

            <div className="container relative z-10 mx-auto px-4 text-center max-w-4xl">
                <Gavel className="h-16 w-16 mx-auto mb-8 text-blue-500" />
                <h2 className="text-4xl md:text-5xl font-bold mb-6">Are You a Qualified Lawyer?</h2>
                <p className="text-xl text-slate-300 mb-10 leading-relaxed">
                    Join India's fastest-growing legal platform. Connect with clients, manage your practice digitally, and grow your reputation.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <Link href="/auth/lawyer-register">
                        <Button size="lg" className="h-14 px-8 text-lg bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto">
                            <Shield className="mr-2 h-5 w-5" />
                            Register as Lawyer
                        </Button>
                    </Link>
                    <Link href="/for-lawyers">
                        <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-slate-600 text-slate-200 hover:bg-slate-800 hover:text-white w-full sm:w-auto">
                            Learn More
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
}
