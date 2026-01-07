import React from 'react';
import { X, AlertTriangle, Loader2 } from 'lucide-react';
import { WhopCheckoutEmbed } from '@whop/checkout/react';
import { cn } from '../../lib/utils';
import { API_BASE_URL, getAuthHeaders } from '../../api/client';

/**
 * BillingUpgradeModal - Thin UI Component
 * Strictly for rendering the Whop Checkout.
 */
export default function BillingUpgradeModal({ isOpen, onClose }) {
    const apiUrl = import.meta.env.VITE_API_URL;
    const [sessionId, setSessionId] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);

    React.useEffect(() => {
        if (!isOpen || !apiUrl) return;

        const fetchSession = async () => {
            setLoading(true);
            setError(null);
            try {
                const headers = await getAuthHeaders();
                const response = await fetch(`${API_BASE_URL}/payments/session`, { headers });

                if (!response.ok) {
                    throw new Error('Failed to initialize checkout session');
                }

                const data = await response.json();
                setSessionId(data.sessionId);
            } catch (err) {
                console.error('[Billing] Session error:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchSession();
    }, [isOpen, apiUrl]);

    if (!isOpen) return null;

    // Critical Config Error Overlay
    if (!apiUrl) {
        return (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md animate-in fade-in duration-300 shadow-[inset_0_0_100px_rgba(239,68,68,0.2)]">
                <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-2xl border-2 border-red-500 max-w-md text-center transform scale-100 animate-in zoom-in-95 duration-300">
                    <div className="bg-red-100 dark:bg-red-900/30 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertTriangle className="h-10 w-10 text-red-600 dark:text-red-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 font-display">Critical Config Error</h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                        The system environment variable <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-red-500 font-mono text-sm">VITE_API_URL</code> is missing.
                        Application synchronization is disabled.
                    </p>
                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-red-600/20 transform transition-all active:scale-[0.98] hover:scale-[1.02]"
                    >
                        Close Portal
                    </button>
                </div>
            </div>
        );
    }

    // Static plan ID as per instructions
    const planId = "plan_EMmS2ygOVrIdN";

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div
                className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                            <span className="text-xl">🚀</span>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Upgrade to Pro</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Unlock unlimited document processing</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content Area - Whop Embed */}
                <div className="bg-white dark:bg-slate-950 min-h-[600px] flex flex-col items-center justify-center relative">
                    {loading ? (
                        <div className="flex flex-col items-center gap-4">
                            <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
                            <p className="text-sm text-slate-500 font-medium">Initializing secure connection...</p>
                        </div>
                    ) : error ? (
                        <div className="p-8 text-center">
                            <div className="bg-red-100 dark:bg-red-900/30 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertTriangle className="h-6 w-6 text-red-600" />
                            </div>
                            <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Checkout Error</h4>
                            <p className="text-sm text-slate-500 mb-6">{error}</p>
                            <button
                                onClick={onClose}
                                className="px-6 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold"
                            >
                                Try Again Later
                            </button>
                        </div>
                    ) : sessionId ? (
                        <div className="w-full h-[600px] overflow-hidden">
                            <WhopCheckoutEmbed
                                sessionId={sessionId}
                                iframeAttributes={{
                                    allow: 'payment; clipboard-write'
                                }}
                            />
                        </div>
                    ) : (
                        <div className="text-slate-400">Unable to load checkout portal</div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 bg-slate-50 dark:bg-slate-900/30 border-t border-slate-100 dark:border-slate-800 text-center">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        Secure checkout powered by <b>Whop</b>
                    </p>
                </div>
            </div>

            {/* Backdrop overlay listener */}
            <div className="absolute inset-0 -z-10" onClick={onClose}></div>
        </div>
    );
}
