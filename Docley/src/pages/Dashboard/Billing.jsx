import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { CreditCard, CheckCircle2, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { cn } from '../../lib/utils';
import apiClient from '../../api/client';
import BillingUpgradeModal from '../../components/modals/BillingUpgradeModal';

export default function Billing() {
    const { user, isPremium, refreshProfile } = useAuth();
    const { addToast } = useToast();
    const [searchParams] = useSearchParams();
    const [isLoading, setIsLoading] = useState(false); // No longer needed for specific fetch
    const [isCreatingSession, setIsCreatingSession] = useState(false);
    const [showCheckout, setShowCheckout] = useState(false);
    const [sessionId, setSessionId] = useState(null);

    const status = searchParams.get('status');

    // Show success notification if redirected back after payment
    useEffect(() => {
        if (status === 'success') {
            addToast('Payment successful! You are now a Pro user.', 'success');
            // Clear the query param
            window.history.replaceState({}, '', '/settings/billing');
        }
    }, [status, addToast]);

    const handleUpgradeClick = async () => {
        setIsCreatingSession(true);
        try {
            const response = await apiClient.post('/payments/create-session');
            const { sessionId } = response.data;
            setSessionId(sessionId);
            setShowCheckout(true);
        } catch (err) {
            addToast('Failed to start checkout: ' + (err.response?.data?.message || err.message), 'error');
        } finally {
            setIsCreatingSession(false);
        }
    };

    const handleCheckoutComplete = () => {
        setShowCheckout(false);
        addToast('Payment successful! You are now a Pro user.', 'success');
        setIsPremium(true);
        // Redirect to billing page with success flag
        window.location.href = '/settings/billing?status=success';
    };

    const handleCheckoutClose = () => {
        setShowCheckout(false);
        setSessionId(null);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Back to Settings */}
            <button
                onClick={() => window.history.back()}
                className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to Settings
            </button>

            {/* Current Plan Card */}
            <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden bg-white dark:bg-slate-900">
                <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                    <CardTitle className="text-lg text-slate-900 dark:text-white">Current Plan</CardTitle>
                    <CardDescription className="text-slate-500 dark:text-slate-400">Manage your billing and subscription.</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                    <div className={cn(
                        "relative overflow-hidden rounded-xl border p-8",
                        isPremium
                            ? "border-emerald-100 dark:border-emerald-900/50 bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-900/20 dark:to-slate-900"
                            : "border-indigo-100 dark:border-indigo-900/50 bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-900/20 dark:to-slate-900"
                    )}>
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <CreditCard className="h-32 w-32 text-indigo-600" />
                        </div>
                        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                                        {isPremium ? 'Pro Plan' : 'Free Plan'}
                                    </h3>
                                    <span className={cn(
                                        "px-3 py-1 rounded-full text-xs font-bold border",
                                        isPremium
                                            ? "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                                            : "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800"
                                    )}>
                                        ACTIVE
                                    </span>
                                </div>
                                <p className="text-slate-600 dark:text-slate-400 max-w-md">
                                    {isPremium
                                        ? 'You are on the Pro plan with unlimited document processing and premium features.'
                                        : 'You are currently on the free tier. Upgrade to unlock more document processing power and premium features.'}
                                </p>
                            </div>
                            <div className="text-left md:text-right">
                                <div className="text-3xl font-bold text-slate-900 dark:text-white">
                                    {isPremium ? '$9' : '$0'}
                                </div>
                                <div className="text-sm text-slate-500 dark:text-slate-400">per month</div>
                            </div>
                        </div>

                        <div className="mt-8 pt-8 border-t border-indigo-100 dark:border-indigo-900/30">
                            {!isPremium ? (
                                <Button
                                    onClick={handleUpgradeClick}
                                    isLoading={isCreatingSession}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20"
                                >
                                    Upgrade to Pro
                                </Button>
                            ) : (
                                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                                    <CheckCircle2 className="h-5 w-5" />
                                    <span className="font-medium">You have full access to all Pro features</span>
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Features Comparison */}
            <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden bg-white dark:bg-slate-900">
                <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                    <CardTitle className="text-lg text-slate-900 dark:text-white">Plan Features</CardTitle>
                    <CardDescription className="text-slate-500 dark:text-slate-400">Compare Free vs Pro plans.</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="space-y-4">
                        {[
                            { feature: 'Documents', free: '2 per lifetime', pro: 'Unlimited' },
                            { feature: 'AI Diagnostics', free: '2 per lifetime', pro: 'Unlimited' },
                            { feature: 'AI Upgrades', free: '2 per lifetime', pro: 'Unlimited' },
                            { feature: 'Export Formats', free: 'PDF & DOCX', pro: 'All formats' },
                            { feature: 'Priority Support', free: 'Community', pro: 'Priority' },
                        ].map((item) => (
                            <div key={item.feature} className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
                                <span className="font-medium text-slate-900 dark:text-white">{item.feature}</span>
                                <div className="flex items-center gap-6 text-sm">
                                    <span className={cn(
                                        isPremium ? "text-slate-400 line-through" : "text-slate-600 dark:text-slate-400"
                                    )}>
                                        {item.free}
                                    </span>
                                    <span className={cn(
                                        "font-medium",
                                        isPremium ? "text-emerald-600 dark:text-emerald-400" : "text-indigo-600 dark:text-indigo-400"
                                    )}>
                                        {item.pro}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Checkout Modal */}
            <BillingUpgradeModal
                isOpen={showCheckout}
                onClose={handleCheckoutClose}
            />
        </div>
    );
}
