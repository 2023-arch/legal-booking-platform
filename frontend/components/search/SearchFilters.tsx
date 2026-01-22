"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SPECIALIZATIONS } from "@/lib/constants";
import PriceRangeSlider from "./PriceRangeSlider";
import { useState, useEffect } from 'react';
import { useDebounce } from '@/hooks/use-debounce'; // We might need to create this or inline it

// Inline debounce hook if not exists
function useDebounceValue<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
}

export default function SearchFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Initial States from URL
    const [specialization, setSpecialization] = useState(searchParams.get('specialization') || "");
    const [priceRange, setPriceRange] = useState<[number, number]>([
        Number(searchParams.get('min_price')) || 500,
        Number(searchParams.get('max_price')) || 10000
    ]);
    const [experience, setExperience] = useState<string[]>(searchParams.get('min_experience') ? [`${searchParams.get('min_experience')}+ Years`] : []);
    const [rating, setRating] = useState<string | null>(searchParams.get('min_rating') ? `${searchParams.get('min_rating')}+ Stars` : null);

    // Debounce Price
    const debouncedPrice = useDebounceValue(priceRange, 500);

    // Update URL helper
    const updateFilters = (key: string, value: string | null) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        router.push(`/search?${params.toString()}`);
    };

    // Effect for Price updates
    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('min_price', debouncedPrice[0].toString());
        params.set('max_price', debouncedPrice[1].toString());
        router.push(`/search?${params.toString()}`);
    }, [debouncedPrice]);

    const handleSpecializationChange = (val: string) => {
        setSpecialization(val);
        updateFilters('specialization', val === "all" ? null : val);
    };

    const handleExperienceChange = (exp: string, checked: boolean) => {
        // Logic: For simplicity in this demo, we'll take the highest selected or just single select behavior if complex
        // Let's implement single select behavior for simplicity with the API which takes min_experience
        // Extract number
        const years = parseInt(exp);
        if (checked) {
            updateFilters('min_experience', years.toString());
            setExperience([exp]); // UI only supports single active for clarity 
        } else {
            updateFilters('min_experience', null);
            setExperience([]);
        }
    };

    const handleRatingChange = (rat: string, checked: boolean) => {
        const stars = parseInt(rat);
        if (checked) {
            updateFilters('min_rating', stars.toString());
            setRating(rat);
        } else {
            updateFilters('min_rating', null);
            setRating(null);
        }
    };

    const handleReset = () => {
        router.push('/search');
        setSpecialization("");
        setPriceRange([500, 10000]);
        setExperience([]);
        setRating(null);
    };

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
                    value={priceRange}
                    onValueChange={setPriceRange}
                />
            </div>

            {/* Specialization */}
            <div className="space-y-3 pb-4 border-b border-slate-100">
                <Label className="text-base font-semibold text-slate-900">Specialization</Label>
                <Select value={specialization} onValueChange={handleSpecializationChange}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select Area of Law" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Specializations</SelectItem>
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
                            <Checkbox
                                id={exp}
                                checked={experience.includes(exp)}
                                onCheckedChange={(checked) => handleExperienceChange(exp, checked as boolean)}
                            />
                            <Label htmlFor={exp} className="text-sm font-normal text-slate-600 cursor-pointer">{exp}</Label>
                        </div>
                    ))}
                </div>
            </div>

            {/* Rating */}
            <div className="space-y-3">
                <Label className="text-base font-semibold text-slate-900">Rating</Label>
                <div className="space-y-2">
                    {[4, 3, 2].map((r) => {
                        const label = `${r}+ Stars`;
                        return (
                            <div key={r} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`rating-${r}`}
                                    checked={rating === label}
                                    onCheckedChange={(checked) => handleRatingChange(label, checked as boolean)}
                                />
                                <Label htmlFor={`rating-${r}`} className="text-sm font-normal text-slate-600 cursor-pointer flex items-center">
                                    {label}
                                </Label>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
