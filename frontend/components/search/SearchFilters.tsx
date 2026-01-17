'use client';

import { useState, useMemo } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { formatCurrency } from "@/lib/utils";
import { FilterX } from "lucide-react";
import { INDIAN_STATES_AND_DISTRICTS, SPECIALIZATIONS } from "@/lib/constants";

export default function SearchFilters() {
    // Local state
    const [selectedState, setSelectedState] = useState<string>("");
    const [selectedDistrict, setSelectedDistrict] = useState<string>("");
    const [priceRange, setPriceRange] = useState([2000]);
    const [selectedSpecs, setSelectedSpecs] = useState<string[]>([]);

    // Derived state for districts
    const districts = useMemo(() => {
        if (!selectedState) return [];
        return INDIAN_STATES_AND_DISTRICTS[selectedState] || [];
    }, [selectedState]);

    const handleClear = () => {
        setSelectedState("");
        setSelectedDistrict("");
        setPriceRange([2000]);
        setSelectedSpecs([]);
    };

    // Handle state change (reset district)
    const handleStateChange = (value: string) => {
        setSelectedState(value);
        setSelectedDistrict(""); // Reset district when state changes
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">Filters</h3>
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-slate-500 hover:text-red-600 h-8 px-2"
                    onClick={handleClear}
                >
                    <FilterX className="h-4 w-4 mr-1" /> Clear
                </Button>
            </div>

            {/* Location Filter */}
            <div className="space-y-3">
                <Label>Location</Label>

                {/* State Select */}
                <Select value={selectedState} onValueChange={handleStateChange}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select State" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px]">
                        {Object.keys(INDIAN_STATES_AND_DISTRICTS).map((state) => (
                            <SelectItem key={state} value={state} className="capitalize">
                                {state}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* District Select */}
                <Select
                    value={selectedDistrict}
                    onValueChange={setSelectedDistrict}
                    disabled={!selectedState || districts.length === 0}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select District" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px]">
                        {districts.map((district) => (
                            <SelectItem key={district} value={district}>
                                {district}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <Accordion type="multiple" defaultValue={["spec", "price", "exp"]} className="w-full">

                {/* Specialization */}
                <AccordionItem value="spec">
                    <AccordionTrigger>Specialization</AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                            {SPECIALIZATIONS.map((spec) => (
                                <div key={spec} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={spec}
                                        checked={selectedSpecs.includes(spec)}
                                        onCheckedChange={(checked) => {
                                            if (checked) setSelectedSpecs([...selectedSpecs, spec]);
                                            else setSelectedSpecs(selectedSpecs.filter(s => s !== spec));
                                        }}
                                    />
                                    <Label htmlFor={spec} className="font-normal cursor-pointer leading-tight py-1">{spec}</Label>
                                </div>
                            ))}
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* Price Range */}
                <AccordionItem value="price">
                    <AccordionTrigger>Consultation Fee</AccordionTrigger>
                    <AccordionContent>
                        <div className="px-2 pt-2 pb-6">
                            <Slider
                                value={priceRange}
                                onValueChange={setPriceRange}
                                max={10000}
                                step={500}
                            />
                        </div>
                        <div className="flex justify-between text-xs text-slate-500">
                            <span>{formatCurrency(500)}</span>
                            <span>{formatCurrency(priceRange[0])}</span>
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* Experience */}
                <AccordionItem value="exp">
                    <AccordionTrigger>Experience</AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-2">
                            {[
                                { id: 'exp-1', label: '5+ Years' },
                                { id: 'exp-2', label: '10+ Years' },
                                { id: 'exp-3', label: '15+ Years' },
                            ].map((item) => (
                                <div key={item.id} className="flex items-center space-x-2">
                                    <Checkbox id={item.id} />
                                    <Label htmlFor={item.id} className="font-normal cursor-pointer">{item.label}</Label>
                                </div>
                            ))}
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    );
}
