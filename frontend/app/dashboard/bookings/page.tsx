"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Calendar, Clock, Video, RotateCcw, Briefcase } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Mock Data
const bookings = [
    {
        id: "BK-2023-001",
        lawyer: "Adv. Priya Sharma",
        avatar: "PS",
        date: "Oct 24, 2026",
        time: "10:30 AM",
        type: "Video Consultation",
        status: "Confirmed",
        amount: "₹2,500"
    },
    {
        id: "BK-2023-002",
        lawyer: "Adv. Rahul Verma",
        avatar: "RV",
        date: "Oct 28, 2026",
        time: "02:00 PM",
        type: "In-Person",
        status: "Pending",
        amount: "₹1,500"
    },
    {
        id: "BK-2023-003",
        lawyer: "Adv. Amit Patel",
        avatar: "AP",
        date: "Sep 15, 2026",
        time: "11:00 AM",
        type: "Video Consultation",
        status: "Completed",
        amount: "₹3,000"
    },
    {
        id: "BK-2023-004",
        lawyer: "Adv. Sneha Gupta",
        avatar: "SG",
        date: "Aug 10, 2026",
        time: "04:00 PM",
        type: "In-Person",
        status: "Cancelled",
        amount: "₹2,000"
    }
]

export default function BookingsPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-slate-900">My Bookings</h1>
                <div className="flex gap-2">
                    <Button variant="outline">Filter Status</Button>
                    <Button>+ New Booking</Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Consultations</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="rounded-md border-t">
                        <div className="relative w-full overflow-auto">
                            <table className="w-full caption-bottom text-sm text-left">
                                <thead className="[&_tr]:border-b">
                                    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Booking ID</th>
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Lawyer</th>
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Date & Time</th>
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Type</th>
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Status</th>
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Amount</th>
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="[&_tr:last-child]:border-0">
                                    {bookings.map((booking) => (
                                        <tr key={booking.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                            <td className="p-4 align-middle font-medium">{booking.id}</td>
                                            <td className="p-4 align-middle">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarFallback>{booking.avatar}</AvatarFallback>
                                                    </Avatar>
                                                    <span>{booking.lawyer}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 align-middle">
                                                <div className="flex flex-col">
                                                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {booking.date}</span>
                                                    <span className="flex items-center gap-1 text-slate-500"><Clock className="h-3 w-3" /> {booking.time}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 align-middle">
                                                <div className="flex items-center gap-2">
                                                    {booking.type.includes("Video") ? <Video className="h-4 w-4" /> : <Briefcase className="h-4 w-4" />}
                                                    {booking.type}
                                                </div>
                                            </td>
                                            <td className="p-4 align-middle">
                                                <Badge variant={
                                                    booking.status === 'Confirmed' ? 'default' :
                                                        booking.status === 'Pending' ? 'secondary' :
                                                            booking.status === 'Completed' ? 'outline' : 'destructive'
                                                }>
                                                    {booking.status}
                                                </Badge>
                                            </td>
                                            <td className="p-4 align-middle">{booking.amount}</td>
                                            <td className="p-4 align-middle text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <span className="sr-only">Open menu</span>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuItem>View Details</DropdownMenuItem>
                                                        {booking.status === 'Confirmed' && (
                                                            <DropdownMenuItem className="text-blue-600 font-medium">Join Meeting</DropdownMenuItem>
                                                        )}
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem className="text-red-600">Cancel Booking</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
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
