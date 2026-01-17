'use client';

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { formatCurrency } from "@/lib/utils";
import { FilterX } from "lucide-react";

export default function SearchFilters() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">Filters</h3>
                <Button variant="ghost" size="sm" className="text-slate-500 hover:text-red-600 h-8 px-2">
                    <FilterX className="h-4 w-4 mr-1" /> Clear
                </Button>
            </div>

            {/* Location Filter */}
            <div className="space-y-3">
                <Label>Location</Label>
                <Select>
                    <SelectTrigger>
                        <SelectValue placeholder="Select State" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="delhi">Delhi</SelectItem>
                        <SelectItem value="maharashtra">Maharashtra</SelectItem>
                        <SelectItem value="karnataka">Karnataka</SelectItem>
                    </SelectContent>
                </Select>
                <Select disabled>
                    <SelectTrigger>
                        <SelectValue placeholder="Select District" />
                    </SelectTrigger>
                    <SelectContent>
                        {/* Populate dynamically */}
                    </SelectContent>
                </Select>
            </div>

            <Accordion type="multiple" defaultValue={["price", "exp"]} className="w-full">

                {/* Specialization */}
                <AccordionItem value="spec">
                    <AccordionTrigger>Specialization</AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-2">
                            {['Criminal', 'Civil', 'Family', 'Corporate', 'Property'].map((spec) => (
                                <div key={spec} className="flex items-center space-x-2">
                                    <Checkbox id={spec} />
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
                            <Slider defaultValue={[2000]} max={10000} step={500} />
                        </div>
                        <div className="flex justify-between text-xs text-slate-500">
                            <span>{formatCurrency(500)}</span>
                            <span>{formatCurrency(10000)}+</span>
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
