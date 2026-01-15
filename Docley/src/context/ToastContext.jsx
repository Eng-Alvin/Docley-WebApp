import { useNotification } from './NotificationContext';

/**
 * LEGACY WRAPPER: Re-routes useToast to the new NotificationProvider.
 * This ensures existing code continues to work while transitioning to
 * the backend-driven system.
 */
export const useToast = () => {
    const { toast } = useNotification();

    // Map legacy addToast(message, type) to new showNotification({ message, priority })
    const addToast = (message, type = 'info') => {
        const priorityMap = {
            success: 'minimal',
            error: 'normal',
            warning: 'normal',
            info: 'minimal'
        };

        toast({
            message,
            priority: priorityMap[type] || 'minimal',
            ttl: type === 'success' ? 3000 : 5000
        });
    };

    return { addToast, toast: addToast };
};

// Dummy provider for backward compatibility (in case it's still imported)
export const ToastProvider = ({ children }) => children;
