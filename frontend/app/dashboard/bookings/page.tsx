"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BookingCard from "@/components/dashboard/BookingCard";

export default function BookingsPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-900">My Bookings</h1>
            </div>

            <Tabs defaultValue="upcoming" className="w-full">
                <TabsList className="mb-4 bg-white border border-slate-200">
                    <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                    <TabsTrigger value="pending">Pending</TabsTrigger>
                    <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>

                <TabsContent value="upcoming" className="space-y-4">
                    <BookingCard
                        id="BK-2023-001"
                        lawyerName="Adv. Priya Sharma"
                        description="Consultation regarding property dispute and documentation review."
                        date="Oct 12, 2023"
                        time="02:00 PM"
                        status="upcoming"
                        amount={2500}
                        type="video"
                    />
                    <BookingCard
                        id="BK-2023-003"
                        lawyerName="Adv. Rohan Das"
                        description="Startup incorporation and founder agreement advice."
                        date="Oct 18, 2023"
                        time="11:00 AM"
                        status="upcoming"
                        amount={3000}
                        type="video"
                    />
                </TabsContent>

                <TabsContent value="pending" className="space-y-4">
                    <BookingCard
                        id="BK-2023-004"
                        lawyerName="Adv. Suresh Menon"
                        description="Criminal defense consultation."
                        date="Oct 14, 2023"
                        time="04:00 PM"
                        status="pending"
                        amount={5000}
                        type="in-person"
                    />
                </TabsContent>

                <TabsContent value="history" className="space-y-4">
                    <BookingCard
                        id="BK-2023-000"
                        lawyerName="Adv. Anita Roy"
                        description="Family law advice regarding divorce proceedings."
                        date="Sep 28, 2023"
                        time="10:00 AM"
                        status="completed"
                        amount={2000}
                        type="video"
                    />
                    <BookingCard
                        id="BK-2023-00X"
                        lawyerName="Adv. Vikram Singh"
                        description="Tax filing consultation."
                        date="Sep 15, 2023"
                        time="03:00 PM"
                        status="cancelled"
                        amount={1500}
                        type="video"
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}
