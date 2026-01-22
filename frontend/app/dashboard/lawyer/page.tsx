"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
    Calendar,
    TrendingUp,
    Users,
    Clock,
    CheckCircle2,
    XCircle,
    ArrowUpRight,
    IndianRupee,
    ChevronRight,
    Loader2
} from "lucide-react";
import Link from "next/link";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { authAPI, bookingsAPI } from "@/lib/api";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

export default function LawyerDashboard() {
    const [user, setUser] = useState<any>(null);
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [userData, bookingsData] = await Promise.all([
                    authAPI.getCurrentUser(),
                    bookingsAPI.getBookings()
                ]);

                setUser(userData.data?.data || userData.data);

                // Handle array wrapping
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

    const handleUpdateStatus = async (id: string, newStatus: string) => {
        try {
            await bookingsAPI.updateStatus(id, newStatus);
            // Refresh local state ideally, or just update the list
            setBookings(prev => prev.map(b =>
                (b.id === id || b._id === id) ? { ...b, status: newStatus } : b
            ));
            toast({
                title: "Status Updated",
                description: `Booking has been marked as ${newStatus}.`,
            });
        } catch (error) {
            console.error("Failed to update status:", error);
            toast({
                variant: "destructive",
                title: "Update Failed",
                description: "Could not update booking status. Please try again.",
            });
        }
    };

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
        );
    }

    // --- Stats Calculations ---
    const totalEarnings = bookings
        .filter(b => b.status === 'completed' || b.status === 'confirmed') // Counting confirmed as revenue for demo
        .reduce((sum, b) => sum + (b.amount || b.consultation_fee || 0), 0);

    // Unique clients
    const uniqueClients = new Set(bookings.map(b => b.user_id || b.user?._id)).size;

    const pendingRequests = bookings.filter(b => b.status === 'pending');

    const upcomingAppointments = bookings
        .filter(b => b.status === 'confirmed' || b.status === 'upcoming')
        .sort((a, b) => new Date(a.preferred_time).getTime() - new Date(b.preferred_time).getTime());

    // Mock chart data relative to real total? Or just keep mock for visual appeal
    // Let's keep the mock data for the chart for now as we don't have historical breakdowns
    const chartData = [
        { name: 'Mon', amt: 2400 },
        { name: 'Tue', amt: 1398 },
        { name: 'Wed', amt: 9800 },
        { name: 'Thu', amt: 3908 },
        { name: 'Fri', amt: 4800 },
        { name: 'Sat', amt: 3800 },
        { name: 'Sun', amt: 4300 },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">

            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
                    <p className="text-slate-500 mt-1">Welcome back, Adv. {user?.full_name?.split(' ')[0] || 'Lawyer'}.</p>
                </div>
                <div className="flex gap-2">
                    {/* <Button variant="outline">Download Report</Button> */}
                    <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-2 rounded-md font-medium text-sm">
                        <div className="h-2 w-2 rounded-full bg-green-600 animate-pulse" />
                        Available Now
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-slate-500">Total Earnings</CardTitle>
                        <IndianRupee className="h-4 w-4 text-slate-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">{formatCurrency(totalEarnings)}</div>
                        <p className="text-xs text-green-600 flex items-center mt-1">
                            <ArrowUpRight className="h-3 w-3 mr-1" />
                            +12% from last month
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-slate-500">Total Clients</CardTitle>
                        <Users className="h-4 w-4 text-slate-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">{uniqueClients}</div>
                        <p className="text-xs text-green-600 flex items-center mt-1">
                            <ArrowUpRight className="h-3 w-3 mr-1" />
                            Active this month
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-slate-500">Pending Requests</CardTitle>
                        <Clock className="h-4 w-4 text-slate-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">{pendingRequests.length}</div>
                        <p className="text-xs text-slate-500 mt-1">
                            Requires action
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-slate-500">Upcoming</CardTitle>
                        <Calendar className="h-4 w-4 text-slate-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">{upcomingAppointments.length}</div>
                        <p className="text-xs text-slate-500 mt-1">
                            Scheduled
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid lg:grid-cols-7 gap-8">
                {/* Earnings Chart */}
                <Card className="lg:col-span-4">
                    <CardHeader>
                        <CardTitle>Revenue Overview</CardTitle>
                        <CardDescription>Weekly earnings breakdown (Simulated).</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} tickMargin={10} />
                                <YAxis axisLine={false} tickLine={false} fontSize={12} tickFormatter={(value) => `₹${value}`} />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="amt" fill="#0f172a" radius={[4, 4, 0, 0]} maxBarSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Recent Requests */}
                <Card className="lg:col-span-3">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                        <div>
                            <CardTitle>Recent Requests</CardTitle>
                            <CardDescription>New booking inquiries.</CardDescription>
                        </div>
                        <Link href="/dashboard/lawyer/requests" className="text-blue-600 hover:text-blue-700 text-sm font-medium">View All</Link>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {pendingRequests.length > 0 ? pendingRequests.slice(0, 5).map((booking) => (
                            <div key={booking.id || booking._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg group hover:bg-slate-100 transition-colors">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10">
                                        <AvatarFallback className="bg-white border text-slate-600">{booking.user?.full_name?.charAt(0) || 'U'}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="font-semibold text-sm text-slate-900">{booking.user?.full_name || 'Anonymous User'}</div>
                                        <div className="text-xs text-slate-500 truncate max-w-[150px]">{booking.case_description}</div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button onClick={() => handleUpdateStatus(booking.id || booking._id, 'confirmed')} size="icon" variant="ghost" className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50">
                                        <CheckCircle2 className="h-5 w-5" />
                                    </Button>
                                    <Button onClick={() => handleUpdateStatus(booking.id || booking._id, 'cancelled')} size="icon" variant="ghost" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50">
                                        <XCircle className="h-5 w-5" />
                                    </Button>
                                </div>
                            </div>
                        )) : (
                            <p className="text-sm text-slate-500 italic text-center py-4">No pending requests.</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Upcoming Appointments Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Upcoming Appointments</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-1">
                        {upcomingAppointments.length > 0 ? upcomingAppointments.slice(0, 5).map((booking) => (
                            <div key={booking.id || booking._id} className="flex items-center justify-between py-4 border-b last:border-0 hover:bg-slate-50 px-2 rounded-lg transition-colors -mx-2">
                                <div className="flex items-center gap-4">
                                    <div className="text-center min-w-[50px] font-bold text-slate-700">
                                        <div className="text-xs text-slate-400 uppercase">{format(new Date(booking.preferred_time), "MMM")}</div>
                                        <div>{format(new Date(booking.preferred_time), "dd")}</div>
                                        <div className="text-xs text-slate-400">{format(new Date(booking.preferred_time), "p")}</div>
                                    </div>
                                    <div className="h-10 w-1 bg-blue-500 rounded-full" />
                                    <div>
                                        <div className="font-semibold text-slate-900">Consultation with {booking.user?.full_name || 'Client'}</div>
                                        <div className="text-sm text-slate-500 flex items-center gap-2">
                                            <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">{booking.type || "Video"}</span>
                                            <span>• {booking.case_type || "General Consultation"}</span>
                                        </div>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm">View Details</Button>
                            </div>
                        )) : (
                            <p className="text-sm text-slate-500 italic text-center py-8">No upcoming appointments.</p>
                        )}
                    </div>
                </CardContent>
            </Card>

        </div>
    );
}
