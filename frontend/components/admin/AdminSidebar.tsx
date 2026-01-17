"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Users,
    ShieldCheck,
    Settings,
    LogOut,
    Scale,
    FileText,
    AlertCircle
} from "lucide-react";

const adminLinks = [
    { name: "Overview", href: "/admin", icon: LayoutDashboard },
    { name: "Lawyers", href: "/admin/lawyers", icon: ShieldCheck },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Disputes", href: "/admin/disputes", icon: AlertCircle },
    { name: "Reports", href: "/admin/reports", icon: FileText },
    { name: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminSidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-950 text-white flex flex-col z-50">
            {/* Logo */}
            <div className="h-16 flex items-center px-6 border-b border-slate-900 bg-slate-950">
                <Link href="/" className="flex items-center gap-2 font-bold text-lg hover:text-blue-400 transition-colors">
                    <Scale className="h-6 w-6 text-red-500" />
                    <span>LegalBook <span className="text-xs font-normal text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded ml-1">Admin</span></span>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-6 px-3 space-y-1">
                {adminLinks.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                                isActive
                                    ? "bg-red-600 text-white shadow-lg shadow-red-500/20"
                                    : "text-slate-400 hover:text-white hover:bg-slate-900"
                            )}
                        >
                            <Icon className={cn("h-5 w-5", isActive ? "text-white" : "text-slate-500 group-hover:text-white")} />
                            {link.name}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-slate-900 bg-slate-950">
                <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-950/30 transition-colors">
                    <LogOut className="h-5 w-5" />
                    Sign Out
                </button>
            </div>
        </aside>
    );
}
