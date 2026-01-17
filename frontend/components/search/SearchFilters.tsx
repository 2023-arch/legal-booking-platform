'use client';

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { formatCurrency } from "@/lib/utils";
import { FilterX } from "lucide-react";

// Full list of Indian States and UTs
const INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
    "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
    "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh",
    "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh",
    "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh",
    "Lakshadweep", "Puducherry"
];

const SPECIALIZATIONS = ['Criminal', 'Civil', 'Family', 'Corporate', 'Property', 'Cyber Crime', 'Labor Law', 'Intellectual Property'];

export default function SearchFilters() {
    // Local state for UI interactivity (Clear button demo)
    const [selectedState, setSelectedState] = useState<string>("");
    const [priceRange, setPriceRange] = useState([2000]);
    const [selectedSpecs, setSelectedSpecs] = useState<string[]>([]);

    const handleClear = () => {
        setSelectedState("");
        setPriceRange([2000]);
        setSelectedSpecs([]);
        console.log("Filters cleared");
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
                <Select value={selectedState} onValueChange={setSelectedState}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select State" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px]">
                        {INDIAN_STATES.map((state) => (
                            <SelectItem key={state} value={state.toLowerCase()}>{state}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select disabled>
                    <SelectTrigger>
                        <SelectValue placeholder="Select District" />
                    </SelectTrigger>
                    <SelectContent>
                        {/* Dynamic Districts would go here */}
                    </SelectContent>
                </Select>
            </div>

            <Accordion type="multiple" defaultValue={["spec", "price", "exp"]} className="w-full">

                {/* Specialization */}
                <AccordionItem value="spec">
                    <AccordionTrigger>Specialization</AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-2">
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
                                    <Label htmlFor={spec} className="font-normal cursor-pointer">{spec}</Label>
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
