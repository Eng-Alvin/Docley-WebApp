import { supabase } from '../lib/supabase';
import { API_BASE_URL } from '../config/api';

const API_URL = `${API_BASE_URL}/users`;

// Helper to get authorization header
const getAuthHeaders = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
        throw new Error('User not authenticated');
    }
    return {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
    };
};

/**
 * Update user password
 */
export const updatePassword = async (newPassword) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/password`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ password: newPassword }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update password');
    }

    return await response.json();
};
