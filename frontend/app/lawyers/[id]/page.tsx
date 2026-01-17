"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import {
    MapPin, Star, ShieldCheck, Clock, Award, Phone, Mail,
    Share2, Heart, CheckCircle2, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import BookingModal from "@/components/booking/BookingModal";

// Mock Data Loader
const getLawyer = (id: string) => ({
    id,
    name: "Adv. Priya Sharma",
    photo: "/placeholder-lawyer.jpg",
    specializations: ["Corporate Law", "Startup Advisory", "IPR"],
    location: "High Court, Delhi",
    experience: 12,
    rating: 4.9,
    reviewCount: 124,
    languages: ["English", "Hindi", "Punjabi"],
    barCouncilId: "D/1234/2012",
    bio: `Highly experienced Corporate Lawyer with over 12 years of practice at the High Court of Delhi. Specializing in Mergers & Acquisitions, Intellectual Property Rights, and Startup legal compliances. I have successfully advised over 50+ startups in their fundraising journeys and legal structuring.

My approach is client-centric, focusing on practical legal solutions that enable business growth while ensuring 100% compliance. I believe in transparent communication and quick turnaround times.`,
    education: [
        "LL.M in Corporate Law, National Law University, Delhi (2012)",
        "B.A. LL.B (Hons), Symbiosis Law School, Pune (2010)"
    ],
    courts: ["Supreme Court of India", "High Court of Delhi", "NCLT Delhi"],
    availability: "Mon - Sat, 10:00 AM - 7:00 PM",
    fee: 2500
});

