'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    Calendar,
    MessageSquare,
    User,
    LogOut,
    Scale,
    Settings,
    HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const sidebarItems = [
    { icon: LayoutDashboard, label: 'Overview', href: '/dashboard' },
    { icon: Calendar, label: 'My Bookings', href: '/dashboard/bookings' },
    { icon: MessageSquare, label: 'AI Assistant', href: '/dashboard/ai-assistant' },
    { icon: User, label: 'My Profile', href: '/dashboard/profile' },
    { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="h-screen w-64 bg-slate-900 text-white flex flex-col fixed left-0 top-0">
            {/* Brand */}
            <div className="h-16 flex items-center px-6 border-b border-slate-800">
                <Scale className="h-6 w-6 text-blue-500 mr-2" />
                <span className="font-bold text-lg">LegalBook</span>
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
                                    isActive && "bg-blue-600 text-white hover:bg-blue-700"
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
                    Help & Support
                </Button>
                <Button variant="ghost" className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-900/20">
                    <LogOut className="h-5 w-5 mr-3" />
                    Logout
                </Button>
            </div>
        </div>
    );
}
