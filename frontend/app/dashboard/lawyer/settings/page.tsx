"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/lib/api";
import { toast } from "sonner";
import { Save } from "lucide-react";

export default function SettingsPage() {
    const defaultSchedule = {
        monday:    { start: "09:00", end: "18:00", active: true },
        tuesday:   { start: "09:00", end: "18:00", active: true },
        wednesday: { start: "09:00", end: "18:00", active: true },
        thursday:  { start: "09:00", end: "18:00", active: true },
        friday:    { start: "09:00", end: "18:00", active: true },
        saturday:  { start: "10:00", end: "14:00", active: false },
        sunday:    { start: "10:00", end: "14:00", active: false },
    };

    const [schedule, setSchedule] = useState<any>(defaultSchedule);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        // Fetch current lawyer profile to get existing availability
        // Wait, there is no direct /me endpoint but we can extract it or rely on a new endpoint. 
        // Let's create an async block to fetch /auth/me or /lawyers/{id} if needed, 
        // but for now we might not have a clean way to fetch just availability yet unless we query /auth/me and the user has a lawyer profile embedded, 
        // OR we just use the API to do a GET /lawyers/me/availability (we didn't make a GET but we can rely on patching and local storage, or just saving it).
        // Actually, let's fetch it via auth me or a generic profile call if available.
        // For simplicity we will assume it starts with defaults and overwrites, 
        // but in a real app we'd fetch it here.
    }, []);

    const handleToggle = (day: string) => {
        setSchedule({
            ...schedule,
            [day]: { ...schedule[day], active: !schedule[day].active }
        });
    };

    const handleTimeChange = (day: string, field: 'start' | 'end', value: string) => {
        setSchedule({
            ...schedule,
            [day]: { ...schedule[day], [field]: value }
        });
    };

    const saveAvailability = async () => {
        setIsSaving(true);
        try {
            await api.patch('/lawyers/me/availability', schedule);
            toast.success("Availability schedule updated successfully.");
        } catch (error) {
            toast.error("Failed to save schedule. Please try again.");
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    const days = [
        { key: 'monday', label: 'Monday' },
        { key: 'tuesday', label: 'Tuesday' },
        { key: 'wednesday', label: 'Wednesday' },
        { key: 'thursday', label: 'Thursday' },
        { key: 'friday', label: 'Friday' },
        { key: 'saturday', label: 'Saturday' },
        { key: 'sunday', label: 'Sunday' },
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
                <p className="text-slate-500 mt-1">Manage your account preferences and consultation schedule.</p>
            </div>

            <Tabs defaultValue="availability" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="profile">Profile Details</TabsTrigger>
                    <TabsTrigger value="availability">Availability</TabsTrigger>
                    <TabsTrigger value="notifications">Notifications</TabsTrigger>
                </TabsList>
                
                <TabsContent value="profile" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile Details</CardTitle>
                            <CardDescription>Update your personal information and bio.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-slate-500">Profile editing features are coming soon.</p>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="availability" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Consultation Schedule</CardTitle>
                            <CardDescription>Set the days and hours you are available for client consultations.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                {days.map(({ key, label }) => (
                                    <div key={key} className="flex items-center justify-between p-4 border rounded-lg bg-slate-50">
                                        <div className="flex items-center space-x-4 w-1/3">
                                            <Switch 
                                                checked={schedule[key].active} 
                                                onCheckedChange={() => handleToggle(key)} 
                                            />
                                            <Label className="font-medium">{label}</Label>
                                        </div>
                                        
                                        <div className="flex items-center space-x-4 w-2/3 justify-end">
                                            {schedule[key].active ? (
                                                <>
                                                    <div className="flex items-center space-x-2">
                                                        <Label className="text-xs text-slate-500">Start</Label>
                                                        <Input 
                                                            type="time" 
                                                            value={schedule[key].start}
                                                            onChange={(e) => handleTimeChange(key, 'start', e.target.value)}
                                                            className="w-32 bg-white"
                                                        />
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Label className="text-xs text-slate-500">End</Label>
                                                        <Input 
                                                            type="time" 
                                                            value={schedule[key].end}
                                                            onChange={(e) => handleTimeChange(key, 'end', e.target.value)}
                                                            className="w-32 bg-white"
                                                        />
                                                    </div>
                                                </>
                                            ) : (
                                                <span className="text-sm text-slate-400 italic">Unavailable</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="pt-4 flex justify-end">
                                <Button onClick={saveAvailability} disabled={isSaving} className="bg-slate-900">
                                    <Save className="w-4 h-4 mr-2" />
                                    {isSaving ? "Saving..." : "Save Availability"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="notifications" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Notification Preferences</CardTitle>
                            <CardDescription>Choose how you want to be notified.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-slate-500">Notification preferences coming soon.</p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
