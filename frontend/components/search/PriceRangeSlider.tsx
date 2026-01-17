"use client";

import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";

interface PriceRangeSliderProps {
    min: number;
    max: number;
    step?: number;
    defaultValue?: [number, number];
    onValueChange: (value: [number, number]) => void;
}

export default function PriceRangeSlider({
    min,
    max,
    step = 500,
    defaultValue = [min, max],
    onValueChange
}: PriceRangeSliderProps) {
    const [range, setRange] = useState<[number, number]>(defaultValue);

    const handleChange = (newRange: number[]) => {
        const val = newRange as [number, number];
        setRange(val);
        onValueChange(val);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-slate-700">Consultation Fee</Label>
                <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded">
                    ₹{range[0].toLocaleString()} - ₹{range[1].toLocaleString()}
                </span>
            </div>
            <Slider
                defaultValue={defaultValue}
                min={min}
                max={max}
                step={step}
                value={range}
                onValueChange={handleChange}
                className="py-4"
            />
        </div>
    );
}
