import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { User, Bell, CreditCard, Shield, Mail, Save } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { useState } from 'react';

export default function DashboardSettings() {
    const { addToast } = useToast();
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            addToast("Settings saved successfully!", "success");
        }, 1000);
    };

    const handleCancelPlan = () => {
        addToast("Please contact support to cancel your plan.", "warning");
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-slate-900 mb-6">Account Settings</h1>

            {/* Profile Section */}
            <Card className="border-slate-200">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <User className="h-5 w-5 text-indigo-600" />
                        <CardTitle className="text-lg">Personal Information</CardTitle>
                    </div>
                    <CardDescription>Manage your public profile and contact details.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Full Name</label>
                            <input
                                type="text"
                                defaultValue="Alvyn Student"
                                className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                                <input
                                    type="email"
                                    defaultValue="student@university.edu"
                                    className="w-full h-10 pl-10 px-3 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end pt-2">
                        <Button size="sm" onClick={handleSave} isLoading={isSaving} className="bg-gradient-to-r from-indigo-600 to-indigo-700">
                            <Save className="mr-2 h-4 w-4" /> Save Changes
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Preferences */}
            <Card className="border-slate-200">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Bell className="h-5 w-5 text-indigo-600" />
                        <CardTitle className="text-lg">Notifications</CardTitle>
                    </div>
                    <CardDescription>Configure how you receive alerts.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between py-2 border-b border-slate-50">
                        <div>
                            <p className="font-medium text-slate-900 text-sm">Email Alerts</p>
                            <p className="text-xs text-slate-500">Receive analysis reports via email</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked onChange={() => addToast("Notification settings updated", "info")} />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                    </div>
                    <div className="flex items-center justify-between py-2">
                        <div>
                            <p className="font-medium text-slate-900 text-sm">Marketing</p>
                            <p className="text-xs text-slate-500">Receive product updates and tips</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" onChange={() => addToast("Marketing preferences updated", "info")} />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                    </div>
                </CardContent>
            </Card>

            {/* Subscription */}
            <Card className="border-slate-200">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-indigo-600" />
                        <CardTitle className="text-lg">Subscription</CardTitle>
                    </div>
                    <CardDescription>View and manage your current plan.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between bg-slate-50 p-4 rounded-lg border border-slate-100 mb-4">
                        <div>
                            <p className="font-bold text-slate-900">Free Plan</p>
                            <p className="text-xs text-slate-500">Limited to 3 uploads/month</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => addToast("Upgrade flow not implemented yet", "info")}>Upgrade to Pro</Button>
                    </div>
                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50 p-0 h-auto" onClick={handleCancelPlan}>
                        Cancel Subscription
                    </Button>
                </CardContent>
            </Card>

        </div>
    );
}
