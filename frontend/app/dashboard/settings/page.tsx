export default function SettingsPage() {
    return (
        <div className="max-w-2xl">
            <h1 className="text-2xl font-bold text-slate-900 mb-6">Settings</h1>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
                <div>
                    <h3 className="font-semibold text-lg mb-1">Notifications</h3>
                    <p className="text-sm text-slate-500 mb-4">Manage how you receive updates.</p>
                    <div className="space-y-2">
                        <label className="flex items-center gap-2">
                            <input type="checkbox" defaultChecked className="rounded border-slate-300" />
                            <span className="text-sm">Email Notifications</span>
                        </label>
                        <label className="flex items-center gap-2">
                            <input type="checkbox" defaultChecked className="rounded border-slate-300" />
                            <span className="text-sm">SMS Alerts</span>
                        </label>
                    </div>
                </div>

                <div className="pt-6 border-t border-slate-100">
                    <h3 className="font-semibold text-lg mb-1">Account</h3>
                    <p className="text-sm text-slate-500 mb-4">Update your personal details.</p>
                    <button className="text-red-600 text-sm font-medium hover:underline">Delete Account</button>
                </div>
            </div>
        </div>
    );
}
