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

                router.push("/dashboard")
            } catch (error: any) {
                console.error("Registration failed:", error);
                alert(error.response?.data?.detail || "Registration failed. Please try again.");
                setIsLoading(false)
            }
        }
    }

    return (
        <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
            <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
                <div className="absolute inset-0 bg-slate-900" />
                <div className="relative z-20 flex items-center text-lg font-medium">
                    <Scale className="mr-2 h-6 w-6" />
                    LegalBook Inc
                </div>
                <div className="relative z-20 mt-auto">
                    <blockquote className="space-y-2">
                        <p className="text-lg">
                            &ldquo;Join thousands of verified lawyers and clients connecting every day.&rdquo;
                        </p>
                    </blockquote>
                </div>
            </div>

            <div className="p-8">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    <div className="flex flex-col space-y-2 text-center">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Create an account
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Enter your information below to create your account
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
                                            <Input placeholder="John Doe" {...field} />
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
                                            <Input placeholder="name@example.com" {...field} />
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
                                            <Input placeholder="+91 9876543210" {...field} />
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
                                            <Input type="password" placeholder="••••••••" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="role"
                                render={({ field }) => (
                                    <FormItem className="space-y-3">
                                        <FormLabel>I am a...</FormLabel>
                                        <FormControl>
                                            <div className="flex gap-4">
                                                <label className={`flex-1 border rounded-lg p-3 text-center cursor-pointer transition-colors ${field.value === 'user' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'hover:bg-slate-50'}`}>
                                                    <input
                                                        type="radio"
                                                        className="hidden"
                                                        {...field}
                                                        value="user"
                                                        checked={field.value === 'user'}
                                                    />
                                                    <span className="font-semibold block">Client</span>
                                                    <span className="text-xs text-slate-500">I need legal help</span>
                                                </label>
                                                <label className={`flex-1 border rounded-lg p-3 text-center cursor-pointer transition-colors ${field.value === 'lawyer' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'hover:bg-slate-50'}`}>
                                                    <input
                                                        type="radio"
                                                        className="hidden"
                                                        {...field}
                                                        value="lawyer"
                                                        checked={field.value === 'lawyer'}
                                                    />
                                                    <span className="font-semibold block">Lawyer</span>
                                                    <span className="text-xs text-slate-500">I offer legal services</span>
                                                </label>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button type="submit" className="w-full bg-slate-900" disabled={isLoading}>
                                {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                                Create Account
                            </Button>
                        </form>
                    </Form>

                    <p className="px-8 text-center text-sm text-muted-foreground">
                        By clicking continue, you agree to our{" "}
                        <Link href="/terms" className="underline underline-offset-4 hover:text-primary">
                            Terms
                        </Link>{" "}
                        and{" "}
                        <Link href="/privacy" className="underline underline-offset-4 hover:text-primary">
                            Privacy Policy
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
