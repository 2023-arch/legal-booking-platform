"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { authAPI } from "@/lib/api"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Icons } from "@/components/ui/icons"
import { Scale } from "lucide-react"

// Login Schema
const formSchema = z.object({
    email: z.string().email({
        message: "Please enter a valid email address.",
    }),
    password: z.string().min(1, {
        message: "Password is required.",
    }),
})

export default function LoginPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true)
        try {
            const data = await authAPI.login(values);

            // Store tokens
            localStorage.setItem('access_token', data.access_token);
            localStorage.setItem('refresh_token', data.refresh_token);

            // Set cookie for Middleware (expires in 1 day)
            document.cookie = `token=${data.access_token}; path=/; max-age=86400; SameSite=Strict`;

            // Redirect logic
            try {
                const user = await authAPI.getCurrentUser();
                if (user.user_type === 'lawyer') {
                    router.push('/dashboard/lawyer');
                } else if (user.is_superuser) {
                    router.push('/admin');
                } else {
                    router.push('/dashboard');
                }
            } catch (e) {
                router.push('/dashboard'); // Fallback
            }

        } catch (error: any) {
            console.error("Login failed:", error);
            alert(error.response?.data?.detail || "Login failed. Please check your credentials.");
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="container relative min-h-[calc(100vh-4rem)] flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
            {/* Left Side - Branding */}
            <div className="relative hidden h-full flex-col p-10 text-white dark:border-r lg:flex overflow-hidden">
                <div className="absolute inset-0 bg-slate-900" />
                {/* Animated Gradients */}
                <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-blue-500 rounded-full blur-[100px] opacity-20 animate-pulse pointer-events-none" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-purple-500 rounded-full blur-[100px] opacity-20 animate-pulse delay-1000 pointer-events-none" />

                <div className="relative z-20 flex items-center text-lg font-medium">
                    <div className="bg-blue-600 p-1.5 rounded-lg mr-2">
                        <Scale className="h-5 w-5 text-white" />
                    </div>
                    LegalBook
                </div>
                <div className="relative z-20 mt-auto">
                    <blockquote className="space-y-2">
                        <p className="text-lg leading-relaxed text-slate-200">
                            &ldquo;This platform saved me so much time. I found a great property lawyer within minutes and got my documents verified securely.&rdquo;
                        </p>
                        <footer className="text-sm font-medium text-slate-100">Sofia Davis, Real Estate Investor</footer>
                    </blockquote>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="p-8 lg:p-12">
                <div className="mx-auto flex w-full flex-col justify-center space-y-8 sm:w-[380px]">
                    <div className="flex flex-col space-y-2 text-center">
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                            Welcome back
                        </h1>
                        <p className="text-sm text-slate-500">
                            Enter your email to sign in to your account
                        </p>
                    </div>

                    <div className="grid gap-6">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input placeholder="name@example.com" className="h-11" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <div className="flex items-center justify-between">
                                                <FormLabel>Password</FormLabel>
                                                <Link
                                                    href="/auth/forgot-password"
                                                    className="text-xs text-blue-600 hover:text-blue-500 font-medium"
                                                >
                                                    Forgot password?
                                                </Link>
                                            </div>
                                            <FormControl>
                                                <Input type="password" placeholder="••••••••" className="h-11" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 h-11 text-base" disabled={isLoading}>
                                    {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                                    Sign In
                                </Button>
                            </form>
                        </Form>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-slate-200" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white px-2 text-slate-500">
                                    Or continue with
                                </span>
                            </div>
                        </div>

                        <Button variant="outline" type="button" disabled={isLoading} className="h-11 border-slate-200 hover:bg-slate-50">
                            <Icons.google className="mr-2 h-4 w-4" />
                            Google
                        </Button>
                    </div>

                    <p className="px-8 text-center text-sm text-slate-500">
                        Don&apos;t have an account?{" "}
                        <Link
                            href="/auth/register"
                            className="text-blue-600 hover:text-blue-700 font-medium underline-offset-4 hover:underline"
                        >
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
