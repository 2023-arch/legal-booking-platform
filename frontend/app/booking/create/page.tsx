'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Check, Loader2 } from 'lucide-react';
import Link from 'next/link';

declare global {
    interface Window {
        Razorpay: any;
    }
}

function BookingCreateContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user } = useAuth();
    const lawyer_id = searchParams.get('lawyer_id');

    const [step, setStep] = useState(1);
    const [lawyer, setLawyer] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Form data
    const [caseDescription, setCaseDescription] = useState('');
    const [courtId, setCourtId] = useState('');
    const [policeStationId, setPoliceStationId] = useState('');
    const [locationType, setLocationType] = useState<'court' | 'police_station'>('court');

    // New fields
    const [bookingName, setBookingName] = useState('');
    const [preferredTime, setPreferredTime] = useState('');
    const [duration, setDuration] = useState('30');

    // Draft data
    const [draftId, setDraftId] = useState('');
    const [aiSummary, setAiSummary] = useState('');

    // Location data
    const [courts, setCourts] = useState([]);
    const [policeStations, setPoliceStations] = useState([]);

    const fetchLawyer = async (id: string) => {
        try {
            const { data } = await api.get(`/lawyers/${id}`);
            setLawyer(data.data);
            // Get courts for this lawyer
            if (data.data.courts?.length > 0) {
                setCourts(data.data.courts);
            }
        } catch (error) {
            setError('Failed to load lawyer details');
        }
    };

    useEffect(() => {
        if (!user) {
            router.push(`/auth/login?redirect=/booking/create?lawyer_id=${lawyer_id}`);
            return;
        }
        if (user?.name) {
            setBookingName(user.name);
        }
        if (lawyer_id) {
            fetchLawyer(lawyer_id);
        }
    }, [user, lawyer_id]);

    const handleStep1Submit = async () => {
        if (caseDescription.length < 10 || caseDescription.length > 200) {
            setError('Description must be between 10-200 characters');
            return;
        }

        if (!bookingName.trim()) {
            setError('Please enter your name');
            return;
        }

        if (!preferredTime) {
            setError('Please select a preferred time');
            return;
        }

        if (!courtId && !policeStationId) {
            setError('Please select a court or police station');
            return;
        }

        setError('');
        setLoading(true);

        try {
            const { data } = await api.post('/bookings/create', {
                lawyer_id,
                case_description: caseDescription,
                court_id: locationType === 'court' ? courtId : undefined,
                police_station_id: locationType === 'police_station' ? policeStationId : undefined,
                user_name: bookingName,
                preferred_time: preferredTime,
                duration_minutes: parseInt(duration),
            });

            setDraftId(data.data.booking_draft_id);
            setAiSummary(data.data.ai_summary);
            setStep(2);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to create booking');
        } finally {
            setLoading(false);
        }
    };

    const handleRegenerateSummary = async () => {
        setLoading(true);
        try {
            const { data } = await api.post('/bookings/regenerate-summary', {
                booking_draft_id: draftId,
                updated_description: caseDescription,
            });
            setAiSummary(data.data.ai_summary);
        } catch (err: any) {
            setError('Failed to regenerate summary');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmAndPay = async () => {
        setLoading(true);
        try {
            const { data } = await api.post('/bookings/confirm', {
                booking_draft_id: draftId,
            });

            // Initialize Razorpay
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: data.data.amount,
                currency: data.data.currency,
                order_id: data.data.razorpay_order_id,
                name: 'LegalBook',
                description: `Consultation with ${lawyer.name}`,
                handler: async (response: any) => {
                    try {
                        await api.post('/payments/verify', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                        });
                        router.push(`/dashboard/bookings`);
                    } catch (err) {
                        setError('Payment verification failed');
                    }
                },
                prefill: {
                    name: user?.name,
                    email: user?.email,
                },
                theme: {
                    color: '#3B82F6',
                },
            };

            const razorpay = new window.Razorpay(options);
            razorpay.open();
        } catch (err: any) {
            setError('Failed to initiate payment');
        } finally {
            setLoading(false);
        }
    };

    if (!lawyer) {
        return <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Load Razorpay Script */}
            <script src="https://checkout.razorpay.com/v1/checkout.js"></script>

            <nav className="border-b bg-white">
                <div className="container mx-auto px-4 h-16 flex items-center">
                    <Link href={`/lawyers/${lawyer_id}`}>
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Button>
                    </Link>
                </div>
            </nav>

            <div className="container mx-auto px-4 py-8 max-w-3xl">
                {/* Progress Steps */}
                <div className="flex items-center justify-between mb-8">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className="flex items-center">
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center font-semibold ${s === step ? 'bg-blue-600 text-white' : s < step ? 'bg-green-600 text-white' : 'bg-gray-200'
                                }`}>
                                {s < step ? <Check className="h-5 w-5" /> : s}
                            </div>
                            {s < 3 && <div className={`h-1 w-24 mx-2 ${s < step ? 'bg-green-600' : 'bg-gray-200'}`} />}
                        </div>
                    ))}
                </div>

                {/* Lawyer Info Card */}
                <div className="bg-white rounded-lg shadow p-6 mb-8">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16">
                            <AvatarImage src={lawyer.profile_photo_url} />
                            <AvatarFallback>{lawyer.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <h2 className="text-xl font-semibold">{lawyer.name}</h2>
                            <p className="text-gray-600">{lawyer.specializations?.[0]?.name}</p>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold text-blue-600">₹{lawyer.consultation_fee}</div>
                            <div className="text-sm text-gray-500">Consultation Fee</div>
                        </div>
                    </div>
                </div>

                {error && (
                    <Alert variant="destructive" className="mb-6">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {/* Step 1: Case Description */}
                {step === 1 && (
                    <div className="bg-white rounded-lg shadow p-8">
                        <h2 className="text-2xl font-bold mb-6">Describe Your Case</h2>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Your Name
                                </label>
                                <Input
                                    value={bookingName}
                                    onChange={(e) => setBookingName(e.target.value)}
                                    placeholder="Enter your full name"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Preferred Time
                                    </label>
                                    <Input
                                        type="datetime-local"
                                        value={preferredTime}
                                        onChange={(e) => setPreferredTime(e.target.value)}
                                        min={new Date().toISOString().slice(0, 16)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Duration
                                    </label>
                                    <Select value={duration} onValueChange={setDuration}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select duration" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="15">15 Minutes</SelectItem>
                                            <SelectItem value="30">30 Minutes</SelectItem>
                                            <SelectItem value="45">45 Minutes</SelectItem>
                                            <SelectItem value="60">1 Hour</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Case Description (10-200 characters)
                                </label>
                                <Textarea
                                    value={caseDescription}
                                    onChange={(e) => setCaseDescription(e.target.value)}
                                    placeholder="Brief description of your legal issue..."
                                    maxLength={200}
                                    rows={4}
                                    className="resize-none"
                                />
                                <p className="text-sm text-gray-500 mt-1">
                                    {caseDescription.length}/200 characters
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Location Type</label>
                                <div className="flex gap-4">
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            checked={locationType === 'court'}
                                            onChange={() => setLocationType('court')}
                                            className="mr-2"
                                        />
                                        Court
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            checked={locationType === 'police_station'}
                                            onChange={() => setLocationType('police_station')}
                                            className="mr-2"
                                        />
                                        Police Station
                                    </label>
                                </div>
                            </div>

                            {locationType === 'court' && (
                                <div>
                                    <label className="block text-sm font-medium mb-2">Select Court</label>
                                    <Select value={courtId} onValueChange={setCourtId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Choose a court" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {courts.map((court: any) => (
                                                <SelectItem key={court.id} value={court.id}>
                                                    {court.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            <Button
                                onClick={handleStep1Submit}
                                disabled={loading || caseDescription.length < 10}
                                className="w-full"
                                size="lg"
                            >
                                {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                                Continue
                            </Button>
                        </div>
                    </div>
                )}

                {/* Step 2: AI Summary Review */}
                {step === 2 && (
                    <div className="bg-white rounded-lg shadow p-8">
                        <h2 className="text-2xl font-bold mb-6">Review Summary</h2>

                        <div className="space-y-6">
                            <div>
                                <h3 className="font-semibold mb-2">Your Description:</h3>
                                <div className="bg-gray-50 p-4 rounded">
                                    <p className="text-gray-700">{caseDescription}</p>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-semibold mb-2">AI-Generated Summary:</h3>
                                <div className="bg-blue-50 p-4 rounded border-l-4 border-blue-600">
                                    <p className="text-gray-800">{aiSummary}</p>
                                </div>
                            </div>

                            <Alert>
                                <AlertDescription>
                                    This summary will be sent to the lawyer. If it's not accurate, edit your description and regenerate.
                                </AlertDescription>
                            </Alert>

                            <div>
                                <label className="block text-sm font-medium mb-2">Edit Description (optional)</label>
                                <Textarea
                                    value={caseDescription}
                                    onChange={(e) => setCaseDescription(e.target.value)}
                                    maxLength={200}
                                    rows={3}
                                />
                                <Button
                                    variant="outline"
                                    onClick={handleRegenerateSummary}
                                    disabled={loading}
                                    className="mt-2"
                                >
                                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                    Regenerate Summary
                                </Button>
                            </div>

                            <div className="border-t pt-6">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="font-semibold">Consultation Fee:</span>
                                    <span className="text-3xl font-bold text-blue-600">₹{lawyer.consultation_fee}</span>
                                </div>

                                <Button
                                    onClick={handleConfirmAndPay}
                                    disabled={loading}
                                    className="w-full"
                                    size="lg"
                                >
                                    {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                                    Proceed to Payment
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function BookingCreatePage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>}>
            <BookingCreateContent />
        </Suspense>
    );
}
