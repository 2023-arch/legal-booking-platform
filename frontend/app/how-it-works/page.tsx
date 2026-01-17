import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function HowItWorksPage() {
    return (
        <div className="container py-20 text-center">
            <h1 className="text-4xl font-bold mb-6">How It Works</h1>
            <p className="text-xl text-muted-foreground mb-8 text-center max-w-2xl mx-auto">
                We simplify the process of finding and booking the right lawyer for your needs.
            </p>

            <div className="grid md:grid-cols-3 gap-8 my-16">
                <div className="p-6 bg-slate-50 rounded-lg">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">1</div>
                    <h3 className="tex-xl font-semibold mb-2">Search</h3>
                    <p>Find lawyers by specialization, location, or name.</p>
                </div>
                <div className="p-6 bg-slate-50 rounded-lg">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">2</div>
                    <h3 className="tex-xl font-semibold mb-2">Book</h3>
                    <p>Schedule a consultation at a time that works for you.</p>
                </div>
                <div className="p-6 bg-slate-50 rounded-lg">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">3</div>
                    <h3 className="tex-xl font-semibold mb-2">Consult</h3>
                    <p>Connect via video, audio, or in-person meeting.</p>
                </div>
            </div>

            <Link href="/search">
                <Button size="lg" className="bg-blue-600">Find a Lawyer Now</Button>
            </Link>
        </div>
    )
}
