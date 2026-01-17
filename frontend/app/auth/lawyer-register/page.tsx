"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
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
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Icons } from "@/components/ui/icons"
import { Scale, ChevronRight, ChevronLeft, Upload, FileCheck, CheckCircle2 } from "lucide-react"
import { authAPI } from "@/lib/api"

// Schema for all steps
const wizardSchema = z.object({
    // Step 1: Personal
    fullName: z.string().min(2, "Name required"),
    email: z.string().email("Invalid email"),
    phone: z.string().min(10, "Invalid phone"),
    password: z.string().min(8, "Password too short"),

    // Step 2: Professional
    barCouncilId: z.string().min(5, "Bar ID required"),
    experience: z.string().min(1, "Experience required"), // string for input, convert later
    bio: z.string().min(50, "Bio must be at least 50 chars"),

    // Step 3: Practice
    specializations: z.array(z.string()).min(1, "Select at least one"),
    courts: z.string().min(2, "Court name required"), // simplified for demo
    consultationFee: z.string().min(1, "Fee required"),
    languages: z.array(z.string()).min(1, "Select languages"),

    // Step 4: Documents (Simulated)
    barCertificate: z.any().optional(),
    idProof: z.any().optional(),
})

const SPECIALIZATIONS = ["Criminal", "Civil", "Family", "Corporate", "Property", "Startup", "Cyber Crime", "Labor"]
const LANGUAGES = ["English", "Hindi", "Bengali", "Marathi", "Tamil", "Telugu", "Kannada"]

