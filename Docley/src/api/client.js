/**
 * API Client Configuration
 * Manages VITE_API_URL and enforces strict configuration.
 */

const getApiUrl = () => {
    const url = import.meta.env.VITE_API_URL;

    if (!url) {
        if (import.meta.env.DEV) {
            console.warn('VITE_API_URL is missing. Falling back to localhost:3000 for development.');
            return 'http://localhost:3000';
        }
        // Strict requirement: Throw error if missing in production
        throw new Error('System Config Error: VITE_API_URL is missing. Please check your environment variables.');
    }

    return url;
};

export const API_BASE_URL = getApiUrl();

/**
 * Helper to get authentication headers using the current Supabase session.
 * Used for all backend-driven API calls.
 */
export async function getAuthHeaders() {
    try {
        const { supabase } = await import('../lib/supabase');
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.access_token) {
            throw new Error('User session not found');
        }

        return {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
        };
    } catch (error) {
        console.error('[API Client] Auth Header Error:', error);
        throw error;
    }
}
