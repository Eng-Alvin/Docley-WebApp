import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { registerNotificationHandler } from '../api/client';

const NotificationContext = createContext(null);

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};

/**
 * Minimal Notification Card
 * Types: processing, success, action, failure
 */
const NotificationCard = ({ id, type, message, progress, action, onDismiss, onAction, ttl }) => {
    const isProcessing = type === 'processing';
    const hasAction = type === 'action' && action;

    return (
        <div
            className={cn(
                "flex items-center gap-3 bg-white dark:bg-slate-800 px-4 py-3 rounded-xl shadow-xl border border-slate-200/80 dark:border-slate-700",
                "animate-in slide-in-from-bottom-4 fade-in duration-300 ease-out",
                "min-w-[280px] max-w-[400px]"
            )}
        >
            {/* Progress/Spinner for processing */}
            {isProcessing && (
                <Loader2 className="h-4 w-4 text-slate-500 animate-spin flex-shrink-0" />
            )}

            {/* Message */}
            <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-slate-800 dark:text-slate-200 leading-tight">
                    {message}
                    {progress && (
                        <span className="text-slate-500 dark:text-slate-400 ml-1">{progress}</span>
                    )}
                </p>
            </div>

            {/* Action Button */}
            {hasAction && (
                <button
                    onClick={() => {
                        onAction?.(action);
                        onDismiss(id);
                    }}
                    className="text-[13px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors flex-shrink-0"
                >
                    {action.label || 'View'}
                </button>
            )}

            {/* Dismiss Button */}
            <button
                onClick={() => onDismiss(id)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex-shrink-0"
                aria-label="Dismiss"
            >
                <X className="h-4 w-4" />
            </button>

            {/* Auto-dismiss progress bar */}
            {ttl && !isProcessing && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-slate-200 dark:bg-slate-700 overflow-hidden rounded-b-xl">
                    <div
                        className="h-full bg-slate-400 dark:bg-slate-500"
                        style={{ animation: `shrink ${ttl}ms linear forwards` }}
                    />
                </div>
            )}
        </div>
    );
};

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const MAX_VISIBLE = 3;

    const showNotification = useCallback((notification) => {
        if (!notification) return;

        const { type = 'success', message, progress, action, ttl } = notification;

        // Map legacy priority to new types
        let resolvedType = type;
        if (notification.priority) {
            const priorityMap = {
                critical: 'failure',
                normal: 'failure',
                minimal: 'success'
            };
            resolvedType = priorityMap[notification.priority] || 'success';
        }

        // Default TTLs by type
        const defaultTtl = {
            success: 2500,
            failure: 5000,
            action: null, // Persists until dismissed
            processing: null // Persists until dismissed
        };

        const id = Date.now() + Math.random();
        const finalTtl = ttl !== undefined ? ttl : defaultTtl[resolvedType];

        const newNotification = {
            id,
            type: resolvedType,
            message,
            progress,
            action,
            ttl: finalTtl
        };

        setNotifications(prev => {
            // Limit to MAX_VISIBLE, remove oldest if exceeding
            const updated = [...prev, newNotification];
            if (updated.length > MAX_VISIBLE) {
                return updated.slice(-MAX_VISIBLE);
            }
            return updated;
        });

        // Auto-dismiss if ttl is set
        if (finalTtl) {
            setTimeout(() => {
                setNotifications(prev => prev.filter(n => n.id !== id));
            }, finalTtl);
        }

        return id;
    }, []);

    const dismissNotification = useCallback((id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    const handleAction = useCallback((action) => {
        if (!action) return;
        if (action.url) {
            window.open(action.url, '_blank');
        }
        if (action.callback && typeof action.callback === 'function') {
            action.callback();
        }
    }, []);

    // Register for backend-driven notifications
    useEffect(() => {
        registerNotificationHandler(showNotification);
    }, [showNotification]);

    return (
        <NotificationContext.Provider value={{
            showNotification,
            toast: showNotification,
            dismissNotification
        }}>
            {children}

            {/* Bottom-Center Notification Container */}
            {createPortal(
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex flex-col-reverse items-center gap-2 pointer-events-none">
                    {notifications.map(n => (
                        <div key={n.id} className="pointer-events-auto relative">
                            <NotificationCard
                                {...n}
                                onDismiss={dismissNotification}
                                onAction={handleAction}
                            />
                        </div>
                    ))}
                </div>,
                document.body
            )}
        </NotificationContext.Provider>
    );
};
