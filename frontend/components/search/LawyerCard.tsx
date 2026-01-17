'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Briefcase, Gavel, Languages } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import BookingModal from "@/components/booking/BookingModal";
import BookingModal from "@/components/booking/BookingModal";

// Types (move to separate types file later)
interface Lawyer {
    id: string;
    name: string;
    photo_url?: string;
    specializations: { name: string }[];
    rating: number;
    review_count: number;
    experience_years: number;
    languages: string[];
    courts: string[];
    consultation_fee: number;
}

interface LawyerCardProps {
    lawyer: Lawyer;
}

export default function LawyerCard({ lawyer }: LawyerCardProps) {
    return (
        <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200 border-slate-200">
            <div className="flex flex-col md:flex-row">
                {/* Lawyer Photo Section */}
                <div className="w-full md:w-64 bg-slate-100 relative">
                    <div className="aspect-[4/5] w-full h-full bg-slate-200 flex items-center justify-center text-slate-400">
                        {lawyer.photo_url ? (
                            <img src={lawyer.photo_url} alt={lawyer.name} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-4xl font-bold text-slate-300">{lawyer.name.charAt(0)}</span>
                        )}
                    </div>
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2 py-1 rounded-md shadow-sm flex items-center gap-1 text-sm font-bold text-slate-900">
                        <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                        {lawyer.rating} <span className="text-slate-500 font-normal">({lawyer.review_count})</span>
                    </div>
                </div>

                {/* Details Section */}
                <CardContent className="flex-1 p-6 flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                                    {lawyer.name}
                                </h3>
                                <div className="flex items-center gap-2 text-slate-600 text-sm mt-1">
                                    <Briefcase className="h-3.5 w-3.5" />
                                    <span>{lawyer.experience_years} years experience</span>
                                </div>
                            </div>
                            <div className="text-right hidden sm:block">
                                <div className="text-lg font-bold text-slate-900">{formatCurrency(lawyer.consultation_fee)}</div>
                                <div className="text-xs text-slate-500">per consultation</div>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4">
                            {lawyer.specializations.map((spec, i) => (
                                <Badge key={i} variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100">
                                    {spec.name}
                                </Badge>
                            ))}
                        </div>

                        <div className="space-y-2 text-sm text-slate-600 mb-6">
                            <div className="flex items-center gap-2">
                                <Gavel className="h-4 w-4 text-slate-400" />
                                <span className="line-clamp-1">{lawyer.courts.join(", ")}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Languages className="h-4 w-4 text-slate-400" />
                                <span>{lawyer.languages.join(", ")}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100 mt-auto">
                        <div className="sm:hidden flex justify-between items-center mb-2">
                            <div>
                                <div className="text-lg font-bold text-slate-900">{formatCurrency(lawyer.consultation_fee)}</div>
                                <div className="text-xs text-slate-500">per consultation</div>
                            </div>
                        </div>
                        <Link href={`/lawyers/${lawyer.id}`} className="flex-1">
                            <Button variant="outline" className="w-full border-blue-200 text-blue-700 hover:bg-blue-50">
                                View Profile
                            </Button>
                        </Link>

                        <div className="flex-1">
                            <BookingModal
                                lawyerId={lawyer.id}
                                lawyerName={lawyer.name}
                                consultationFee={lawyer.consultation_fee}
                                trigger={
                                    <Button className="w-full bg-slate-900 hover:bg-slate-800">
                                        Book <span className="hidden sm:inline ml-1">Consultation</span>
                                    </Button>
                                }
                            />
                        </div>
                    </div>
                </CardContent>
            </div>
        </Card>
    );
}
