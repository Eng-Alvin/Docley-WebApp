import React from 'react';
import { X, AlertTriangle, Loader2, Rocket, CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { createCheckoutSession } from '../../services/paymentsService';
import { Button } from '../ui/Button';

export default function BillingUpgradeModal({ isOpen, onClose }) {
    const [isRedirecting, setIsRedirecting] = React.useState(false);
    const [error, setError] = React.useState(null);

    const handleUpgrade = async () => {
        setIsRedirecting(true);
        setError(null);
        try {
            const data = await createCheckoutSession();
            if (data.url) {
                // Redirect to Whop secure checkout
                window.location.href = data.url;
            } else {
                throw new Error('Checkout URL not received from server');
            }
        } catch (err) {
            console.error('[BillingUpgradeModal] Redirect failed:', err);
            setError(err.message || 'Failed to initialize secure checkout');
            setIsRedirecting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div
                className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 bg-gradient-to-r from-indigo-600 to-violet-600 text-white">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                            <Rocket className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold">Upgrade to Pro</h3>
                            <p className="text-xs text-indigo-100 italic">Elevate your document game</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-all"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 space-y-6">
                    {error && (
                        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 flex items-start gap-3 text-red-600 dark:text-red-400">
                            <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                            <p className="text-sm font-medium">{error}</p>
                        </div>
                    )}

                    <div className="space-y-4">
                        <h4 className="font-bold text-slate-900 dark:text-white text-lg">Pro Plan Benefits</h4>
                        <ul className="space-y-3">
                            {[
                                'Unlimited document processing',
                                'Priority AI processing speeds',
                                'Early access to new features',
                                'Premium export options',
                                'Priority support'
                            ].map((feature, idx) => (
                                <li key={idx} className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                                    <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                                    {feature}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Monthly Billing</p>
                            <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">$9.00<span className="text-sm font-normal text-slate-400">/mo</span></p>
                        </div>
                        <div className="text-right">
                            <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold tracking-wider uppercase">Best Value</span>
                        </div>
                    </div>

                    <Button
                        onClick={handleUpgrade}
                        disabled={isRedirecting}
                        className="w-full py-6 text-lg font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-500/20 rounded-2xl transition-all active:scale-[0.98]"
                    >
                        {isRedirecting ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            'Upgrade Now'
                        )}
                    </Button>

                    <p className="text-[10px] text-center text-slate-400">
                        By upgrading, you agree to our Terms of Service. Secure payments processed via Whop.
                    </p>
                </div>
            </div>

            {/* Backdrop overlay listener */}
            <div className="absolute inset-0 -z-10" onClick={onClose}></div>
        </div>
    );
}
