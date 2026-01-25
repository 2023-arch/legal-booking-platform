"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
    Scale, Users, DollarSign, Calendar, Settings,
    BarChart3, RefreshCw, LogOut, ChevronRight, Shield,
    UserCheck, Clock, CheckCircle, XCircle, TrendingUp
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://legal-booking-platform.onrender.com/api/v1';

interface DashboardStats {
    total_users: number
    total_lawyers: number
    pending_verifications: number
    verified_lawyers: number
    rejected_lawyers: number
}

interface FinanceOverview {
    total_revenue: number
    total_commissions: number
    total_payouts: number
    pending_payouts: number
    booking_stats: {
        completed: number
        pending: number
        cancelled: number
    }
}

export default function AdminDashboardPage() {
    const router = useRouter()
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [finance, setFinance] = useState<FinanceOverview | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const adminToken = localStorage.getItem('admin_token')
        if (!adminToken) {
            router.push('/company-admin/login')
            return
        }

        fetchData()
    }, [router])

    const fetchData = async () => {
        setIsLoading(true)
        const token = localStorage.getItem('admin_token')
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }

        try {
            const [statsRes, financeRes] = await Promise.all([
                fetch(`${API_BASE_URL}/admin/dashboard/stats`, { headers }),
                fetch(`${API_BASE_URL}/admin/finance/overview`, { headers })
            ])

            if (statsRes.status === 401) {
                localStorage.removeItem('admin_token')
                router.push('/company-admin/login')
                return
            }

            if (statsRes.ok) setStats(await statsRes.json())
            if (financeRes.ok) setFinance(await financeRes.json())
        } catch (err) {
            console.error('Error fetching data:', err)
        } finally {
            setIsLoading(false)
        }
    }

    const handleLogout = () => {
        localStorage.removeItem('admin_token')
        localStorage.removeItem('admin_logged_in')
        router.push('/company-admin/login')
    }

    const navItems = [
        {
            title: "Lawyer Verifications",
            description: `${stats?.pending_verifications || 0} pending`,
            icon: UserCheck,
            href: "/company-admin/lawyers",
            color: "amber",
            highlight: (stats?.pending_verifications || 0) > 0
        },
        {
            title: "User Management",
            description: `${stats?.total_users || 0} users`,
            icon: Users,
            href: "/company-admin/users",
            color: "blue"
        },
        {
            title: "Bookings",
            description: `${finance?.booking_stats?.pending || 0} pending`,
            icon: Calendar,
            href: "/company-admin/bookings",
            color: "purple"
        },
        {
            title: "Finance",
            description: `₹${finance?.total_revenue || 0} revenue`,
            icon: DollarSign,
            href: "/company-admin/finance",
            color: "green"
        },
        {
            title: "Settings",
            description: "Platform config",
            icon: Settings,
            href: "/company-admin/settings",
            color: "slate"
        },
    ]

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            {/* Header */}
            <header className="bg-slate-800/50 backdrop-blur-xl border-b border-slate-700 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center">
                            <Shield className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-white">Admin Panel</h1>
                            <p className="text-xs text-slate-400">Legal Booking Platform</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={fetchData}
                            className="text-slate-400 hover:text-white"
                        >
                            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleLogout}
                            className="text-slate-400 hover:text-red-400"
                        >
                            <LogOut className="h-4 w-4 mr-2" />
                            Logout
                        </Button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8">
                {/* Welcome Banner */}
                <div className="bg-gradient-to-r from-amber-500/20 to-amber-600/10 border border-amber-500/20 rounded-2xl p-6 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
                            <BarChart3 className="h-6 w-6 text-amber-500" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Welcome, Admin</h2>
                            <p className="text-slate-400">Manage lawyers, users, bookings, and platform operations</p>
                        </div>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <Card className="bg-slate-800/50 border-slate-700">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                    <Users className="h-5 w-5 text-blue-500" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-white">{stats?.total_users || 0}</p>
                                    <p className="text-xs text-slate-400">Total Users</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-800/50 border-slate-700">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                                    <Scale className="h-5 w-5 text-purple-500" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-white">{stats?.verified_lawyers || 0}</p>
                                    <p className="text-xs text-slate-400">Verified Lawyers</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-800/50 border-slate-700">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                                    <TrendingUp className="h-5 w-5 text-green-500" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-white">₹{finance?.total_revenue || 0}</p>
                                    <p className="text-xs text-slate-400">Total Revenue</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className={`bg-slate-800/50 border-slate-700 ${(stats?.pending_verifications || 0) > 0 ? 'ring-2 ring-amber-500/50' : ''}`}>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                                    <Clock className="h-5 w-5 text-amber-500" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-white">{stats?.pending_verifications || 0}</p>
                                    <p className="text-xs text-slate-400">Pending Reviews</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Navigation Cards */}
                <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {navItems.map((item, index) => (
                        <Link key={index} href={item.href}>
                            <Card className={`bg-slate-800/50 border-slate-700 hover:border-${item.color}-500/50 transition-all cursor-pointer group ${item.highlight ? 'ring-2 ring-amber-500/50' : ''}`}>
                                <CardContent className="p-5">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 bg-${item.color}-500/20 rounded-xl flex items-center justify-center`}>
                                                <item.icon className={`h-6 w-6 text-${item.color}-500`} style={{
                                                    color: item.color === 'amber' ? '#f59e0b' :
                                                        item.color === 'blue' ? '#3b82f6' :
                                                            item.color === 'purple' ? '#a855f7' :
                                                                item.color === 'green' ? '#22c55e' : '#64748b'
                                                }} />
                                            </div>
                                            <div>
                                                <h3 className="text-base font-semibold text-white">{item.title}</h3>
                                                <p className="text-sm text-slate-400">{item.description}</p>
                                            </div>
                                        </div>
                                        <ChevronRight className={`h-5 w-5 text-slate-500 group-hover:text-${item.color}-500 transition-colors`} />
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>

                {/* Booking Stats */}
                {finance && (
                    <div className="mt-8">
                        <h3 className="text-lg font-semibold text-white mb-4">Booking Overview</h3>
                        <div className="grid grid-cols-3 gap-4">
                            <Card className="bg-slate-800/50 border-slate-700">
                                <CardContent className="p-4 text-center">
                                    <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                                    <p className="text-2xl font-bold text-white">{finance.booking_stats.completed}</p>
                                    <p className="text-xs text-slate-400">Completed</p>
                                </CardContent>
                            </Card>
                            <Card className="bg-slate-800/50 border-slate-700">
                                <CardContent className="p-4 text-center">
                                    <Clock className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                                    <p className="text-2xl font-bold text-white">{finance.booking_stats.pending}</p>
                                    <p className="text-xs text-slate-400">Pending</p>
                                </CardContent>
                            </Card>
                            <Card className="bg-slate-800/50 border-slate-700">
                                <CardContent className="p-4 text-center">
                                    <XCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                                    <p className="text-2xl font-bold text-white">{finance.booking_stats.cancelled}</p>
                                    <p className="text-xs text-slate-400">Cancelled</p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}
