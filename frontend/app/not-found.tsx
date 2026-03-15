import Link from "next/link";
import { Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-slate-50">
      <div className="text-blue-600 font-black text-9xl mb-4 opacity-20">404</div>
      <h2 className="text-3xl font-bold text-slate-800 mb-2 z-10">
        Page Not Found
      </h2>
      <p className="text-slate-500 mb-8 max-w-md z-10">
        The page you are looking for doesn't exist or has been moved.
      </p>
      
      <div className="w-full max-w-md relative mb-8 z-10">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input 
            type="text" 
            placeholder="Search lawyers, articles, or help..." 
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <Link href="/" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors z-10">
        Go Back Home
      </Link>
    </div>
  );
}
