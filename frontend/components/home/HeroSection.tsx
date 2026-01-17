"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function HeroSection() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [locationQuery, setLocationQuery] = useState("");

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (searchQuery) params.set("q", searchQuery);
        if (locationQuery) params.set("location", locationQuery);
        router.push(`/search?${params.toString()}`);
    };

    return (
        <section className="relative py-20 lg:py-32 overflow-hidden bg-white">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-100 rounded-full blur-3xl opacity-50 animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-purple-100 rounded-full blur-3xl opacity-50 animate-pulse delay-1000" />
            </div>

            <div className="container relative z-10 mx-auto px-4 text-center">
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
                    <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm font-medium bg-blue-50 text-blue-700 border-blue-100">
                        Trusted by 10,000+ Clients
                    </Badge>
                </div>

                <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 mb-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                    Find the Right Lawyer, <br />
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Right Now.
                    </span>
                </h1>

                <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
                    Connect with verified legal experts across India for consultation, documentation, and representation. Secure, confidential, and instant.
                </p>

                {/* Search Bar */}
                <div className="bg-white p-2 rounded-2xl shadow-xl shadow-slate-200/50 max-w-3xl mx-auto border border-slate-100 flex flex-col md:flex-row gap-2 mb-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                        <Input
                            placeholder="Search by specialization (e.g. Divorce, Property)"
                            className="pl-12 h-12 border-none shadow-none text-base focus-visible:ring-0 bg-transparent"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        />
                    </div>
                    <div className="hidden md:block w-px bg-slate-200 my-2" />
                    <div className="relative flex-1">
                        <MapPin className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                        <Input
                            placeholder="City or Pincode"
                            className="pl-12 h-12 border-none shadow-none text-base focus-visible:ring-0 bg-transparent"
                            value={locationQuery}
                            onChange={(e) => setLocationQuery(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        />
                    </div>
                    <Button
                        size="lg"
                        className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-200"
                        onClick={handleSearch}
                    >
                        Find Lawyers
                    </Button>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap justify-center gap-3 text-sm text-slate-600 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-700">
                    <span>Popular:</span>
                    {["Divorce", "Property Dispute", "Criminal Defense", "Corporate", "Startup"].map((tag) => (
                        <button
                            key={tag}
                            onClick={() => router.push(`/search?q=${tag}`)}
                            className="hover:text-blue-600 underline decoration-slate-300 hover:decoration-blue-600 underline-offset-4 transition-all"
                        >
                            {tag}
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );
}
