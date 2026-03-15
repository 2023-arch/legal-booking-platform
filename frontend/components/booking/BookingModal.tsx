'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import api, { bookingsAPI } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

interface BookingModalProps {
    lawyerId: string;
    lawyerName: string;
    consultationFee: number;
    trigger?: React.ReactNode;
}

export default function BookingModal({ lawyerId, lawyerName, consultationFee, trigger }: BookingModalProps) {
    const [step, setStep] = useState<'input' | 'summary' | 'success' | 'confirmation'>('input');
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const { toast } = useToast();
    const router = useRouter();

    // Form State
    const [description, setDescription] = useState("");
    const [date, setDate] = useState<Date>();
    const [availableSlots, setAvailableSlots] = useState<string[]>([]);
    const [selectedSlot, setSelectedSlot] = useState<string>("");
    const [confirmationData, setConfirmationData] = useState<any>(null);
    const [showTestBanner, setShowTestBanner] = useState(false);

    // Draft State
    const [draft, setDraft] = useState<any>(null);

    const fetchAvailability = async (selectedDate: string) => {
        try {
            const res = await api.get(`/bookings/lawyers/${lawyerId}/availability?date=${selectedDate}`);
            setAvailableSlots(res.data.available_slots || []);
            setSelectedSlot(""); // reset selected slot
        } catch (error) {
            console.error("Failed to fetch availability:", error);
            setAvailableSlots([]);
        }
    };

    const handleCreateDraft = async () => {
        if (!description || !date || !selectedSlot) {
            setError("Please provide a description, select a date, and pick an available time slot.");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            // Combine date and selected slot
            const dateStr = date.toISOString().split('T')[0];
            const combinedDateTime = new Date(`${dateStr}T${selectedSlot}:00`).toISOString();

            const draftData = await bookingsAPI.createDraft({
                lawyer_id: lawyerId,
                case_description: description,
                preferred_time: combinedDateTime
            });

            setDraft(draftData);
            setStep('summary');
        } catch (err: any) {
            console.error(err);
            const msg = err.response?.data?.detail || "Failed to generate summary. Please try again.";
            setError(msg);
            toast({
                variant: 'destructive',
                title: "Error",
                description: msg
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfirmPayment = async () => {
        setIsLoading(true);
        setError("");

        try {
            const res = await bookingsAPI.confirmBooking(draft.booking_draft_id);
            const { order_id, amount, currency, is_test_mode } = (res as any).data || res;

            const completePayment = async (paymentData: any) => {
                const verifyRes = await api.post("/payments/verify", paymentData);
                const { booking_id, meet_link } = verifyRes.data;
                setStep('confirmation');
                setConfirmationData({ booking_id, meet_link });
            };

            if (is_test_mode) {
                setShowTestBanner(true);
                await completePayment({
                    razorpay_order_id: order_id,
                    razorpay_payment_id: "pay_TEST_" + Date.now(),
                    razorpay_signature: "test_signature"
                });
                return;
            }

            const rzp = new (window as any).Razorpay({
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount, currency, order_id,
                name: "LegalBook",
                description: "Legal Consultation Fee",
                handler: async (resp: any) => {
                    await completePayment({
                        razorpay_order_id: resp.razorpay_order_id,
                        razorpay_payment_id: resp.razorpay_payment_id,
                        razorpay_signature: resp.razorpay_signature
                    });
                },
                modal: { ondismiss: () => setIsLoading(false) }
            });
            rzp.open();
        } catch (err: any) {
            console.error(err);
            const msg = err.response?.data?.detail || "Payment initiation failed.";
            setError(msg);
            toast({
                variant: 'destructive',
                title: "Payment Error",
                description: msg
            });
        } finally {
            setIsLoading(false);
        }
    };

    const resetModal = () => {
        setStep('input');
        setDescription("");
        setDate(undefined);
        setAvailableSlots([]);
        setSelectedSlot("");
        setDraft(null);
        setError("");
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) resetModal(); // Reset on close
        }}>
            <DialogTrigger asChild>
                {trigger || <Button>Book Consultation</Button>}
            </DialogTrigger>
            <DialogContent className="fixed inset-0 sm:inset-auto flex flex-col sm:block justify-end sm:justify-center w-full sm:max-w-lg sm:rounded-xl rounded-t-xl rounded-b-none max-h-[90vh] overflow-y-auto mb-0 mx-auto sm:my-auto">
                <DialogHeader>
                    <DialogTitle>Book Consultation with {lawyerName}</DialogTitle>
                    <DialogDescription>
                        {step === 'input' && "Describe your legal issue to get an AI-generated summary before booking."}
                        {step === 'summary' && "Review your case summary and consultation fee."}
                        {step === 'success' && "Booking Confirmed!"}
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-4 flex items-center">
                            <AlertCircle className="h-4 w-4 mr-2" />
                            {error}
                        </div>
                    )}

                    {step === 'input' && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Case Details</Label>
                                <Textarea
                                    placeholder="Briefly describe your legal situation..."
                                    className="h-32"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                                <p className="text-sm text-gray-400 text-right">
                                    {description.length}/1000 characters
                                    {description.length < 50 && " (minimum 50)"}
                                </p>
                            </div>

                            <div className="space-y-2 flex flex-col">
                                <Label>Preferred Date</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-[240px] pl-3 text-left font-normal",
                                                !date && "text-muted-foreground"
                                            )}
                                        >
                                            {date ? format(date, "PPP") : <span>Pick a date</span>}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={date}
                                            onSelect={(d) => {
                                                setDate(d);
                                                if (d) {
                                                    // use local date to avoid timezone offset shifts to previous day
                                                    const formattedDate = format(d, 'yyyy-MM-dd');
                                                    fetchAvailability(formattedDate);
                                                }
                                            }}
                                            disabled={(date) =>
                                                date < new Date(new Date().setHours(0, 0, 0, 0))
                                            }
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            {date && (
                                <div className="space-y-3 animate-in fade-in pt-2">
                                    <Label>Select Time</Label>
                                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                        {[...Array(9)].map((_, i) => {
                                            const hour = i + 9;
                                            const slot = `${hour.toString().padStart(2, '0')}:00`;
                                            const isAvailable = availableSlots.includes(slot);
                                            const isSelected = selectedSlot === slot;

                                            return (
                                                <Button
                                                    key={slot}
                                                    type="button"
                                                    variant={isSelected ? "default" : "outline"}
                                                    disabled={!isAvailable}
                                                    onClick={() => setSelectedSlot(slot)}
                                                    className={cn(
                                                        "text-xs md:text-sm h-9",
                                                        !isAvailable && "opacity-40 cursor-not-allowed",
                                                        isSelected && "ring-2 ring-blue-600 ring-offset-2"
                                                    )}
                                                >
                                                    {hour > 12 ? `${hour - 12}:00 PM` : `${hour}:00 AM`}
                                                </Button>
                                            );
                                        })}
                                    </div>
                                    {availableSlots.length === 0 && (
                                        <p className="text-sm text-amber-600 bg-amber-50 p-2 rounded text-center">
                                            No slots available for this date.
                                        </p>
                                    )}
                                </div>
                            )}

                            <div className="pt-4 flex justify-end">
                                <Button onClick={handleCreateDraft} disabled={isLoading}>
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Generate Summary & Continue
                                </Button>
                            </div>
                        </div>
                    )}

                    {step === 'summary' && draft && (
                        <div className="space-y-6">
                            <div className="bg-slate-50 p-4 rounded-lg space-y-3 border">
                                <div>
                                    <h4 className="font-semibold text-sm text-slate-500 uppercase tracking-wider mb-1">AI Summary</h4>
                                    <p className="text-sm leading-relaxed">{draft.ai_summary}</p>
                                </div>
                                <div className="border-t pt-3 flex justify-between items-center">
                                    <span className="text-sm font-medium">Consultation Fee</span>
                                    <span className="text-lg font-bold text-green-700">{formatCurrency(draft.consultation_fee)}</span>
                                </div>
                            </div>

                            {draft.is_test_mode && (
                                <div className="bg-yellow-50 p-3 rounded-md text-sm text-yellow-800 border border-yellow-200 mt-4">
                                    Test Mode — no real charge
                                </div>
                            )}

                            <div className="flex gap-3 justify-end">
                                <Button variant="outline" onClick={() => setStep('input')}>Back</Button>
                                <Button onClick={handleConfirmPayment} disabled={isLoading} className="bg-green-600 hover:bg-green-700">
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Pay & Confirm Booking
                                </Button>
                            </div>
                        </div>
                    )}

                    {step === 'success' && (
                        <div className="text-center py-8 space-y-4">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                                <CheckCircle2 className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-bold">Booking Request Sent!</h3>
                            <p className="text-muted-foreground max-w-sm mx-auto">
                                Your request has been sent to {lawyerName}. You will be notified once they accept the consultation.
                            </p>
                            <Button className="mt-4" onClick={() => setIsOpen(false)}>
                                Done
                            </Button>
                        </div>
                    )}

                    {step === 'confirmation' && confirmationData && (
                        <div className="text-center p-6 space-y-4">
                            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                            <h3 className="text-xl font-bold">Booking Confirmed!</h3>
                            <p className="text-muted-foreground">Booking ID: {confirmationData.booking_id}</p>
                            
                            {confirmationData.meet_link ? (
                                <a href={confirmationData.meet_link} target="_blank" rel="noopener noreferrer" className="inline-block mt-2">
                                    <Button className="w-full bg-blue-600 hover:bg-blue-700">Join Google Meet</Button>
                                </a>
                            ) : (
                                <div className="mt-2 p-3 bg-blue-50 text-blue-700 text-sm rounded-md border border-blue-100">
                                    Google Meet link will be generated shortly.
                                </div>
                            )}

                            <div className="pt-2">
                                <Button onClick={() => router.push("/dashboard/bookings")} variant="outline" className="w-full">
                                    View All Bookings
                                </Button>
                            </div>
                            
                            {showTestBanner && (
                                <p className="text-amber-600 text-sm mt-4 font-medium px-4 py-2 bg-amber-50 rounded-md inline-block">
                                    Test Mode — no real payment was processed
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
