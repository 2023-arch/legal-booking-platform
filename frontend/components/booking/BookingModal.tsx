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
import { bookingsAPI } from "@/lib/api";

interface BookingModalProps {
    lawyerId: string;
    lawyerName: string;
    consultationFee: number;
    trigger?: React.ReactNode;
}

export default function BookingModal({ lawyerId, lawyerName, consultationFee, trigger }: BookingModalProps) {
    const [step, setStep] = useState<'input' | 'summary' | 'success'>('input');
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    // Form State
    const [description, setDescription] = useState("");
    const [date, setDate] = useState<Date>();

    // Draft State
    const [draft, setDraft] = useState<any>(null);

    const handleCreateDraft = async () => {
        if (!description || !date) {
            setError("Please provide a case description and select a preferred date.");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            const draftData = await bookingsAPI.createDraft({
                lawyer_id: lawyerId,
                case_description: description,
                preferred_time: date.toISOString()
            });

            setDraft(draftData);
            setStep('summary');
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.detail || "Failed to generate summary. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfirmPayment = async () => {
        setIsLoading(true);
        setError("");

        try {
            // In a real app, this would open Razorpay
            // For now, we simulate the confirm call which returns the order_id
            const paymentData = await bookingsAPI.confirmBooking(draft.booking_draft_id);

            // SIMULATING PAYMENT SUCCESS
            // Ideally we verify payment here with another API call

            setStep('success');
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.detail || "Payment initiation failed.");
        } finally {
            setIsLoading(false);
        }
    };

    const resetModal = () => {
        setStep('input');
        setDescription("");
        setDate(undefined);
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
            <DialogContent className="sm:max-w-[600px]">
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
                                <p className="text-xs text-muted-foreground">
                                    Our AI will summarize this for the lawyer to review.
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
                                            onSelect={setDate}
                                            disabled={(date) =>
                                                date < new Date() || date < new Date("1900-01-01")
                                            }
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

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

                            <div className="bg-yellow-50 p-3 rounded-md text-sm text-yellow-800 border border-yellow-200">
                                This is a mock payment for demonstration. No actual money will be deducted.
                            </div>

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
                </div>
            </DialogContent>
        </Dialog>
    )
}
