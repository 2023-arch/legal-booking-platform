import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CheckCircle2 } from "lucide-react"

export default function ForLawyersPage() {
    return (
        <div className="container py-20">
            <div className="text-center max-w-3xl mx-auto mb-16">
                <h1 className="text-4xl font-bold mb-6">Grow Your Legal Practice</h1>
                <p className="text-xl text-muted-foreground mb-8">
                    Join thousands of top-rated lawyers who are expanding their client base with LegalBook.
                </p>
                <Link href="/auth/register?role=lawyer">
                    <Button size="lg" className="bg-green-600 hover:bg-green-700">Join as a Partner</Button>
                </Link>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold">Why Partner with Us?</h2>
                    <ul className="space-y-4">
                        {[
                            "Access to high-intent clients looking for legal help",
                            "Automated appointment scheduling and reminders",
                            "Secure document handling and case management",
                            "Guaranteed payments for consultations",
                            "Build your online reputation with verified reviews"
                        ].map((item, i) => (
                            <li key={i} className="flex items-center gap-3">
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="bg-slate-100 h-[400px] rounded-2xl flex items-center justify-center text-slate-400">
                    Image Placeholder
                </div>
            </div>
        </div>
    )
}
