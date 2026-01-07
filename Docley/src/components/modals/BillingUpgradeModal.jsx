import React, { useState, useEffect } from 'react';
import { X, ExternalLink, AlertCircle, Loader2 } from 'lucide-react';
import { WhopCheckoutEmbed } from '@whop/checkout/react';
import { cn } from '../../lib/utils';

export default function BillingUpgradeModal({ isOpen, onClose }) {
    // Fail-Fast: Throw error if VITE_API_URL is missing
    if (!import.meta.env.VITE_API_URL) {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <div className="bg-white dark:bg-slate-900 border-2 border-red-500 rounded-2xl p-8 max-w-md text-center">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Configuration Error</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">
                        Frontend is misconfigured. <code>VITE_API_URL</code> is missing. Please contact support.
                    </p>
                    <button onClick={onClose} className="bg-red-500 text-white px-6 py-2 rounded-lg font-medium">Close</button>
                </div>
            </div>
        );
    }

    const [hasTimedOut, setHasTimedOut] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const planId = import.meta.env.VITE_WHOP_PLAN_ID || "plan_EMmS2ygOVrIdN";

    useEffect(() => {
        if (!isOpen) {
            setHasTimedOut(false);
            setIsLoading(true);
            return;
        }

        // Fail-Safe: 5-second timer
        const timer = setTimeout(() => {
            setHasTimedOut(true);
            setIsLoading(false);
        }, 5000);

        return () => clearTimeout(timer);
    }, [isOpen]);

    if (!isOpen) return null;

    const handleCheckoutReady = () => {
        setIsLoading(false);
        // If it loads, clear timeout is handled by useEffect cleanup if unmounted,
        // but we should ideally let the user see the embed even if it takes 6s if it eventually works.
        // However, the requirement is "If it fails to load after 5 seconds... replace the embed".
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div
                className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
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

                {/* Content Area */}
                <div className="bg-white dark:bg-slate-950 min-h-[600px] flex flex-col items-center justify-center relative">

                    {isLoading && !hasTimedOut && (
                        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white dark:bg-slate-950">
                            <Loader2 className="h-10 w-10 text-indigo-600 animate-spin mb-4" />
                            <p className="text-slate-500 dark:text-slate-400 font-medium">Securing checkout session...</p>
                        </div>
                    )}

                    {hasTimedOut ? (
                        <div className="flex flex-col items-center justify-center p-8 text-center max-w-lg mx-auto animate-in fade-in duration-500">
                            <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mb-6">
                                <AlertCircle className="h-10 w-10 text-amber-600 dark:text-amber-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Checkout Taking a While?</h3>
                            <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                                Browser security policies or network filters might be blocking the embedded checkout.
                                You can continue securely on our primary payment gateway.
                            </p>
                            <a
                                href={`https://whop.com/checkout/${planId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl shadow-indigo-600/20 transform hover:-translate-y-1 transition-all"
                            >
                                Open Secure Checkout <ExternalLink className="h-5 w-5" />
                            </a>
                            <p className="mt-6 text-sm text-slate-500 dark:text-slate-500">
                                Rest assured, your payment is processed securely by Whop.
                            </p>
                        </div>
                    ) : (
                        <div className="w-full h-[600px] overflow-hidden" allow="payment; clipboard-write">
                            <WhopCheckoutEmbed
                                planId={planId}
                            />
                        </div>
                    )}
                </div>

                {/* Footer info/Trust badges */}
                <div className="p-4 bg-slate-50 dark:bg-slate-900/30 border-t border-slate-100 dark:border-slate-800 text-center">
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2">
                        Secure checkout powered by <b>Whop</b>
                    </p>
                </div>
            </div>

            {/* Backdrop overlay listener */}
            <div className="absolute inset-0 -z-10" onClick={onClose}></div>
        </div>
    );
}
