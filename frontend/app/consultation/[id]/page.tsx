"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { bookingsAPI } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { Calendar, Clock, Loader2, Video, Copy, ExternalLink, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";

export default function ConsultationRoom({ params }: { params: { id: string } }) {
    const { id } = params;
    const { toast } = useToast();
    const [booking, setBooking] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBooking = async () => {
            try {
                const data = await bookingsAPI.getBookingById(id);
                setBooking(data);
            } catch (err) {
                console.error("Failed to fetch booking:", err);
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Failed to load consultation details. Please try again later."
                });
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchBooking();
        }
    }, [id, toast]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center space-y-4">
                    <h2 className="text-2xl font-bold text-slate-900">Consultation Not Found</h2>
                    <p className="text-slate-500">The consultation you are looking for does not exist.</p>
                </div>
            </div>
        );
    }

    // From the requirements, consultation start endpoint returns the actual meet link
    // However, the prompt says the booking object should hold consultation.meet_link.
    // If it's loaded within booking.consultation.meet_link we use that. 
    // Otherwise fallback to safe null.
    const meetLink = booking.consultation?.meet_link;

    const copyToClipboard = () => {
        if (!meetLink) return;
        navigator.clipboard.writeText(meetLink);
        toast({
            title: "Copied!",
            description: "Google Meet link copied to clipboard."
        });
    };

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto space-y-8">
                {/* Header Section */}
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Virtual Consultation</h1>
                    <p className="mt-2 text-slate-500">Review your case details and join the scheduled video call.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Left Column: Details */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Info Card */}
                        <div className="bg-white rounded-xl shadow-sm border p-6 space-y-6">
                            <div className="flex items-start justify-between border-b pb-6">
                                <div>
                                    <h2 className="text-xl font-semibold text-slate-900">
                                        Adv. {booking.lawyer?.user?.full_name || booking.lawyer?.user?.name || "Lawyer"}
                                    </h2>
                                    <p className="text-sm text-blue-600 font-medium mt-1">
                                        {booking.lawyer?.specializations?.[0]?.name || "Legal Advisor"}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                                        {booking.status}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center text-sm text-slate-500">
                                        <Calendar className="h-4 w-4 mr-2" />
                                        Date & Time (IST)
                                    </div>
                                    <div className="font-medium text-slate-900">
                                        {booking.scheduled_time ? format(new Date(booking.scheduled_time), "PPP 'at' p") : "Not scheduled"}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center text-sm text-slate-500">
                                        <Clock className="h-4 w-4 mr-2" />
                                        Duration Booked
                                    </div>
                                    <div className="font-medium text-slate-900">
                                        {booking.duration_minutes || 30} minutes
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Case Summary Card */}
                        <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
                            <h3 className="text-lg font-semibold text-slate-900 border-b pb-3">AI Case Intake Summary</h3>
                            <p className="text-slate-700 leading-relaxed text-sm whitespace-pre-wrap">
                                {booking.ai_summary || booking.original_description || "No summary available."}
                            </p>
                        </div>
                    </div>

                    {/* Right Column: Actions & Timeline */}
                    <div className="space-y-6">
                        {/* Join Card */}
                        <div className="bg-white rounded-xl shadow-sm border p-6 space-y-6">
                            <div className="space-y-3">
                                <Button 
                                    className="w-full bg-[#1a73e8] hover:bg-[#1557b0] text-white flex items-center justify-center gap-2 h-12 text-base font-medium transition-colors"
                                    disabled={!meetLink}
                                    onClick={() => meetLink && window.open(meetLink, '_blank')}
                                >
                                    <Video className="h-5 w-5" />
                                    {meetLink ? "Join Google Meet" : "Link not yet available"}
                                </Button>
                                
                                <Button 
                                    variant="outline" 
                                    className="w-full flex items-center justify-center gap-2"
                                    disabled={!meetLink}
                                    onClick={copyToClipboard}
                                >
                                    {meetLink ? <Copy className="h-4 w-4" /> : <ExternalLink className="h-4 w-4 text-slate-400" />}
                                    Copy Meet Link
                                </Button>
                            </div>

                            <div className="text-xs text-slate-500 text-center bg-slate-50 p-3 rounded-lg border">
                                Both you and your lawyer have received a calendar invite with the Google Meet link.
                            </div>
                        </div>

                        {/* Timeline */}
                        <div className="bg-white rounded-xl shadow-sm border p-6">
                            <h3 className="font-semibold text-slate-900 mb-6">Consultation Status</h3>
                            
                            <div className="space-y-6">
                                <div className="relative flex gap-4">
                                    <div className="absolute left-3 top-8 bottom-[-24px] w-px bg-green-200" />
                                    <div className="relative z-10 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                                    </div>
                                    <div className="pt-0.5">
                                        <p className="text-sm font-medium text-slate-900">Booking Confirmed</p>
                                    </div>
                                </div>
                                
                                <div className="relative flex gap-4">
                                    <div className="absolute left-3 top-8 bottom-[-24px] w-px bg-slate-200" />
                                    <div className="relative z-10 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                                    </div>
                                    <div className="pt-0.5">
                                        <p className="text-sm font-medium text-slate-900">Payment Received</p>
                                    </div>
                                </div>
                                
                                <div className="relative flex gap-4">
                                    <div className="absolute left-3 top-8 bottom-[-24px] w-px bg-slate-200" />
                                    <div className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${booking.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600 ring-4 ring-blue-50'}`}>
                                        {booking.status === 'completed' ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-2 h-2 rounded-full bg-blue-600" />}
                                    </div>
                                    <div className="pt-0.5">
                                        <p className={`text-sm font-medium ${booking.status !== 'completed' ? 'text-blue-700' : 'text-slate-900'}`}>
                                            Join at {booking.scheduled_time ? format(new Date(booking.scheduled_time), "p") : "scheduled time"}
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="relative flex gap-4">
                                    <div className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${booking.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-slate-100'}`}>
                                        {booking.status === 'completed' ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <div className="w-2 h-2 rounded-full bg-slate-300" />}
                                    </div>
                                    <div className="pt-0.5">
                                        <p className={`text-sm font-medium ${booking.status === 'completed' ? 'text-slate-900' : 'text-slate-400'}`}>Consultation Complete</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
