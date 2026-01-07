import { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

export function Modal({ isOpen, onClose, children, size = 'md' }) {
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full mx-4">
                <div
                    className={cn(
                        'bg-white dark:bg-slate-900 rounded-xl shadow-2xl overflow-hidden transform transition-all',
                        sizeClasses[size]
                    )}
                >
                    {children}
                </div>
            </div>
        </div>
    );
}

export function ModalHeader({ children, onClose }) {
    return (
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
            {children}
            <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
                <X className="h-5 w-5" />
            </button>
        </div>
    );
}

export function ModalContent({ children }) {
    return <div className="p-6">{children}</div>;
}

export function ModalFooter({ children }) {
    return (
        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
            {children}
        </div>
    );
}
