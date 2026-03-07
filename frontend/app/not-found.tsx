import Link from "next/link"
import { Scale, Search, Home } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-10">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Scale className="h-6 w-6 text-white" />
          </div>
          <span className="font-bold text-xl text-slate-900">LegalBook</span>
        </div>

        {/* 404 Visual */}
        <h1 className="text-[120px] font-bold leading-none text-slate-100 select-none">404</h1>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900">Page not found</h2>
        <p className="mt-3 text-slate-500 text-base leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Let&apos;s get you back on track.
        </p>

        {/* CTAs */}
        <div className="mt-8 flex gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-100 transition"
          >
            <Home className="h-4 w-4" />
            Go home
          </Link>
          <Link
            href="/search"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 transition"
          >
            <Search className="h-4 w-4" />
            Find a lawyer
          </Link>
        </div>
      </div>
    </div>
  )
}
