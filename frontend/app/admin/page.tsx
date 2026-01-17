'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Users, AlertCircle, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function AdminDashboardHome() {
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-slate-900">Platform Overview</h1>
                <Button variant="outline">Download Report</Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between space-y-0 pb-2">
                            <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                            <TrendingUp className="h-4 w-4 text-green-500" />
                        </div>
                        <div className="text-2xl font-bold">₹1,24,500</div>
                        <p className="text-xs text-muted-foreground">+12% this month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between space-y-0 pb-2">
                            <p className="text-sm font-medium text-muted-foreground">Verifications Pending</p>
                            <AlertCircle className="h-4 w-4 text-orange-500" />
                        </div>
                        <div className="text-2xl font-bold text-orange-600">5</div>
                        <p className="text-xs text-muted-foreground">Action required</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between space-y-0 pb-2">
                            <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                            <Users className="h-4 w-4 text-blue-500" />
                        </div>
                        <div className="text-2xl font-bold">1,203</div>
                        <p className="text-xs text-muted-foreground">+48 new users</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between space-y-0 pb-2">
                            <p className="text-sm font-medium text-muted-foreground">Verified Lawyers</p>
                            <CheckCircle className="h-4 w-4 text-purple-500" />
                        </div>
                        <div className="text-2xl font-bold">85</div>
                        <p className="text-xs text-muted-foreground">Across 12 cities</p>
                    </CardContent>
                </Card>
            </div>

            {/* Pending Verifications Preview */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Verification Requests</CardTitle>
                    <CardDescription>Lawyers waiting for document verification.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {[
                            { name: "Adv. Suresh Kumar", email: "suresh.k@example.com", reg: "MAH/882/2020", status: "Pending" },
                            { name: "Adv. Anita Desai", email: "anita.law@example.com", reg: "DEL/112/2018", status: "Pending" },
                            { name: "Adv. Rohan Gupta", email: "rohan.g@example.com", reg: "KAR/445/2022", status: "In Review" },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">
                                        {item.name.substring(5, 7)}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-slate-900">{item.name}</h4>
                                        <p className="text-sm text-slate-500">{item.email} • {item.reg}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Link href="/admin/lawyers">
                                        <Button size="sm" variant="secondary">Review details</Button>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 text-center">
                        <Link href="/admin/lawyers" className="text-sm text-blue-600 hover:underline">View All Requests</Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
