import apiClient from '../api/client';

/**
 * Payments Service
 * Handles billing and subscription logic via NestJS backend.
 */

/**
 * Creates a dynamic Whop checkout session.
 * @returns {Promise<{ sessionId: string }>}
 */
export async function createCheckoutSession() {
    try {
        const response = await apiClient.get('/payments/session');
        return response.data;
    } catch (error) {
        console.error('[Payments Service] Failed to create session:', error);
        throw error;
    }
}
