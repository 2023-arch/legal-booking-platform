"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { INDIAN_STATES_AND_DISTRICTS, SPECIALIZATIONS } from "@/lib/constants";
import PriceRangeSlider from "./PriceRangeSlider";

export default function SearchFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Derive initial state from URL params
    const qParam = searchParams.get('q') || '';
    const locParam = searchParams.get('location') || '';

    // TODO: Maintain more complex state or simple form ref
    const handleReset = () => {
        router.push('/search');
    };

    // Note: In a real app, these states would be lifted or managed via URL sync directly.
    // For now, minimal implementation that syncs simple filters.

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="font-semibold text-lg text-slate-900">Filters</h2>
                <Button variant="ghost" size="sm" onClick={handleReset} className="text-slate-500 hover:text-blue-600 h-8 px-2">
                    Clear All
                </Button>
            </div>

            {/* Price Range */}
            <div className="pb-4 border-b border-slate-100">
                <PriceRangeSlider
                    min={500}
                    max={10000}
                    onValueChange={(val) => console.log(val)}
                />
            </div>

            {/* Specialization */}
            <div className="space-y-3 pb-4 border-b border-slate-100">
                <Label className="text-base font-semibold text-slate-900">Specialization</Label>
                <Select defaultValue={qParam}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select Area of Law" />
                    </SelectTrigger>
                    <SelectContent>
                        {SPECIALIZATIONS.map((spec) => (
                            <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Experience */}
            <div className="space-y-3 pb-4 border-b border-slate-100">
                <Label className="text-base font-semibold text-slate-900">Experience</Label>
                <div className="space-y-2">
                    {["5+ Years", "10+ Years", "15+ Years"].map((exp) => (
                        <div key={exp} className="flex items-center space-x-2">
                            <Checkbox id={exp} />
                            <Label htmlFor={exp} className="text-sm font-normal text-slate-600 cursor-pointer">{exp}</Label>
                        </div>
                    ))}
                </div>
            </div>

            {/* Rating */}
            <div className="space-y-3">
                <Label className="text-base font-semibold text-slate-900">Rating</Label>
                <div className="space-y-2">
                    {[4, 3, 2].map((rating) => (
                        <div key={rating} className="flex items-center space-x-2">
                            <Checkbox id={`rating-${rating}`} />
                            <Label htmlFor={`rating-${rating}`} className="text-sm font-normal text-slate-600 cursor-pointer flex items-center">
                                {rating}+ Stars
                            </Label>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
