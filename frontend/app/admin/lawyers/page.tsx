"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, CheckCircle, XCircle, FileText, Download } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

// Mock Data
const PENDING_LAWYERS = [
    {
        id: 1,
        name: "Adv. Suresh Kumar",
        email: "suresh.kumar@example.com",
        location: "Mumbai, Maharashtra",
        reg_number: "MAH/882/2020",
        experience: "5 Years",
        specialization: "Criminal Law",
        documents: ["Bar Council Certificate", "ID Proof"],
        submitted: "2 hours ago"
    },
    {
        id: 2,
        name: "Adv. Anita Desai",
        email: "anita.law@example.com",
        location: "New Delhi, Delhi",
        reg_number: "DEL/112/2018",
        experience: "8 Years",
        specialization: "Family Law",
        documents: ["Bar Council Certificate", "ID Proof", "Degree Certificate"],
        submitted: "5 hours ago"
    }
];

export default function VerificationQueuePage() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Lawyer Verification</h1>
                    <p className="text-slate-500">Review and approve lawyer registrations.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline"><Download className="h-4 w-4 mr-2" /> Export CSV</Button>
                </div>
            </div>

            <Tabs defaultValue="pending" className="w-full">
                <TabsList className="bg-white border border-slate-200">
                    <TabsTrigger value="pending" className="data-[state=active]:bg-orange-100 data-[state=active]:text-orange-700">Pending Review (5)</TabsTrigger>
                    <TabsTrigger value="approved" className="data-[state=active]:bg-green-100 data-[state=active]:text-green-700">Approved</TabsTrigger>
                    <TabsTrigger value="rejected" className="data-[state=active]:bg-red-100 data-[state=active]:text-red-700">Rejected</TabsTrigger>
                </TabsList>

                <TabsContent value="pending" className="mt-6 space-y-4">
                    {PENDING_LAWYERS.map((lawyer) => (
                        <Card key={lawyer.id} className="overflow-hidden">
                            <CardContent className="p-0">
                                <div className="flex flex-col md:flex-row">
                                    {/* Left Info Panel */}
                                    <div className="p-6 flex-1">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-4">
                                                <Avatar className="h-16 w-16 border-2 border-white shadow-sm">
                                                    <AvatarFallback className="bg-slate-900 text-white text-xl">
                                                        {lawyer.name.charAt(5)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <h3 className="text-lg font-bold text-slate-900">{lawyer.name}</h3>
                                                    <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                                                        <Badge variant="secondary" className="font-normal">{lawyer.specialization}</Badge>
                                                        <span>• {lawyer.location}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <Badge variant="outline" className="text-orange-600 bg-orange-50 border-orange-200">
                                                <AlertCircle className="h-3 w-3 mr-1" /> Pending
                                            </Badge>
                                        </div>

                                        <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <div className="text-slate-500 mb-1">Bar Council Reg. No.</div>
                                                <div className="font-medium text-slate-900">{lawyer.reg_number}</div>
                                            </div>
                                            <div>
                                                <div className="text-slate-500 mb-1">Experience</div>
                                                <div className="font-medium text-slate-900">{lawyer.experience}</div>
                                            </div>
                                            <div>
                                                <div className="text-slate-500 mb-1">Email Address</div>
                                                <div className="font-medium text-slate-900">{lawyer.email}</div>
                                            </div>
                                            <div>
                                                <div className="text-slate-500 mb-1">Submitted</div>
                                                <div className="font-medium text-slate-900">{lawyer.submitted}</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Action Panel */}
                                    <div className="bg-slate-50 p-6 w-full md:w-80 border-t md:border-t-0 md:border-l border-slate-100 flex flex-col justify-between">
                                        <div>
                                            <h4 className="font-semibold text-sm mb-3">Submitted Documents</h4>
                                            <div className="space-y-2">
                                                {lawyer.documents.map((doc, idx) => (
                                                    <div key={idx} className="flex items-center justify-between p-2 bg-white rounded border border-slate-200 text-sm">
                                                        <div className="flex items-center gap-2 truncate">
                                                            <FileText className="h-4 w-4 text-slate-400" />
                                                            <span className="truncate">{doc}</span>
                                                        </div>
                                                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-blue-600"><Download className="h-3 w-3" /></Button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex grid grid-cols-2 gap-3 mt-6">
                                            <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700">Reject</Button>

                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button className="bg-green-600 hover:bg-green-700">Approve</Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>Approve Verification?</DialogTitle>
                                                        <DialogDescription>
                                                            This will active <strong>{lawyer.name}'s</strong> account and listing on the platform. They will be notified via email.
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    <DialogFooter>
                                                        <Button variant="outline">Cancel</Button>
                                                        <Button className="bg-green-600 hover:bg-green-700">Confirm Approval</Button>
                                                    </DialogFooter>
                                                </DialogContent>
                                            </Dialog>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </TabsContent>

                <TabsContent value="approved">
                    <div className="text-center py-12 text-slate-500">No recently approved lawyers.</div>
                </TabsContent>

                <TabsContent value="rejected">
                    <div className="text-center py-12 text-slate-500">No rejected applications.</div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
