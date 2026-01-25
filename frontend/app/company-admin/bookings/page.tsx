"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import {
    Calendar, ArrowLeft, RefreshCw, Shield, Eye,
    CheckCircle, XCircle, Clock, DollarSign, User, Scale
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://legal-booking-platform.onrender.com/api/v1';

interface BookingData {
    id: string
    user_name: string
    user_email: string
    lawyer_name: string
    status: string
    consultation_fee: number
    platform_commission: number
    lawyer_payout: number
    scheduled_time: string | null
    created_at: string
}

function AdminBookingsContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const statusFilter = searchParams.get('status') || ''

    const [bookings, setBookings] = useState<BookingData[]>([])
    const [total, setTotal] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const [selectedBooking, setSelectedBooking] = useState<any>(null)

    useEffect(() => {
        const adminToken = localStorage.getItem('admin_token')
        if (!adminToken) {
            router.push('/company-admin/login')
            return
        }
        fetchBookings()
    }, [router, statusFilter])

    const fetchBookings = async () => {
        setIsLoading(true)
        try {
            const token = localStorage.getItem('admin_token')
            let url = `${API_BASE_URL}/admin/bookings?limit=50`
            if (statusFilter) url += `&status=${statusFilter}`

            const response = await fetch(url, {
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

            const data = await response.json()
            setBookings(data.bookings || [])
            setTotal(data.total || 0)
        } catch (err) {
            console.error('Error:', err)
        } finally {
            setIsLoading(false)
        }
    }

    const fetchBookingDetail = async (bookingId: string) => {
        try {
            const token = localStorage.getItem('admin_token')
            const response = await fetch(`${API_BASE_URL}/admin/bookings/${bookingId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
            if (response.ok) {
                setSelectedBooking(await response.json())
            }
        } catch (err) {
            console.error('Error:', err)
        }
    }

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            completed: 'bg-green-500/20 text-green-400',
            pending: 'bg-amber-500/20 text-amber-400',
            accepted: 'bg-blue-500/20 text-blue-400',
            cancelled: 'bg-red-500/20 text-red-400',
            rejected: 'bg-red-500/20 text-red-400',
        }
        const icons: Record<string, any> = {
            completed: CheckCircle,
            pending: Clock,
            accepted: CheckCircle,
            cancelled: XCircle,
            rejected: XCircle
        }
        const Icon = icons[status] || Clock
        return (
            <span className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 w-fit ${styles[status] || 'bg-slate-500/20 text-slate-400'}`}>
                <Icon className="h-3 w-3" />{status}
            </span>
        )
    }

    const statusFilters = ['', 'pending', 'accepted', 'completed', 'cancelled']

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
                            <h1 className="text-lg font-bold text-white">Bookings Management</h1>
                        </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={fetchBookings} className="text-slate-400 hover:text-white">
                        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8">
                {/* Filter Tabs */}
                <div className="flex gap-2 mb-6 flex-wrap">
                    {statusFilters.map((status) => (
                        <Link key={status || 'all'} href={status ? `/company-admin/bookings?status=${status}` : '/company-admin/bookings'}>
                            <Button
                                variant={statusFilter === status ? 'default' : 'ghost'}
                                size="sm"
                                className={statusFilter === status ? 'bg-amber-500' : 'text-slate-400'}
                            >
                                {status || 'All'}
                            </Button>
                        </Link>
                    ))}
                </div>

                <div className="text-sm text-slate-400 mb-4">
                    Showing {bookings.length} of {total} bookings
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Bookings List */}
                    <div className="lg:col-span-2">
                        <Card className="bg-slate-800/50 border-slate-700">
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-slate-700/50">
                                            <tr>
                                                <th className="text-left p-4 text-sm font-medium text-slate-300">Client</th>
                                                <th className="text-left p-4 text-sm font-medium text-slate-300">Lawyer</th>
                                                <th className="text-left p-4 text-sm font-medium text-slate-300">Status</th>
                                                <th className="text-left p-4 text-sm font-medium text-slate-300">Fee</th>
                                                <th className="text-left p-4 text-sm font-medium text-slate-300">Date</th>
                                                <th className="text-left p-4 text-sm font-medium text-slate-300"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-700">
                                            {isLoading ? (
                                                [...Array(5)].map((_, i) => (
                                                    <tr key={i} className="animate-pulse">
                                                        <td colSpan={6} className="p-4"><div className="h-8 bg-slate-700 rounded"></div></td>
                                                    </tr>
                                                ))
                                            ) : bookings.length === 0 ? (
                                                <tr>
                                                    <td colSpan={6} className="p-8 text-center text-slate-400">
                                                        <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                                        No bookings found
                                                    </td>
                                                </tr>
                                            ) : (
                                                bookings.map((b) => (
                                                    <tr key={b.id} className="hover:bg-slate-700/30 cursor-pointer" onClick={() => fetchBookingDetail(b.id)}>
                                                        <td className="p-4">
                                                            <p className="font-medium text-white">{b.user_name}</p>
                                                            <p className="text-xs text-slate-400">{b.user_email}</p>
                                                        </td>
                                                        <td className="p-4 text-slate-300">{b.lawyer_name}</td>
                                                        <td className="p-4">{getStatusBadge(b.status)}</td>
                                                        <td className="p-4 text-white">₹{b.consultation_fee}</td>
                                                        <td className="p-4 text-sm text-slate-400">
                                                            {b.created_at ? new Date(b.created_at).toLocaleDateString() : 'N/A'}
                                                        </td>
                                                        <td className="p-4">
                                                            <Button variant="ghost" size="sm" className="text-slate-400">
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Booking Detail */}
                    <div className="lg:col-span-1">
                        {selectedBooking ? (
                            <Card className="bg-slate-800/50 border-slate-700 sticky top-24">
                                <CardHeader className="border-b border-slate-700">
                                    <CardTitle className="text-white text-base flex items-center gap-2">
                                        <Eye className="h-4 w-4 text-amber-500" />
                                        Booking Details
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 space-y-4">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4 text-blue-500" />
                                            <div>
                                                <p className="text-xs text-slate-400">Client</p>
                                                <p className="text-white text-sm">{selectedBooking.user?.name}</p>
                                                <p className="text-slate-400 text-xs">{selectedBooking.user?.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Scale className="h-4 w-4 text-purple-500" />
                                            <div>
                                                <p className="text-xs text-slate-400">Lawyer</p>
                                                <p className="text-white text-sm">{selectedBooking.lawyer?.name}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-3 border-t border-slate-700">
                                        {getStatusBadge(selectedBooking.status)}
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-700">
                                        <div className="bg-slate-700/50 rounded p-2">
                                            <p className="text-xs text-slate-400">Fee</p>
                                            <p className="text-white font-semibold">₹{selectedBooking.consultation_fee}</p>
                                        </div>
                                        <div className="bg-slate-700/50 rounded p-2">
                                            <p className="text-xs text-slate-400">Commission</p>
                                            <p className="text-amber-400 font-semibold">₹{selectedBooking.platform_commission}</p>
                                        </div>
                                    </div>

                                    {selectedBooking.ai_summary && (
                                        <div className="pt-3 border-t border-slate-700">
                                            <p className="text-xs text-slate-400 mb-1">AI Summary</p>
                                            <p className="text-sm text-slate-300 bg-slate-700/50 rounded p-2">{selectedBooking.ai_summary}</p>
                                        </div>
                                    )}

                                    {selectedBooking.payment && (
                                        <div className="pt-3 border-t border-slate-700">
                                            <p className="text-xs text-slate-400 mb-1">Payment</p>
                                            <div className="flex items-center gap-2">
                                                <DollarSign className="h-4 w-4 text-green-500" />
                                                <span className="text-sm text-white">{selectedBooking.payment.status}</span>
                                            </div>
                                            {selectedBooking.payment.razorpay_payment_id && (
                                                <p className="text-xs text-slate-500 mt-1">
                                                    ID: {selectedBooking.payment.razorpay_payment_id}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ) : (
                            <Card className="bg-slate-800/50 border-slate-700 h-64 flex items-center justify-center">
                                <div className="text-center text-slate-400">
                                    <Eye className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">Select a booking to view details</p>
                                </div>
                            </Card>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}

function LoadingFallback() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
            <div className="text-center">
                <div className="w-12 h-12 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-400">Loading...</p>
            </div>
        </div>
    )
}

export default function AdminBookingsPage() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <AdminBookingsContent />
        </Suspense>
    )
}
