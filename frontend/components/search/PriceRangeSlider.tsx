"use client";

import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";

interface PriceRangeSliderProps {
    min: number;
    max: number;
    step?: number;
    value?: [number, number];
    onValueChange: (value: [number, number]) => void;
}

export default function PriceRangeSlider({
    min,
    max,
    step = 500,
    value,
    onValueChange
}: PriceRangeSliderProps) {
    const [localRange, setLocalRange] = useState<[number, number]>(value || [min, max]);

    // Sync with external value if it changes
    useEffect(() => {
        if (value) {
            setLocalRange(value);
        }
    }, [value]);

    const handleChange = (newRange: number[]) => {
        const val = newRange as [number, number];
        setLocalRange(val);
        onValueChange(val);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-slate-700">Consultation Fee</Label>
                <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded">
                    ₹{localRange[0].toLocaleString()} - ₹{localRange[1].toLocaleString()}
                </span>
            </div>
            <Slider
                min={min}
                max={max}
                step={step}
                value={localRange}
                onValueChange={handleChange}
                className="py-4"
            />
        </div>
    );
}
