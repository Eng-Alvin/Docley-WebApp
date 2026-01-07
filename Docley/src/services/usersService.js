import { API_BASE_URL, getAuthHeaders } from '../api/client';

const API_URL = `${API_BASE_URL}/users`;

export async function getUserUsage() {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/usage`, { headers });

    if (!response.ok) {
        throw new Error('Failed to fetch user usage');
    }

    return await response.json();
}

/**
 * Manages user profile fetching and syncing
 */
export async function fetchUserProfile() {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/profile`, { headers });

    if (!response.ok) {
        throw new Error('Failed to fetch user profile');
    }

    return await response.json();
}

/**
 * Syncs user profile with backend
 */
export async function syncUserProfile() {
    try {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_URL}/sync`, {
            method: 'POST',
            headers
        });

        if (!response.ok) {
            throw new Error('Failed to sync user profile');
        }

        return await response.json();
    } catch (error) {
        console.error('Error syncing user profile:', error);
        return null;
    }
}
