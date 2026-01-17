"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, CheckCircle, XCircle, MoreHorizontal } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

// Mock Data for Admin
const lawyers = [
    {
        id: "L-101",
        name: "Adv. Suresh Kumar",
        email: "suresh.k@example.com",
        phone: "+91 9876543210",
        reg: "MAH/882/2020",
        docs: ["Bar Certificate", "ID Proof"],
        status: "Pending",
        applied: "2 hours ago"
    },
    {
        id: "L-102",
        name: "Adv. Anita Desai",
        email: "anita.law@example.com",
        phone: "+91 9123456780",
        reg: "DEL/112/2018",
        docs: ["Bar Certificate"],
        status: "Pending",
        applied: "5 hours ago"
    },
    {
        id: "L-103",
        name: "Adv. Rohan Gupta",
        email: "rohan.g@example.com",
        phone: "+91 9988776655",
        reg: "KAR/445/2022",
        docs: ["Bar Certificate", "ID Proof"],
        status: "In Review",
        applied: "1 day ago"
    },
    {
        id: "L-104",
        name: "Adv. Meera Reddy",
        email: "meera.r@example.com",
        phone: "+91 8877665544",
        reg: "TEL/999/2019",
        docs: ["Bar Certificate", "ID Proof"],
        status: "Verified",
        applied: "2 days ago"
    }
]

export default function VerificationQueuePage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Lawyer Verification</h1>
                    <p className="text-slate-500">Review and approve lawyer applications.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">Filter Status</Button>
                    <Button variant="outline">Export CSV</Button>
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    <div className="rounded-md border-t">
                        <div className="relative w-full overflow-auto">
                            <table className="w-full caption-bottom text-sm text-left">
                                <thead className="[&_tr]:border-b bg-slate-50">
                                    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground w-[50px]">ID</th>
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Applicant</th>
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Bar Reg. No</th>
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Documents</th>
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Status</th>
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right w-[200px]">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="[&_tr:last-child]:border-0">
                                    {lawyers.map((lawyer) => (
                                        <tr key={lawyer.id} className="border-b transition-colors hover:bg-slate-50/50 data-[state=selected]:bg-muted">
                                            <td className="p-4 align-middle font-mono text-xs text-slate-500">{lawyer.id}</td>
                                            <td className="p-4 align-middle">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-9 w-9">
                                                        <AvatarFallback className="bg-slate-200 text-slate-700">{lawyer.name.substring(5, 7)}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div className="font-medium text-slate-900">{lawyer.name}</div>
                                                        <div className="text-xs text-slate-500">{lawyer.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 align-middle font-mono text-sm">{lawyer.reg}</td>
                                            <td className="p-4 align-middle">
                                                <div className="flex flex-col gap-1">
                                                    {lawyer.docs.map((doc, i) => (
                                                        <div key={i} className="flex items-center text-xs text-blue-600 hover:underline cursor-pointer">
                                                            <FileText className="h-3 w-3 mr-1" /> {doc}
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="p-4 align-middle">
                                                <Badge variant={lawyer.status === 'Verified' ? 'default' : 'secondary'} className={lawyer.status === 'Verified' ? 'bg-green-600' : ''}>
                                                    {lawyer.status}
                                                </Badge>
                                            </td>
                                            <td className="p-4 align-middle text-right">
                                                {lawyer.status !== 'Verified' ? (
                                                    <div className="flex justify-end gap-2">
                                                        <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-red-600 border-red-200 hover:bg-red-50">
                                                            <XCircle className="h-4 w-4" />
                                                        </Button>
                                                        <Button size="sm" className="h-8 w-8 p-0 bg-green-600 hover:bg-green-700">
                                                            <CheckCircle className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <Button variant="ghost" size="sm" disabled>Approved</Button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
