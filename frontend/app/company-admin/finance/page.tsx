"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
    DollarSign, ArrowLeft, RefreshCw, Shield, TrendingUp,
    Wallet, PiggyBank, Clock, CheckCircle, XCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://legal-booking-platform.onrender.com/api/v1';

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

interface Transaction {
    id: string
    booking_id: string
    user_name: string
    amount: number
    status: string
    razorpay_order_id: string
    razorpay_payment_id: string
    captured_at: string | null
    created_at: string
}

export default function AdminFinancePage() {
    const router = useRouter()
    const [overview, setOverview] = useState<FinanceOverview | null>(null)
    const [transactions, setTransactions] = useState<Transaction[]>([])
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
            const [overviewRes, transactionsRes] = await Promise.all([
                fetch(`${API_BASE_URL}/admin/finance/overview`, { headers }),
                fetch(`${API_BASE_URL}/admin/finance/transactions?limit=20`, { headers })
            ])

            if (overviewRes.status === 401) {
                localStorage.removeItem('admin_token')
                router.push('/company-admin/login')
                return
            }

            if (overviewRes.ok) setOverview(await overviewRes.json())
            if (transactionsRes.ok) {
                const data = await transactionsRes.json()
                setTransactions(data.transactions || [])
            }
        } catch (err) {
            console.error('Error:', err)
        } finally {
            setIsLoading(false)
        }
    }

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            captured: 'bg-green-500/20 text-green-400',
            pending: 'bg-amber-500/20 text-amber-400',
            failed: 'bg-red-500/20 text-red-400',
            refunded: 'bg-purple-500/20 text-purple-400',
        }
        return (
            <span className={`px-2 py-1 rounded-full text-xs ${styles[status] || 'bg-slate-500/20 text-slate-400'}`}>
                {status}
            </span>
        )
    }

    const statCards = overview ? [
        {
            title: "Total Revenue",
            value: `₹${overview.total_revenue.toLocaleString()}`,
            icon: TrendingUp,
            color: "green",
            description: "All completed bookings"
        },
        {
            title: "Platform Commissions",
            value: `₹${overview.total_commissions.toLocaleString()}`,
            icon: DollarSign,
            color: "amber",
            description: "10% of each booking"
        },
        {
            title: "Lawyer Payouts",
            value: `₹${overview.total_payouts.toLocaleString()}`,
            icon: Wallet,
            color: "purple",
            description: "90% of each booking"
        },
        {
            title: "Pending Payouts",
            value: `₹${overview.pending_payouts.toLocaleString()}`,
            icon: Clock,
            color: "blue",
            description: "Accepted but not completed"
        },
    ] : []

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            <header className="bg-slate-800/50 backdrop-blur-xl border-b border-slate-700 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/company-admin">
                            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                                <ArrowLeft className="h-4 w-4 mr-2" />Back
                            </Button>
                        </Link>
                        <div className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-amber-500" />
                            <h1 className="text-lg font-bold text-white">Finance Dashboard</h1>
                        </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={fetchData} className="text-slate-400 hover:text-white">
                        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8">
                {/* Revenue Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {isLoading ? (
                        [...Array(4)].map((_, i) => (
                            <Card key={i} className="bg-slate-800/50 border-slate-700 animate-pulse">
                                <CardContent className="p-6">
                                    <div className="h-16 bg-slate-700 rounded"></div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        statCards.map((stat, index) => (
                            <Card key={index} className="bg-slate-800/50 border-slate-700">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className={`w-10 h-10 bg-${stat.color}-500/20 rounded-lg flex items-center justify-center`}>
                                            <stat.icon className="h-5 w-5" style={{
                                                color: stat.color === 'green' ? '#22c55e' :
                                                    stat.color === 'amber' ? '#f59e0b' :
                                                        stat.color === 'purple' ? '#a855f7' : '#3b82f6'
                                            }} />
                                        </div>
                                    </div>
                                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                                    <p className="text-sm text-slate-400">{stat.title}</p>
                                    <p className="text-xs text-slate-500 mt-1">{stat.description}</p>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>

                {/* Booking Stats */}
                {overview && (
                    <div className="grid grid-cols-3 gap-4 mb-8">
                        <Card className="bg-slate-800/50 border-slate-700">
                            <CardContent className="p-4 text-center">
                                <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-2" />
                                <p className="text-xl font-bold text-white">{overview.booking_stats.completed}</p>
                                <p className="text-xs text-slate-400">Completed</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-slate-800/50 border-slate-700">
                            <CardContent className="p-4 text-center">
                                <Clock className="h-6 w-6 text-amber-500 mx-auto mb-2" />
                                <p className="text-xl font-bold text-white">{overview.booking_stats.pending}</p>
                                <p className="text-xs text-slate-400">Pending</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-slate-800/50 border-slate-700">
                            <CardContent className="p-4 text-center">
                                <XCircle className="h-6 w-6 text-red-500 mx-auto mb-2" />
                                <p className="text-xl font-bold text-white">{overview.booking_stats.cancelled}</p>
                                <p className="text-xs text-slate-400">Cancelled</p>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Recent Transactions */}
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader className="border-b border-slate-700">
                        <CardTitle className="text-white text-base flex items-center gap-2">
                            <PiggyBank className="h-4 w-4 text-amber-500" />
                            Recent Transactions
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-700/50">
                                    <tr>
                                        <th className="text-left p-4 text-sm font-medium text-slate-300">User</th>
                                        <th className="text-left p-4 text-sm font-medium text-slate-300">Amount</th>
                                        <th className="text-left p-4 text-sm font-medium text-slate-300">Status</th>
                                        <th className="text-left p-4 text-sm font-medium text-slate-300">Payment ID</th>
                                        <th className="text-left p-4 text-sm font-medium text-slate-300">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700">
                                    {isLoading ? (
                                        [...Array(5)].map((_, i) => (
                                            <tr key={i} className="animate-pulse">
                                                <td colSpan={5} className="p-4"><div className="h-8 bg-slate-700 rounded"></div></td>
                                            </tr>
                                        ))
                                    ) : transactions.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="p-8 text-center text-slate-400">
                                                <DollarSign className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                                No transactions yet
                                            </td>
                                        </tr>
                                    ) : (
                                        transactions.map((t) => (
                                            <tr key={t.id} className="hover:bg-slate-700/30">
                                                <td className="p-4 text-white">{t.user_name}</td>
                                                <td className="p-4 text-white font-medium">₹{(t.amount / 100).toLocaleString()}</td>
                                                <td className="p-4">{getStatusBadge(t.status)}</td>
                                                <td className="p-4 text-slate-400 text-xs font-mono">
                                                    {t.razorpay_payment_id || t.razorpay_order_id || '-'}
                                                </td>
                                                <td className="p-4 text-sm text-slate-400">
                                                    {t.created_at ? new Date(t.created_at).toLocaleDateString() : 'N/A'}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}
