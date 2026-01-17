'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MessageSquare, Briefcase, ChevronRight } from "lucide-react";

export default function DashboardHome() {
    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Welcome back, John! 👋</h1>
                    <p className="text-slate-500 mt-1">Here's what's happening with your legal cases today.</p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700">
                    + New Consultation
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardContent className="p-6 flex items-center space-x-4">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
                            <Calendar className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Upcoming Bookings</p>
                            <h3 className="text-2xl font-bold text-slate-900">2</h3>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6 flex items-center space-x-4">
                        <div className="p-3 bg-green-100 text-green-600 rounded-full">
                            <Briefcase className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Active Cases</p>
                            <h3 className="text-2xl font-bold text-slate-900">1</h3>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6 flex items-center space-x-4">
                        <div className="p-3 bg-purple-100 text-purple-600 rounded-full">
                            <MessageSquare className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Pending Reviews</p>
                            <h3 className="text-2xl font-bold text-slate-900">0</h3>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Upcoming Consultations */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-slate-900">Upcoming Consultations</h2>
                    <Button variant="link" className="text-blue-600">View All</Button>
                </div>

                <div className="grid gap-4">
                    {/* Booking Card 1 */}
                    <Card className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="h-12 w-12 rounded-full bg-slate-200" /> {/* Avatar Placeholder */}
                                <div>
                                    <h4 className="font-semibold text-lg text-slate-900">Adv. Priya Sharma</h4>
                                    <p className="text-sm text-slate-500">Corporate Law • High Court, Delhi</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-8">
                                <div className="flex items-center text-slate-600">
                                    <Calendar className="h-4 w-4 mr-2" />
                                    <span>Oct 24, 2026</span>
                                </div>
                                <div className="flex items-center text-slate-600">
                                    <Clock className="h-4 w-4 mr-2" />
                                    <span>10:30 AM</span>
                                </div>
                                <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50">
                                    Join Call
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Booking Card 2 */}
                    <Card className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="h-12 w-12 rounded-full bg-slate-200" />
                                <div>
                                    <h4 className="font-semibold text-lg text-slate-900">Adv. Rahul Verma</h4>
                                    <p className="text-sm text-slate-500">Family Law • District Court, Pune</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-8">
                                <div className="flex items-center text-slate-600">
                                    <Calendar className="h-4 w-4 mr-2" />
                                    <span>Oct 28, 2026</span>
                                </div>
                                <div className="flex items-center text-slate-600">
                                    <Clock className="h-4 w-4 mr-2" />
                                    <span>2:00 PM</span>
                                </div>
                                <Button variant="secondary" disabled>
                                    Upcoming
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Recent Activity */}
            <div>
                <h2 className="text-xl font-semibold text-slate-900 mb-4">Recent Activity</h2>
                <Card>
                    <CardContent className="p-0">
                        <div className="divide-y">
                            {[
                                { text: "Booking confirmed with Adv. Priya Sharma", time: "2 hours ago" },
                                { text: "Payment of ₹2,500 successful", time: "2 hours ago" },
                                { text: "New consultation request created", time: "5 hours ago" }
                            ].map((item, i) => (
                                <div key={i} className="p-4 flex justify-between items-center hover:bg-slate-50">
                                    <span className="text-slate-700">{item.text}</span>
                                    <span className="text-sm text-slate-400">{item.time}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

        </div>
    );
}
