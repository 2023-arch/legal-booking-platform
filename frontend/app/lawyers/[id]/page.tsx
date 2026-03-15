'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, MapPin, Briefcase, Languages, Award, Clock } from 'lucide-react';
import Link from 'next/link';

export default function LawyerProfilePage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const [lawyer, setLawyer] = useState<any>(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (params.id) {
            fetchLawyer(params.id as string);
            fetchReviews(params.id as string);
        }
    }, [params.id]);

    const fetchLawyer = async (id: string) => {
        try {
            const { data } = await api.get(`/lawyers/${id}`);
            setLawyer(data.data);
        } catch (error) {
            console.error('Failed to fetch lawyer:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchReviews = async (id: string) => {
        try {
            const { data } = await api.get(`/lawyers/${id}/reviews`);
            setReviews(data.data || []);
        } catch (error) {
            console.error('Failed to fetch reviews:', error);
        }
    };

    const handleBookConsultation = () => {
        if (!user) {
            const returnUrl = `/booking/create?lawyer_id=${params.id}`;
            router.push(`/auth/login?returnUrl=${encodeURIComponent(returnUrl)}`);
            return;
        } else {
            router.push(`/booking/create?lawyer_id=${params.id}`);
        }
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>;
    }

    if (!lawyer) {
        return <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">Lawyer not found</h2>
                <Link href="/search"><Button>Back to Search</Button></Link>
            </div>
        </div>;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <nav className="border-b bg-white">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/" className="font-bold text-xl">LegalBook</Link>
                    <Link href="/search"><Button variant="outline">Back to Search</Button></Link>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        <Avatar className="h-32 w-32 border-4 border-white">
                            <AvatarImage src={lawyer.profile_photo_url} />
                            <AvatarFallback className="text-4xl bg-white text-blue-600">{lawyer.name[0]}</AvatarFallback>
                        </Avatar>

                        <div className="flex-1">
                            <h1 className="text-4xl font-bold mb-2">{lawyer.name}</h1>

                            <div className="flex flex-wrap gap-2 mb-4">
                                {lawyer.specializations?.map((spec: any, idx: number) => (
                                    <Badge key={idx} variant="secondary" className="bg-white text-blue-600">
                                        {spec.name}
                                    </Badge>
                                ))}
                            </div>

                            <div className="flex items-center gap-6 text-white/90 mb-4">
                                <div className="flex items-center gap-2">
                                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                                    <span className="font-semibold">{lawyer.average_rating.toFixed(1)}</span>
                                    <span>({lawyer.total_reviews} reviews)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Briefcase className="h-5 w-5" />
                                    <span>{lawyer.years_experience} years experience</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                {lawyer.languages?.map((lang: string, idx: number) => (
                                    <span key={idx} className="text-sm">{lang}</span>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white text-gray-900 rounded-lg p-6 shadow-lg">
                            <div className="text-center mb-4">
                                <div className="text-3xl font-bold text-blue-600">₹{lawyer.consultation_fee}</div>
                                <div className="text-sm text-gray-600">per consultation</div>
                            </div>
                            <Button onClick={handleBookConsultation} className="w-full" size="lg">
                                Book Consultation
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 py-8">
                <Tabs defaultValue="about" className="w-full">
                    <TabsList className="grid w-full max-w-md grid-cols-3">
                        <TabsTrigger value="about">About</TabsTrigger>
                        <TabsTrigger value="reviews">Reviews</TabsTrigger>
                        <TabsTrigger value="courts">Courts</TabsTrigger>
                    </TabsList>

                    <TabsContent value="about" className="mt-6">
                        <div className="bg-white rounded-lg shadow p-6 space-y-6">
                            <div>
                                <h2 className="text-xl font-semibold mb-3">About</h2>
                                <p className="text-gray-700 whitespace-pre-wrap">{lawyer.bio || 'No bio available'}</p>
                            </div>

                            {lawyer.education && (
                                <div>
                                    <h2 className="text-xl font-semibold mb-3">Education</h2>
                                    <p className="text-gray-700">{lawyer.education}</p>
                                </div>
                            )}

                            <div>
                                <h2 className="text-xl font-semibold mb-3">Bar Council Registration</h2>
                                <p className="text-gray-700">
                                    Registration No: {lawyer.bar_council_number.slice(0, 3)}***{lawyer.bar_council_number.slice(-3)}
                                </p>
                                <p className="text-sm text-green-600 mt-1">✓ Verified by LegalBook</p>
                            </div>

                            <div>
                                <h2 className="text-xl font-semibold mb-3">Specializations</h2>
                                <div className="flex flex-wrap gap-2">
                                    {lawyer.specializations?.map((spec: any, idx: number) => (
                                        <Badge key={idx} variant="outline">{spec.name}</Badge>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="reviews" className="mt-6">
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-xl font-semibold mb-6">Client Reviews</h2>

                            {reviews.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">No reviews yet</p>
                            ) : (
                                <div className="space-y-4">
                                    {reviews.map((review: any) => (
                                        <div key={review.id} className="border-b pb-4 last:border-0">
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <div className="font-semibold">{review.user_name}</div>
                                                    <div className="flex items-center gap-1">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star
                                                                key={i}
                                                                className={`h-4 w-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                                                                    }`}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                                <span className="text-sm text-gray-500">
                                                    {new Date(review.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="text-gray-700">{review.comment}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="courts" className="mt-6">
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-xl font-semibold mb-4">Practicing Courts</h2>
                            <div className="grid gap-3">
                                {lawyer.courts?.map((court: any, idx: number) => (
                                    <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                                        <MapPin className="h-5 w-5 text-blue-600" />
                                        <div>
                                            <div className="font-medium">{court.name}</div>
                                            <div className="text-sm text-gray-600">{court.type}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
