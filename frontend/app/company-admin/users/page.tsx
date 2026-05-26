"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
    Users, ArrowLeft, RefreshCw, Search, Shield,
    UserCheck, UserX, Mail, Phone, Calendar
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://legal-booking-platform.onrender.com/api/v1';

interface UserData {
    id: string
    email: string
    full_name: string
    phone: string
    user_type: string
    is_active: boolean
    is_verified: boolean
    created_at: string
}

export default function AdminUsersPage() {
    const router = useRouter()
    const [users, setUsers] = useState<UserData[]>([])
    const [total, setTotal] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [typeFilter, setTypeFilter] = useState<string | null>(null)
    const [actionLoading, setActionLoading] = useState<string | null>(null)

    useEffect(() => {
        const adminToken = localStorage.getItem('admin_token')
        if (!adminToken) {
            router.push('/company-admin/login')
            return
        }
        fetchUsers()
    }, [router, typeFilter])

    const fetchUsers = async () => {
        setIsLoading(true)
        try {
            const token = localStorage.getItem('admin_token')
            let url = `${API_BASE_URL}/admin/users?limit=50`
            if (typeFilter) url += `&user_type=${typeFilter}`
            if (search) url += `&search=${encodeURIComponent(search)}`

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

            if (!response.ok) throw new Error('Failed to fetch users')

            const data = await response.json()
            setUsers(data.users)
            setTotal(data.total)
        } catch (err) {
            console.error('Error:', err)
        } finally {
            setIsLoading(false)
        }
    }

    const handleToggleActive = async (userId: string) => {
        setActionLoading(userId)
        try {
            const token = localStorage.getItem('admin_token')
            
            // Extract CSRF token from cookie
            const csrfToken = typeof document !== 'undefined'
                ? document.cookie
                    .split('; ')
                    .find(row => row.startsWith('csrf_token='))
                    ?.split('=')[1]
                : undefined;

            const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/toggle-active`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {})
                },
                credentials: 'include'
            })

            if (response.ok) {
                await fetchUsers()
            }
        } catch (err) {
            console.error('Error:', err)
        } finally {
            setActionLoading(null)
        }
    }

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        fetchUsers()
    }

    const getTypeBadge = (type: string) => {
        const colors = {
            user: 'bg-blue-500/20 text-blue-400',
            lawyer: 'bg-purple-500/20 text-purple-400',
            admin: 'bg-amber-500/20 text-amber-400'
        }
        return <span className={`px-2 py-1 rounded-full text-xs ${colors[type as keyof typeof colors] || 'bg-slate-500/20 text-slate-400'}`}>{type}</span>
    }

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
                            <h1 className="text-lg font-bold text-white">User Management</h1>
                        </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={fetchUsers} className="text-slate-400 hover:text-white">
                        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8">
                {/* Filters */}
                <div className="flex flex-wrap gap-4 mb-6">
                    <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-[250px]">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by name, email, phone..."
                                className="pl-10 bg-slate-800 border-slate-700 text-white"
                            />
                        </div>
                        <Button type="submit" variant="secondary">Search</Button>
                    </form>

                    <div className="flex gap-2">
                        {[null, 'user', 'lawyer'].map((type) => (
                            <Button
                                key={type || 'all'}
                                variant={typeFilter === type ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setTypeFilter(type)}
                                className={typeFilter === type ? 'bg-amber-500' : 'text-slate-400'}
                            >
                                {type === null ? 'All' : type.charAt(0).toUpperCase() + type.slice(1) + 's'}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Stats */}
                <div className="mb-4 text-sm text-slate-400">
                    Showing {users.length} of {total} users
                </div>

                {/* Users Table */}
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-700/50">
                                    <tr>
                                        <th className="text-left p-4 text-sm font-medium text-slate-300">User</th>
                                        <th className="text-left p-4 text-sm font-medium text-slate-300">Contact</th>
                                        <th className="text-left p-4 text-sm font-medium text-slate-300">Type</th>
                                        <th className="text-left p-4 text-sm font-medium text-slate-300">Status</th>
                                        <th className="text-left p-4 text-sm font-medium text-slate-300">Joined</th>
                                        <th className="text-left p-4 text-sm font-medium text-slate-300">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700">
                                    {isLoading ? (
                                        [...Array(5)].map((_, i) => (
                                            <tr key={i} className="animate-pulse">
                                                <td colSpan={6} className="p-4"><div className="h-8 bg-slate-700 rounded"></div></td>
                                            </tr>
                                        ))
                                    ) : users.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="p-8 text-center text-slate-400">
                                                <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                                No users found
                                            </td>
                                        </tr>
                                    ) : (
                                        users.map((user) => (
                                            <tr key={user.id} className="hover:bg-slate-700/30">
                                                <td className="p-4">
                                                    <div>
                                                        <p className="font-medium text-white">{user.full_name}</p>
                                                        <p className="text-xs text-slate-400">{user.id.slice(0, 8)}...</p>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="space-y-1">
                                                        <p className="text-sm text-slate-300 flex items-center gap-1">
                                                            <Mail className="h-3 w-3" />{user.email}
                                                        </p>
                                                        {user.phone && (
                                                            <p className="text-sm text-slate-400 flex items-center gap-1">
                                                                <Phone className="h-3 w-3" />{user.phone}
                                                            </p>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-4">{getTypeBadge(user.user_type)}</td>
                                                <td className="p-4">
                                                    <div className="flex gap-2">
                                                        {user.is_active ? (
                                                            <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs flex items-center gap-1">
                                                                <UserCheck className="h-3 w-3" />Active
                                                            </span>
                                                        ) : (
                                                            <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs flex items-center gap-1">
                                                                <UserX className="h-3 w-3" />Inactive
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-4 text-sm text-slate-400">
                                                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                                                </td>
                                                <td className="p-4">
                                                    <Button
                                                        variant={user.is_active ? "destructive" : "default"}
                                                        size="sm"
                                                        onClick={() => handleToggleActive(user.id)}
                                                        disabled={actionLoading === user.id}
                                                        className="text-xs"
                                                    >
                                                        {actionLoading === user.id ? '...' : user.is_active ? 'Deactivate' : 'Activate'}
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
            </main>
        </div>
    )
}
