import React, { useState } from 'react';
import { Mail, ArrowRight, Loader2, Link as LinkIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../lib/utils';

export function VerificationBanner() {
    const { user, isEmailVerified, resendVerificationEmail } = useAuth();
    const { addToast } = useToast();
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [isResending, setIsResending] = useState(false);

    if (isEmailVerified) return null;

    const handleResend = async () => {
        if (!user?.email) return;

        setIsResending(true);
        try {
            await resendVerificationEmail(user.email);
            addToast('Verification email resent! Please check your inbox.', 'success');
        } catch (error) {
            console.error('[VerificationBanner] Resend failed:', error);
            addToast('Failed to resend email. Please try again later.', 'error');
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className={cn(
            "relative z-30 flex items-center justify-between px-4 py-3 sm:px-6 lg:px-8 transition-all animate-in slide-in-from-top duration-300",
            isDark
                ? "bg-gradient-to-r from-orange-500/20 to-blue-500/20 border-b border-white/10"
                : "bg-gradient-to-r from-orange-50 to-indigo-50 border-b border-slate-200"
        )}>
            <div className="flex items-center gap-3 overflow-hidden">
                <div className={cn(
                    "flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center animate-pulse",
                    isDark ? "bg-orange-500/20" : "bg-orange-100"
                )}>
                    <Mail className={cn(
                        "h-4 w-4",
                        isDark ? "text-orange-400" : "text-orange-600"
                    )} />
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-sm">
                    <span className={cn(
                        "font-semibold whitespace-nowrap",
                        isDark ? "text-white" : "text-slate-900"
                    )}>
                        Verify your email
                    </span>
                    <span className={cn(
                        "truncate opacity-80",
                        isDark ? "text-slate-300" : "text-slate-600"
                    )}>
                        Unlock full access to exports and premium AI features.
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4 ml-4">
                <button
                    onClick={handleResend}
                    disabled={isResending}
                    className={cn(
                        "hidden sm:flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all",
                        isDark
                            ? "bg-white/10 text-white hover:bg-white/20"
                            : "bg-white text-slate-700 hover:bg-slate-50 shadow-sm border border-slate-200"
                    )}
                >
                    {isResending ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                        <LinkIcon className="h-3 w-3" />
                    )}
                    Resend Link
                </button>

                <div className={cn(
                    "flex items-center gap-1.5 text-xs font-bold whitespace-nowrap",
                    isDark ? "text-orange-400" : "text-orange-600"
                )}>
                    Check Inbox
                    <ArrowRight className="h-3.5 w-3.5" />
                </div>
            </div>
        </div>
    );
}
