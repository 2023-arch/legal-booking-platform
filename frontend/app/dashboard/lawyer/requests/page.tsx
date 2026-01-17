"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, MapPin, MessageSquare, Briefcase } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"

const requests = [
    {
        id: 1,
        client: "Amit Kumar",
        type: "Property Dispute",
        date: "Oct 25, 2026",
        time: "10:00 AM",
        mode: "Video Call",
        status: "pending",
        message: "I need help with a property inheritance issue involving my ancestral land in Pune."
    },
    {
        id: 2,
        client: "Sarah Jenkins",
        type: "Corporate",
        date: "Oct 26, 2026",
        time: "2:00 PM",
        mode: "In-Person",
        status: "pending",
        message: "Reviewing employment contracts for my new startup."
    },
    {
        id: 3,
        client: "Rajiv Malhotra",
        type: "Divorce Consultation",
        date: "Oct 24, 2026",
        time: "11:00 AM",
        mode: "Video Call",
        status: "accepted",
        message: "Initial consultation regarding separation proceedings."
    }
]

export default function RequestsPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-slate-900">Booking Requests</h1>

            <Tabs defaultValue="pending" className="w-full">
                <TabsList className="grid w-full grid-cols-3 max-w-[400px]">
                    <TabsTrigger value="pending">Pending</TabsTrigger>
                    <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                    <TabsTrigger value="past">Past</TabsTrigger>
                </TabsList>

                <TabsContent value="pending" className="mt-6 space-y-4">
                    {requests.filter(r => r.status === 'pending').map((request) => (
                        <Card key={request.id}>
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarFallback>{request.client.substring(0, 2)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <CardTitle className="text-lg">{request.client}</CardTitle>
                                            <CardDescription>{request.type}</CardDescription>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">Pending</Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="pb-3">
                                <div className="grid md:grid-cols-2 gap-4 mb-4">
                                    <div className="flex items-center text-sm text-slate-600">
                                        <Calendar className="mr-2 h-4 w-4" /> {request.date}
                                    </div>
                                    <div className="flex items-center text-sm text-slate-600">
                                        <Clock className="mr-2 h-4 w-4" /> {request.time}
                                    </div>
                                    <div className="flex items-center text-sm text-slate-600">
                                        {request.mode === 'Video Call' ? <MessageSquare className="mr-2 h-4 w-4" /> : <MapPin className="mr-2 h-4 w-4" />}
                                        {request.mode}
                                    </div>
                                </div>
                                <div className="bg-slate-50 p-3 rounded-md text-sm text-slate-700 italic">
                                    "{request.message}"
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-end gap-3 pt-3 border-t">
                                <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700">Reject</Button>
                                <Button className="bg-green-600 hover:bg-green-700">Accept Request</Button>
                            </CardFooter>
                        </Card>
                    ))}
                </TabsContent>

                <TabsContent value="upcoming" className="mt-6 space-y-4">
                    {requests.filter(r => r.status === 'accepted').map((request) => (
                        <Card key={request.id}>
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarFallback>{request.client.substring(0, 2)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <CardTitle className="text-lg">{request.client}</CardTitle>
                                            <CardDescription>{request.type}</CardDescription>
                                        </div>
                                    </div>
                                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">Confirmed</Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid md:grid-cols-3 gap-4">
                                    <div className="flex items-center text-sm text-slate-600">
                                        <Calendar className="mr-2 h-4 w-4" /> {request.date}
                                    </div>
                                    <div className="flex items-center text-sm text-slate-600">
                                        <Clock className="mr-2 h-4 w-4" /> {request.time}
                                    </div>
                                    <div className="flex items-center text-sm text-slate-600">
                                        <Briefcase className="mr-2 h-4 w-4" /> {request.mode}
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-end pt-0">
                                <Button variant="secondary">View Case Details</Button>
                            </CardFooter>
                        </Card>
                    ))}
                </TabsContent>
            </Tabs>
        </div>
    )
}
