'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, TrendingUp, Users, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";

export default function LawyerDashboardHome() {
    return (
        <div className="space-y-8">
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between space-y-0 pb-2">
                            <p className="text-sm font-medium text-muted-foreground">Total Earnings</p>
                            <TrendingUp className="h-4 w-4 text-green-500" />
                        </div>
                        <div className="text-2xl font-bold">₹12,450</div>
                        <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between space-y-0 pb-2">
                            <p className="text-sm font-medium text-muted-foreground">Active Clients</p>
                            <Users className="h-4 w-4 text-blue-500" />
                        </div>
                        <div className="text-2xl font-bold">12</div>
                        <p className="text-xs text-muted-foreground">+2 new this week</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between space-y-0 pb-2">
                            <p className="text-sm font-medium text-muted-foreground">Pending Requests</p>
                            <Clock className="h-4 w-4 text-orange-500" />
                        </div>
                        <div className="text-2xl font-bold">3</div>
                        <p className="text-xs text-muted-foreground">Requires attention</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between space-y-0 pb-2">
                            <p className="text-sm font-medium text-muted-foreground">Completed Cases</p>
                            <CheckCircle className="h-4 w-4 text-purple-500" />
                        </div>
                        <div className="text-2xl font-bold">48</div>
                        <p className="text-xs text-muted-foreground">All time</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Booking Requests */}
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>New Booking Requests</CardTitle>
                        <CardDescription>You have 3 unread requests.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center justify-between p-4 border rounded-lg bg-slate-50">
                                    <div className="space-y-1">
                                        <h4 className="font-semibold text-slate-900">Consultation Request</h4>
                                        <p className="text-sm text-slate-500">From: Amit Kumar • Property Law</p>
                                        <div className="flex items-center text-xs text-slate-500 mt-1">
                                            <Calendar className="mr-1 h-3 w-3" /> 25 Oct, 2026
                                            <Clock className="ml-3 mr-1 h-3 w-3" /> 10:00 AM
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50">Decline</Button>
                                        <Button size="sm" className="bg-green-600 hover:bg-green-700">Accept</Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 text-center">
                            <Link href="/dashboard/lawyer/requests" className="text-sm text-blue-600 hover:underline">View All Requests</Link>
                        </div>
                    </CardContent>
                </Card>

                {/* Schedule */}
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Today's Schedule</CardTitle>
                        <CardDescription>Upcoming appointments for Oct 17, 2026</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-0 relative border-l border-slate-200 ml-3 pl-6 pb-2">
                            {[
                                { time: "09:00 AM", title: "Court Hearing - Sharma vs State", type: "High Court", status: "Done" },
                                { time: "02:00 PM", title: "Client Meeting - Priya Singh", type: "Video Call", status: "Upcoming" },
                                { time: "04:30 PM", title: "Document Review", type: "Office", status: "Pending" },
                            ].map((item, i) => (
                                <div key={i} className="mb-8 relative">
                                    <span className={`absolute -left-[31px] top-1 h-3 w-3 rounded-full border-2 border-white ${item.status === 'Done' ? 'bg-slate-300' : 'bg-blue-600'}`} />
                                    <div className="flex flex-col">
                                        <span className="text-sm text-slate-500 font-medium">{item.time}</span>
                                        <h4 className="text-base font-semibold text-slate-900 mt-1">{item.title}</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Badge variant="outline" className="font-normal">{item.type}</Badge>
                                            {item.status === 'Upcoming' && <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-none">Now</Badge>}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}
