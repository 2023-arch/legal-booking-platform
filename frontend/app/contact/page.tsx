"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Mail, Phone, MapPin, Send, Clock, CheckCircle2, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import api from "@/lib/api";

const contactSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    phone: z.string().min(10, "Please enter a valid phone number"),
    subject: z.string().min(5, "Subject must be at least 5 characters"),
    message: z.string().min(20, "Message must be at least 20 characters"),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function ContactPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<ContactFormData>({
        resolver: zodResolver(contactSchema),
    });

    const onSubmit = async (data: ContactFormData) => {
        setIsSubmitting(true);
        setError(null);

        try {
            await api.post("/support/contact", data);
            setIsSuccess(true);
            reset();
        } catch (err: any) {
            setError(err.response?.data?.detail || "Failed to send message. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-teal-600 to-cyan-700 text-white py-20">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">
                        Contact Support
                    </h1>
                    <p className="text-xl text-teal-100 max-w-3xl mx-auto">
                        Have a question or need help? Our support team is here for you.
                        We typically respond within 24 hours.
                    </p>
                </div>
            </section>

            {/* Contact Section */}
            <section className="py-20 bg-slate-50">
                <div className="container mx-auto px-4">
                    <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">

                        {/* Contact Info */}
                        <div className="space-y-6">
                            <Card className="border-0 shadow-md">
                                <CardContent className="pt-6">
                                    <div className="flex items-start gap-4">
                                        <div className="bg-teal-100 p-3 rounded-xl">
                                            <Mail className="h-6 w-6 text-teal-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold mb-1">Email Us</h3>
                                            <a href="mailto:support@legalbook.in" className="text-teal-600 hover:underline">
                                                support@legalbook.in
                                            </a>
                                            <p className="text-sm text-slate-500 mt-1">
                                                For general queries
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-0 shadow-md">
                                <CardContent className="pt-6">
                                    <div className="flex items-start gap-4">
                                        <div className="bg-blue-100 p-3 rounded-xl">
                                            <Phone className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold mb-1">Call Us</h3>
                                            <a href="tel:+911800123456" className="text-blue-600 hover:underline">
                                                +91 1800-123-4567
                                            </a>
                                            <p className="text-sm text-slate-500 mt-1">
                                                Toll-free, 9 AM - 9 PM IST
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-0 shadow-md">
                                <CardContent className="pt-6">
                                    <div className="flex items-start gap-4">
                                        <div className="bg-purple-100 p-3 rounded-xl">
                                            <MapPin className="h-6 w-6 text-purple-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold mb-1">Office Address</h3>
                                            <p className="text-slate-600">
                                                Tech Park, 5th Floor<br />
                                                Outer Ring Road<br />
                                                Bangalore, Karnataka 560103
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-0 shadow-md bg-gradient-to-br from-slate-800 to-slate-900 text-white">
                                <CardContent className="pt-6">
                                    <div className="flex items-start gap-4">
                                        <div className="bg-white/10 p-3 rounded-xl">
                                            <Clock className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold mb-1">Response Time</h3>
                                            <p className="text-slate-300 text-sm">
                                                We aim to respond to all queries within 24 hours.
                                                Urgent booking issues are prioritized.
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Contact Form */}
                        <div className="lg:col-span-2">
                            <Card className="border-0 shadow-lg">
                                <CardContent className="pt-8">
                                    {isSuccess ? (
                                        <div className="text-center py-12">
                                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <CheckCircle2 className="h-8 w-8 text-green-600" />
                                            </div>
                                            <h3 className="text-xl font-bold mb-2">Message Sent!</h3>
                                            <p className="text-slate-600 mb-6">
                                                Thank you for contacting us. We'll get back to you within 24 hours.
                                            </p>
                                            <Button
                                                variant="outline"
                                                onClick={() => setIsSuccess(false)}
                                            >
                                                Send Another Message
                                            </Button>
                                        </div>
                                    ) : (
                                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                            <div className="grid md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <Label htmlFor="name">Full Name *</Label>
                                                    <Input
                                                        id="name"
                                                        placeholder="Enter your name"
                                                        {...register("name")}
                                                        className={errors.name ? "border-red-500" : ""}
                                                    />
                                                    {errors.name && (
                                                        <p className="text-sm text-red-500">{errors.name.message}</p>
                                                    )}
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="email">Email Address *</Label>
                                                    <Input
                                                        id="email"
                                                        type="email"
                                                        placeholder="you@example.com"
                                                        {...register("email")}
                                                        className={errors.email ? "border-red-500" : ""}
                                                    />
                                                    {errors.email && (
                                                        <p className="text-sm text-red-500">{errors.email.message}</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="grid md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <Label htmlFor="phone">Phone Number *</Label>
                                                    <Input
                                                        id="phone"
                                                        placeholder="+91 98765 43210"
                                                        {...register("phone")}
                                                        className={errors.phone ? "border-red-500" : ""}
                                                    />
                                                    {errors.phone && (
                                                        <p className="text-sm text-red-500">{errors.phone.message}</p>
                                                    )}
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="subject">Subject *</Label>
                                                    <Input
                                                        id="subject"
                                                        placeholder="What's this about?"
                                                        {...register("subject")}
                                                        className={errors.subject ? "border-red-500" : ""}
                                                    />
                                                    {errors.subject && (
                                                        <p className="text-sm text-red-500">{errors.subject.message}</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="message">Message *</Label>
                                                <Textarea
                                                    id="message"
                                                    rows={6}
                                                    placeholder="Describe your issue or question in detail..."
                                                    {...register("message")}
                                                    className={errors.message ? "border-red-500" : ""}
                                                />
                                                {errors.message && (
                                                    <p className="text-sm text-red-500">{errors.message.message}</p>
                                                )}
                                            </div>

                                            {error && (
                                                <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm">
                                                    {error}
                                                </div>
                                            )}

                                            <Button
                                                type="submit"
                                                size="lg"
                                                className="w-full bg-teal-600 hover:bg-teal-700"
                                                disabled={isSubmitting}
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                        Sending...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Send className="h-4 w-4 mr-2" />
                                                        Send Message
                                                    </>
                                                )}
                                            </Button>
                                        </form>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Reference */}
            <section className="py-12 bg-white">
                <div className="container mx-auto px-4 text-center">
                    <p className="text-slate-600">
                        Looking for quick answers? Check our{" "}
                        <a href="/#faq" className="text-teal-600 hover:underline font-medium">
                            Frequently Asked Questions
                        </a>
                    </p>
                </div>
            </section>
        </div>
    );
}
