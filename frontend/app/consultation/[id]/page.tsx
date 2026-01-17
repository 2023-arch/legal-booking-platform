"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Video, VideoOff, PhoneOff, MessageSquare, Users, Settings } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ConsultationRoom({ params }: { params: { id: string } }) {
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col">
            {/* Header */}
            <div className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 text-white">
                <div className="flex items-center gap-3">
                    <div className="h-3 w-3 bg-red-500 rounded-full animate-pulse" />
                    <span className="font-semibold">Consultation #{params.id}</span>
                    <span className="text-slate-400 text-sm">| 00:12:45</span>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white"><Settings className="h-5 w-5" /></Button>
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white"><Users className="h-5 w-5" /></Button>
                </div>
            </div>

            {/* Main Video Area */}
            <div className="flex-1 p-4 flex gap-4 overflow-hidden relative">

                {/* Main Speaker (Lawyer) */}
                <div className="flex-1 bg-slate-800 rounded-2xl relative overflow-hidden flex items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                    <img
                        src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=1000"
                        alt="Lawyer"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-6 left-6 z-20 text-white">
                        <h3 className="font-bold text-lg text-shadow">Adv. Priya Sharma</h3>
                        <p className="text-sm opacity-80">Supreme Court Advocate</p>
                    </div>
                    <div className="absolute top-4 right-4 z-20">
                        <div className="bg-black/50 backdrop-blur-md p-2 rounded-full">
                            <div className="h-4 w-1 bg-green-500 rounded-full animate-bounce mx-auto" style={{ height: '60%' }} />
                        </div>
                    </div>
                </div>

                {/* Self View (User) */}
                <div className="absolute top-6 right-6 w-64 h-48 bg-slate-900 rounded-xl border-2 border-slate-700 shadow-2xl overflow-hidden z-30">
                    <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-500 relative">
                        {isVideoOff ? (
                            <Avatar className="h-20 w-20">
                                <AvatarFallback>ME</AvatarFallback>
                            </Avatar>
                        ) : (
                            <div className="text-sm">Cannot access camera in demo</div>
                        )}
                        <div className="absolute bottom-2 left-2 text-xs text-white font-medium bg-black/50 px-2 py-0.5 rounded">You</div>
                    </div>
                </div>
            </div>

            {/* Controls Bar */}
            <div className="h-24 bg-slate-900 border-t border-slate-800 flex items-center justify-center gap-6">
                <Button
                    variant={isMuted ? "destructive" : "secondary"}
                    size="lg"
                    className="h-14 w-14 rounded-full"
                    onClick={() => setIsMuted(!isMuted)}
                >
                    {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                </Button>

                <Button
                    variant={isVideoOff ? "destructive" : "secondary"}
                    size="lg"
                    className="h-14 w-14 rounded-full"
                    onClick={() => setIsVideoOff(!isVideoOff)}
                >
                    {isVideoOff ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
                </Button>

                <Button variant="destructive" size="lg" className="h-14 w-20 rounded-full px-0 bg-red-600 hover:bg-red-700">
                    <PhoneOff className="h-6 w-6" />
                </Button>

                <Button variant="secondary" size="lg" className="h-14 w-14 rounded-full">
                    <MessageSquare className="h-6 w-6" />
                </Button>
            </div>
        </div>
    );
}
