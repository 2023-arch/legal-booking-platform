"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Scale, Lock, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/lib/api";

const resetPasswordSchema = z.object({
    new_password: z.string().min(8, "Password must be at least 8 characters"),
    confirm_password: z.string()
}).refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
    const params = useParams();
    const router = useRouter();
    const token = params.token as string;

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ResetPasswordFormData>({
        resolver: zodResolver(resetPasswordSchema),
    });

    const onSubmit = async (data: ResetPasswordFormData) => {
        setIsSubmitting(true);
        setError(null);

        try {
            await api.post("/auth/reset-password", {
                token,
                new_password: data.new_password
            });
            setIsSuccess(true);
            
            // Redirect to login after 3 seconds
            setTimeout(() => {
                router.push("/auth/login");
            }, 3000);
            
        } catch (err: any) {
            const message = err.response?.data?.detail || "Invalid or expired token. Please request a new reset link.";
            setError(message);
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
                        Create a new password
                    </h2>
                    <p className="text-blue-100 text-lg">
                        You're almost there! Choose a strong password to secure your account.
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
                                <Lock className="h-8 w-8 text-blue-600" />
                            </div>
                            <CardTitle className="text-2xl">Reset Password</CardTitle>
                            <CardDescription>
                                Enter your new password below
                            </CardDescription>
                        </CardHeader>
                        
                        <CardContent>
                            {isSuccess ? (
                                <div className="text-center py-6">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle2 className="h-8 w-8 text-green-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2">Password Reset Successful</h3>
                                    <p className="text-slate-600 text-sm mb-4">
                                        Your password has been successfully updated.
                                        You are being redirected to login...
                                    </p>
                                    <Button 
                                        className="w-full" 
                                        onClick={() => router.push("/auth/login")}
                                    >
                                        Go to Login Now
                                    </Button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="new_password">New Password</Label>
                                        <Input
                                            id="new_password"
                                            type="password"
                                            placeholder="••••••••"
                                            {...register("new_password")}
                                            className={errors.new_password ? "border-red-500" : ""}
                                        />
                                        {errors.new_password && (
                                            <p className="text-sm text-red-500">{errors.new_password.message}</p>
                                        )}
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label htmlFor="confirm_password">Confirm New Password</Label>
                                        <Input
                                            id="confirm_password"
                                            type="password"
                                            placeholder="••••••••"
                                            {...register("confirm_password")}
                                            className={errors.confirm_password ? "border-red-500" : ""}
                                        />
                                        {errors.confirm_password && (
                                            <p className="text-sm text-red-500">{errors.confirm_password.message}</p>
                                        )}
                                    </div>

                                    {error && (
                                        <div className="bg-red-50 border border-red-200 text-red-700 rounded-md p-3 text-sm">
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
                                                Resetting Password...
                                            </>
                                        ) : (
                                            "Reset Password"
                                        )}
                                    </Button>
                                </form>
                            )}
                        </CardContent>
                        <CardFooter className="justify-center pt-2">
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
