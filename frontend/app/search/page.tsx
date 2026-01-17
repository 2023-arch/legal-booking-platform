'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import SearchFilters from '@/components/search/SearchFilters';
import LawyerCard from '@/components/search/LawyerCard';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function SearchPage() {
    const [view, setView] = useState<'grid' | 'list'>('list');

    // Placeholder data
    const lawyers = [
        {
            id: '1',
            name: 'Adv. Priya Sharma',
            rating: 4.9,
            review_count: 124,
            experience_years: 12,
            specializations: [{ name: 'Corporate Law' }, { name: 'Startups' }],
            consultation_fee: 2500,
            languages: ['English', 'Hindi'],
            courts: ['High Court, Delhi', 'Supreme Court'],
        },
        {
            id: '2',
            name: 'Adv. Rahul Verma',
            rating: 4.7,
            review_count: 89,
            experience_years: 8,
            specializations: [{ name: 'Criminal Defense' }, { name: 'Cyber Crime' }],
            consultation_fee: 1500,
            languages: ['English', 'Marathi'],
            courts: ['District Court, Pune'],
        },
        {
            id: '3',
            name: 'Adv. Anita Desai',
            rating: 4.8,
            review_count: 210,
            experience_years: 15,
            specializations: [{ name: 'Family Law' }, { name: 'Divorce' }],
            consultation_fee: 3000,
            languages: ['English', 'Hindi', 'Gujarati'],
            courts: ['Family Court, Mumbai'],
        },
    ];

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* 1. Header Search Bar (Sticky) */}
            <div className="bg-white border-b sticky top-16 z-30 shadow-sm">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex gap-4 max-w-4xl mx-auto">
                        {/* Mobile Filter Trigger */}
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="outline" className="lg:hidden">
                                    <SlidersHorizontal className="h-4 w-4 mr-2" /> Filters
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                                <SheetHeader>
                                    <SheetTitle>Filters</SheetTitle>
                                    <SheetDescription>Narrow down your search</SheetDescription>
                                </SheetHeader>
                                <div className="mt-6">
                                    <SearchFilters />
                                </div>
                            </SheetContent>
                        </Sheet>

                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                            <Input
                                placeholder="Search by name, specialization, or keyword..."
                                className="pl-10 h-10 w-full"
                            />
                        </div>
                        <Button className="hidden sm:flex">Search</Button>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="flex gap-8">
                    {/* 2. Desktop Filters Sidebar (Left) */}
                    <aside className="hidden lg:block w-64 flex-shrink-0">
                        <div className="bg-white p-6 rounded-xl border border-slate-200 sticky top-36">
                            <SearchFilters />
                        </div>
                    </aside>

                    {/* 3. Results Area (Right) */}
                    <main className="flex-1">
                        <div className="flex justify-between items-center mb-6">
                            <h1 className="text-2xl font-bold text-slate-900">
                                Found {lawyers.length} Lawyers
                                <span className="text-base font-normal text-slate-500 ml-2">in New Delhi</span>
                            </h1>

                            <div className="flex items-center gap-2">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="sm" className="h-9">
                                            <ArrowUpDown className="h-4 w-4 mr-2" /> Sort by
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem>Recommended</DropdownMenuItem>
                                        <DropdownMenuItem>Price: Low to High</DropdownMenuItem>
                                        <DropdownMenuItem>Price: High to Low</DropdownMenuItem>
                                        <DropdownMenuItem>Rating: High to Low</DropdownMenuItem>
                                        <DropdownMenuItem>Experience: High to Low</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {lawyers.map((lawyer) => (
                                <LawyerCard key={lawyer.id} lawyer={lawyer} />
                            ))}
                        </div>

                        {/* Pagination Placeholder */}
                        <div className="mt-12 flex justify-center">
                            <Button variant="outline">Load More Lawyers</Button>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
