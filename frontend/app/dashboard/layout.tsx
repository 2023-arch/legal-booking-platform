import Sidebar from '@/components/dashboard/Sidebar';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-slate-50">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <div className="pl-64">
                {/* Dashboard Header */}
                <header className="h-16 bg-white border-b flex items-center justify-between px-8 sticky top-0 z-10">
                    <h2 className="text-xl font-semibold text-slate-800">User Dashboard</h2>

                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" className="text-slate-500 relative">
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full" />
                        </Button>
                        <div className="h-8 w-px bg-slate-200" />
                        <div className="flex items-center gap-3">
                            <div className="text-right hidden md:block">
                                <div className="text-sm font-medium text-slate-900">John Doe</div>
                                <div className="text-xs text-slate-500">Premium Member</div>
                            </div>
                            <Avatar>
                                <AvatarImage src="https://github.com/shadcn.png" />
                                <AvatarFallback>JD</AvatarFallback>
                            </Avatar>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