export default function LawyerRegisterWizard() {
    const router = useRouter()
    const [step, setStep] = useState(1)
    const [isLoading, setIsLoading] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)

    const form = useForm<z.infer<typeof wizardSchema>>({
        resolver: zodResolver(wizardSchema),
        mode: "onChange",
        defaultValues: {
            fullName: "",
            email: "",
            phone: "",
            password: "",
            barCouncilId: "",
            experience: "",
            bio: "",
            specializations: [],
            courts: "",
            consultationFee: "",
            languages: [],
        },
    })

    // Check validation before moving next
    const nextStep = async () => {
        let fieldsToValidate: any[] = []
        if (step === 1) fieldsToValidate = ['fullName', 'email', 'phone', 'password']
        if (step === 2) fieldsToValidate = ['barCouncilId', 'experience', 'bio']
        if (step === 3) fieldsToValidate = ['specializations', 'courts', 'consultationFee', 'languages']

        const isValid = await form.trigger(fieldsToValidate)
        if (isValid) setStep(step + 1)
    }

    const prevStep = () => setStep(step - 1)

    async function onSubmit(values: z.infer<typeof wizardSchema>) {
        setIsLoading(true)
        console.log("Submitting Lawyer Application:", values)

        try {
            const formData = new FormData();

            // Append Text Fields
            formData.append('bar_council_number', values.barCouncilId);
            formData.append('years_experience', values.experience);
            formData.append('bio', values.bio);
            formData.append('consultation_fee', values.consultationFee);

            // Append JSON Fields
            formData.append('languages', JSON.stringify(values.languages));
            formData.append('specializations', JSON.stringify(values.specializations.map(s => ({ specialization_id: s })))); // Mock structure
            formData.append('court_ids', JSON.stringify([values.courts])); // Mock structure: usually UUIDs

            // Append Files
            if (values.barCertificate) formData.append('bar_council_certificate', values.barCertificate);
            if (values.idProof) formData.append('id_proof', values.idProof);
            // formData.append('profile_photo', ...); 

            await authAPI.registerLawyer(formData);

            setIsSubmitted(true);
        } catch (error: any) {
            console.error("Submission failed:", error);
            alert(error.response?.data?.detail || "Failed to submit application.");
        } finally {
            setIsLoading(false)
        }
    }

    if (isSubmitted) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <Card className="max-w-md w-full text-center p-8">
                    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                        <CheckCircle2 className="h-8 w-8 text-green-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Application Submitted!</h1>
                    <p className="text-slate-600 mb-8">
                        Your profile is currently under review. verification usually takes 24-48 hours. We will notify you via email.
                    </p>
                    <Link href="/">
                        <Button className="w-full">Return to Home</Button>
                    </Link>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4">
            <div className="max-w-3xl mx-auto">

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-2">
                        <div className="bg-blue-600 p-2 rounded-lg">
                            <Scale className="h-6 w-6 text-white" />
                        </div>
                        <span className="font-bold text-xl text-slate-900">Partner Application</span>
                    </div>
                    <div className="text-sm font-medium text-slate-500">
                        Step {step} of 4
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 bg-slate-200 rounded-full mb-8 overflow-hidden">
                    <div
                        className="h-full bg-blue-600 transition-all duration-500 ease-out"
                        style={{ width: `${(step / 4) * 100}%` }}
                    />
                </div>

                <Card className="border-none shadow-xl">
                    <CardHeader>
                        <CardTitle className="text-2xl">
                            {step === 1 && "Basic Information"}
                            {step === 2 && "Professional Profile"}
                            {step === 3 && "Practice Details"}
                            {step === 4 && "Document Verification"}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                                {/* STEP 1: BASIC INFO */}
                                {step === 1 && (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                                        <FormField
                                            control={form.control}
                                            name="fullName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Full Name</FormLabel>
                                                    <FormControl><Input placeholder="Adv. Rajesh Kumar" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="email"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Email</FormLabel>
                                                        <FormControl><Input placeholder="lawyer@example.com" {...field} /></FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="phone"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Mobile Number</FormLabel>
                                                        <FormControl><Input placeholder="+91 9876543210" {...field} /></FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <FormField
                                            control={form.control}
                                            name="password"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Password</FormLabel>
                                                    <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                )}

                                {/* STEP 2: PROFESSIONAL */}
                                {step === 2 && (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="barCouncilId"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Bar Council ID</FormLabel>
                                                        <FormControl><Input placeholder="MAH/1234/2015" {...field} /></FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="experience"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Years of Experience</FormLabel>
                                                        <FormControl><Input type="number" placeholder="5" {...field} /></FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <FormField
                                            control={form.control}
                                            name="bio"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Professional Bio</FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            placeholder="Describe your expertise, education, and notable cases..."
                                                            className="h-32"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormDescription>Min 50 characters. This will be shown on your profile.</FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                )}

                                {/* STEP 3: PRACTICE */}
                                {step === 3 && (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                                        <FormField
                                            control={form.control}
                                            name="specializations"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="mb-2 block">Areas of Specialization</FormLabel>
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                        {SPECIALIZATIONS.map((spec) => (
                                                            <FormItem key={spec} className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-3 bg-white hover:bg-slate-50 transition-colors">
                                                                <FormControl>
                                                                    <Checkbox
                                                                        checked={field.value?.includes(spec)}
                                                                        onCheckedChange={(checked) => {
                                                                            return checked
                                                                                ? field.onChange([...field.value, spec])
                                                                                : field.onChange(
                                                                                    field.value?.filter(
                                                                                        (value) => value !== spec
                                                                                    )
                                                                                )
                                                                        }}
                                                                    />
                                                                </FormControl>
                                                                <FormLabel className="font-normal cursor-pointer w-full">
                                                                    {spec}
                                                                </FormLabel>
                                                            </FormItem>
                                                        ))}
                                                    </div>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <div className="grid md:grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="courts"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Primary Court</FormLabel>
                                                        <FormControl><Input placeholder="e.g. High Court, Bombay" {...field} /></FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="consultationFee"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Consultation Fee (₹)</FormLabel>
                                                        <FormControl><Input type="number" placeholder="2000" {...field} /></FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <FormField
                                            control={form.control}
                                            name="languages"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="mb-2 block">Languages Spoken</FormLabel>
                                                    <div className="flex flex-wrap gap-2">
                                                        {LANGUAGES.map((lang) => (
                                                            <div key={lang} className="flex items-center space-x-2">
                                                                <Checkbox
                                                                    id={`lang-${lang}`}
                                                                    checked={field.value?.includes(lang)}
                                                                    onCheckedChange={(checked) => {
                                                                        return checked
                                                                            ? field.onChange([...field.value, lang])
                                                                            : field.onChange(
                                                                                field.value?.filter(
                                                                                    (value) => value !== lang
                                                                                )
                                                                            )
                                                                    }}
                                                                />
                                                                <label htmlFor={`lang-${lang}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                                                    {lang}
                                                                </label>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                )}

                                {/* STEP 4: DOCS */}
                                {step === 4 && (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                                        <Card className="border-dashed border-2 bg-slate-50">
                                            <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                                                <FileCheck className="h-10 w-10 text-slate-400 mb-4" />
                                                <h3 className="font-semibold text-lg">Bar Council Certificate</h3>
                                                <p className="text-sm text-slate-500 mb-4">Upload your clear scanned certificate (PDF/JPG)</p>
                                                <Input
                                                    type="file"
                                                    accept=".pdf,.jpg,.jpeg,.png"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) form.setValue('barCertificate', file);
                                                    }}
                                                    className="max-w-xs"
                                                />
                                            </CardContent>
                                        </Card>

                                        <Card className="border-dashed border-2 bg-slate-50">
                                            <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                                                <FileCheck className="h-10 w-10 text-slate-400 mb-4" />
                                                <h3 className="font-semibold text-lg">Identity Proof</h3>
                                                <p className="text-sm text-slate-500 mb-4">Aadhaar Card or PAN Card (PDF/JPG)</p>
                                                <Input
                                                    type="file"
                                                    accept=".pdf,.jpg,.jpeg,.png"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) form.setValue('idProof', file);
                                                    }}
                                                    className="max-w-xs"
                                                />
                                            </CardContent>
                                        </Card>

                                        <div className="bg-blue-50 p-4 rounded-lg flex gap-3 text-blue-700 text-sm">
                                            <div className="mt-0.5"><CheckCircle2 className="h-4 w-4" /></div>
                                            <div>
                                                I hereby declare that all information provided is true and I am a registered practitioner under the Advocates Act, 1961.
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-between pt-6 border-t">
                                    {step > 1 ? (
                                        <Button type="button" variant="outline" onClick={prevStep}>
                                            <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                                        </Button>
                                    ) : (
                                        <Button type="button" variant="ghost" className="invisible">Previous</Button>
                                    )}

                                    {step < 4 ? (
                                        <Button type="button" onClick={nextStep} className="bg-blue-600 hover:bg-blue-700">
                                            Next Step <ChevronRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    ) : (
                                        <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={isLoading}>
                                            {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                                            Submit Application
                                        </Button>
                                    )}
                                </div>

                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
