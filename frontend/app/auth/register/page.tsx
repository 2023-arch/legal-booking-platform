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
    FormDescription,
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
    fullName: z.string().min(2, {
        message: "Name must be at least 2 characters.",
    }),
    email: z.string().email({
        message: "Please enter a valid email address.",
    }),
    password: z.string().min(8, {
        message: "Password must be at least 8 characters.",
    }),
    phone: z.string().min(10, {
        message: "Please enter a valid phone number.",
    }),
    role: z.enum(["user", "lawyer"])
})

export default function RegisterPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            fullName: "",
            email: "",
            password: "",
            phone: "",
            role: "user"
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true)

        // Redirect logic
        if (values.role === 'lawyer') {
            // Check if backend uses separate reg for first step? 
            // Usually auth.py Register works for both if user_type is passed
            // user_type: "lawyer" -> creates user, then redirects to wizard

            try {
                // Register base user first
                const data = await authAPI.register({
                    email: values.email,
                    password: values.password,
                    full_name: values.fullName,
                    phone: values.phone,
                    user_type: "lawyer"
                });

                // Login automatically
                localStorage.setItem('access_token', data.access_token);
                localStorage.setItem('refresh_token', data.refresh_token);
                // Set cookie for middleware
                document.cookie = `token=${data.access_token}; path=/; max-age=86400; SameSite=Strict`;

                router.push('/auth/lawyer-register') // Go to wizard
            } catch (error: any) {
                console.error("Registration failed:", error);
                alert(error.response?.data?.detail || "Registration failed. Please try again.");
                setIsLoading(false)
            }

        } else {
            try {
                const data = await authAPI.register({
                    email: values.email,
                    password: values.password,
                    full_name: values.fullName,
                    phone: values.phone,
                    user_type: "client"
                });

                // Login automatically
                localStorage.setItem('access_token', data.access_token);
                localStorage.setItem('refresh_token', data.refresh_token);
                // Set cookie for middleware
                document.cookie = `token=${data.access_token}; path=/; max-age=86400; SameSite=Strict`;

                router.push("/dashboard")
            } catch (error: any) {
                console.error("Registration failed:", error);
                alert(error.response?.data?.detail || "Registration failed. Please try again.");
                setIsLoading(false)
            }
        }
    }

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center relative overflow-hidden bg-slate-50 py-12">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-100/50 rounded-full blur-3xl pointer-events-none" />

            <div className="w-full max-w-lg px-4 relative z-10">
                <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 sm:p-10">
                    <div className="flex flex-col space-y-2 text-center mb-8">
                        <div className="mx-auto bg-blue-600 p-2 rounded-xl mb-4 w-fit">
                            <Scale className="h-6 w-6 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                            Create an account
                        </h1>
                        <p className="text-sm text-slate-500">
                            Join thousands of verified lawyers and clients
                        </p>
                    </div>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="fullName"
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
                                            <Input placeholder="+91 9876543210" className="h-11" {...field} />
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
                                name="role"
                                render={({ field }) => (
                                    <FormItem className="space-y-3 pt-2">
                                        <FormLabel>I am a...</FormLabel>
                                        <FormControl>
                                            <div className="grid grid-cols-2 gap-4">
                                                <label className={`border rounded-xl p-4 text-center cursor-pointer transition-all ${field.value === 'user' ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500' : 'hover:bg-slate-50 border-slate-200'}`}>
                                                    <input
                                                        type="radio"
                                                        className="hidden"
                                                        {...field}
                                                        value="user"
                                                        checked={field.value === 'user'}
                                                    />
                                                    <span className={`font-semibold block mb-1 ${field.value === 'user' ? 'text-blue-700' : 'text-slate-900'}`}>Client</span>
                                                    <span className="text-xs text-slate-500 block">I need legal help</span>
                                                </label>
                                                <label className={`border rounded-xl p-4 text-center cursor-pointer transition-all ${field.value === 'lawyer' ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500' : 'hover:bg-slate-50 border-slate-200'}`}>
                                                    <input
                                                        type="radio"
                                                        className="hidden"
                                                        {...field}
                                                        value="lawyer"
                                                        checked={field.value === 'lawyer'}
                                                    />
                                                    <span className={`font-semibold block mb-1 ${field.value === 'lawyer' ? 'text-blue-700' : 'text-slate-900'}`}>Lawyer</span>
                                                    <span className="text-xs text-slate-500 block">I offer legal services</span>
                                                </label>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 h-12 text-base mt-2" disabled={isLoading}>
                                {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                                Create Account
                            </Button>
                        </form>
                    </Form>

                    <p className="px-8 text-center text-sm text-slate-500 mt-6">
                        By clicking continue, you agree to our{" "}
                        <Link href="/terms" className="underline underline-offset-4 hover:text-blue-600">
                            Terms
                        </Link>{" "}
                        and{" "}
                        <Link href="/privacy" className="underline underline-offset-4 hover:text-blue-600">
                            Privacy Policy
                        </Link>
                    </p>
                </div>

                <p className="text-center text-sm text-slate-500 mt-8">
                    Already have an account?{" "}
                    <Link href="/auth/login" className="font-semibold text-blue-600 hover:text-blue-500 underline-offset-4 hover:underline">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    )
}
