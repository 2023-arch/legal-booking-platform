'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    UserCheck,
    Users,
    Calendar,
    Settings,
    ShieldCheck,
    LogOut,
    HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const sidebarItems = [
    { icon: LayoutDashboard, label: 'Overview', href: '/admin' },
    { icon: UserCheck, label: 'Verification Queue', href: '/admin/lawyers' },
    { icon: Users, label: 'All Users', href: '/admin/users' },
    { icon: Calendar, label: 'All Bookings', href: '/admin/bookings' },
    { icon: Settings, label: 'Platform Settings', href: '/admin/settings' },
];

export default function AdminSidebar() {
    const pathname = usePathname();

    return (
        <div className="h-screen w-64 bg-slate-950 text-white flex flex-col fixed left-0 top-0 border-r border-slate-900">
            {/* Brand */}
            <div className="h-16 flex items-center px-6 border-b border-slate-900 bg-slate-950">
                <ShieldCheck className="h-6 w-6 text-red-500 mr-2" />
                <div>
                    <span className="font-bold text-lg block">LegalBook</span>
                    <span className="text-[10px] text-red-500 uppercase tracking-wider font-semibold">Admin</span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-6 px-3 space-y-1">
                {sidebarItems.map((item) => {
                    const isActive = pathname === item.href || (pathname !== '/admin' && pathname.startsWith(item.href) && item.href !== '/admin');
                    return (
                        <Link key={item.href} href={item.href}>
                            <Button
                                variant="ghost"
                                className={cn(
                                    "w-full justify-start text-slate-400 hover:text-white hover:bg-slate-900 mb-1",
                                    isActive && "bg-slate-800 text-white hover:bg-slate-800"
                                )}
                            >
                                <item.icon className="h-5 w-5 mr-3" />
                                {item.label}
                            </Button>
                        </Link>
                    );
                })}
            </nav>

            {/* Footer Actions */}
            <div className="p-4 border-t border-slate-900 space-y-2">
                <Button variant="ghost" className="w-full justify-start text-slate-500 hover:text-white hover:bg-slate-900">
                    <HelpCircle className="h-5 w-5 mr-3" />
                    Documentation
                </Button>
                <Button variant="ghost" className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-900/20">
                    <LogOut className="h-5 w-5 mr-3" />
                    Logout
                </Button>
            </div>
        </div>
    );
}
