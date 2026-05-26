"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Scale, Shield, Lock, Eye, EyeOff, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://legal-booking-platform.onrender.com/api/v1';

export default function AdminLoginPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState("")
    const [formData, setFormData] = useState({
        username: "",
        password: "",
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")

        try {
            // Extract CSRF token from cookie
            const csrfToken = typeof document !== 'undefined'
                ? document.cookie
                    .split('; ')
                    .find(row => row.startsWith('csrf_token='))
                    ?.split('=')[1]
                : undefined;

            const response = await fetch(`${API_BASE_URL}/admin/login`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {})
                },
                credentials: 'include',
                body: JSON.stringify(formData),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.detail || 'Login failed')
            }

            // Store admin token separately
            localStorage.setItem('admin_token', data.access_token)
            localStorage.setItem('admin_logged_in', 'true')

            // Redirect to admin dashboard
            router.push('/company-admin')

        } catch (err: any) {
            setError(err.message || 'Login failed. Please check your credentials.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48ZyBmaWxsPSIjMjAyMDIwIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzLTItMi00LTJsLTIgMnYyYzAgMiAyIDQgMiA0czItMiA0LTJsMi0ydi0yeiIvPjwvZz48L2c+PC9zdmc+')] opacity-10"></div>

            <Card className="w-full max-w-md relative z-10 bg-slate-800/50 backdrop-blur-xl border-slate-700 shadow-2xl">
                <CardHeader className="text-center space-y-4 pb-8">
                    {/* Logo */}
                    <div className="flex justify-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                            <Shield className="h-8 w-8 text-white" />
                        </div>
                    </div>

                    <div>
                        <CardTitle className="text-2xl font-bold text-white flex items-center justify-center gap-2">
                            <Scale className="h-6 w-6 text-amber-500" />
                            Admin Portal
                        </CardTitle>
                        <CardDescription className="text-slate-400 mt-2">
                            Secure access for authorized personnel only
                        </CardDescription>
                    </div>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Security Notice */}
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 flex items-start gap-3">
                        <Lock className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-200/80">
                            This is a restricted access area. All login attempts are logged and monitored.
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-center gap-3">
                            <AlertCircle className="h-5 w-5 text-red-500" />
                            <p className="text-sm text-red-400">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">
                                Admin Username
                            </label>
                            <Input
                                type="text"
                                placeholder="Enter admin username"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-amber-500 focus:ring-amber-500"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">
                                Password
                            </label>
                            <div className="relative">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-amber-500 focus:ring-amber-500 pr-12"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold py-3 shadow-lg shadow-amber-500/20"
                        >
                            {isLoading ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Verifying...
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Shield className="h-5 w-5" />
                                    Access Admin Panel
                                </div>
                            )}
                        </Button>
                    </form>

                    <div className="pt-4 border-t border-slate-700">
                        <p className="text-center text-xs text-slate-500">
                            © 2026 Legal Booking Platform. All rights reserved.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
