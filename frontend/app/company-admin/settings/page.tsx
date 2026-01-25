"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
    Settings, ArrowLeft, RefreshCw, Shield, Check, X,
    Video, CreditCard, Brain
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://legal-booking-platform.onrender.com/api/v1';

interface PlatformSettings {
    platform_name: string
    commission_rate: number
    min_consultation_fee: number
    max_consultation_duration: number
    features: {
        ai_summaries: boolean
        video_consultations: boolean
        razorpay_enabled: boolean
    }
}

export default function AdminSettingsPage() {
    const router = useRouter()
    const [settings, setSettings] = useState<PlatformSettings | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const adminToken = localStorage.getItem('admin_token')
        if (!adminToken) {
            router.push('/company-admin/login')
            return
        }
        fetchSettings()
    }, [router])

    const fetchSettings = async () => {
        setIsLoading(true)
        try {
            const token = localStorage.getItem('admin_token')
            const response = await fetch(`${API_BASE_URL}/admin/settings`, {
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

            if (response.ok) {
                setSettings(await response.json())
            }
        } catch (err) {
            console.error('Error:', err)
        } finally {
            setIsLoading(false)
        }
    }

    const FeatureCard = ({ title, description, enabled, icon: Icon }: { title: string, description: string, enabled: boolean, icon: any }) => (
        <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 ${enabled ? 'bg-green-500/20' : 'bg-slate-700'} rounded-lg flex items-center justify-center`}>
                            <Icon className={`h-5 w-5 ${enabled ? 'text-green-500' : 'text-slate-500'}`} />
                        </div>
                        <div>
                            <p className="text-white font-medium">{title}</p>
                            <p className="text-xs text-slate-400">{description}</p>
                        </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full flex items-center gap-1 ${enabled ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400'}`}>
                        {enabled ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                        <span className="text-xs">{enabled ? 'Enabled' : 'Disabled'}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )

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
                            <h1 className="text-lg font-bold text-white">Platform Settings</h1>
                        </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={fetchSettings} className="text-slate-400 hover:text-white">
                        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 py-8">
                {isLoading ? (
                    <div className="space-y-4">
                        {[...Array(4)].map((_, i) => (
                            <Card key={i} className="bg-slate-800/50 border-slate-700 animate-pulse">
                                <CardContent className="p-6">
                                    <div className="h-12 bg-slate-700 rounded"></div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : settings ? (
                    <div className="space-y-6">
                        {/* Platform Info */}
                        <Card className="bg-slate-800/50 border-slate-700">
                            <CardHeader className="border-b border-slate-700">
                                <CardTitle className="text-white text-base flex items-center gap-2">
                                    <Settings className="h-4 w-4 text-amber-500" />
                                    Platform Configuration
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-xs text-slate-400 mb-1">Platform Name</p>
                                        <p className="text-white font-medium">{settings.platform_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 mb-1">Commission Rate</p>
                                        <p className="text-white font-medium">{settings.commission_rate}%</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 mb-1">Min Consultation Fee</p>
                                        <p className="text-white font-medium">₹{settings.min_consultation_fee}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 mb-1">Max Consultation Duration</p>
                                        <p className="text-white font-medium">{settings.max_consultation_duration} mins</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Feature Toggles */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-semibold text-slate-300">Features Status</h3>

                            <FeatureCard
                                title="AI Case Summaries"
                                description="Google Gemini powered case analysis"
                                enabled={settings.features.ai_summaries}
                                icon={Brain}
                            />

                            <FeatureCard
                                title="Video Consultations"
                                description="Agora powered video calls"
                                enabled={settings.features.video_consultations}
                                icon={Video}
                            />

                            <FeatureCard
                                title="Payment Processing"
                                description="Razorpay integration"
                                enabled={settings.features.razorpay_enabled}
                                icon={CreditCard}
                            />
                        </div>

                        {/* Note */}
                        <Card className="bg-amber-500/10 border-amber-500/20">
                            <CardContent className="p-4">
                                <p className="text-sm text-amber-200/80">
                                    <strong>Note:</strong> These settings are configured through environment variables.
                                    To change them, update the values in your Render dashboard and redeploy.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    <Card className="bg-slate-800/50 border-slate-700">
                        <CardContent className="p-8 text-center">
                            <Settings className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                            <p className="text-slate-400">Failed to load settings</p>
                        </CardContent>
                    </Card>
                )}
            </main>
        </div>
    )
}
