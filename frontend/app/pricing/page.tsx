import { CheckCircle2, HelpCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PricingPage() {
    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-20">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">
                        Simple, Transparent Pricing
                    </h1>
                    <p className="text-xl text-slate-300 max-w-3xl mx-auto">
                        No hidden fees. Lawyers set their own rates, and we charge a small platform fee.
                    </p>
                </div>
            </section>

            {/* Pricing Card */}
            <section className="py-20 bg-slate-50">
                <div className="container mx-auto px-4">
                    <div className="max-w-xl mx-auto">
                        <Card className="border-0 shadow-xl overflow-hidden">
                            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-center py-8">
                                <CardTitle className="text-2xl">Platform Fee</CardTitle>
                                <p className="text-blue-100 mt-2">Applied to each booking</p>
                            </CardHeader>
                            <CardContent className="pt-8 pb-10 text-center">
                                <div className="mb-6">
                                    <span className="text-6xl font-bold text-slate-900">10%</span>
                                    <span className="text-xl text-slate-500 ml-2">of consultation fee</span>
                                </div>

                                <div className="space-y-3 text-left max-w-sm mx-auto mb-8">
                                    {[
                                        "Secure payment processing",
                                        "Escrow protection until consultation",
                                        "Full refund if lawyer cancels",
                                        "24/7 customer support",
                                        "Verified lawyer profiles",
                                        "AI-powered case summary"
                                    ].map((feature, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                                            <span className="text-slate-600">{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                <a
                                    href="/search"
                                    className="inline-flex items-center justify-center w-full px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Find a Lawyer
                                </a>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Example Calculation */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4">
                    <div className="max-w-2xl mx-auto">
                        <h2 className="text-2xl font-bold text-center mb-8">How It Works</h2>
                        <div className="bg-slate-50 rounded-2xl p-8">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center py-3 border-b">
                                    <span className="text-slate-600">Lawyer's Consultation Fee</span>
                                    <span className="font-semibold">₹2,000</span>
                                </div>
                                <div className="flex justify-between items-center py-3 border-b">
                                    <span className="text-slate-600">Platform Fee (10%)</span>
                                    <span className="font-semibold text-blue-600">+ ₹200</span>
                                </div>
                                <div className="flex justify-between items-center py-3 text-lg">
                                    <span className="font-bold">Total You Pay</span>
                                    <span className="font-bold text-green-600">₹2,200</span>
                                </div>
                            </div>
                            <div className="mt-6 pt-6 border-t text-center text-sm text-slate-500">
                                <p>The lawyer receives ₹2,000. We keep ₹200 as platform fee.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* For Lawyers */}
            <section className="py-16 bg-slate-50">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-2xl font-bold mb-4">Are You a Lawyer?</h2>
                    <p className="text-slate-600 mb-8 max-w-2xl mx-auto">
                        Joining LegalBook is completely free. You set your own consultation fees,
                        and we only charge a 10% platform fee when you complete a consultation.
                    </p>
                    <a
                        href="/auth/lawyer-register"
                        className="inline-flex items-center justify-center px-8 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                    >
                        Register as a Lawyer
                    </a>
                </div>
            </section>

            {/* FAQ */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4">
                    <h2 className="text-2xl font-bold text-center mb-8">Pricing FAQ</h2>
                    <div className="max-w-2xl mx-auto space-y-6">
                        {[
                            {
                                q: "Why is there a platform fee?",
                                a: "The platform fee covers secure payment processing, lawyer verification, customer support, and platform maintenance. It ensures a safe and reliable experience for both clients and lawyers."
                            },
                            {
                                q: "When am I charged?",
                                a: "You're charged when you confirm a booking. The payment is held in escrow and released to the lawyer only after your consultation is completed."
                            },
                            {
                                q: "What if the lawyer cancels?",
                                a: "If a lawyer cancels, you receive a 100% refund, including the platform fee. No questions asked."
                            },
                            {
                                q: "Are there any hidden fees?",
                                a: "No. The price you see at checkout is exactly what you pay. There are no subscription fees, signup charges, or additional costs."
                            }
                        ].map((faq, i) => (
                            <div key={i} className="bg-slate-50 rounded-xl p-6">
                                <div className="flex items-start gap-3">
                                    <HelpCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <h3 className="font-semibold mb-2">{faq.q}</h3>
                                        <p className="text-slate-600 text-sm">{faq.a}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
