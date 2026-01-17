'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    Calendar,
    User,
    LogOut,
    Scale,
    Settings,
    HelpCircle,
    Inbox,
    IndianRupee,
    Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const sidebarItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard/lawyer' },
    { icon: Inbox, label: 'Requests', href: '/dashboard/lawyer/requests' },
    { icon: Calendar, label: 'Consultations', href: '/dashboard/lawyer/consultations' },
    { icon: Clock, label: 'Availability', href: '/dashboard/lawyer/availability' },
    { icon: IndianRupee, label: 'Earnings', href: '/dashboard/lawyer/earnings' },
    { icon: User, label: 'My Profile', href: '/dashboard/lawyer/profile' },
    { icon: Settings, label: 'Settings', href: '/dashboard/lawyer/settings' },
];

export default function LawyerSidebar() {
    const pathname = usePathname();

    return (
        <div className="h-screen w-64 bg-slate-900 text-white flex flex-col fixed left-0 top-0 border-r border-slate-800">
            {/* Brand */}
            <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-900">
                <Scale className="h-6 w-6 text-green-500 mr-2" />
                <div>
                    <span className="font-bold text-lg block">LegalBook</span>
                    <span className="text-[10px] text-green-500 uppercase tracking-wider font-semibold">Partner</span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-6 px-3 space-y-1">
                {sidebarItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link key={item.href} href={item.href}>
                            <Button
                                variant="ghost"
                                className={cn(
                                    "w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800 mb-1",
                                    isActive && "bg-green-600 text-white hover:bg-green-700"
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
            <div className="p-4 border-t border-slate-800 space-y-2">
                <Button variant="ghost" className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-800">
                    <HelpCircle className="h-5 w-5 mr-3" />
                    Support
                </Button>
                <Button variant="ghost" className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-900/20">
                    <LogOut className="h-5 w-5 mr-3" />
                    Logout
                </Button>
            </div>
        </div>
    );
}
