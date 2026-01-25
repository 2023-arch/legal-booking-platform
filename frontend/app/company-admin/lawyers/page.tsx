"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import {
    Scale, ArrowLeft, RefreshCw, CheckCircle, XCircle,
    Clock, Eye, FileText, Phone, Mail, Shield,
    ExternalLink, AlertTriangle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://legal-booking-platform.onrender.com/api/v1';

interface LawyerData {
    id: string
    user_id: string
    full_name: string
    email: string
    phone?: string
    bar_council_number: string
    years_experience?: number
    bio?: string
    consultation_fee?: number
    languages?: string[]
    verification_status: string
    rejection_reason?: string
    bar_council_certificate_url?: string
    id_proof_url?: string
    profile_photo_url?: string
    created_at?: string
    verified_at?: string
}

// Separate component that uses useSearchParams
function AdminLawyersContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const statusFilter = searchParams.get('status') || 'pending'

    const [lawyers, setLawyers] = useState<LawyerData[]>([])
    const [selectedLawyer, setSelectedLawyer] = useState<LawyerData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState(false)
    const [rejectionReason, setRejectionReason] = useState("")
    const [showRejectModal, setShowRejectModal] = useState(false)

    useEffect(() => {
        const adminToken = localStorage.getItem('admin_token')
        if (!adminToken) {
            router.push('/company-admin/login')
            return
        }
        fetchLawyers()
    }, [router, statusFilter])

    const fetchLawyers = async () => {
        setIsLoading(true)
        try {
            const token = localStorage.getItem('admin_token')
            const endpoint = statusFilter === 'pending'
                ? `${API_BASE_URL}/admin/lawyers/pending`
                : `${API_BASE_URL}/admin/lawyers/all`

            const response = await fetch(endpoint, {
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

            if (!response.ok) throw new Error('Failed to fetch lawyers')

            const data = await response.json()
            setLawyers(data)
        } catch (err) {
            console.error('Error fetching lawyers:', err)
        } finally {
            setIsLoading(false)
        }
    }

    const handleVerify = async (lawyerId: string, action: 'approve' | 'reject', reason?: string) => {
        setActionLoading(true)
        try {
            const token = localStorage.getItem('admin_token')
            const response = await fetch(`${API_BASE_URL}/admin/lawyers/${lawyerId}/verify`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ action, reason })
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.detail || 'Action failed')
            }

            await fetchLawyers()
            setSelectedLawyer(null)
            setShowRejectModal(false)
            setRejectionReason("")

        } catch (err: any) {
            alert(err.message)
        } finally {
            setActionLoading(false)
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'verified':
                return <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs flex items-center gap-1"><CheckCircle className="h-3 w-3" />Verified</span>
            case 'rejected':
                return <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs flex items-center gap-1"><XCircle className="h-3 w-3" />Rejected</span>
            default:
                return <span className="px-2 py-1 bg-amber-500/20 text-amber-400 rounded-full text-xs flex items-center gap-1"><Clock className="h-3 w-3" />Pending</span>
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            {/* Header */}
            <header className="bg-slate-800/50 backdrop-blur-xl border-b border-slate-700 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/company-admin">
                            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back
                            </Button>
                        </Link>
                        <div className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-amber-500" />
                            <h1 className="text-lg font-bold text-white">Lawyer Verifications</h1>
                        </div>
                    </div>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={fetchLawyers}
                        className="text-slate-400 hover:text-white"
                    >
                        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8">
                {/* Filter Tabs */}
                <div className="flex gap-2 mb-6">
                    <Link href="/company-admin/lawyers">
                        <Button
                            variant={statusFilter === 'pending' ? 'default' : 'ghost'}
                            className={statusFilter === 'pending' ? 'bg-amber-500 hover:bg-amber-600' : 'text-slate-400'}
                        >
                            <Clock className="h-4 w-4 mr-2" />
                            Pending
                        </Button>
                    </Link>
                    <Link href="/company-admin/lawyers?status=all">
                        <Button
                            variant={statusFilter === 'all' ? 'default' : 'ghost'}
                            className={statusFilter === 'all' ? 'bg-purple-500 hover:bg-purple-600' : 'text-slate-400'}
                        >
                            <Scale className="h-4 w-4 mr-2" />
                            All Lawyers
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Lawyers List */}
                    <div className="lg:col-span-1 space-y-4">
                        {isLoading ? (
                            [...Array(3)].map((_, i) => (
                                <Card key={i} className="bg-slate-800/50 border-slate-700 animate-pulse">
                                    <CardContent className="p-4">
                                        <div className="h-12 bg-slate-700 rounded"></div>
                                    </CardContent>
                                </Card>
                            ))
                        ) : lawyers.length === 0 ? (
                            <Card className="bg-slate-800/50 border-slate-700">
                                <CardContent className="p-8 text-center">
                                    <Scale className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                                    <p className="text-slate-400">No lawyers found</p>
                                </CardContent>
                            </Card>
                        ) : (
                            lawyers.map((lawyer) => (
                                <Card
                                    key={lawyer.id}
                                    onClick={() => setSelectedLawyer(lawyer)}
                                    className={`bg-slate-800/50 border-slate-700 cursor-pointer transition-all hover:border-amber-500/50 ${selectedLawyer?.id === lawyer.id ? 'ring-2 ring-amber-500' : ''
                                        }`}
                                >
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-full bg-slate-700 overflow-hidden flex-shrink-0">
                                                {lawyer.profile_photo_url ? (
                                                    <img
                                                        src={lawyer.profile_photo_url}
                                                        alt={lawyer.full_name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-500">
                                                        <Scale className="h-6 w-6" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-white truncate">{lawyer.full_name}</h3>
                                                <p className="text-xs text-slate-400 truncate">{lawyer.email}</p>
                                                <div className="mt-1">{getStatusBadge(lawyer.verification_status)}</div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>

                    {/* Lawyer Detail */}
                    <div className="lg:col-span-2">
                        {selectedLawyer ? (
                            <Card className="bg-slate-800/50 border-slate-700">
                                <CardHeader className="border-b border-slate-700">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-white flex items-center gap-2">
                                            <Eye className="h-5 w-5 text-amber-500" />
                                            Review Application
                                        </CardTitle>
                                        {getStatusBadge(selectedLawyer.verification_status)}
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6 space-y-6">
                                    {/* Profile Header */}
                                    <div className="flex items-start gap-4">
                                        <div className="w-20 h-20 rounded-xl bg-slate-700 overflow-hidden flex-shrink-0">
                                            {selectedLawyer.profile_photo_url ? (
                                                <img
                                                    src={selectedLawyer.profile_photo_url}
                                                    alt={selectedLawyer.full_name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-500">
                                                    <Scale className="h-10 w-10" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h2 className="text-xl font-bold text-white">{selectedLawyer.full_name}</h2>
                                            <p className="text-slate-400">{selectedLawyer.bar_council_number}</p>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                <span className="flex items-center text-sm text-slate-400">
                                                    <Mail className="h-4 w-4 mr-1" />{selectedLawyer.email}
                                                </span>
                                                {selectedLawyer.phone && (
                                                    <span className="flex items-center text-sm text-slate-400">
                                                        <Phone className="h-4 w-4 mr-1" />{selectedLawyer.phone}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Details Grid */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-slate-700/50 rounded-lg p-4">
                                            <p className="text-xs text-slate-400 mb-1">Experience</p>
                                            <p className="text-white font-semibold">{selectedLawyer.years_experience || 'N/A'} years</p>
                                        </div>
                                        <div className="bg-slate-700/50 rounded-lg p-4">
                                            <p className="text-xs text-slate-400 mb-1">Consultation Fee</p>
                                            <p className="text-white font-semibold">₹{selectedLawyer.consultation_fee || 'N/A'}</p>
                                        </div>
                                    </div>

                                    {/* Bio */}
                                    {selectedLawyer.bio && (
                                        <div>
                                            <h4 className="text-sm font-semibold text-slate-300 mb-2">Bio</h4>
                                            <p className="text-sm text-slate-400 bg-slate-700/50 rounded-lg p-4 whitespace-pre-wrap">
                                                {selectedLawyer.bio}
                                            </p>
                                        </div>
                                    )}

                                    {/* Documents */}
                                    <div>
                                        <h4 className="text-sm font-semibold text-slate-300 mb-3">Documents</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {selectedLawyer.bar_council_certificate_url ? (
                                                <a
                                                    href={selectedLawyer.bar_council_certificate_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-3 bg-slate-700/50 rounded-lg p-4 hover:bg-slate-700 transition-colors"
                                                >
                                                    <FileText className="h-5 w-5 text-amber-500" />
                                                    <span className="text-sm text-white">Bar Certificate</span>
                                                    <ExternalLink className="h-4 w-4 text-slate-400 ml-auto" />
                                                </a>
                                            ) : (
                                                <div className="flex items-center gap-3 bg-slate-700/30 rounded-lg p-4 opacity-50">
                                                    <FileText className="h-5 w-5 text-slate-500" />
                                                    <span className="text-sm text-slate-400">Bar Certificate - Not uploaded</span>
                                                </div>
                                            )}
                                            {selectedLawyer.id_proof_url ? (
                                                <div className="space-y-1">
                                                    <a
                                                        href={selectedLawyer.id_proof_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-3 bg-slate-700/50 rounded-lg p-4 hover:bg-slate-700 transition-colors"
                                                    >
                                                        <FileText className="h-5 w-5 text-blue-500" />
                                                        <span className="text-sm text-white">ID Proof</span>
                                                        <ExternalLink className="h-4 w-4 text-slate-400 ml-auto" />
                                                    </a>
                                                    <p className="text-[10px] text-slate-500 font-mono break-all px-1">
                                                        {selectedLawyer.id_proof_url}
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-3 bg-slate-700/30 rounded-lg p-4 opacity-50">
                                                    <FileText className="h-5 w-5 text-slate-500" />
                                                    <span className="text-sm text-slate-400">ID Proof - Not uploaded</span>
                                                </div>
                                            )}
                                            {selectedLawyer.profile_photo_url && (
                                                <div className="space-y-1">
                                                    <a
                                                        href={selectedLawyer.profile_photo_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-3 bg-slate-700/50 rounded-lg p-4 hover:bg-slate-700 transition-colors"
                                                    >
                                                        <FileText className="h-5 w-5 text-green-500" />
                                                        <span className="text-sm text-white">Profile Photo Link</span>
                                                        <ExternalLink className="h-4 w-4 text-slate-400 ml-auto" />
                                                    </a>
                                                    <p className="text-[10px] text-slate-500 font-mono break-all px-1">
                                                        {selectedLawyer.profile_photo_url}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                        {/* Debug: Show if Cloudinary URLs are missing */}
                                        {!selectedLawyer.bar_council_certificate_url && !selectedLawyer.id_proof_url && (
                                            <p className="text-xs text-red-400 mt-2">
                                                ⚠️ No document URLs found. Check Cloudinary configuration in Render.
                                            </p>
                                        )}
                                    </div>

                                    {/* Rejection Reason (if rejected) */}
                                    {selectedLawyer.verification_status === 'rejected' && selectedLawyer.rejection_reason && (
                                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                                            <div className="flex items-center gap-2 text-red-400 mb-2">
                                                <AlertTriangle className="h-4 w-4" />
                                                <span className="font-semibold text-sm">Rejection Reason</span>
                                            </div>
                                            <p className="text-sm text-red-300">{selectedLawyer.rejection_reason}</p>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    {selectedLawyer.verification_status === 'pending_verification' && (
                                        <div className="flex gap-3 pt-4 border-t border-slate-700">
                                            <Button
                                                onClick={() => handleVerify(selectedLawyer.id, 'approve')}
                                                disabled={actionLoading}
                                                className="flex-1 bg-green-600 hover:bg-green-700"
                                            >
                                                <CheckCircle className="h-4 w-4 mr-2" />
                                                Approve Lawyer
                                            </Button>
                                            <Button
                                                onClick={() => setShowRejectModal(true)}
                                                disabled={actionLoading}
                                                variant="destructive"
                                                className="flex-1"
                                            >
                                                <XCircle className="h-4 w-4 mr-2" />
                                                Reject
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ) : (
                            <Card className="bg-slate-800/50 border-slate-700 h-96 flex items-center justify-center">
                                <div className="text-center">
                                    <Eye className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                                    <p className="text-slate-400">Select a lawyer to review</p>
                                </div>
                            </Card>
                        )}
                    </div>
                </div>
            </main>

            {/* Rejection Modal */}
            {showRejectModal && selectedLawyer && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <Card className="bg-slate-800 border-slate-700 w-full max-w-md">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <XCircle className="h-5 w-5 text-red-500" />
                                Reject Application
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-slate-400">
                                Please provide a reason for rejecting <strong className="text-white">{selectedLawyer.full_name}</strong>&apos;s application:
                            </p>
                            <Textarea
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="Enter rejection reason..."
                                className="bg-slate-700 border-slate-600 text-white min-h-[100px]"
                            />
                            <div className="flex gap-3">
                                <Button
                                    variant="ghost"
                                    onClick={() => {
                                        setShowRejectModal(false)
                                        setRejectionReason("")
                                    }}
                                    className="flex-1 text-slate-400"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={() => handleVerify(selectedLawyer.id, 'reject', rejectionReason)}
                                    disabled={!rejectionReason.trim() || actionLoading}
                                    variant="destructive"
                                    className="flex-1"
                                >
                                    {actionLoading ? 'Processing...' : 'Confirm Rejection'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}

// Loading fallback for Suspense
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

// Main export wrapped in Suspense
export default function AdminLawyersPage() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <AdminLawyersContent />
        </Suspense>
    )
}
