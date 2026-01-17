"use client"

import * as React from "react"
import { RotateCw } from "lucide-react"
import { cn } from "@/lib/utils"

export interface IconsProps extends React.ComponentProps<"svg"> { }

export const Icons = {
    spinner: ({ className, ...props }: IconsProps) => (
        <RotateCw className={cn("h-4 w-4 animate-spin", className)} {...props} />
    ),
    google: ({ className, ...props }: IconsProps) => (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn("h-4 w-4", className)}
            {...props}
        >
            <path d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2 6.5 2 12.17 2 17.84 6.42 22.5 12 22.5c5.2 0 9.69-3.45 9.69-9.69 0-.63-.09-1.24-.25-1.71z" />
        </svg>
    ),
}
