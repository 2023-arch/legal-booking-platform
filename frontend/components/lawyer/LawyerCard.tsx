"use client";

import Link from "next/link";
import { Star, MapPin, BadgeCheck, Clock, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import BookingModal from "@/components/booking/BookingModal"; // Existing modal

interface LawyerCardProps {
    id: string;
    name: string;
    image?: string;
    specialization: string;
    location: string;
    experience: number;
    rating: number;
    reviewCount: number;
    languages: string[];
    price: number;
    verified?: boolean;
}

export default function LawyerCard({
    id,
    name,
    image,
    specialization,
    location,
    experience,
    rating,
    reviewCount,
    languages,
    price,
    verified = true,
}: LawyerCardProps) {
    return (
        <Card className="flex flex-col h-full hover:shadow-lg transition-shadow duration-300 border-slate-200 overflow-hidden">
            <CardContent className="p-6 flex-1">
                <div className="flex gap-4">
                    {/* Avatar */}
                    <div className="relative">
                        <Avatar className="h-16 w-16 md:h-20 md:w-20 border-2 border-slate-100">
                            <AvatarImage src={image} alt={name} />
                            <AvatarFallback className="bg-slate-100 text-slate-500 font-bold text-xl">
                                {name.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                        {verified && (
                            <div className="absolute -bottom-1 -right-1 bg-blue-600 rounded-full p-1 text-white ring-2 ring-white" title="Verified Lawyer">
                                <BadgeCheck className="h-3 w-3" />
                            </div>
                        )}
                    </div>

                    {/* Basic Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 truncate pr-2">
                                    {name}
                                </h3>
                                <p className="text-sm text-blue-600 font-medium mb-1">
                                    {specialization}
                                </p>
                            </div>
                            <div className="flex items-center bg-slate-50 px-2 py-1 rounded text-xs font-semibold text-slate-700">
                                <Star className="h-3 w-3 text-yellow-500 mr-1 fill-yellow-500" />
                                {rating}
                                <span className="text-slate-400 font-normal ml-1">({reviewCount})</span>
                            </div>
                        </div>

                        <div className="flex items-center text-sm text-slate-500 mt-2">
                            <MapPin className="h-3.5 w-3.5 mr-1" />
                            <span className="truncate">{location}</span>
                        </div>

                        <div className="flex items-center text-sm text-slate-500 mt-1">
                            <Clock className="h-3.5 w-3.5 mr-1" />
                            <span>{experience} years exp.</span>
                        </div>
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-4">
                    <div>
                        <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Languages</div>
                        <div className="flex flex-wrap gap-1">
                            {languages.slice(0, 3).map(lang => (
                                <Badge key={lang} variant="secondary" className="px-1.5 py-0 h-5 text-[10px] bg-slate-100 text-slate-600 font-normal">
                                    {lang}
                                </Badge>
                            ))}
                            {languages.length > 3 && (
                                <span className="text-[10px] text-slate-400 flex items-center">+{languages.length - 3} more</span>
                            )}
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Consultation</div>
                        <div className="text-lg font-bold text-slate-900">₹{price.toLocaleString()}</div>
                    </div>
                </div>
            </CardContent>

            <CardFooter className="p-4 bg-slate-50 border-t border-slate-100 gap-3">
                <Link href={`/lawyers/${id}`} className="flex-1">
                    <Button variant="outline" className="w-full border-slate-300 hover:bg-white hover:border-slate-400 text-slate-700">
                        View Profile
                    </Button>
                </Link>
                <div className="flex-1">
                    {/* Using existing BookingModal, passing minimal props logic */}
                    <BookingModal
                        lawyerId={id}
                        lawyerName={name}
                        consultationFee={price}
                        trigger={
                            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                                Book Now
                            </Button>
                        }
                    />
                </div>
            </CardFooter>
        </Card>
    );
}
