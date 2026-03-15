"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext" // Using Auth Context
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

// Register Schema
const formSchema = z.object({
    name: z.string().min(2, {
        message: "Name must be at least 2 characters.",
    }),
    email: z.string().email({
        message: "Please enter a valid email address.",
    }),
    phone: z.string().min(10, {
        message: "Phone number must be at least 10 digits.",
    }),
    password: z.string().min(6, {
        message: "Password must be at least 6 characters.",
    }),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

export default function RegisterPage() {
    const router = useRouter()
    const { register } = useAuth(); // Hook
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            password: "",
            confirmPassword: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true)
        try {
            await register({
                name: values.name,
                email: values.email,
                phone: values.phone,
                password: values.password,
                user_type: "user", // Default to user type
            });

            // Registration successful, AuthContext might auto-login or we redirect to dashboard
            router.push('/dashboard');

        } catch (err: any) {
            console.error("Registration failed:", err);
            const detail = err.response?.data?.detail || err.message;
            if (typeof detail === 'string' && detail.includes("already")) {
                form.setError("email", { message: "This email is already registered. Try logging in." });
            } else {
                form.setError("root", { message: detail || "Registration failed." });
            }
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
                <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-emerald-500 rounded-full blur-[100px] opacity-20 animate-pulse pointer-events-none" />
                <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-600 rounded-full blur-[100px] opacity-20 animate-pulse delay-1000 pointer-events-none" />

                <div className="relative z-20 flex items-center text-lg font-medium">
                    <div className="bg-blue-600 p-1.5 rounded-lg mr-2">
                        <Scale className="h-5 w-5 text-white" />
                    </div>
                    LegalBook
                </div>
                <div className="relative z-20 mt-auto">
                    <blockquote className="space-y-2">
                        <p className="text-lg leading-relaxed text-slate-200">
                            &ldquo;LegalBook made it incredibly easy to find a verified lawyer for my startup. The video consultation feature is a game-changer!&rdquo;
                        </p>
                        <footer className="text-sm font-medium text-slate-100">Rahul Mehta, Entrepreneur</footer>
                    </blockquote>
                </div>
            </div>

            <div className="p-8 lg:p-12">
                <div className="mx-auto flex w-full flex-col justify-center space-y-8 sm:w-[380px]">
                    <div className="flex flex-col space-y-2 text-center">
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                            Create an account
                        </h1>
                        <p className="text-sm text-slate-500">
                            Enter your details below to create your account
                        </p>
                    </div>

                    <div className="grid gap-6">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Full Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="John Doe" className="h-11" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
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
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Phone Number</FormLabel>
                                            <FormControl>
                                                <Input placeholder="9876543210" className="h-11" {...field} />
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
                                            <FormLabel>Password</FormLabel>
                                            <FormControl>
                                                <Input type="password" placeholder="••••••••" className="h-11" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="confirmPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Confirm Password</FormLabel>
                                            <FormControl>
                                                <Input type="password" placeholder="••••••••" className="h-11" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {form.formState.errors.root && (
                                    <div className="bg-red-50 border border-red-300 text-red-700 rounded-lg p-3 text-sm">
                                        {form.formState.errors.root.message}
                                    </div>
                                )}

                                <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 h-11 text-base" disabled={isLoading}>
                                    {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                                    Create Account
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

                        <div className="grid grid-cols-2 gap-4">
                            <Button variant="outline" type="button" disabled={isLoading} className="h-11 border-slate-200 hover:bg-slate-50">
                                <Icons.google className="mr-2 h-4 w-4" />
                                Google
                            </Button>
                            <Link href="/auth/lawyer-register" className="w-full">
                                <Button variant="outline" type="button" className="w-full h-11 border-blue-200 text-blue-700 hover:bg-blue-50">
                                    I am a Lawyer
                                </Button>
                            </Link>
                        </div>
                    </div>

                    <p className="px-8 text-center text-sm text-slate-500">
                        Already have an account?{" "}
                        <Link
                            href="/auth/login"
                            className="text-blue-600 hover:text-blue-700 font-medium underline-offset-4 hover:underline"
                        >
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
