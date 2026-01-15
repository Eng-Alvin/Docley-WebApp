import apiClient from '../api/client';

export const paymentsService = {
    createCheckoutSession: async () => {
        try {
            const response = await apiClient.post('/api/payments/create-session');
            return response.data;
        } catch (error) {
            console.error('Failed to create checkout session:', error);
            throw error;
        }
    }
};
