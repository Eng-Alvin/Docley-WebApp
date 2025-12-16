import { createContext, useContext, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '../lib/utils';

const ToastContext = createContext(null);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

const ToastItem = ({ id, type, message, onDismiss }) => {
    const icons = {
        success: CheckCircle2,
        error: AlertCircle,
        info: Info,
        warning: AlertTriangle
    };

    const colors = {
        success: "bg-green-50 border-green-200 text-green-800",
        error: "bg-red-50 border-red-200 text-red-800",
        info: "bg-blue-50 border-blue-200 text-blue-800",
        warning: "bg-orange-50 border-orange-200 text-orange-800" // Utilizing Orange for warnings
    };

    const Icon = icons[type] || icons.info;

    return (
        <div className={cn(
            "flex items-center gap-3 w-full max-w-sm px-4 py-3 mb-3 rounded-lg border shadow-lg transform transition-all duration-300 ease-in-out animate-in slide-in-from-right",
            colors[type] || colors.info
        )}>
            <Icon className="h-5 w-5 flex-shrink-0" />
            <p className="flex-1 text-sm font-medium">{message}</p>
            <button onClick={() => onDismiss(id)} className="text-current opacity-60 hover:opacity-100">
                <X className="h-4 w-4" />
            </button>
        </div>
    );
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);

        // Auto dismiss
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 4000);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ addToast, toast: addToast }}>
            {children}
            {createPortal(
                <div className="fixed top-4 right-4 z-50 flex flex-col items-end pointer-events-none">
                    {toasts.map(t => (
                        <div key={t.id} className="pointer-events-auto">
                            <ToastItem {...t} onDismiss={removeToast} />
                        </div>
                    ))}
                </div>,
                document.body
            )}
        </ToastContext.Provider>
    );
};
