"use client";
import Link from "next/link";
import { useEffect } from "react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-slate-50">
      <h2 className="text-3xl font-bold text-slate-800 mb-2">
        Something went wrong
      </h2>
      <p className="text-slate-500 mb-8 max-w-md">
        We could not load this page. This is usually temporary. Our team has been notified.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <button onClick={() => reset()} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors">
          Try Again
        </button>
        <Link href="/" className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-6 py-2.5 rounded-lg font-medium transition-colors">
          Return to Homepage
        </Link>
      </div>
    </div>
  );
}
