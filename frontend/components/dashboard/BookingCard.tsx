"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Clock, Video, FileText, MoreVertical } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

interface BookingCardProps {
    id: string;
    lawyerName: string;
    lawyerImage?: string;
    description: string;
    date: string;
    time: string;
    status: 'upcoming' | 'completed' | 'cancelled' | 'pending';
    amount: number;
    type: 'video' | 'in-person';
}

export default function BookingCard({
    id,
    lawyerName,
    lawyerImage,
    description,
    date,
    time,
    status,
    amount,
    type
}: BookingCardProps) {

    const statusStyles = {
        upcoming: "bg-blue-100 text-blue-700",
        completed: "bg-green-100 text-green-700",
        cancelled: "bg-red-100 text-red-700",
        pending: "bg-orange-100 text-orange-700"
    };

    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                            <AvatarImage src={lawyerImage} />
                            <AvatarFallback>{lawyerName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h3 className="font-semibold text-slate-900">{lawyerName}</h3>
                            <div className="text-xs text-slate-500">Booking ID: {id}</div>
                        </div>
                    </div>
                    <Badge variant="secondary" className={statusStyles[status]}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Badge>
                </div>

                <div className="space-y-3 mb-4">
                    <div className="flex items-center text-sm text-slate-600">
                        <Calendar className="h-4 w-4 mr-2 text-slate-400" />
                        {date}
                    </div>
                    <div className="flex items-center text-sm text-slate-600">
                        <Clock className="h-4 w-4 mr-2 text-slate-400" />
                        {time}
                    </div>
                    <div className="flex items-center text-sm text-slate-600">
                        {type === 'video' ? <Video className="h-4 w-4 mr-2 text-slate-400" /> : <FileText className="h-4 w-4 mr-2 text-slate-400" />}
                        {type === 'video' ? 'Video Consultation' : 'In-Person Visit'}
                    </div>
                </div>

                <div className="text-sm font-medium text-slate-900">
                    Topic: <span className="font-normal text-slate-600">{description}</span>
                </div>
            </CardContent>

            <CardFooter className="bg-slate-50 p-4 border-t flex justify-between items-center">
                <div className="font-bold text-slate-900">₹{amount}</div>
                <div className="flex gap-2">
                    {status === 'upcoming' && (
                        <>
                            <Button variant="outline" size="sm" className="hidden sm:inline-flex">Reschedule</Button>
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">Join</Button>
                        </>
                    )}
                    {status === 'completed' && (
                        <Button variant="outline" size="sm">View Invoice</Button>
                    )}

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">Cancel Booking</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardFooter>
        </Card>
    );
}
