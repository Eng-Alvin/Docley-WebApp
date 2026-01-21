import axios from 'axios';
import { supabase } from '../lib/supabase';

let notificationHandler = null;
let statusHandler = null;

export const registerNotificationHandler = (handler) => {
    notificationHandler = handler;
};

export const registerStatusHandler = (handler) => {
    statusHandler = handler;
};

// 1. Base URL Resolution & Safety Check
const getBaseURL = () => {
    const url = import.meta.env.VITE_API_BASE_URL;
    if (!url) {
        console.error('FATAL: VITE_API_BASE_URL is missing from .env');
        return import.meta.env.DEV ? 'http://localhost:3000' : '';
    }
    return url;
};

const apiClient = axios.create({
    baseURL: getBaseURL(),
    timeout: 30000, // Increased to 30s to match backend processing speed
    headers: {
        'Content-Type': 'application/json',
    }
});

/**
 * 3. Request Interceptor: Module Intelligence
 * Automatically injects Supabase JWT into every request.
 */
apiClient.interceptors.request.use(
    async (config) => {
        // Smoke Test Indicator
        console.log('🚀 API Request:', config.method.toUpperCase(), config.url);

        // STRICT GUARD: Prevent malformed URLs containing error messages
        // This acts as a trap to identify the code responsible for appending errors to URLs
        if (config.url && /(%20|\s)(net::|ERR_)/i.test(config.url)) {
            console.error('🚨 MALFORMED URL DETECTED:', config.url);
            console.trace('Trace for malformed URL construction');
            // Reject immediately to protect backend logs
            return Promise.reject(new Error(`Blocked malformed request: ${config.url}`));
        }

        // Cold Start Detection: If request takes > 2s, signal "Waking up server..."
        config.metadata = { startTime: Date.now() };
        config.slowRequestTimeout = setTimeout(() => {
            if (statusHandler) statusHandler('waking_up', true);
        }, 2000);

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.access_token) {
                config.headers.Authorization = `Bearer ${session.access_token}`;
            }
        } catch (error) {
            console.error('[API Client] Request Interceptor Error:', error);
        }
        return config;
    },
    (error) => Promise.reject(error)
);

/**
 * 4. Response Interceptor: Quality Control
 * Handles global error states (401, 500) and prevents zombie sessions.
 */
apiClient.interceptors.response.use(
    (response) => {
        // Clear cold start timeout
        if (response.config.slowRequestTimeout) {
            clearTimeout(response.config.slowRequestTimeout);
        }
        if (statusHandler) statusHandler('waking_up', false);

        // Trigger success notification if present
        if (response.data?.notification && notificationHandler) {
            notificationHandler(response.data.notification);
        }
        return response;
    },
    async (error) => {
        // Clear cold start timeout
        if (error.config?.slowRequestTimeout) {
            clearTimeout(error.config.slowRequestTimeout);
        }
        if (statusHandler) statusHandler('waking_up', false);

        const status = error.response?.status;
        const data = error.response?.data;

        // Trigger error notification if present
        if (data?.notification && notificationHandler) {
            notificationHandler(data.notification);
        }

        if (status === 401) {
            console.warn('[API Client] 401 Unauthorized - Clearing zombie session');
            await supabase.auth.signOut();
            // No reload - let AuthContext handle the state change via onAuthStateChange
        }

        if (status >= 500) {
            console.error('[API Client] Backend Error:', error.response?.data?.message || error.message);
        }

        // Handle Timeout specifically for better UX
        if (error.code === 'ECONNABORTED' && statusHandler) {
            notificationHandler?.({
                code: 'TIMEOUT',
                message: 'The server is taking too long to respond. Please try again.',
                priority: 'normal',
                ttl: 5000
            });
        }

        return Promise.reject(error);
    }
);

export default apiClient;
