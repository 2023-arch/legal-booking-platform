"use client";

import { useState } from "react";
import SearchFilters from "@/components/search/SearchFilters";
import LawyerCard from "@/components/lawyer/LawyerCard";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Filter } from "lucide-react";

// Mock Data
const MOCK_LAWYERS = Array(8).fill(null).map((_, i) => ({
    id: `lawyer-${i}`,
    name: `Adv. Name ${i + 1}`,
    specialization: ["Criminal Law", "Divorce", "Property", "Corporate"][i % 4],
    location: ["Delhi", "Mumbai", "Bangalore", "Chennai"][i % 4],
    experience: 5 + (i * 2),
    rating: 4.0 + (i * 0.1),
    reviewCount: 10 + (i * 5),
    languages: ["English", "Hindi"],
    price: 1000 + (i * 500),
    verified: true,
}));

export default function SearchPage() {
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    return (
        <div className="min-h-screen bg-slate-50 pt-8 pb-20">
            <div className="container mx-auto px-4">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Desktop Sidebar */}
                    <aside className="hidden lg:block w-72 flex-shrink-0">
                        <div className="bg-white rounded-xl border border-slate-200 p-6 sticky top-24">
                            <SearchFilters />
                        </div>
                    </aside>

                    {/* Mobile Filter Toggle */}
                    <div className="lg:hidden mb-4">
                        <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                            <SheetTrigger asChild>
                                <Button variant="outline" className="w-full justify-between">
                                    <span className="flex items-center gap-2"><Filter className="h-4 w-4" /> Filters</span>
                                    <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-full">3 Applied</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-[300px] sm:w-[540px] overflow-y-auto">
                                <div className="py-6">
                                    <SearchFilters />
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>

                    {/* Results Grid */}
                    <main className="flex-1">
                        <div className="mb-6 flex justify-between items-center">
                            <h1 className="text-xl font-bold text-slate-900">Showning {MOCK_LAWYERS.length} Lawyers</h1>
                            {/* Sort Dropdown could go here */}
                        </div>

                        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {MOCK_LAWYERS.map((lawyer) => (
                                <LawyerCard key={lawyer.id} {...lawyer} />
                            ))}
                        </div>

                        {/* Pagination Placeholder */}
                        <div className="mt-12 flex justify-center">
                            <Button variant="outline" className="mx-auto">Load More Lawyers</Button>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
