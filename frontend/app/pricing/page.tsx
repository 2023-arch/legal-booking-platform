export default function PricingPage() {
    return (
        <div className="container py-20 text-center">
            <h1 className="text-4xl font-bold mb-4">Pricing</h1>
            <p className="text-xl text-muted-foreground">Transparent pricing for everyone.</p>

            <div className="mt-16 p-8 border rounded-lg max-w-md mx-auto bg-slate-50">
                <h2 className="text-2xl font-bold mb-4">Platform Fee</h2>
                <p className="text-slate-600 mb-6">Clients pay only for the consultation fee set by the lawyer. We charge a small service fee.</p>
                <div className="text-4xl font-bold mb-2">₹49</div>
                <p className="text-sm text-slate-500 mb-8">per booking service fee</p>
            </div>
        </div>
    )
}
