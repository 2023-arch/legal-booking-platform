"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { Scale, Mail, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import api from "@/lib/api";

const forgotPasswordSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
    });

    const onSubmit = async (data: ForgotPasswordFormData) => {
        setIsSubmitting(true);
        setError(null);

        try {
            await api.post("/auth/forgot-password", { email: data.email });
            setIsSuccess(true);
        } catch (err: any) {
            // Always show success to prevent email enumeration
            setIsSuccess(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Panel - Decorative */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-12 flex-col justify-between">
                <div>
                    <Link href="/" className="flex items-center gap-2 text-white">
                        <div className="bg-white/20 p-2 rounded-lg">
                            <Scale className="h-6 w-6" />
                        </div>
                        <span className="font-bold text-xl">LegalBook</span>
                    </Link>
                </div>
                <div className="space-y-6">
                    <h2 className="text-3xl font-bold text-white">
                        Forgot your password?
                    </h2>
                    <p className="text-blue-100 text-lg">
                        No worries! Enter your email and we'll send you a secure link to reset your password.
                    </p>
                </div>
                <div className="text-blue-200 text-sm">
                    Need help? Contact support@legalbook.in
                </div>
            </div>

            {/* Right Panel - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50">
                <div className="w-full max-w-md">
                    {/* Mobile Logo */}
                    <div className="lg:hidden flex justify-center mb-8">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="bg-blue-600 p-2 rounded-lg">
                                <Scale className="h-6 w-6 text-white" />
                            </div>
                            <span className="font-bold text-xl">LegalBook</span>
                        </Link>
                    </div>

                    <Card className="border-0 shadow-xl">
                        <CardHeader className="text-center">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Mail className="h-8 w-8 text-blue-600" />
                            </div>
                            <CardTitle className="text-2xl">Reset Password</CardTitle>
                            <CardDescription>
                                Enter the email address associated with your account
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isSuccess ? (
                                <div className="text-center py-6">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle2 className="h-8 w-8 text-green-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2">Check your email</h3>
                                    <p className="text-slate-600 text-sm mb-6">
                                        If an account exists with the email you provided,
                                        you'll receive a password reset link shortly.
                                    </p>
                                    <p className="text-slate-500 text-xs">
                                        Didn't receive the email? Check your spam folder or{" "}
                                        <button
                                            onClick={() => setIsSuccess(false)}
                                            className="text-blue-600 hover:underline"
                                        >
                                            try again
                                        </button>
                                    </p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email Address</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="you@example.com"
                                            {...register("email")}
                                            className={errors.email ? "border-red-500" : ""}
                                            autoFocus
                                        />
                                        {errors.email && (
                                            <p className="text-sm text-red-500">{errors.email.message}</p>
                                        )}
                                    </div>

                                    {error && (
                                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                                            {error}
                                        </div>
                                    )}

                                    <Button
                                        type="submit"
                                        className="w-full"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Sending Link...
                                            </>
                                        ) : (
                                            "Send Reset Link"
                                        )}
                                    </Button>
                                </form>
                            )}
                        </CardContent>
                        <CardFooter className="justify-center">
                            <Link
                                href="/auth/login"
                                className="text-sm text-slate-600 hover:text-blue-600 flex items-center gap-2"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back to Login
                            </Link>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}
