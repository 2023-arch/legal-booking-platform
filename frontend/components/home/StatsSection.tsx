"use client";

import { useEffect, useState, useRef } from "react";
import api from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

function CountUp({ end, duration = 2000, suffix = "" }: { end: number; duration?: number; suffix?: string }) {
    const [count, setCount] = useState(0);
    const elementRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.1 }
        );

        if (elementRef.current) {
            observer.observe(elementRef.current);
        }

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!isVisible) return;

        let startTime: number;
        let animationFrame: number;

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            const percentage = Math.min(progress / duration, 1);
            const ease = 1 - Math.pow(1 - percentage, 4);

            setCount(Math.floor(end * ease));

            if (progress < duration) {
                animationFrame = requestAnimationFrame(animate);
            }
        };

        animationFrame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrame);
    }, [end, duration, isVisible]);

    return <span ref={elementRef}>{count.toLocaleString()}{suffix}</span>;
}

export default function StatsSection() {
    const [stats, setStats] = useState([
        { label: "Verified Lawyers", value: 500, suffix: "+" },
        { label: "Happy Clients", value: 2000, suffix: "+" },
        { label: "Consultations", value: 5000, suffix: "+" },
        { label: "Districts Covered", value: 150, suffix: "+" },
    ]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                // Try to fetch real stats from backend
                const { data } = await api.getPlatformStats();
                if (data && data.data) {
                    setStats([
                        { label: "Verified Lawyers", value: data.data.total_lawyers || 500, suffix: "+" },
                        { label: "Happy Clients", value: data.data.total_users || 2000, suffix: "+" },
                        { label: "Consultations", value: data.data.total_bookings || 5000, suffix: "+" },
                        { label: "Districts Covered", value: data.data.districts_covered || 150, suffix: "+" },
                    ]);
                }
            } catch (error) {
                console.log('Using demo stats due to API error');
            } finally {
                setLoading(false);
            }
        }
        fetchStats();
    }, []);

    if (loading) {
        return <StatsSkeletonLoader />;
    }

    return (
        <section className="border-y border-slate-100 bg-slate-50/50 py-12">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-slate-200/50">
                    {stats.map((stat, i) => (
                        <div key={i} className={i % 2 !== 0 ? "border-l border-slate-200/50 pl-8 md:pl-0 md:border-l-0" : ""}>
                            <div className="text-3xl md:text-4xl font-bold text-slate-900 mb-1">
                                <CountUp end={stat.value} suffix={stat.suffix} />
                            </div>
                            <div className="text-sm font-medium text-slate-500 uppercase tracking-wide">
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function StatsSkeletonLoader() {
    return (
        <section className="border-y border-slate-100 bg-slate-50/50 py-12">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex flex-col items-center">
                            <Skeleton className="h-10 w-24 mb-2" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
