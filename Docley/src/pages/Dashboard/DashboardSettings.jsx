import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { User, Bell, CreditCard, Shield, Mail, Save, Key, Trash2, AlertTriangle, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { useState } from 'react';
import { updatePassword } from '../../services/usersService';

export default function DashboardSettings() {
    const { addToast } = useToast();
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        fullName: 'Alvyn Student',
        email: 'student@university.edu',
        emailAlerts: true,
        marketing: false,
    });

    // Password change state
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
    const [passwordData, setPasswordData] = useState({
        newPassword: '',
        confirmPassword: '',
    });
    const [showPasswords, setShowPasswords] = useState(false);

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            addToast('Settings saved successfully!', 'success');
        }, 1000);
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            addToast('Passwords do not match', 'error');
            return;
        }

        if (passwordData.newPassword.length < 8) {
            addToast('Password must be at least 8 characters long', 'warning');
            return;
        }

        setIsUpdatingPassword(true);
        try {
            await updatePassword(passwordData.newPassword);
            addToast('Password updated successfully', 'success');
            setShowPasswordForm(false);
            setPasswordData({ newPassword: '', confirmPassword: '' });
        } catch (error) {
            addToast(error.message || 'Failed to update password', 'error');
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    const handleCancelPlan = () => {
        addToast('Please contact support to cancel your plan.', 'warning');
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Account Settings</h1>
                <p className="text-sm text-slate-600">Manage your account preferences and subscription</p>
            </div>

            {/* Profile Section */}
            <Card className="border-slate-200 shadow-sm">
                <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-white to-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                            <User className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div>
                            <CardTitle className="text-xl">Personal Information</CardTitle>
                            <CardDescription>Manage your public profile and contact details</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6 space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                Full Name
                            </label>
                            <input
                                type="text"
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                className="w-full h-11 px-4 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                <Mail className="h-4 w-4 text-slate-400" />
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full h-11 pl-10 pr-4 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end pt-2">
                        <Button
                            size="sm"
                            onClick={handleSave}
                            isLoading={isSaving}
                            className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white"
                        >
                            <Save className="mr-2 h-4 w-4" /> Save Changes
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Notifications */}
            <Card className="border-slate-200 shadow-sm">
                <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-white to-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                            <Bell className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div>
                            <CardTitle className="text-xl">Notifications</CardTitle>
                            <CardDescription>Configure how you receive alerts and updates</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                    <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                        <div className="flex-1">
                            <p className="font-semibold text-slate-900 text-sm mb-1">Email Alerts</p>
                            <p className="text-xs text-slate-500">Receive analysis reports and important updates via email</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer ml-4">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={formData.emailAlerts}
                                onChange={(e) => {
                                    setFormData({ ...formData, emailAlerts: e.target.checked });
                                    addToast('Notification settings updated', 'info');
                                }}
                            />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                    </div>
                    <div className="flex items-center justify-between py-3">
                        <div className="flex-1">
                            <p className="font-semibold text-slate-900 text-sm mb-1">Marketing Updates</p>
                            <p className="text-xs text-slate-500">Receive product updates, tips, and feature announcements</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer ml-4">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={formData.marketing}
                                onChange={(e) => {
                                    setFormData({ ...formData, marketing: e.target.checked });
                                    addToast('Marketing preferences updated', 'info');
                                }}
                            />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                    </div>
                </CardContent>
            </Card>

            {/* Subscription */}
            <Card className="border-slate-200 shadow-sm">
                <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-white to-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                            <CreditCard className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div>
                            <CardTitle className="text-xl">Subscription</CardTitle>
                            <CardDescription>View and manage your current plan</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="bg-gradient-to-br from-slate-50 to-indigo-50/30 p-5 rounded-xl border border-slate-200 mb-4">
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-bold text-lg text-slate-900">Free Plan</span>
                                    <span className="px-2 py-0.5 rounded-full bg-slate-200 text-xs font-semibold text-slate-700">
                                        Current
                                    </span>
                                </div>
                                <p className="text-sm text-slate-600">Limited to 3 document upgrades per month</p>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-bold text-slate-900">$0</div>
                                <div className="text-xs text-slate-500">per month</div>
                            </div>
                        </div>
                        <div className="pt-4 border-t border-slate-200">
                            <div className="flex items-center justify-between text-sm mb-2">
                                <span className="text-slate-600">Usage this month</span>
                                <span className="font-semibold text-slate-900">1 / 3 documents</span>
                            </div>
                            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full" style={{ width: '33%' }}></div>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addToast('Upgrade flow not implemented yet', 'info')}
                            className="flex-1 border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                        >
                            Upgrade to Pro
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={handleCancelPlan}
                        >
                            Cancel Subscription
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Security */}
            <Card className="border-slate-200 shadow-sm">
                <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-white to-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                            <Shield className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div>
                            <CardTitle className="text-xl">Security</CardTitle>
                            <CardDescription>Manage your account security settings</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                    <div className="flex items-center justify-between py-3 border-b border-slate-100">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <Key className="h-4 w-4 text-slate-400" />
                                <p className="font-semibold text-slate-900 text-sm">Password</p>
                            </div>
                            <p className="text-xs text-slate-500">Last changed 3 months ago</p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowPasswordForm(!showPasswordForm)}
                        >
                            {showPasswordForm ? 'Cancel' : 'Change Password'}
                        </Button>
                    </div>

                    {showPasswordForm && (
                        <form onSubmit={handlePasswordChange} className="mt-4 p-5 rounded-xl border border-indigo-100 bg-indigo-50/30 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-slate-700">New Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPasswords ? "text" : "password"}
                                            value={passwordData.newPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                            className="w-full h-10 px-4 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            placeholder="Min. 8 characters"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPasswords(!showPasswords)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        >
                                            {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-slate-700">Confirm Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPasswords ? "text" : "password"}
                                            value={passwordData.confirmPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                            className="w-full h-10 px-4 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            placeholder="Match new password"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button
                                    type="submit"
                                    size="sm"
                                    isLoading={isUpdatingPassword}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                >
                                    Update Password
                                </Button>
                            </div>
                        </form>
                    )}
                    <div className="flex items-center justify-between py-3">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <AlertTriangle className="h-4 w-4 text-amber-400" />
                                <p className="font-semibold text-slate-900 text-sm">Delete Account</p>
                            </div>
                            <p className="text-xs text-slate-500">Permanently delete your account and all data</p>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => addToast('Account deletion requires confirmation', 'warning')}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
