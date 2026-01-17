"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Clock, MapPin, Video, FileText, Phone } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

export default function AppointmentsPage() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-900">Appointments</h1>
                <Button className="bg-slate-900 text-white">Sync Calendar</Button>
            </div>

            <Tabs defaultValue="upcoming" className="w-full">
                <TabsList className="bg-white border border-slate-200">
                    <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                    <TabsTrigger value="pending">Start Soon</TabsTrigger>
                    <TabsTrigger value="past">Past</TabsTrigger>
                </TabsList>

                <TabsContent value="upcoming" className="mt-6 space-y-4">
                    {/* Appointment Card 1 */}
                    <Card>
                        <CardContent className="p-6 flex flex-col md:flex-row gap-6">
                            {/* Date Block */}
                            <div className="flex flex-col items-center justify-center bg-blue-50 text-blue-700 rounded-lg w-20 h-20 shrink-0">
                                <span className="text-xs font-bold uppercase">Oct</span>
                                <span className="text-2xl font-bold">12</span>
                                <span className="text-xs">2:00 PM</span>
                            </div>

                            {/* Info */}
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-bold text-slate-900">Consultation with Sarah Smith</h3>
                                        <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-200">Confirmed</Badge>
                                    </div>
                                    <Button variant="outline" size="sm">Reschedule</Button>
                                </div>

                                <div className="grid grid-cols-2 gap-y-2 gap-x-8 text-sm text-slate-600 mb-4">
                                    <div className="flex items-center gap-2">
                                        <Video className="h-4 w-4 text-slate-400" /> Video Consultation
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-slate-400" /> 30 Minutes
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-slate-400" /> Divorce Consultation
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback>SS</AvatarFallback>
                                    </Avatar>
                                    <div className="text-sm font-medium text-slate-900">Client: Sarah Smith</div>
                                    <div className="ml-auto flex gap-3">
                                        <Button variant="outline" size="sm"><Phone className="h-3.5 w-3.5 mr-2" /> Call</Button>
                                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">Join Meeting</Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Appointment Card 2 */}
                    <Card>
                        <CardContent className="p-6 flex flex-col md:flex-row gap-6">
                            <div className="flex flex-col items-center justify-center bg-slate-50 text-slate-600 rounded-lg w-20 h-20 shrink-0">
                                <span className="text-xs font-bold uppercase">Oct</span>
                                <span className="text-2xl font-bold">15</span>
                                <span className="text-xs">10:00 AM</span>
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-bold text-slate-900">Document Review: Property Deal</h3>
                                        <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200">Upcoming</Badge>
                                    </div>
                                    <Button variant="outline" size="sm">Reschedule</Button>
                                </div>

                                <div className="grid grid-cols-2 gap-y-2 gap-x-8 text-sm text-slate-600 mb-4">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-slate-400" /> Office Visit
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-slate-400" /> 1 Hour
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="pending">
                    <div className="text-center py-12 text-slate-500">
                        No appointments starting soon.
                    </div>
                </TabsContent>

                <TabsContent value="past">
                    <div className="text-center py-12 text-slate-500">
                        No past appointments found.
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
