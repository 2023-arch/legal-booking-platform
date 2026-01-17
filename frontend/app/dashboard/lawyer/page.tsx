"use client";

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
    MoreHorizontal
} from "lucide-react";
import Link from "next/link";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const data = [
    { name: 'Mon', amt: 2400 },
    { name: 'Tue', amt: 1398 },
    { name: 'Wed', amt: 9800 },
    { name: 'Thu', amt: 3908 },
    { name: 'Fri', amt: 4800 },
    { name: 'Sat', amt: 3800 },
    { name: 'Sun', amt: 4300 },
];

export default function LawyerDashboard() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">

            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
                    <p className="text-slate-500 mt-1">Overview of your practice performance.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">Download Report</Button>
                    <Button className="bg-slate-900 hover:bg-slate-800">Available Now</Button>
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
                        <div className="text-2xl font-bold text-slate-900">₹45,231</div>
                        <p className="text-xs text-green-600 flex items-center mt-1">
                            <ArrowUpRight className="h-3 w-3 mr-1" />
                            +20.1% from last month
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-slate-500">New Clients</CardTitle>
                        <Users className="h-4 w-4 text-slate-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">+12</div>
                        <p className="text-xs text-green-600 flex items-center mt-1">
                            <ArrowUpRight className="h-3 w-3 mr-1" />
                            +4 new this week
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-slate-500">Pending Requests</CardTitle>
                        <Clock className="h-4 w-4 text-slate-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">3</div>
                        <p className="text-xs text-slate-500 mt-1">
                            Avg wait: 2 hours
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-slate-500">Upcoming </CardTitle>
                        <Calendar className="h-4 w-4 text-slate-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">5</div>
                        <p className="text-xs text-slate-500 mt-1">
                            Next: Today, 4:00 PM
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid lg:grid-cols-7 gap-8">
                {/* Earnings Chart */}
                <Card className="lg:col-span-4">
                    <CardHeader>
                        <CardTitle>Revenue Overview</CardTitle>
                        <CardDescription>Weekly earnings breakdown.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data}>
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
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg group hover:bg-slate-100 transition-colors">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10">
                                        <AvatarFallback className="bg-white border text-slate-600">JD</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="font-semibold text-sm text-slate-900">John Doe</div>
                                        <div className="text-xs text-slate-500">Property Dispute • 2h ago</div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50">
                                        <CheckCircle2 className="h-5 w-5" />
                                    </Button>
                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50">
                                        <XCircle className="h-5 w-5" />
                                    </Button>
                                </div>
                            </div>
                        ))}
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
                        {[1, 2].map((i) => (
                            <div key={i} className="flex items-center justify-between py-4 border-b last:border-0 hover:bg-slate-50 px-2 rounded-lg transition-colors -mx-2">
                                <div className="flex items-center gap-4">
                                    <div className="text-center min-w-[50px] font-bold text-slate-700">
                                        <div className="text-xs text-slate-400 uppercase">TODAY</div>
                                        <div>04:00</div>
                                        <div className="text-xs text-slate-400">PM</div>
                                    </div>
                                    <div className="h-10 w-1 bg-blue-500 rounded-full" />
                                    <div>
                                        <div className="font-semibold text-slate-900">Consultation with Sarah Smith</div>
                                        <div className="text-sm text-slate-500 flex items-center gap-2">
                                            <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold">VIDEO</span>
                                            <span>• Divorce Consultation</span>
                                        </div>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm">View Details</Button>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

        </div>
    );
}
