'use client';

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BookingCard from "@/components/dashboard/BookingCard";
import { bookingsAPI } from "@/lib/api";
import { Loader2, Calendar } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default function BookingsPage() {
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const data = await bookingsAPI.getBookings();
                // Handle different response structures
                const bookingList = Array.isArray(data) ? data : (data.data || []);
                setBookings(bookingList);
            } catch (error) {
                console.error("Failed to fetch bookings:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, []);

    const filterBookings = (statusGroup: string) => {
        if (statusGroup === 'upcoming') {
            return bookings.filter(b => b.status === 'confirmed' || b.status === 'upcoming');
        }
        if (statusGroup === 'pending') {
            return bookings.filter(b => b.status === 'pending');
        }
        if (statusGroup === 'history') {
            return bookings.filter(b => b.status === 'completed' || b.status === 'cancelled' || b.status === 'rejected');
        }
        return [];
    };

    const renderBookingList = (statusGroup: string) => {
        const filtered = filterBookings(statusGroup);

        if (filtered.length === 0) {
            return (
                <div className="text-center py-12 bg-white rounded-lg border border-slate-100">
                    <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-slate-900">No bookings found</h3>
                    <p className="text-slate-500 mb-4">You don't have any {statusGroup} bookings.</p>
                    {statusGroup !== 'history' && (
                        <Link href="/search" className="text-blue-600 font-semibold hover:underline">
                            Book a Consultation
                        </Link>
                    )}
                </div>
            );
        }

        return (
            <div className="space-y-4">
                {filtered.map((booking) => (
                    <BookingCard
                        key={booking.id || booking._id}
                        id={booking.id || booking._id}
                        lawyerName={booking.lawyer?.full_name || "Lawyer"}
                        lawyerImage={booking.lawyer?.profile_image}
                        description={booking.case_description}
                        date={booking.preferred_time ? format(new Date(booking.preferred_time), "MMM d, yyyy") : "TBD"}
                        time={booking.preferred_time ? format(new Date(booking.preferred_time), "h:mm a") : "TBD"}
                        status={booking.status || 'pending'}
                        amount={booking.amount || booking.consultation_fee || 0}
                        type={booking.type || 'video'}
                    />
                ))}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-900">My Bookings</h1>
                <Link href="/search" className="hidden sm:block">
                    <span className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline">
                        + New Booking
                    </span>
                </Link>
            </div>

            <Tabs defaultValue="upcoming" className="w-full">
                <TabsList className="mb-4 bg-white border border-slate-200 w-full sm:w-auto overflow-x-auto justify-start">
                    <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                    <TabsTrigger value="pending">Pending</TabsTrigger>
                    <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>

                <TabsContent value="upcoming" className="space-y-4">
                    {renderBookingList('upcoming')}
                </TabsContent>

                <TabsContent value="pending" className="space-y-4">
                    {renderBookingList('pending')}
                </TabsContent>

                <TabsContent value="history" className="space-y-4">
                    {renderBookingList('history')}
                </TabsContent>
            </Tabs>
        </div>
    );
}