export default function LawyerProfilePage() {
    const params = useParams();
    const lawyer = getLawyer(params.id as string);
    const [activeTab, setActiveTab] = useState("about");

    // Review Breakdown Mock
    const ratings = [
        { stars: 5, percent: 85 },
        { stars: 4, percent: 10 },
        { stars: 3, percent: 3 },
        { stars: 2, percent: 1 },
        { stars: 1, percent: 1 }
    ];

    return (
        <div className="min-h-screen bg-white">
            {/* Header Hero */}
            <div className="bg-slate-900 text-white pt-20 pb-24 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

                <div className="container mx-auto px-4 relative z-10">
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        <Avatar className="h-32 w-32 md:h-40 md:w-40 border-4 border-white/20 shadow-2xl">
                            <AvatarImage src={lawyer.photo} />
                            <AvatarFallback className="text-4xl bg-slate-800 text-slate-400">
                                {lawyer.name.charAt(0)}
                            </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 space-y-4">
                            <div className="flex flex-wrap items-center gap-3">
                                <h1 className="text-3xl md:text-4xl font-bold">{lawyer.name}</h1>
                                <Badge className="bg-blue-500/20 text-blue-200 hover:bg-blue-500/30 border-blue-500/50">
                                    <ShieldCheck className="h-3.5 w-3.5 mr-1" />
                                    Verified
                                </Badge>
                            </div>

                            <div className="flex flex-wrap gap-2 text-slate-300 text-sm">
                                <div className="flex items-center">
                                    <MapPin className="h-4 w-4 mr-1 text-slate-400" />
                                    {lawyer.location}
                                </div>
                                <span className="hidden md:inline">•</span>
                                <div className="flex items-center">
                                    <Clock className="h-4 w-4 mr-1 text-slate-400" />
                                    {lawyer.experience} Years Experience
                                </div>
                                <span className="hidden md:inline">•</span>
                                <div className="flex items-center text-yellow-500 font-medium">
                                    <Star className="h-4 w-4 mr-1 fill-yellow-500" />
                                    {lawyer.rating} ({lawyer.reviewCount} Reviews)
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 pt-2">
                                {lawyer.specializations.map(spec => (
                                    <Badge key={spec} variant="outline" className="border-slate-600 text-slate-300">
                                        {spec}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        <div className="flex md:flex-col gap-3 w-full md:w-auto mt-4 md:mt-0">
                            <Button variant="outline" className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white">
                                <Share2 className="h-4 w-4 mr-2" /> Share
                            </Button>
                            <Button variant="outline" className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white">
                                <Heart className="h-4 w-4 mr-2" /> Save
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 -mt-12 relative z-20 pb-20">
                <div className="grid lg:grid-cols-3 gap-8">

                    {/* Left Column - Tabs */}
                    <div className="lg:col-span-2">
                        <Card className="border-none shadow-xl shadow-slate-200/50">
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                <div className="border-b px-6 pt-2">
                                    <TabsList className="bg-transparent h-14 w-full justify-start space-x-8">
                                        <TabsTrigger value="about" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none h-full px-0 text-base">About</TabsTrigger>
                                        <TabsTrigger value="reviews" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none h-full px-0 text-base">Reviews ({lawyer.reviewCount})</TabsTrigger>
                                        <TabsTrigger value="availability" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none h-full px-0 text-base">Availability</TabsTrigger>
                                    </TabsList>
                                </div>

                                <div className="p-6 md:p-8">
                                    <TabsContent value="about" className="mt-0 space-y-8 animate-in fade-in duration-500">
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-900 mb-4">Biography</h3>
                                            <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{lawyer.bio}</p>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-8">
                                            <div>
                                                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                                                    <Award className="h-5 w-5 mr-2 text-blue-600" /> Education
                                                </h3>
                                                <ul className="space-y-3">
                                                    {lawyer.education.map((edu, i) => (
                                                        <li key={i} className="flex items-start text-slate-600 text-sm">
                                                            <div className="h-1.5 w-1.5 rounded-full bg-slate-300 mt-2 mr-3 flex-shrink-0" />
                                                            {edu}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                                                    <MapPin className="h-5 w-5 mr-2 text-blue-600" /> Practicing Courts
                                                </h3>
                                                <ul className="space-y-3">
                                                    {lawyer.courts.map((court, i) => (
                                                        <li key={i} className="flex items-start text-slate-600 text-sm">
                                                            <CheckCircle2 className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
                                                            {court}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                                                <Languages className="h-5 w-5 mr-2 text-blue-600" /> Languages Spoken
                                            </h3>
                                            <div className="flex gap-2">
                                                {lawyer.languages.map(lang => (
                                                    <Badge key={lang} variant="secondary" className="px-3 py-1 bg-slate-100 text-slate-700">
                                                        {lang}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="reviews" className="mt-0 space-y-8 animate-in fade-in duration-500">
                                        <div className="flex items-center gap-8 p-6 bg-slate-50 rounded-xl">
                                            <div className="text-center">
                                                <div className="text-5xl font-bold text-slate-900 mb-1">{lawyer.rating}</div>
                                                <div className="flex justify-center mb-1">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} className={`h-4 w-4 ${i < Math.floor(lawyer.rating) ? "text-yellow-500 fill-yellow-500" : "text-slate-300"}`} />
                                                    ))}
                                                </div>
                                                <div className="text-sm text-slate-500">{lawyer.reviewCount} Reviews</div>
                                            </div>
                                            <div className="flex-1 space-y-2 border-l pl-8 border-slate-200">
                                                {ratings.map((rating) => (
                                                    <div key={rating.stars} className="flex items-center gap-2">
                                                        <span className="text-xs font-medium w-3">{rating.stars}</span>
                                                        <Star className="h-3 w-3 text-slate-400" />
                                                        <Progress value={rating.percent} className="h-2" />
                                                        <span className="text-xs text-slate-400 w-8">{rating.percent}%</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Mock Reviews List */}
                                        <div className="space-y-6">
                                            {[1, 2, 3].map((i) => (
                                                <div key={i} className="border-b border-slate-100 last:border-0 pb-6 last:pb-0">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <Avatar className="h-8 w-8">
                                                                <AvatarFallback>U{i}</AvatarFallback>
                                                            </Avatar>
                                                            <span className="font-semibold text-sm">User {i}823</span>
                                                        </div>
                                                        <span className="text-xs text-slate-400">2 days ago</span>
                                                    </div>
                                                    <div className="flex mb-2">
                                                        {[...Array(5)].map((_, j) => (
                                                            <Star key={j} className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                                                        ))}
                                                    </div>
                                                    <p className="text-sm text-slate-600">
                                                        Very helpful consultation. Adv. Priya explained the legal nuances associated with my startup clearly.
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="availability" className="mt-0 py-8 text-center animate-in fade-in duration-500">
                                        <div className="bg-blue-50 text-blue-800 p-4 rounded-lg inline-block mb-4">
                                            <Clock className="h-6 w-6 mx-auto mb-2" />
                                            <div className="font-semibold">Available Today</div>
                                            <div className="text-sm opacity-80">{lawyer.availability}</div>
                                        </div>
                                        <p className="text-slate-500">Calendar integration coming soon. For now, please proceed to book to check specific slots.</p>
                                    </TabsContent>
                                </div>
                            </Tabs>
                        </Card>
                    </div>

                    {/* Right Column - Booking Card */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 space-y-4">
                            <Card className="shadow-xl shadow-blue-200/20 border-blue-100 overflow-hidden">
                                <div className="bg-blue-600 text-white p-4 text-center">
                                    <div className="text-sm opacity-90 mb-1">Fixed Consultation Fee</div>
                                    <div className="text-3xl font-bold">₹{lawyer.fee}</div>
                                    <div className="text-xs opacity-75 mt-1">per 30 min session</div>
                                </div>
                                <CardContent className="p-6 space-y-6">
                                    <div className="space-y-3">
                                        <div className="flex items-center text-sm text-slate-600">
                                            <CheckCircle2 className="h-4 w-4 mr-3 text-green-500" />
                                            <span>One-on-one Video Consultation</span>
                                        </div>
                                        <div className="flex items-center text-sm text-slate-600">
                                            <CheckCircle2 className="h-4 w-4 mr-3 text-green-500" />
                                            <span>Document Review Included</span>
                                        </div>
                                        <div className="flex items-center text-sm text-slate-600">
                                            <CheckCircle2 className="h-4 w-4 mr-3 text-green-500" />
                                            <span>100% Secure & Confidential</span>
                                        </div>
                                    </div>

                                    <BookingModal
                                        lawyerId={lawyer.id}
                                        lawyerName={lawyer.name}
                                        amount={lawyer.fee}
                                        trigger={
                                            <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 text-lg h-12">
                                                Book Consultation
                                            </Button>
                                        }
                                    />

                                    <div className="text-center text-xs text-slate-400">
                                        No hidden charges. Full refund if cancelled 24h prior.
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-slate-50 border-slate-200">
                                <CardContent className="p-4 flex items-center gap-3">
                                    <div className="bg-white p-2 rounded-full shadow-sm">
                                        <Phone className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-500 font-semibold uppercase">Need Help?</div>
                                        <div className="text-sm font-bold text-slate-800">+91 98765 43210</div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                </div>
            </div>

            {/* Mobile Sticky Booking Bar */}
            <div className="lg:hidden fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50 flex items-center justify-between">
                <div>
                    <div className="text-xs text-slate-500">Consultation Fee</div>
                    <div className="text-xl font-bold text-slate-900">₹{lawyer.fee}</div>
                </div>
                <BookingModal
                    lawyerId={lawyer.id}
                    lawyerName={lawyer.name}
                    amount={lawyer.fee}
                    trigger={
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg px-8">
                            Book Now
                        </Button>
                    }
                />
            </div>
        </div>
    );
}
