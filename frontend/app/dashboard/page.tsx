"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Video, ChevronRight, FileCheck, Loader2 } from "lucide-react";
import Link from "next/link";
import { bookingsAPI, authAPI } from "@/lib/api";
import BookingCard from "@/components/dashboard/BookingCard";
import { format } from "date-fns";

export default function UserDashboard() {
    const [user, setUser] = useState<any>(null);
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch User & Bookings in parallel
                const [userData, bookingsData] = await Promise.all([
                    authAPI.getCurrentUser(),
                    bookingsAPI.getBookings()
                ]);

                // Handle different response structures if needed
                setUser(userData.data?.data || userData.data);

                // Assuming bookingsAPI.getBookings() returns the data array directly due to my previous fix
                // or if it returns { data: [...] }
                const bookingList = Array.isArray(bookingsData) ? bookingsData : (bookingsData.data || []);
                setBookings(bookingList);

            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Calculate Stats
    const upcomingCount = bookings.filter(b => b.status === 'confirmed' || b.status === 'upcoming').length;
    const pendingCount = bookings.filter(b => b.status === 'pending').length;
    const activeCount = bookings.filter(b => b.status !== 'cancelled' && b.status !== 'completed').length;

    // Get Upcoming Appointments (sorted by date)
    const upcomingAppointments = bookings
        .filter(b => b.status === 'confirmed' || b.status === 'upcoming')
        .sort((a, b) => new Date(a.preferred_time).getTime() - new Date(b.preferred_time).getTime())
        .slice(0, 3);

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">

            {/* Welcome Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Welcome back, {user?.full_name?.split(' ')[0] || 'User'}! 👋</h1>
                    <p className="text-slate-500 mt-1">Here's what's happening with your legal consultations.</p>
                </div>
                <Link href="/search">
                    <Button className="bg-slate-900 hover:bg-slate-800">
                        Find a New Lawyer
                    </Button>
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-slate-500">Upcoming Sessions</CardTitle>
                        <Calendar className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">{upcomingCount}</div>
                        <p className="text-xs text-slate-500 mt-1">Confirmed appointments</p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-slate-500">Pending Requests</CardTitle>
                        <Clock className="h-4 w-4 text-yellow-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">{pendingCount}</div>
                        <p className="text-xs text-slate-500 mt-1">Awaiting lawyer approval</p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-slate-500">Active Cases</CardTitle>
                        <FileCheck className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">{activeCount}</div>
                        <p className="text-xs text-slate-500 mt-1">Total active interactions</p>
                    </CardContent>
                </Card>
            </div>

            {/* Upcoming Appointments */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-slate-900">Upcoming Appointments</h2>
                    <Link href="/dashboard/bookings" className="text-sm text-blue-600 hover:underline flex items-center">
                        View All <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                </div>

                {upcomingAppointments.length > 0 ? (
                    <div className="grid gap-4">
                        {upcomingAppointments.map((booking) => (
                            <BookingCard
                                key={booking.id || booking._id}
                                id={booking.id || booking._id}
                                lawyerName={booking.lawyer?.full_name || "Lawyer"}
                                lawyerImage={booking.lawyer?.profile_image}
                                description={booking.case_description}
                                date={format(new Date(booking.preferred_time), "MMM d, yyyy")}
                                time={format(new Date(booking.preferred_time), "h:mm a")}
                                status={booking.status || 'upcoming'}
                                amount={booking.amount || booking.consultation_fee || 0}
                                type={booking.type || 'video'}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">
                        <Calendar className="h-10 w-10 mx-auto text-slate-300 mb-3" />
                        <p>No upcoming appointments scheduled.</p>
                        <Link href="/search" className="text-blue-600 hover:underline text-sm mt-2 block">
                            Book a consultation
                        </Link>
                    </div>
                )}
            </div>

            {/* Recent Activity / Simple List */}
            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <h2 className="text-lg font-bold text-slate-900 mb-4">Recent Bookings</h2>
                    <div className="space-y-3">
                        {bookings.slice(0, 5).map(booking => (
                            <div key={booking.id || booking._id} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-100 shadow-sm">
                                <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold">
                                    {booking.lawyer?.full_name?.charAt(0) || 'L'}
                                </div>
                                <div className="flex-1">
                                    <div className="font-medium text-sm">Booking #{(booking.id || booking._id).substring(0, 8)}</div>
                                    <div className="text-xs text-slate-500 truncate max-w-[200px]">{booking.case_description}</div>
                                </div>
                                <div className={`text-xs font-medium px-2 py-1 rounded capitalize ${booking.status === 'confirmed' ? 'text-green-600 bg-green-50' :
                                        booking.status === 'pending' ? 'text-orange-600 bg-orange-50' :
                                            'text-slate-600 bg-slate-50'
                                    }`}>
                                    {booking.status}
                                </div>
                            </div>
                        ))}
                        {bookings.length === 0 && (
                            <p className="text-sm text-slate-500 italic">No booking history found.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
