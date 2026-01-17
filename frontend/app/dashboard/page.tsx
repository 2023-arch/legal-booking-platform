"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Video, ChevronRight, FileCheck } from "lucide-react";
import Link from "next/link";

export default function UserDashboard() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">

            {/* Welcome Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Welcome back, John! 👋</h1>
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
                        <div className="text-2xl font-bold text-slate-900">2</div>
                        <p className="text-xs text-slate-500 mt-1">Next: Tomorrow, 2:00 PM</p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-slate-500">Pending Requests</CardTitle>
                        <Clock className="h-4 w-4 text-yellow-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">1</div>
                        <p className="text-xs text-slate-500 mt-1">Awaiting lawyer approval</p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-slate-500">Active Cases</CardTitle>
                        <FileCheck className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">3</div>
                        <p className="text-xs text-slate-500 mt-1">Updates in last 24h</p>
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

                <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-sm">
                    {/* Item 1 */}
                    <div className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="bg-blue-50 p-3 rounded-lg text-blue-600 font-bold text-center min-w-[60px]">
                                <div className="text-xs uppercase">OCT</div>
                                <div className="text-xl">12</div>
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-900">Consultation with Adv. Priya Sharma</h3>
                                <div className="flex items-center text-sm text-slate-500 mt-1 gap-3">
                                    <span className="flex items-center"><Clock className="h-3.5 w-3.5 mr-1" /> 2:00 PM - 2:30 PM</span>
                                    <span className="flex items-center"><Video className="h-3.5 w-3.5 mr-1" /> Video Call</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="hidden sm:inline-flex">Reschedule</Button>
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">Join Call</Button>
                        </div>
                    </div>

                    {/* Item 2 */}
                    <div className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="bg-purple-50 p-3 rounded-lg text-purple-600 font-bold text-center min-w-[60px]">
                                <div className="text-xs uppercase">OCT</div>
                                <div className="text-xl">15</div>
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-900">Document Review: Property Deal</h3>
                                <div className="flex items-center text-sm text-slate-500 mt-1 gap-3">
                                    <span className="flex items-center"><Clock className="h-3.5 w-3.5 mr-1" /> 10:00 AM - 11:00 AM</span>
                                    <span className="flex items-center"><Video className="h-3.5 w-3.5 mr-1" /> Video Call</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" disabled>Not Started</Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity / Simple List */}
            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <h2 className="text-lg font-bold text-slate-900 mb-4">Recent Bookings</h2>
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-100 shadow-sm">
                                <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold">
                                    L{i}
                                </div>
                                <div className="flex-1">
                                    <div className="font-medium text-sm">Booking #BK-2023-00{i}</div>
                                    <div className="text-xs text-slate-500">Corporate Law • ₹2500</div>
                                </div>
                                <div className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded">Pending</div>
                            </div>
                        ))}
                    </div>
                </div>
                {/* Could add another widget here */}
            </div>
        </div>
    );
}
