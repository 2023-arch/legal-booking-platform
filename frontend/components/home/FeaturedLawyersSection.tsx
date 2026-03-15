"use client";

import { useEffect, useState } from "react";
import LawyerCard from "@/components/lawyer/LawyerCard";
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/lib/api";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

// Fallback demo data
const DEMO_LAWYERS = [
    {
        id: "demo-1",
        name: "Adv. Priya Sharma",
        specialization: "Corporate Law",
        location: "Mumbai, MH",
        experience: 12,
        rating: 4.9,
        reviewCount: 120,
        languages: ["English", "Hindi"],
        price: 2500,
        verified: true,
        image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200",
    },
    {
        id: "demo-2",
        name: "Adv. Rajesh Verma",
        specialization: "Criminal Defense",
        location: "Delhi, DL",
        experience: 15,
        rating: 4.8,
        reviewCount: 85,
        languages: ["Hindi", "English", "Punjabi"],
        price: 1800,
        verified: true,
        image: "https://images.unsplash.com/photo-1556157382-97eda2d622ca?auto=format&fit=crop&q=80&w=200",
    },
    {
        id: "demo-3",
        name: "Adv. Anjali Gupta",
        specialization: "Family Law",
        location: "Bangalore, KA",
        experience: 8,
        rating: 4.7,
        reviewCount: 92,
        languages: ["English", "Kannada"],
        price: 1500,
        verified: true,
        image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200",
    },
];

export default function FeaturedLawyersSection() {
    const [lawyers, setLawyers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchFeaturedLawyers() {
            try {
                const { data } = await api.getFeaturedLawyers(3);
                if (data && data.data && data.data.length > 0) {
                    // Transform API data to match LawyerCard props if necessary
                    // Assuming API returns data compatible or we map it here
                    const mappedLawyers = data.data.map((l: any) => ({
                        id: l.profile_id || l._id || l.id,
                        name: l.name,
                        specialization: l.specialization?.name || l.specialization || "Legal Expert",
                        location: l.city || "India",
                        experience: l.years_experience || 5,
                        rating: l.average_rating || 5.0,
                        reviewCount: l.total_reviews || 0,
                        languages: l.languages || ["English"],
                        price: l.consultation_fee || 1000,
                        verified: l.is_verified,
                        image: l.profile_image,
                    }));
                    setLawyers(mappedLawyers);
                } else {
                    // No lawyers returned, use demo
                    setLawyers(DEMO_LAWYERS);
                }
            } catch (err: any) {
                console.error("Failed to fetch lawyers, using demo data:", err);
                setError(err.message);
                setLawyers(DEMO_LAWYERS);
            } finally {
                setLoading(false);
            }
        }
        fetchFeaturedLawyers();
    }, []);

    if (loading) {
        return (
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-end mb-10">
                        <div>
                            <Skeleton className="h-8 w-64 mb-2" />
                            <Skeleton className="h-4 w-96" />
                        </div>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-[300px] rounded-lg border border-slate-200 p-4 space-y-4">
                                <Skeleton className="h-20 w-20 rounded-full" />
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900 mb-2">Top Rated Lawyers</h2>
                        <p className="text-slate-500 max-w-2xl">
                            Connect with verified legal experts who have a proven track record of success.
                        </p>
                    </div>
                    <Link href="/search">
                        <span className="flex items-center text-blue-600 font-semibold hover:underline">
                            View All Lawyers <ArrowRight className="h-4 w-4 ml-1" />
                        </span>
                    </Link>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {lawyers.map((lawyer) => (
                        <LawyerCard
                            key={lawyer.id}
                            {...lawyer}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
