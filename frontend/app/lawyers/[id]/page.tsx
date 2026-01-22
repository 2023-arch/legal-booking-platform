"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    MapPin, Star, ShieldCheck, Clock, Award, Phone, Mail,
    Share2, Heart, CheckCircle2, ChevronRight, Languages
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton"; // Use the one I created
import BookingModal from "@/components/booking/BookingModal";
import api from "@/lib/api";

export default function LawyerProfilePage() {
    const params = useParams();
    const router = useRouter();
    const [lawyer, setLawyer] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("about");

    useEffect(() => {
        async function fetchLawyer() {
            if (!params.id) return;
            setLoading(true);
            try {
                const { data } = await api.getLawyer(params.id as string);
                if (data && (data.success || data.id || data._id)) {
                    // Normalize data if needed
                    // API might return data wrapped or direct object
                    setLawyer(data.data || data);
                } else {
                    console.error("Lawyer not found");
                    // router.push('/404'); // Optional handling
                }
            } catch (error) {
                console.error("Error fetching lawyer:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchLawyer();
    }, [params.id]);

    // Format Helpers
    const getExperience = (l: any) => l.years_experience || l.experience || 0;
    const getFee = (l: any) => l.consultation_fee || l.fee || 0;
    const getName = (l: any) => l.full_name || l.name || "Lawyer";
    // Ensure specializations is an array
    const getSpecializations = (l: any) => {
        if (Array.isArray(l.specialization)) return l.specialization;
        if (typeof l.specialization === 'string') return [l.specialization];
        if (l.specializations) return l.specializations;
        return ["Legal Expert"];
    };
    const cities = ["Supreme Court of India", "High Court of Delhi"]; // Fallback courts logic if not in API

    if (loading) {
        return <ProfileSkeleton />;
    }

    if (!lawyer) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-slate-900">Lawyer Not Found</h2>
                    <p className="text-slate-500 mb-6">The lawyer profile you are looking for does not exist.</p>
                    <Button onClick={() => router.push('/search')}>Back to Search</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Header Hero */}
            <div className="bg-slate-900 text-white pt-20 pb-24 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

                <div className="container mx-auto px-4 relative z-10">
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        <Avatar className="h-32 w-32 md:h-40 md:w-40 border-4 border-white/20 shadow-2xl">
                            <AvatarImage src={lawyer.profile_image || lawyer.photo} />
                            <AvatarFallback className="text-4xl bg-slate-800 text-slate-400">
                                {getName(lawyer).charAt(0)}
                            </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 space-y-4">
                            <div className="flex flex-wrap items-center gap-3">
                                <h1 className="text-3xl md:text-4xl font-bold">{getName(lawyer)}</h1>
                                {lawyer.is_verified && (
                                    <Badge className="bg-blue-500/20 text-blue-200 hover:bg-blue-500/30 border-blue-500/50">
                                        <ShieldCheck className="h-3.5 w-3.5 mr-1" />
                                        Verified
                                    </Badge>
                                )}
                            </div>

                            <div className="flex flex-wrap gap-2 text-slate-300 text-sm">
                                <div className="flex items-center">
                                    <MapPin className="h-4 w-4 mr-1 text-slate-400" />
                                    {lawyer.city || lawyer.location || "India"}, {lawyer.state}
                                </div>
                                <span className="hidden md:inline">•</span>
                                <div className="flex items-center">
                                    <Clock className="h-4 w-4 mr-1 text-slate-400" />
                                    {getExperience(lawyer)} Years Experience
                                </div>
                                <span className="hidden md:inline">•</span>
                                <div className="flex items-center text-yellow-500 font-medium">
                                    <Star className="h-4 w-4 mr-1 fill-yellow-500" />
                                    {lawyer.average_rating || 5.0} ({lawyer.total_reviews || 0} Reviews)
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 pt-2">
                                {getSpecializations(lawyer).map((spec: string) => (
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
                                        <TabsTrigger value="reviews" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none h-full px-0 text-base">Reviews ({lawyer.total_reviews || 0})</TabsTrigger>
                                        <TabsTrigger value="availability" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none h-full px-0 text-base">Availability</TabsTrigger>
                                    </TabsList>
                                </div>

                                <div className="p-6 md:p-8">
                                    <TabsContent value="about" className="mt-0 space-y-8 animate-in fade-in duration-500">
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-900 mb-4">Biography</h3>
                                            <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                                                {lawyer.bio || `Experienced lawyer specializing in ${getSpecializations(lawyer).join(', ')}. Committed to providing top-notch legal services.`}
                                            </p>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-8">
                                            <div>
                                                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                                                    <Award className="h-5 w-5 mr-2 text-blue-600" /> Education
                                                </h3>
                                                <ul className="space-y-3">
                                                    {/* Fallback education if not API provided */}
                                                    {(lawyer.education || ["B.A. LL.B (Hons)"]).map((edu: string, i: number) => (
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
                                                    {(lawyer.courts || cities).map((court: string, i: number) => (
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
                                                {(lawyer.languages || ["English", "Hindi"]).map((lang: string) => (
                                                    <Badge key={lang} variant="secondary" className="px-3 py-1 bg-slate-100 text-slate-700">
                                                        {lang}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="reviews" className="mt-0 space-y-8 animate-in fade-in duration-500">
                                        {/* Reviews implementation - using mock breakdown for now if API doesn't provide detail */}
                                        <div className="flex items-center gap-8 p-6 bg-slate-50 rounded-xl">
                                            <div className="text-center">
                                                <div className="text-5xl font-bold text-slate-900 mb-1">{lawyer.average_rating || 5.0}</div>
                                                <div className="flex justify-center mb-1">
                                                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                                </div>
                                                <div className="text-sm text-slate-500">{lawyer.total_reviews || 0} Reviews</div>
                                            </div>
                                            <div className="flex-1 space-y-2 border-l pl-8 border-slate-200">
                                                <div className="text-sm text-slate-500 italic">Detailed review statistics coming soon...</div>
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="availability" className="mt-0 py-8 text-center animate-in fade-in duration-500">
                                        <div className="bg-blue-50 text-blue-800 p-4 rounded-lg inline-block mb-4">
                                            <Clock className="h-6 w-6 mx-auto mb-2" />
                                            <div className="font-semibold">Available Today</div>
                                            <div className="text-sm opacity-80">{lawyer.availability || "10:00 AM - 6:00 PM"}</div>
                                        </div>
                                        <p className="text-slate-500">Book a consultation to see precise slots.</p>
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
                                    <div className="text-3xl font-bold">₹{getFee(lawyer).toLocaleString()}</div>
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
                                        lawyerId={lawyer.id || lawyer._id}
                                        lawyerName={getName(lawyer)}
                                        consultationFee={getFee(lawyer)}
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
                        </div>
                    </div>

                </div>
            </div>

            {/* Mobile Sticky Booking Bar */}
            <div className="lg:hidden fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50 flex items-center justify-between">
                <div>
                    <div className="text-xs text-slate-500">Consultation Fee</div>
                    <div className="text-xl font-bold text-slate-900">₹{getFee(lawyer).toLocaleString()}</div>
                </div>
                <BookingModal
                    lawyerId={lawyer.id || lawyer._id}
                    lawyerName={getName(lawyer)}
                    consultationFee={getFee(lawyer)}
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

function ProfileSkeleton() {
    return (
        <div className="min-h-screen bg-white">
            <div className="bg-slate-900 pt-20 pb-24 relative">
                <div className="container mx-auto px-4 relative z-10 flex flex-col md:flex-row gap-8">
                    <Skeleton className="h-32 w-32 md:h-40 md:w-40 rounded-full bg-slate-800" />
                    <div className="flex-1 space-y-4">
                        <Skeleton className="h-10 w-3/4 bg-slate-800" />
                        <Skeleton className="h-6 w-1/2 bg-slate-800" />
                    </div>
                </div>
            </div>
            <div className="container mx-auto px-4 -mt-12 relative z-20 pb-20">
                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-64 w-full" />
                    </div>
                    <div className="lg:col-span-1">
                        <Skeleton className="h-96 w-full" />
                    </div>
                </div>
            </div>
        </div>
    )
}
