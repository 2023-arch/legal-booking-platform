"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    IndianRupee,
    ArrowUpRight,
    ArrowDownRight,
    Wallet,
    CreditCard,
    Download,
    Calendar,
    Briefcase
} from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
    LineChart,
    Line
} from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const weeklyData = [
    { name: 'Mon', revenue: 2400, consultations: 4 },
    { name: 'Tue', revenue: 1398, consultations: 2 },
    { name: 'Wed', revenue: 9800, consultations: 8 },
    { name: 'Thu', revenue: 3908, consultations: 5 },
    { name: 'Fri', revenue: 4800, consultations: 6 },
    { name: 'Sat', revenue: 3800, consultations: 4 },
    { name: 'Sun', revenue: 4300, consultations: 5 },
];

const monthlyData = [
    { name: 'Jan', revenue: 45000 },
    { name: 'Feb', revenue: 52000 },
    { name: 'Mar', revenue: 48000 },
    { name: 'Apr', revenue: 61000 },
    { name: 'May', revenue: 55000 },
    { name: 'Jun', revenue: 67000 },
];

export default function EarningsPage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Financial Overview</h1>
                    <p className="text-slate-500 mt-1">Track your earnings, payouts, and financial growth.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline"><Download className="h-4 w-4 mr-2" /> Tax Report</Button>
                    <Button className="bg-slate-900 text-white"><Wallet className="h-4 w-4 mr-2" /> Withdraw Funds</Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="bg-slate-900 text-white border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-slate-400">Total Balance</CardTitle>
                        <Wallet className="h-4 w-4 text-blue-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">₹24,562</div>
                        <p className="text-xs text-slate-400 mt-2">Available for withdrawal</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-slate-500">This Month</CardTitle>
                        <IndianRupee className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">₹67,200</div>
                        <p className="text-xs text-green-600 flex items-center mt-1">
                            <ArrowUpRight className="h-3 w-3 mr-1" />
                            +12.5% vs last month
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-slate-500">Pending Clearance</CardTitle>
                        <Clock className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">₹8,400</div>
                        <p className="text-xs text-slate-500 mt-1">From 3 completed cases</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Revenue Analytics</CardTitle>
                        <CardDescription>Income trends over time.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="weekly">
                            <TabsList className="mb-4">
                                <TabsTrigger value="weekly">Weekly</TabsTrigger>
                                <TabsTrigger value="monthly">Monthly</TabsTrigger>
                            </TabsList>
                            <TabsContent value="weekly" className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={weeklyData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} />
                                        <YAxis axisLine={false} tickLine={false} fontSize={12} tickFormatter={(value) => `₹${value}`} />
                                        <Tooltip
                                            cursor={{ fill: 'transparent' }}
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                            formatter={(value) => [`₹${value}`, 'Revenue']}
                                        />
                                        <Bar dataKey="revenue" fill="#0f172a" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </TabsContent>
                            <TabsContent value="monthly" className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={monthlyData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} />
                                        <YAxis axisLine={false} tickLine={false} fontSize={12} tickFormatter={(value) => `₹${value}`} />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                            formatter={(value) => [`₹${value}`, 'Revenue']}
                                        />
                                        <Line type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Recent Transactions</CardTitle>
                        <CardDescription>Latest financial activity.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {[
                            { desc: "Payout to Bank XXXX", date: "Today", amount: "- ₹45,000", type: "withdrawal" },
                            { desc: "Consultation Fee (Case #882)", date: "Yesterday", amount: "+ ₹2,500", type: "income" },
                            { desc: "Consultation Fee (Case #879)", date: "Oct 12", amount: "+ ₹1,200", type: "income" },
                            { desc: "Platform Fee Deduction", date: "Oct 01", amount: "- ₹500", type: "expense" },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-full ${item.type === 'income' ? 'bg-green-100 text-green-600' :
                                            item.type === 'withdrawal' ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'
                                        }`}>
                                        {item.type === 'income' ? <ArrowDownRight className="h-4 w-4" /> :
                                            item.type === 'withdrawal' ? <CreditCard className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-slate-900">{item.desc}</div>
                                        <div className="text-xs text-slate-500">{item.date}</div>
                                    </div>
                                </div>
                                <div className={`font-bold text-sm ${item.type === 'income' ? 'text-green-600' : 'text-slate-900'
                                    }`}>
                                    {item.amount}
                                </div>
                            </div>
                        ))}
                        <Button variant="ghost" className="w-full text-blue-6000 text-xs">View All Transactions</Button>
                    </CardContent>
                </Card>
            </div>

            {/* Bank Details */}
            <Card>
                <CardHeader>
                    <CardTitle>Linked Accounts</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1 border p-4 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 bg-slate-100 rounded-lg flex items-center justify-center font-bold text-slate-600">HDFC</div>
                            <div>
                                <div className="font-semibold">HDFC Bank</div>
                                <div className="text-sm text-slate-500">**** **** **** 8821</div>
                            </div>
                        </div>
                        <div className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">PRIMARY</div>
                    </div>
                    <div className="flex-1 border border-dashed border-slate-300 p-4 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-50 cursor-pointer transition-colors">
                        + Add New Bank Account
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
// Icon import fix
import { Clock } from "lucide-react";
