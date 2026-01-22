"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import SearchFilters from "@/components/search/SearchFilters";
import LawyerCard from "@/components/lawyer/LawyerCard";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Filter } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/lib/api";

function SearchContent() {
    return <SearchFilters />;
}

// Separate component for Results to handle SearchParams cleanly
function SearchResults() {
    const searchParams = useSearchParams();
    const [lawyers, setLawyers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        async function fetchLawyers() {
            setLoading(true);
            try {
                // Convert searchParams to API params object
                const params: any = {};
                searchParams.forEach((value, key) => {
                    params[key] = value;
                });

                const { data } = await api.searchLawyers(params);
                if (data && data.success) {
                    setLawyers(data.data);
                    setTotal(data.data.length || 0); // Pagination support to be added if API supports 'total' meta
                } else {
                    setLawyers([]);
                }
            } catch (error) {
                console.error("Search failed:", error);
                setLawyers([]);
            } finally {
                setLoading(false);
            }
        }

        fetchLawyers();
    }, [searchParams]);

    if (loading) {
        return (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="h-[300px] border border-slate-200 rounded-lg p-4 space-y-4">
                        <div className="flex gap-4">
                            <Skeleton className="h-16 w-16 rounded-full" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-3 w-1/2" />
                            </div>
                        </div>
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <div className="pt-4 border-t border-slate-100 flex justify-between">
                            <Skeleton className="h-8 w-24" />
                            <Skeleton className="h-8 w-24" />
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    return (
        <>
            <div className="mb-6 flex justify-between items-center">
                <h1 className="text-xl font-bold text-slate-900">
                    {lawyers.length > 0 ? `Showing ${lawyers.length} Lawyers` : 'No lawyers found'}
                </h1>
            </div>

            {lawyers.length > 0 ? (
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {lawyers.map((lawyer) => (
                        <LawyerCard
                            key={lawyer.id || lawyer._id}
                            // Map API props to LawyerCard props if needed
                            id={lawyer.id || lawyer._id}
                            name={lawyer.name || lawyer.full_name}
                            image={lawyer.profile_image}
                            specialization={lawyer.specialization?.name || lawyer.specialization || "Legal Expert"}
                            location={`${lawyer.city || 'India'}, ${lawyer.state || ''}`}
                            experience={lawyer.years_experience || 0}
                            rating={lawyer.average_rating || 0}
                            reviewCount={lawyer.total_reviews || 0}
                            languages={lawyer.languages || ["English"]}
                            price={lawyer.consultation_fee || 0}
                            verified={lawyer.is_verified}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-white rounded-xl border border-slate-200">
                    <h3 className="text-lg font-semibold text-slate-900">No lawyers found</h3>
                    <p className="text-slate-500">Try adjusting your filters to find more results.</p>
                </div>
            )}
        </>
    );
}

export default function SearchPage() {
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    return (
        <div className="min-h-screen bg-slate-50 pt-8 pb-20">
            <div className="container mx-auto px-4">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Desktop Sidebar */}
                    <aside className="hidden lg:block w-72 flex-shrink-0">
                        <div className="bg-white rounded-xl border border-slate-200 p-6 sticky top-24">
                            <Suspense fallback={<div>Loading filters...</div>}>
                                <SearchContent />
                            </Suspense>
                        </div>
                    </aside>

                    {/* Mobile Filter Toggle */}
                    <div className="lg:hidden mb-4">
                        <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                            <SheetTrigger asChild>
                                <Button variant="outline" className="w-full justify-between">
                                    <span className="flex items-center gap-2"><Filter className="h-4 w-4" /> Filters</span>
                                    <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-full">Refine</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-[300px] sm:w-[540px] overflow-y-auto">
                                <div className="py-6">
                                    <Suspense fallback={<div>Loading filters...</div>}>
                                        <SearchContent />
                                    </Suspense>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>

                    {/* Results Grid */}
                    <main className="flex-1">
                        <Suspense fallback={<div>Loading results...</div>}>
                            <SearchResults />
                        </Suspense>
                    </main>
                </div>
            </div>
        </div>
    );
}
