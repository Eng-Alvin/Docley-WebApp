import { API_BASE_URL, getAuthHeaders } from '../config/api';

export async function syncUserProfile() {
    try {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_BASE_URL}/users/sync`, {
            method: 'POST',
            headers
        });

        if (!response.ok) {
            throw new Error('Failed to sync user profile');
        }

        return await response.json();
    } catch (error) {
        console.error('Error syncing user profile:', error);
        // We generally swallow this error to not block the user flow
        return null;
    }
}
