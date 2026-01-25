"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
    Scale, Users, UserCheck, Clock, XCircle, CheckCircle,
    BarChart3, RefreshCw, LogOut, ChevronRight, Shield
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://legal-booking-platform.onrender.com/api/v1';

interface DashboardStats {
    total_users: number
    total_lawyers: number
    pending_verifications: number
    verified_lawyers: number
    rejected_lawyers: number
}

export default function AdminDashboardPage() {
    const router = useRouter()
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        // Check if admin is logged in
        const adminToken = localStorage.getItem('admin_token')
        if (!adminToken) {
            router.push('/company-admin/login')
            return
        }

        fetchStats()
    }, [router])

    const fetchStats = async () => {
        setIsLoading(true)
        setError("")

        try {
            const token = localStorage.getItem('admin_token')
            const response = await fetch(`${API_BASE_URL}/admin/dashboard/stats`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (response.status === 401) {
                localStorage.removeItem('admin_token')
                router.push('/company-admin/login')
                return
            }

            if (!response.ok) {
                throw new Error('Failed to fetch stats')
            }

            const data = await response.json()
            setStats(data)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    const handleLogout = () => {
        localStorage.removeItem('admin_token')
        localStorage.removeItem('admin_logged_in')
        router.push('/company-admin/login')
    }

    const statCards = stats ? [
        {
            title: "Total Users",
            value: stats.total_users,
            icon: Users,
            color: "from-blue-500 to-blue-600",
            bgColor: "bg-blue-500/10",
        },
        {
            title: "Total Lawyers",
            value: stats.total_lawyers,
            icon: Scale,
            color: "from-purple-500 to-purple-600",
            bgColor: "bg-purple-500/10",
        },
        {
            title: "Pending Verifications",
            value: stats.pending_verifications,
            icon: Clock,
            color: "from-amber-500 to-amber-600",
            bgColor: "bg-amber-500/10",
            highlight: stats.pending_verifications > 0,
        },
        {
            title: "Verified Lawyers",
            value: stats.verified_lawyers,
            icon: CheckCircle,
            color: "from-green-500 to-green-600",
            bgColor: "bg-green-500/10",
        },
        {
            title: "Rejected",
            value: stats.rejected_lawyers,
            icon: XCircle,
            color: "from-red-500 to-red-600",
            bgColor: "bg-red-500/10",
        },
    ] : []

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
                            onClick={fetchStats}
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
                            <p className="text-slate-400">Manage lawyers, users, and platform operations</p>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                        {[...Array(5)].map((_, i) => (
                            <Card key={i} className="bg-slate-800/50 border-slate-700 animate-pulse">
                                <CardContent className="p-6">
                                    <div className="h-10 bg-slate-700 rounded mb-4"></div>
                                    <div className="h-6 bg-slate-700 rounded w-1/2"></div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                        {statCards.map((stat, index) => (
                            <Card
                                key={index}
                                className={`bg-slate-800/50 border-slate-700 ${stat.highlight ? 'ring-2 ring-amber-500/50' : ''}`}
                            >
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                                            <stat.icon className={`h-5 w-5 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`} style={{ color: stat.color.includes('amber') ? '#f59e0b' : stat.color.includes('green') ? '#22c55e' : stat.color.includes('red') ? '#ef4444' : stat.color.includes('blue') ? '#3b82f6' : '#a855f7' }} />
                                        </div>
                                        <span className="text-3xl font-bold text-white">{stat.value}</span>
                                    </div>
                                    <p className="text-sm text-slate-400">{stat.title}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Pending Verifications */}
                    <Link href="/company-admin/lawyers">
                        <Card className="bg-slate-800/50 border-slate-700 hover:border-amber-500/50 transition-all cursor-pointer group">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
                                            <UserCheck className="h-6 w-6 text-amber-500" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-white">Lawyer Verifications</h3>
                                            <p className="text-sm text-slate-400">
                                                {stats?.pending_verifications || 0} pending approvals
                                            </p>
                                        </div>
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-slate-500 group-hover:text-amber-500 transition-colors" />
                                </div>
                            </CardContent>
                        </Card>
                    </Link>

                    {/* All Lawyers */}
                    <Link href="/company-admin/lawyers?status=all">
                        <Card className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-all cursor-pointer group">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                                            <Scale className="h-6 w-6 text-purple-500" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-white">All Lawyers</h3>
                                            <p className="text-sm text-slate-400">
                                                View and manage all registered lawyers
                                            </p>
                                        </div>
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-slate-500 group-hover:text-purple-500 transition-colors" />
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                </div>
            </main>
        </div>
    )
}
