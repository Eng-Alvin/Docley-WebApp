import { useNotification } from './NotificationContext';

/**
 * LEGACY WRAPPER: Re-routes useToast to the new NotificationProvider.
 * Maps legacy addToast(message, type) calls to the new notification system.
 */
export const useToast = () => {
    const { showNotification, dismissNotification } = useNotification();

    const addToast = (message, type = 'info') => {
        // Map legacy types to new notification types
        const typeMap = {
            success: 'success',
            error: 'failure',
            warning: 'failure',
            info: 'success',
            processing: 'processing',
            action: 'action',
            failure: 'failure'
        };

        const ttlMap = {
            success: 2500,
            error: 5000,
            warning: 4000,
            info: 2500,
            failure: 5000,
            processing: null,
            action: null
        };

        showNotification({
            type: typeMap[type] || 'success',
            message,
            ttl: ttlMap[type] !== undefined ? ttlMap[type] : 2500
        });
    };


    return { addToast, toast: addToast, dismissNotification };
};

// Dummy provider for backward compatibility (in case it's still imported)
export const ToastProvider = ({ children }) => children;
